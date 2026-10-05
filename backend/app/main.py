from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from app.models.place import PlacesSearchResponse
from app.models.plan import PlanResponse, UserRequest
from app.services.agent_service import create_plan
from app.services.gemini_service import (
    GeminiApiError,
    MalformedGeminiOutputError,
    MissingGeminiApiKeyError,
)
from app.services.serpapi_service import (
    MissingSerpApiKeyError,
    SerpApiSearchError,
    search_google_maps_raw,
    search_places,
)

app = FastAPI(title="LocalLens")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "https://locallens-topaz.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "LocalLens backend is running"}


@app.get("/search")
def search_places_raw(q: str):
    """Legacy endpoint: returns the full SerpApi Google Maps response."""
    try:
        return search_google_maps_raw(q)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except MissingSerpApiKeyError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except SerpApiSearchError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@app.get("/api/places/search", response_model=PlacesSearchResponse)
def search_places_normalized(
    q: str = Query(..., min_length=1, description="Natural-language or keyword search"),
):
    """Search local places and return a normalized list for the agent pipeline."""
    try:
        places, message = search_places(q)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except MissingSerpApiKeyError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except SerpApiSearchError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return PlacesSearchResponse(
        query=q.strip(),
        count=len(places),
        places=places,
        message=message,
    )


@app.post("/api/plan", response_model=PlanResponse)
async def plan_from_request(body: UserRequest):
    """Build a personalized local plan using Gemini + SerpApi search results."""
    try:
        return await create_plan(body.request)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except MissingGeminiApiKeyError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except MissingSerpApiKeyError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except SerpApiSearchError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except GeminiApiError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except MalformedGeminiOutputError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
