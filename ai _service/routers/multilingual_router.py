from fastapi import APIRouter
from models.schemas import TranslationAssistRequest, TranslationAssistResponse
from services.multilingual_engine import translate_and_assist, SUPPORTED_INDIC_LANGUAGES

router = APIRouter(prefix="/api/ai/multilingual", tags=["Multilingual Health Assistance"])

@router.post("/translate-assist", response_model=TranslationAssistResponse)
async def translate_health_query(request: TranslationAssistRequest):
    """
    Feature 5: Indic medical term normalization, Hinglish translation,
    and clinical entity extraction.
    """
    return translate_and_assist(request)

@router.get("/languages")
async def get_supported_languages():
    """
    Returns active and roadmap Indic language adapters.
    """
    return {
        "success": True,
        "languages": SUPPORTED_INDIC_LANGUAGES
    }
