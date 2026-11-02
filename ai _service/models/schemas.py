from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field

# ==========================================
# Base AI Response Contract
# ==========================================
class BaseAIResponse(BaseModel):
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Model confidence estimate (0.0 to 1.0)")
    confidence_level: str = Field(..., description="Qualitative confidence: High, Moderate, or Screening Only")
    limitations: List[str] = Field(default_factory=list, description="Explicit boundaries and algorithmic constraints")
    is_emergency: bool = Field(default=False, description="Whether immediate emergency medical attention is needed")
    emergency_warning: Optional[str] = Field(None, description="Critical warning instructions if emergency detected")
    clinical_safety_notice: str = Field(..., description="Mandatory statutory patient disclaimer")
    language: str = Field(default="en", description="ISO language code of output (en, hi)")

# ==========================================
# Feature 1: AI Health Assistant & Triage
# ==========================================
class SymptomTriageRequest(BaseModel):
    symptoms_text: str = Field(..., min_length=2, description="Patient's description of symptoms")
    language: str = Field(default="en", description="Language of text: en (English) or hi (Hindi)")
    duration_days: Optional[int] = Field(default=1, ge=0, description="Duration of symptoms in days")
    patient_age: Optional[int] = Field(default=35, ge=0, le=120)
    patient_gender: Optional[str] = Field(default="other", description="male, female, or other")
    current_vitals: Optional[Dict[str, Any]] = Field(default=None, description="Optional current BP, pulse, temp, spo2")
    user_consent_given: bool = Field(..., description="Explicit patient consent to analyze symptoms for educational triage")

class FollowUpQuestion(BaseModel):
    id: str
    question: str
    options: List[str]
    clinical_rationale: str

class SymptomTriageResponse(BaseAIResponse):
    provisional_triage_category: str = Field(..., description="Emergency (108), Urgent OPD, Routine Teleconsultation, or Home Supportive Care")
    recommended_care_pathway: str
    suggested_specialist: str
    identified_symptoms: List[str]
    follow_up_questions: List[FollowUpQuestion]
    educational_health_guidance: List[str]
    home_comfort_measures: List[str]
    red_flags_detected: List[Dict[str, Any]] = Field(default_factory=list)

# ==========================================
# Feature 2: Preventive Health Insights
# ==========================================
class MetricDataPoint(BaseModel):
    timestamp: str
    metric_type: str = Field(..., description="blood_glucose, blood_pressure, heart_rate, spo2, temperature, bmi")
    value: Union[float, int, str]
    systolic: Optional[float] = None
    diastolic: Optional[float] = None
    fasting: Optional[bool] = None

class MetricAnalysisRequest(BaseModel):
    patient_id: Optional[str] = "patient-demo"
    metrics: List[MetricDataPoint]
    language: str = "en"
    user_consent_given: bool = Field(..., description="Patient consent to analyze longitudinal telemetry")

class MetricTrendInsight(BaseModel):
    metric_type: str
    total_readings: int
    mean_value: Optional[float] = None
    trend_direction: str = Field(..., description="stable, improving, deteriorating, volatile")
    abnormal_count: int
    outlier_points: List[str]
    clinical_observation: str
    preventive_recommendation: str

class MetricAnalysisResponse(BaseAIResponse):
    insights: List[MetricTrendInsight]
    overall_lifestyle_advice: List[str]
    suggested_screening_tests: List[str]
    doctor_review_suggested: bool

# ==========================================
# Feature 3: Health Risk Assessment
# ==========================================
class DiabetesRiskRequest(BaseModel):
    age: int = Field(..., ge=18, le=110)
    waist_circumference_cm: float = Field(..., ge=40, le=200, description="Waist circumference in cm")
    gender: str = Field(..., description="male or female")
    physical_activity_level: str = Field(..., description="vigorous, moderate, sedentary")
    family_history_diabetes: str = Field(..., description="none, one_parent, both_parents")
    user_consent_given: bool = True

class CvdRiskRequest(BaseModel):
    age: int = Field(..., ge=20, le=100)
    gender: str = Field(..., description="male or female")
    systolic_bp: float = Field(..., ge=70, le=240)
    is_smoker: bool = False
    has_diabetes: bool = False
    bmi: Optional[float] = Field(default=24.5, ge=12, le=60)
    user_consent_given: bool = True

class RiskFactorContribution(BaseModel):
    factor_name: str
    contribution_level: str = Field(..., description="Low, Moderate, Significant, Major")
    points_assigned: int
    explanation: str

class RiskAssessmentResponse(BaseAIResponse):
    assessment_name: str
    calculated_score: int
    max_possible_score: int
    risk_category: str = Field(..., description="Low Risk, Moderate Risk, High Risk")
    projected_risk_description: str
    contributing_factors: List[RiskFactorContribution]
    clinical_evidence_basis: str
    actionable_prevention_steps: List[str]
    diagnostic_disclaimer: str

# ==========================================
# Feature 4: Affordable Care Recommendations
# ==========================================
class AffordableCareRequest(BaseModel):
    patient_latitude: float = Field(default=27.5706, ge=-90, le=90)
    patient_longitude: float = Field(default=80.6776, ge=-180, le=180)
    district: Optional[str] = "Sitapur"
    requested_service: Optional[str] = "generic_medicines"
    prescribed_medicines: Optional[List[str]] = Field(default_factory=list)
    max_distance_km: float = Field(default=25.0, ge=1.0, le=150.0)
    language: str = "en"

class AffordableCenterMatch(BaseModel):
    center_id: str
    name: str
    center_type: str
    distance_km: float
    address: str
    district: str
    operating_hours: str
    contact_phone: str
    services_matched: List[str]
    estimated_generic_savings_pct: int
    kiosk_uptime_pct: float

class AffordableCareResponse(BaseAIResponse):
    total_matching_centers: int
    recommended_centers: List[AffordableCenterMatch]
    generic_substitution_advice: List[str]
    pmbjp_helpline: str = "1800-180-8080"

# ==========================================
# Feature 5: Multilingual Health Assistance
# ==========================================
class TranslationAssistRequest(BaseModel):
    query_text: str = Field(..., min_length=2)
    source_language: str = Field(default="auto")
    target_language: str = Field(default="hi")

class MedicalEntity(BaseModel):
    source_term: str
    standard_medical_term: str
    icd_relevance: Optional[str] = None
    severity: str = "mild"

class TranslationAssistResponse(BaseAIResponse):
    original_text: str
    detected_source_lang: str
    translated_text: str
    extracted_medical_entities: List[MedicalEntity]
    phonetic_hinglish_gloss: Optional[str] = None
