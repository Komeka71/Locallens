import asyncio
import json
import os
from typing import TypeVar

from dotenv import load_dotenv
from google import genai
from google.genai import errors as genai_errors
from google.genai import types
from pydantic import BaseModel, Field, ValidationError

from app.models.plan import PlaceOption


load_dotenv()


DEFAULT_GEMINI_MODEL = "gemini-3.5-flash-lite"
FALLBACK_GEMINI_MODEL = "gemini-3.6-flash"

MAX_RETRIES = 3

T = TypeVar("T", bound=BaseModel)


class MissingGeminiApiKeyError(Exception):
    """Raised when GEMINI_API_KEY is not configured."""


class GeminiApiError(Exception):
    """Raised when the Gemini API returns an error."""


class MalformedGeminiOutputError(Exception):
    """Raised when Gemini output cannot be parsed."""


class ExtractedRequirements(BaseModel):
    """Structured output from step 1."""

    location: str | None = None
    budget: float | None = None
    people: int | None = None
    time: str | None = None

    preferences: list[str] = Field(
        default_factory=list
    )

    search_categories: list[str] = Field(
        default_factory=list,
        description="Subset of: restaurants, cafes, activities.",
    )

class GeneratedPlanPayload(BaseModel):
    """
    Structured output from Gemini.

    Gemini selects one recommended combination and
    additional alternatives from the real SerpApi results.
    """

    recommended_plan: list[PlaceOption] = Field(
        default_factory=list,
        description=(
            "The recommended combination of places "
            "for the user's request."
        ),
    )

    alternatives: dict[str, list[PlaceOption]] = Field(
        default_factory=dict,
        description=(
            "Additional options grouped by category. "
            "Keys should be restaurants, cafes, or activities."
        ),
    )

    total_estimated_cost: str

    summary: str


def _require_api_key() -> str:
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key or not api_key.strip():
        raise MissingGeminiApiKeyError(
            "GEMINI_API_KEY is not set. "
            "Add it to backend/.env and restart the server."
        )

    return api_key.strip()


def _model_name() -> str:
    return (
        os.getenv("GEMINI_MODEL")
        or DEFAULT_GEMINI_MODEL
    ).strip()


def _get_client() -> genai.Client:
    return genai.Client(
        api_key=_require_api_key()
    )


async def _call_gemini(
    client: genai.Client,
    model: str,
    prompt: str,
    schema_model: type[T],
):
    """
    Call Gemini with retries for temporary 5xx errors.
    """

    for attempt in range(MAX_RETRIES):

        try:
            print(
                f"Gemini request: model={model}, "
                f"attempt={attempt + 1}/{MAX_RETRIES}"
            )

            response = await client.aio.models.generate_content(
                model=model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_json_schema=schema_model.model_json_schema(),
                ),
            )

            return response

        except genai_errors.APIError as exc:

            status_code = getattr(exc, "code", None)

            print(
                f"Gemini API error "
                f"(model={model}, status={status_code}): {exc}"
            )

            # Retry temporary server-side errors.
            if status_code in (408, 429, 500, 502, 503, 504):

                if attempt < MAX_RETRIES - 1:

                    delay = 2 ** attempt

                    print(
                        f"Temporary Gemini error. "
                        f"Retrying in {delay} seconds..."
                    )

                    await asyncio.sleep(delay)

                    continue

            raise


async def _generate_structured(
    *,
    system_instruction: str,
    user_content: str,
    schema_model: type[T],
) -> T:

    client = _get_client()

    prompt = (
        f"{system_instruction.strip()}\n\n"
        "---\n\n"
        f"{user_content.strip()}"
    )

    primary_model = _model_name()

    try:

        # --------------------------------------------
        # Try primary model
        # --------------------------------------------

        try:

            response = await _call_gemini(
                client=client,
                model=primary_model,
                prompt=prompt,
                schema_model=schema_model,
            )

        except genai_errors.APIError as primary_error:

            primary_status = getattr(
                primary_error,
                "code",
                None
            )

            # ----------------------------------------
            # Fallback only for temporary availability
            # problems.
            # ----------------------------------------

            if (
                primary_status
                not in (429, 500, 502, 503, 504)
                or primary_model == FALLBACK_GEMINI_MODEL
            ):
                raise

            print(
                f"Primary model unavailable. "
                f"Trying fallback model: "
                f"{FALLBACK_GEMINI_MODEL}"
            )

            response = await _call_gemini(
                client=client,
                model=FALLBACK_GEMINI_MODEL,
                prompt=prompt,
                schema_model=schema_model,
            )

    except genai_errors.APIError as exc:

        print(
            f"Gemini API request failed after retries: {exc}"
        )

        raise GeminiApiError(
            "Gemini API is temporarily unavailable. "
            "Please try the request again."
        ) from exc

    except Exception as exc:

        print(
            f"Unexpected Gemini error: {exc}"
        )

        raise GeminiApiError(
            "Gemini request failed. "
            "Check the backend terminal for details."
        ) from exc

    text = (response.text or "").strip()

    if not text:
        raise MalformedGeminiOutputError(
            "Gemini returned an empty response."
        )

    try:

        data = json.loads(text)

        return schema_model.model_validate(data)

    except (
        json.JSONDecodeError,
        ValidationError,
    ) as exc:

        print(
            "Gemini returned invalid structured output:"
        )

        print(text)

        raise MalformedGeminiOutputError(
            "Gemini returned JSON that did not match "
            "the expected schema."
        ) from exc


