from fastapi import APIRouter
from models.schemas import AffordableCareRequest, AffordableCareResponse
from services.affordable_finder import find_affordable_care_centers, VERIFIED_CENTERS

router = APIRouter(prefix="/api/ai/recommendations", tags=["Affordable Care Recommendations"])

@router.post("/affordable-care", response_model=AffordableCareResponse)
async def recommend_affordable_care(request: AffordableCareRequest):
    """
    Feature 4: Geospatial Haversine matching and PMBJP generic drug cost optimization.
    """
    return find_affordable_care_centers(request)

@router.get("/centers")
async def list_verified_centers():
    """
    Public directory of verified affordable care facilities and PMBJP stores.
    """
    return {
        "success": True,
        "count": len(VERIFIED_CENTERS),
        "data": VERIFIED_CENTERS
    }
