import asyncio
from typing import Any

from app.models.plan import (
    PlanResponse,
    PlaceOption,
    SearchRequirements,
)
from app.models.place import Place
from app.services.gemini_service import (
    ExtractedRequirements,
    MalformedGeminiOutputError,
    extract_requirements,
    generate_plan_from_places,
)
from app.services.serpapi_service import search_places


ALLOWED_CATEGORIES = (
    "restaurants",
    "cafes",
    "activities",
)

MAX_PLACES_PER_CATEGORY = 10

CATEGORY_SEARCH_QUERIES: dict[str, str] = {
    "restaurants": "restaurants in {location}",
    "cafes": "cafes in {location}",
    "activities": "things to do and activities in {location}",
}


def _normalize_categories(
    raw_categories: list[str],
    user_request: str,
) -> list[str]:
    """
    Map Gemini output to predictable allowed categories.
    """

    lowered = {
        item.strip().lower()
        for item in raw_categories
        if item and item.strip()
    }

    selected: list[str] = []

    for category in ALLOWED_CATEGORIES:
        if category in lowered:
            selected.append(category)

    text = user_request.lower()

    if not selected:
        if any(
            word in text
            for word in (
                "dinner",
                "lunch",
                "restaurant",
                "food",
                "eat",
                "meal",
            )
        ):
            selected.append("restaurants")

        if "cafe" in text or "coffee" in text:
            selected.append("cafes")

        if any(
            word in text
            for word in (
                "activity",
                "activities",
                "fun",
                "things to do",
                "movie",
                "bowling",
                "entertainment",
            )
        ):
            selected.append("activities")

    if not selected:
        selected = [
            "restaurants",
            "activities",
        ]

    seen: set[str] = set()
    ordered: list[str] = []

    for category in selected:
        if category not in seen:
            seen.add(category)
            ordered.append(category)

    return ordered[:len(ALLOWED_CATEGORIES)]


def _build_search_query(
    category: str,
    location: str,
    preferences: list[str],
) -> str:

    template = CATEGORY_SEARCH_QUERIES[category]

    query = template.format(
        location=location.strip()
    )

    if preferences:
        query = (
            f"{query} "
            f"{' '.join(preferences[:3])}"
        )

    return query


def _place_to_dict(
    place: Place,
) -> dict[str, Any]:
    return place.model_dump(
        exclude_none=True
    )


def _collect_known_names(
    places_by_category: dict[str, list[Place]],
) -> dict[str, str]:
    """
    Map lowercase name -> canonical name.
    """

    mapping: dict[str, str] = {}

    for places in places_by_category.values():

        for place in places:

            mapping[
                place.name.strip().lower()
            ] = place.name.strip()

    return mapping


def _attach_place_details(
    items: list[PlaceOption],
    places_by_category: dict[str, list[Place]],
) -> list[PlaceOption]:
    """
    Attach real SerpApi place details to Gemini-selected options.

    This prevents Gemini from inventing ratings, addresses,
    websites, hours, thumbnails, etc.
    """

    place_lookup: dict[str, Place] = {}

    for places in places_by_category.values():

        for place in places:

            place_lookup[
                place.name.strip().lower()
            ] = place

    enriched: list[PlaceOption] = []

    for item in items:

        place = place_lookup.get(
            item.name.strip().lower()
        )

        if not place:
            enriched.append(item)
            continue

        enriched.append(
            item.model_copy(
                update={
                    "rating": getattr(
                        place,
                        "rating",
                        None,
                    ),
                    "reviews": getattr(
                        place,
                        "reviews",
                        None,
                    ),
                    "address": getattr(
                        place,
                        "address",
                        None,
                    ),
                    "website": getattr(
                        place,
                        "website",
                        None,
                    ),
                    "hours": getattr(
                        place,
                        "hours",
                        None,
                    ),
                    "thumbnail": getattr(
                        place,
                        "thumbnail",
                        None,
                    ),
                }
            )
        )

    return enriched


def _validate_place_option(
    item: PlaceOption,
    known_names: dict[str, str],
) -> PlaceOption:

    canonical = known_names.get(
        item.name.strip().lower()
    )

    if not canonical:

        raise MalformedGeminiOutputError(
            f'Plan referenced "{item.name}" '
            "which is not in the SerpApi search results."
        )

    return item.model_copy(
        update={
            "name": canonical
        }
    )


def _validate_plan_items(
    plan: list[PlaceOption],
    known_names: dict[str, str],
) -> list[PlaceOption]:

    validated: list[PlaceOption] = []

    for item in plan:

        validated.append(
            _validate_place_option(
                item,
                known_names,
            )
        )

    return validated


def _validate_alternatives(
    alternatives: dict[str, list[PlaceOption]],
    known_names: dict[str, str],
    allowed_categories: list[str],
) -> dict[str, list[PlaceOption]]:

    validated: dict[str, list[PlaceOption]] = {}

    for category in allowed_categories:

        items = alternatives.get(
            category,
            [],
        )

        valid_items: list[PlaceOption] = []

        for item in items:

            valid_items.append(
                _validate_place_option(
                    item,
                    known_names,
                )
            )

        validated[category] = valid_items

    return validated


