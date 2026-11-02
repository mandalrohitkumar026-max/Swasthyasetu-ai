"""
Feature 1: Responsible AI Health Assistant & Symptom Triage Engine
"""
from typing import Dict, Any, List
from models.schemas import SymptomTriageRequest, SymptomTriageResponse, FollowUpQuestion
from models.safety import check_for_red_flags, STATUTORY_DISCLAIMER_EN, STATUTORY_DISCLAIMER_HI

# Clinical Symptom Knowledge Matrix
SYMPTOM_PROFILES = [
    {
        "keywords": ["fever", "bukhar", "high temp", "बुखार", "ताप", "chills", "shivering"],
        "name_en": "Acute Febrile Illness",
        "name_hi": "तीव्र ज्वर / बुखार",
        "specialist": "General Physician / Internal Medicine",
        "questions": [
            {
                "id": "q_fever_duration",
                "en": "How many days has the fever persisted?",
                "hi": "बुखार कितने दिनों से आ रहा है?",
                "options": ["Less than 2 days", "3 to 5 days", "More than 5 days"],
                "rationale": "Duration over 3-5 days in endemic zones increases suspicion of Dengue, Malaria or Typhoid."
            },
            {
                "id": "q_fever_pattern",
                "en": "Is the fever accompanied by severe chills, joint pain, or eye pain?",
                "hi": "क्या बुखार के साथ तेज कंपकंपी, जोड़ों या आंखों में दर्द है?",
                "options": ["Yes, severe body & eye pain", "Mild body ache", "No chills or eye pain"],
                "rationale": "Retro-orbital pain and severe arthralgia are typical of viral arbovirus (Dengue/Chikungunya)."
            }
        ],
        "home_care_en": ["Drink plenty of fluids (ORS, coconut water, lemon water).", "Paracetamol 500mg may be used as advised for high fever.", "Do NOT self-medicate with Aspirin or Brufen without doctor review."],
        "home_care_hi": ["पर्याप्त मात्रा में तरल पदार्थ (ओआरएस, नारियल पानी, नींबू पानी) लें।", "तीव्र बुखार में डॉक्टर की सलाह से पैरासिटामोल ली जा सकती है।", "एस्पिरिन या ब्रूफेन बिना डॉक्टर की सलाह के न लें।"]
    },
    {
        "keywords": ["cough", "khansi", "cold", "sore throat", "खांसी", "जुकाम", "गले में खराश", "phlegm", "balgam"],
        "name_en": "Upper / Lower Respiratory Tract Infection",
        "name_hi": "श्वसन तंत्र संक्रमण (खांसी व जुकाम)",
        "specialist": "Pulmonologist / General Physician",
        "questions": [
            {
                "id": "q_cough_type",
                "en": "Is the cough dry, or producing yellow/green phlegm?",
                "hi": "क्या खांसी सूखी है या पीला/हरा बलगम आ रहा है?",
                "options": ["Dry tickling cough", "Clear phlegm", "Thick yellow/green phlegm"],
                "rationale": "Purulent sputum may indicate secondary bacterial bronchitis requiring targeted clinical evaluation."
            },
            {
                "id": "q_cough_breathless",
                "en": "Do you feel shortness of breath while climbing stairs or lying down?",
                "hi": "क्या सीढ़ियां चढ़ने या लेटने पर सांस फूलती है?",
                "options": ["No difficulty breathing", "Mild breathless with exertion", "Short of breath even at rest"],
                "rationale": "Resting dyspnea or wheezing flags bronchospasm or lower respiratory involvement."
            }
        ],
        "home_care_en": ["Warm saline gargles twice daily.", "Steam inhalation for 5-10 minutes.", "Stay hydrated and avoid cold or refrigerated beverages."],
        "home_care_hi": ["गुनगुने नमक के पानी से दिन में दो बार गरारे करें।", "5-10 मिनट भाप लें।", "पर्याप्त गुनगुना पानी पिएं और ठंडी चीजों से परहेज करें।"]
    },
    {
        "keywords": ["stomach pain", "pet dard", "loose motion", "diarrhea", "dast", "vomiting", "ulti", "पेट दर्द", "दस्त", "उल्टी"],
        "name_en": "Acute Gastroenteritis / Dyspepsia",
        "name_hi": "पेट संक्रमण एवं दस्त (गैस्ट्रोएंटेराइटिस)",
        "specialist": "Gastroenterologist / Family Medicine",
        "questions": [
            {
                "id": "q_stool_freq",
                "en": "How many loose bowel movements have occurred in the last 24 hours?",
                "hi": "पिछले 24 घंटों में कितनी बार पतले दस्त हुए हैं?",
                "options": ["1 to 3 times", "4 to 7 times", "More than 7 times"],
                "rationale": "High stool frequency flags heightened risk of acute hypovolemic dehydration."
            },
            {
                "id": "q_blood_stool",
                "en": "Have you noticed any blood or mucus in the stool, or severe cramping?",
                "hi": "क्या शौच में खून या आंव (म्यूकस) आ रहा है?",
                "options": ["No blood or mucus", "Yes, mucus present", "Yes, visible blood streaks"],
                "rationale": "Dysentery with blood requires microbiological evaluation and antibiotic stewardship."
            }
        ],
        "home_care_en": ["Drink 1 packet of WHO-formula ORS dissolved in 1 litre of clean boiled water.", "Continue light bland diet (khichdi, curd, bananas).", "Avoid spicy, oily, and outside street food."],
        "home_care_hi": ["1 लीटर उबले पानी में डब्ल्यूएचओ ओआरएस घोलकर घूंट-घूंट पिएं।", "हल्का सुपाच्य आहार (खिचड़ी, दही, केला) लें।", "मसालेदार और खुले में बिकने वाले भोजन से बचें।"]
    },
    {
        "keywords": ["headache", "sar dard", "सिरदर्द", "migraine", "dizziness", "chakkar", "चक्कर"],
        "name_en": "Cephalea / Tension or Vascular Headache",
        "name_hi": "सिरदर्द / माइग्रेन",
        "specialist": "Neurologist / General Physician",
        "questions": [
            {
                "id": "q_headache_vision",
                "en": "Is the headache accompanied by flashing lights, nausea, or sensitivity to light?",
                "hi": "क्या सिरदर्द के साथ रोशनी से चिड़चिड़ाहट या उल्टी का मन हो रहा है?",
                "options": ["Yes, light sensitive & nausea", "Constant dull ache across forehead", "No other symptoms"],
                "rationale": "Photophobia and nausea strongly suggest migraine spectrum etiology."
            }
        ],
        "home_care_en": ["Rest in a quiet, dark, well-ventilated room.", "Ensure adequate hydration and regular sleep intervals.", "Check blood pressure if you have a home monitor."],
        "home_care_hi": ["शांत और अंधेरे कमरे में विश्राम करें।", "पर्याप्त पानी पिएं और नींद पूरी करें।", "यदि बीपी मॉनिटर उपलब्ध हो तो रक्तचाप की जांच करें।"]
    }
]

