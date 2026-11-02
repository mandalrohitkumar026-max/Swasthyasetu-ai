from fastapi import APIRouter, HTTPException
from models.schemas import SymptomTriageRequest, SymptomTriageResponse
from services.triage_assistant import analyze_symptoms

router = APIRouter(prefix="/api/ai/assistant", tags=["AI Health Assistant"])

@router.post("/chat", response_model=SymptomTriageResponse)
async def chat_triage(request: SymptomTriageRequest):
    """
    Feature 1: Interactive symptom assessment, follow-up questions, 
    care pathways, and 108 emergency warning sign identification.
    """
    if not request.user_consent_given:
        raise HTTPException(
            status_code=403,
            detail="Patient consent is required under DPDP Act 2023 before processing personal health symptoms."
        )
    return analyze_symptoms(request)

@router.post("/triage", response_model=SymptomTriageResponse)
async def quick_triage(request: SymptomTriageRequest):
    """
    Direct endpoint for clinical triage classification.
    """
    if not request.user_consent_given:
        raise HTTPException(
            status_code=403,
            detail="Patient consent is required before processing symptoms."
        )
    return analyze_symptoms(request)
