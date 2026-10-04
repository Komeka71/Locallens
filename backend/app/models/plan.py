from pydantic import BaseModel, Field


class UserRequest(BaseModel):
    request: str = Field(
        ...,
        min_length=1,
        description="Natural-language outing request",
    )


class SearchRequirements(BaseModel):
    location: str | None = None

    budget: float | None = None

    people: int | None = None

    time: str | None = None

    preferences: list[str] = Field(
        default_factory=list
    )

    categories_searched: list[str] = Field(
        default_factory=list,
        description=(
            "SerpApi search categories used for this plan "
            "(restaurants, cafes, activities)."
        ),
    )


class PlaceOption(BaseModel):
    type: str = Field(
        ...,
        description="e.g. dinner, activity, cafe",
    )

    name: str

    rating: float | None = None
    reviews: int | None = None
    address: str | None = None
    website: str | None = None
    hours: str | None = None
    thumbnail: str | None = None

    reason: str

    estimated_cost: str = Field(
        ...,
        description=(
            "Cost text derived only from SerpApi fields, "
            "or marked unavailable."
        ),
    )

    source: str = "SerpApi"

    cost_verified: bool = Field(
        default=False,
        description=(
            "True when estimated_cost comes from a "
            "SerpApi price field on this place."
        ),
    )

    open_hours_verified: bool = Field(
        default=False,
        description=(
            "True when open_state/hours from SerpApi "
            "were used in the reason."
        ),
    )


class PlanResponse(BaseModel):
    requirements: SearchRequirements

    # Kept for backward compatibility.
    # This contains the recommended combination.
    plan: list[PlaceOption]

    # Explicitly identifies the AI-selected recommendation.
    recommended_plan: list[PlaceOption] = Field(
        default_factory=list,
        description="AI-selected recommended combination.",
    )

    # Additional real SerpApi options grouped by category.
    #
    # Example:
    # {
    #   "restaurants": [...],
    #   "activities": [...]
    # }
    alternatives: dict[str, list[PlaceOption]] = Field(
        default_factory=dict,
        description=(
            "Additional real SerpApi options grouped "
            "by search category."
        ),
    )

    total_estimated_cost: str

    summary: str

    warnings: list[str] = Field(
        default_factory=list,
        description=(
            "Non-fatal issues such as empty categories "
            "or missing data."
        ),
    )