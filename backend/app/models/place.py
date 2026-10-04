from typing import Any

from pydantic import BaseModel, Field


class Place(BaseModel):
    """Normalized local place from SerpApi Google Maps results."""

    name: str
    rating: float | None = None
    reviews: int | None = None
    price: str | None = None
    category: str | None = None
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    open_state: str | None = None
    hours: str | None = None
    website: str | None = None
    description: str | None = None
    vegetarian: bool | None = None
    atmosphere: list[str] | None = None
    amenities: list[str] | None = None
    service_options: list[str] | None = None
    thumbnail: str | None = None


class PlacesSearchResponse(BaseModel):
    query: str
    count: int
    places: list[Place]
    message: str | None = Field(
        default=None,
        description="Set when no places were found or some rows could not be parsed.",
    )