async def _search_category(
    category: str,
    query: str,
) -> tuple[list[Place], str | None]:

    places, message = await asyncio.to_thread(
        search_places,
        query,
    )

    return (
        places[:MAX_PLACES_PER_CATEGORY],
        message,
    )


def _to_search_requirements(
    extracted: ExtractedRequirements,
    categories_searched: list[str],
) -> SearchRequirements:

    return SearchRequirements(
        location=extracted.location,
        budget=extracted.budget,
        people=extracted.people,
        time=extracted.time,
        preferences=extracted.preferences,
        categories_searched=categories_searched,
    )


async def create_plan(
    user_request: str,
) -> PlanResponse:
    """
    LocalLens controlled agent workflow:

    1. Gemini extracts requirements.
    2. Agent decides search categories.
    3. SerpApi retrieves up to 10 places per category.
    4. Gemini compares all retrieved places.
    5. Gemini selects a recommended combination.
    6. Gemini also returns multiple alternative options.
    7. Every returned place is validated against SerpApi.
    8. Real SerpApi details are attached to every returned place.
    """

    if not user_request or not user_request.strip():

        raise ValueError(
            "Request must not be empty."
        )

    # --------------------------------------------------
    # STEP 1 — Understand request
    # --------------------------------------------------

    extracted = await extract_requirements(
        user_request.strip()
    )

    if (
        not extracted.location
        or not extracted.location.strip()
    ):

        raise ValueError(
            "Could not determine a location from your "
            "request. Please include a city or area."
        )

    # --------------------------------------------------
    # STEP 2 — Decide categories
    # --------------------------------------------------

    categories = _normalize_categories(
        extracted.search_categories,
        user_request,
    )

    warnings: list[str] = []

    # --------------------------------------------------
    # STEP 3 — Search SerpApi
    # --------------------------------------------------

    search_tasks = []

    for category in categories:

        query = _build_search_query(
            category,
            extracted.location,
            extracted.preferences,
        )

        search_tasks.append(
            _search_category(
                category,
                query,
            )
        )

    search_results = await asyncio.gather(
        *search_tasks
    )

    # --------------------------------------------------
    # STEP 4 — Prepare results
    # --------------------------------------------------

    places_by_category: dict[
        str,
        list[Place],
    ] = {}

    payload_for_gemini: dict[
        str,
        list[dict[str, Any]],
    ] = {}

    for category, (
        places,
        message,
    ) in zip(
        categories,
        search_results,
        strict=True,
    ):

        places_by_category[category] = places

        payload_for_gemini[category] = [
            _place_to_dict(place)
            for place in places
        ]

        if message:

            warnings.append(
                f"{category}: {message}"
            )

        if not places:

            warnings.append(
                f"No SerpApi results for category "
                f"'{category}'."
            )

    # --------------------------------------------------
    # STEP 5 — No results
    # --------------------------------------------------

    if not any(
        places_by_category.values()
    ):

        requirements = _to_search_requirements(
            extracted,
            categories,
        )

        return PlanResponse(
            requirements=requirements,
            plan=[],
            recommended_plan=[],
            alternatives={},
            total_estimated_cost=(
                "Unavailable — no SerpApi place "
                "data was retrieved."
            ),
            summary=(
                "I could not find local places for "
                "your request with the searches "
                "performed. Try adjusting the "
                "location or preferences."
            ),
            warnings=warnings,
        )

    # --------------------------------------------------
    # STEP 6 — Gemini compares ALL results
    # --------------------------------------------------

    generated = await generate_plan_from_places(
        user_request=user_request.strip(),
        requirements=extracted,
        places_payload=payload_for_gemini,
    )

    # --------------------------------------------------
    # STEP 7 — Validate everything against SerpApi
    # --------------------------------------------------

    known_names = _collect_known_names(
        places_by_category
    )

    recommended_plan = _validate_plan_items(
        generated.recommended_plan,
        known_names,
    )

    recommended_plan = _attach_place_details(
        recommended_plan,
        places_by_category,
    )

    alternatives = _validate_alternatives(
        generated.alternatives,
        known_names,
        categories,
    )

    for category in alternatives:

        alternatives[category] = _attach_place_details(
            alternatives[category],
            places_by_category,
        )

    # --------------------------------------------------
    # STEP 8 — Backward compatibility
    # --------------------------------------------------

    # Keep `plan` equal to recommended_plan so existing
    # frontend code continues to work until we update it.

    return PlanResponse(
        requirements=_to_search_requirements(
            extracted,
            categories,
        ),

        plan=recommended_plan,

        recommended_plan=recommended_plan,

        alternatives=alternatives,

        total_estimated_cost=(
            generated.total_estimated_cost
        ),

        summary=generated.summary,

        warnings=warnings,
    )