def analyze_symptoms(request: SymptomTriageRequest) -> SymptomTriageResponse:
    is_hindi = request.language == "hi"
    disclaimer = STATUTORY_DISCLAIMER_HI if is_hindi else STATUTORY_DISCLAIMER_EN
    
    # 1. Critical Red-Flag Emergency Screening
    red_flags = check_for_red_flags(request.symptoms_text)
    
    if red_flags:
        emergency_action = (
            f"आपातकालीन चेतावनी: {red_flags[0]['action_hi']} 108 डायल करें।"
            if is_hindi else
            f"EMERGENCY RED FLAG: {red_flags[0]['action_en']} Immediately dial 108."
        )
        return SymptomTriageResponse(
            confidence_score=0.95,
            confidence_level="High",
            limitations=[
                "Emergency red-flag heuristics trigger immediate offline medical response.",
                "AI cannot perform clinical physical resuscitation or stabilization.",
                "Requires emergency paramedic dispatch or trauma facility triage."
            ],
            is_emergency=True,
            emergency_warning=emergency_action,
            clinical_safety_notice=disclaimer,
            language=request.language,
            provisional_triage_category="EMERGENCY_RED_FLAG (Call 108 Immediately)",
            recommended_care_pathway="Emergency Department / Dial 108 Ambulance",
            suggested_specialist="Emergency Medicine / Critical Care",
            identified_symptoms=[rf["category"] for rf in red_flags],
            follow_up_questions=[],
            educational_health_guidance=[
                "Stay calm and avoid physical exertion." if not is_hindi else "शांत रहें और शारीरिक श्रम बिल्कुल न करें।",
                "Keep patient in recovery posture if breathing, or upright if chest pain." if not is_hindi else "रोगी को आराम से बैठाएं या करवट दिलाकर लिटाएं।"
            ],
            home_comfort_measures=[
                "Do NOT give solid food or liquids if patient is drowsy." if not is_hindi else "मरीज को बेहोशी या सुस्ती में कुछ भी खाने-पीने को न दें।"
            ],
            red_flags_detected=red_flags
        )

    # 2. Match non-emergency symptom profiles
    text_lower = request.symptoms_text.lower()
    matched_profile = None
    identified_symptoms = []

    for profile in SYMPTOM_PROFILES:
        for kw in profile["keywords"]:
            if kw in text_lower:
                matched_profile = profile
                identified_symptoms.append(profile["name_hi"] if is_hindi else profile["name_en"])
                break
        if matched_profile:
            break

    if not matched_profile:
        # Default supportive profile
        matched_profile = SYMPTOM_PROFILES[0] # general
        identified_symptoms = ["General Symptoms Reported" if not is_hindi else "सामान्य लक्षण"]

    # Build structured follow-up questions
    follow_up_qs = []
    for q in matched_profile.get("questions", []):
        q_text = q["hi"] if is_hindi else q["en"]
        follow_up_qs.append(FollowUpQuestion(
            id=q["id"],
            question=q_text,
            options=q["options"],
            clinical_rationale=q["rationale"]
        ))

    # Determine care pathway based on duration
    days = request.duration_days or 1
    if days > 4:
        care_pathway = "Urgent OPD Teleconsultation within 24 hours" if not is_hindi else "24 घंटे के भीतर टेलीमेडिसिन या नजदीकी स्वास्थ्य केंद्र में परामर्श"
        triage_cat = "Urgent Primary Care"
    else:
        care_pathway = "Routine Teleconsultation & Symptom Monitoring" if not is_hindi else "नियमित टेलीमेडिसिन परामर्श एवं घरेलू निगरानी"
        triage_cat = "Routine Consultation"

    guidance = [
        "Monitor temperature and hydration levels twice daily.",
        "Maintain rest and isolate from vulnerable family members if respiratory symptoms persist.",
        "Book a teleconsultation with a verified SwasthyaSetu doctor if symptoms do not improve in 48 hours."
    ] if not is_hindi else [
        "दिन में दो बार तापमान और पानी की मात्रा की निगरानी करें।",
        "पर्याप्त विश्राम करें और घर के बुजुर्गों से दूरी बनाए रखें।",
        "48 घंटों में सुधार न होने पर स्वास्थ्यसेतु डॉक्टर से ऑनलाइन परामर्श लें।"
    ]

    home_care = matched_profile["home_care_hi"] if is_hindi else matched_profile["home_care_en"]

    return SymptomTriageResponse(
        confidence_score=0.82,
        confidence_level="Moderate",
        limitations=[
            "Educational preliminary assessment only. Not a diagnostic confirmation.",
            "Visual examination, auscultation, and laboratory investigations are required for definitive diagnosis.",
            "Assessments are rule-assisted heuristics based on user-provided descriptions."
        ],
        is_emergency=False,
        emergency_warning=None,
        clinical_safety_notice=disclaimer,
        language=request.language,
        provisional_triage_category=triage_cat,
        recommended_care_pathway=care_pathway,
        suggested_specialist=matched_profile["specialist"],
        identified_symptoms=identified_symptoms,
        follow_up_questions=follow_up_qs,
        educational_health_guidance=guidance,
        home_comfort_measures=home_care,
        red_flags_detected=[]
    )
