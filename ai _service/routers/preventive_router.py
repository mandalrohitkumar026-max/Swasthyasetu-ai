from fastapi import APIRouter, HTTPException
from models.schemas import MetricAnalysisRequest, MetricAnalysisResponse
from services.preventive_insights import analyze_metric_telemetry

router = APIRouter(prefix="/api/ai/preventive", tags=["Preventive Health Insights"])

@router.post("/analyze", response_model=MetricAnalysisResponse)
async def analyze_metrics(request: MetricAnalysisRequest):
    """
    Feature 2: Longitudinal telemetry trend analysis, outlier detection,
    and lifestyle guidance.
    """
    if not request.user_consent_given:
        raise HTTPException(
            status_code=403,
            detail="Patient consent is required before analyzing longitudinal vital telemetry."
        )
    return analyze_metric_telemetry(request)
