import datetime
from fastapi import APIRouter
from config import settings

router = APIRouter(tags=["Health & Status"])

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": settings.SERVICE_NAME,
        "version": settings.VERSION,
        "runtime": "Python 3.14 / FastAPI",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }

@router.get("/api/ai/status")
async def ai_system_status():
    return {
        "service": settings.SERVICE_NAME,
        "version": settings.VERSION,
        "features": {
            "feature_1_symptom_triage": "operational",
            "feature_2_preventive_insights": "operational",
            "feature_3_health_risk_assessment": "operational",
            "feature_4_affordable_care": "operational",
            "feature_5_multilingual_assistance": "operational"
        },
        "safety_guardrails": {
            "red_flag_emergency_failsafe": "enabled",
            "statutory_clinical_disclaimer": "enforced",
            "consent_verification": "enforced",
            "diagnostic_claim_prohibition": "strictly_enforced"
        }
    }
