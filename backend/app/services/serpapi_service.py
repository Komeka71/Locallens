import os
from typing import Any

import serpapi
from dotenv import load_dotenv

from app.models.place import Place

load_dotenv()


class MissingSerpApiKeyError(Exception):
    """Raised when SERPAPI_KEY is not configured."""


class SerpApiSearchError(Exception):
    """Raised when SerpApi returns an error or the request fails."""


def _require_api_key() -> str:
    api_key = os.getenv("SERPAPI_KEY")
    if not api_key or not api_key.strip():
        raise MissingSerpApiKeyError(
            "SERPAPI_KEY is not set. Add it to backend/.env and restart the server."
        )
    return api_key.strip()


def _get_client() -> serpapi.Client:
    return serpapi.Client(api_key=_require_api_key())


def search_google_maps_raw(query: str) -> dict[str, Any]:
    """
    Run a Google Maps search and return the full SerpApi response.
    Used by GET /search to preserve existing behavior.
    """
    if not query or not query.strip():
        raise ValueError("Search query must not be empty.")

    client = _get_client()
    try:
        return client.search(
            {
                "engine": "google_maps",
                "q": query.strip(),
                "type": "search",
            }
        )
    except Exception as exc:
        raise SerpApiSearchError(
            "SerpApi request failed. Check your API key and network connection."
        ) from exc


def _extensions_lookup(
    extensions: list[Any] | None,
) -> dict[str, list[str]]:
    """Turn SerpApi extension blocks into a simple key -> string list map."""
    lookup: dict[str, list[str]] = {}
    if not extensions:
        return lookup

    for block in extensions:
        if not isinstance(block, dict):
            continue
        for key, value in block.items():
            if isinstance(value, list):
                lookup[key] = [str(item) for item in value]
    return lookup


def _service_options_list(raw: dict[str, Any], ext: dict[str, list[str]]) -> list[str] | None:
    from_extensions = ext.get("service_options")
    if from_extensions:
        return from_extensions

    top_level = raw.get("service_options")
    if isinstance(top_level, dict):
        labels = {
            "dine_in": "Dine-in",
            "takeout": "Takeout",
            "delivery": "Delivery",
            "curbside_pickup": "Curbside pickup",
            "no_contact_delivery": "No-contact delivery",
        }
        enabled = [labels[key] for key, enabled in top_level.items() if enabled and key in labels]
        return enabled or None

    return None


def _vegetarian_from_offerings(offerings: list[str] | None) -> bool | None:
    if not offerings:
        return None
    lowered = {item.lower() for item in offerings}
    if "vegetarian options only" in lowered:
        return True
    if any("vegetarian" in item for item in lowered):
        return True
    return None


def _safe_float(value: Any) -> float | None:
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _safe_int(value: Any) -> int | None:
    if value is None:
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def normalize_local_result(raw: dict[str, Any]) -> Place | None:
    """Map one SerpApi local_results item to a Place. Returns None if unusable."""
    name = raw.get("title") or raw.get("name")
    if not name or not str(name).strip():
        return None

    gps = raw.get("gps_coordinates") or {}
    if not isinstance(gps, dict):
        gps = {}

    ext = _extensions_lookup(raw.get("extensions"))

    return Place(
        name=str(name).strip(),
        rating=_safe_float(raw.get("rating")),
        reviews=_safe_int(raw.get("reviews")),
        price=raw.get("price") if isinstance(raw.get("price"), str) else None,
        category=raw.get("type") if isinstance(raw.get("type"), str) else None,
        address=raw.get("address") if isinstance(raw.get("address"), str) else None,
        latitude=_safe_float(gps.get("latitude")),
        longitude=_safe_float(gps.get("longitude")),
        open_state=raw.get("open_state") if isinstance(raw.get("open_state"), str) else None,
        hours=raw.get("hours") if isinstance(raw.get("hours"), str) else None,
        website=raw.get("website") if isinstance(raw.get("website"), str) else None,
        description=raw.get("description") if isinstance(raw.get("description"), str) else None,
        vegetarian=_vegetarian_from_offerings(ext.get("offerings")),
        atmosphere=ext.get("atmosphere"),
        amenities=ext.get("amenities"),
        service_options=_service_options_list(raw, ext),
        thumbnail=(
            raw.get("thumbnail")
            if isinstance(raw.get("thumbnail"), str)
            else raw.get("serpapi_thumbnail")
            if isinstance(raw.get("serpapi_thumbnail"), str)
            else None
        ),
    )


def search_places(query: str) -> tuple[list[Place], str | None]:
    """
    Search Google Maps via SerpApi and return normalized places.
    The optional message explains empty or partially skipped results.
    """
    if not query or not query.strip():
        raise ValueError("Search query must not be empty.")

    raw_response = search_google_maps_raw(query)
    local_results = raw_response.get("local_results")

    if not local_results:
        return [], "No places found for this search."

    if not isinstance(local_results, list):
        return [], "SerpApi returned an unexpected result format."

    places: list[Place] = []
    skipped = 0
    for item in local_results:
        if not isinstance(item, dict):
            skipped += 1
            continue
        place = normalize_local_result(item)
        if place is None:
            skipped += 1
            continue
        places.append(place)

    message: str | None = None
    if not places:
        message = "No places could be normalized from the search results."
    elif skipped:
        message = f"Skipped {skipped} result(s) with missing or invalid fields."

    return places, message