# ============================================================
# STEP 1 — REQUIREMENT EXTRACTION
# ============================================================

EXTRACTION_SYSTEM = """
You are LocalLens, a local discovery assistant.

Understand the user's natural-language request and extract
planning constraints.

Rules:

- Output ONLY JSON matching the provided schema.

- search_categories may ONLY contain:
  restaurants
  cafes
  activities

- Select only the categories needed.

Examples:

Dinner:
restaurants

Coffee:
cafes

Fun evening with dinner and an activity:
restaurants + activities

Food and coffee:
restaurants + cafes

- If the user mentions dinner, eating, food, lunch,
  or a meal without specifically asking for a cafe,
  include restaurants.

- If the user wants an activity, things to do, cinema,
  bowling, entertainment, sightseeing, etc.,
  include activities.

- location should be a city or area name when provided.
  Otherwise use null.

- budget should be a number when a numeric budget is given.

- people should be the number of people when provided.

- time should preserve the user's stated date/time wording.

- preferences should contain useful preferences such as:
  cuisine, vegetarian, vibe, atmosphere, dietary needs,
  indoor/outdoor, etc.

Do not invent information that the user did not provide.
""".strip()


# ============================================================
# STEP 2 — PLAN GENERATION
# ============================================================

PLAN_SYSTEM = """
You are LocalLens, an AI local discovery agent.

Build a personalized outing plan using ONLY the real
SerpApi place data provided.

The user should receive:

1. A recommended combination of places.
2. Multiple alternative options from the same real search results.

STRICT DATA RULES:

- Every place name MUST exactly match a place name
  from the provided SerpApi JSON.

- NEVER invent places.

- NEVER invent ratings.

- NEVER invent reviews.

- NEVER invent prices.

- NEVER invent opening hours.

- NEVER invent addresses.

- NEVER invent websites.

- NEVER invent amenities.

- NEVER invent descriptions.

RECOMMENDED PLAN:

Select the combination that best fits the user's request.

For example:

Dinner + activity request:
- one activity
- one restaurant/cafe

Do not add unnecessary categories.

ALTERNATIVES:

For every searched category that has results,
return several good alternatives.

Aim for up to 4 alternatives per category.

Do NOT repeat the exact places already used in
recommended_plan when possible.

Only use places actually present in the supplied
SerpApi data.

COST:

If a place has a "price" field:

- You may quote or paraphrase that price.
- Set cost_verified=true.

If no price exists:

Use exactly:

"Price not available in SerpApi results"

and set:

cost_verified=false.

Do NOT calculate a fake per-person or total price
from a price range unless the data makes that
calculation reliable.

OPENING HOURS:

Only mention opening status or hours if the
SerpApi data contains open_state or hours.

If used:

open_hours_verified=true.

Otherwise:

open_hours_verified=false.

REASON:

Explain why the place fits the request using only
the supplied SerpApi fields.

Possible evidence:

- rating
- reviews
- category
- description
- atmosphere
- vegetarian
- amenities
- service options
- price
- opening information

SOURCE:

Every item must have:

"SerpApi"

TYPE:

Use useful labels such as:

- dinner
- lunch
- cafe
- activity

BUDGET:

Do not claim that the complete plan fits the user's
budget unless the supplied pricing information
supports that conclusion.

If pricing is incomplete, explicitly state that
budget fit cannot be fully verified.

TOTAL COST:

Only calculate a total when the supplied data
supports a reliable calculation.

Otherwise use:

"Insufficient price data to calculate a reliable total."

SUMMARY:

Give a concise, friendly explanation of the
recommended plan.

Mention important data limitations.

OUTPUT:

Return ONLY JSON matching the requested schema.

Do not include markdown.

Do not include explanations outside the JSON.
""".strip()


# ============================================================
# PUBLIC FUNCTIONS
# ============================================================

async def extract_requirements(
    user_request: str,
) -> ExtractedRequirements:

    return await _generate_structured(
        system_instruction=EXTRACTION_SYSTEM,
        user_content=(
            f"User request:\n{user_request}"
        ),
        schema_model=ExtractedRequirements,
    )


async def generate_plan_from_places(
    *,
    user_request: str,
    requirements: ExtractedRequirements,
    places_payload: dict[str, list[dict]],
) -> GeneratedPlanPayload:

    context = {
        "user_request": user_request,
        "requirements": requirements.model_dump(),
        "serpapi_places_by_category": places_payload,
    }

    user_content = (
        "Use the following real SerpApi data to build "
        "the user's plan.\n\n"
        f"{json.dumps(context, ensure_ascii=False, indent=2)}"
    )

    return await _generate_structured(
        system_instruction=PLAN_SYSTEM,
        user_content=user_content,
        schema_model=GeneratedPlanPayload,
    )