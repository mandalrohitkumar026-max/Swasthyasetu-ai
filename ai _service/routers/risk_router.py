from fastapi import APIRouter, HTTPException
from models.schemas import DiabetesRiskRequest, CvdRiskRequest, RiskAssessmentResponse
from services.risk_assessment import calculate_idrs_diabetes_risk, calculate_cvd_risk

router = APIRouter(prefix="/api/ai/risk", tags=["Health Risk Assessment"])

@router.post("/diabetes", response_model=RiskAssessmentResponse)
async def assess_diabetes_risk(request: DiabetesRiskRequest):
    """
    Feature 3: Validated Indian Diabetes Risk Score (IDRS - ICMR/MDRF).
    """
    if not request.user_consent_given:
        raise HTTPException(status_code=403, detail="Consent required to calculate health risk screening.")
    return calculate_idrs_diabetes_risk(request)

@router.post("/cvd", response_model=RiskAssessmentResponse)
async def assess_cvd_risk(request: CvdRiskRequest):
    """
    Feature 3: Cardiovascular 10-year risk prediction based on WHO/ISH South Asian risk tables.
    """
    if not request.user_consent_given:
        raise HTTPException(status_code=403, detail="Consent required to calculate health risk screening.")
    return calculate_cvd_risk(request)
