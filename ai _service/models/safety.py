"""
Responsible Healthcare AI Safety Guardrails & Emergency Definitions.
Compliant with National Digital Health Mission (ABDM) & WHO AI Health Guidelines.
"""

STATUTORY_DISCLAIMER_EN = (
    "DISCLAIMER: SwasthyaSetu AI is an educational health assistant and preliminary screening tool. "
    "It is NOT a medical device, diagnostic system, or substitute for professional medical advice, "
    "diagnosis, or clinical treatment. If you are experiencing a medical emergency, immediately dial "
    "108 (India Emergency Ambulance) or visit the nearest hospital emergency department."
)

STATUTORY_DISCLAIMER_HI = (
    "वैधानिक अस्वीकरण: स्वास्थ्यसेतु एआई एक शैक्षिक स्वास्थ्य सहायक और प्रारंभिक स्क्रीनिंग उपकरण है। "
    "यह कोई नैदानिक उपकरण या डॉक्टर का विकल्प नहीं है। किसी भी चिकित्सीय आपात स्थिति में तुरंत "
    "108 (एम्बुलेंस) पर कॉल करें या नजदीकी आपातकालीन केंद्र जाएं।"
)

# Critical Red-Flag Clinical Patterns
RED_FLAGS = [
    {
        "id": "ACUTE_CORONARY_SYNDROME",
        "category": "Cardiac Emergency",
        "keywords_en": ["chest pain", "crushing pain", "radiating pain", "left arm pain", "jaw pain", "pressure on chest", "heart attack"],
        "keywords_hi": ["छाती में दर्द", "सीने में दर्द", "दिल का दौरा", "बाएं हाथ में दर्द", "सीने में भारीपन", "छाती में दबाव"],
        "action_en": "Immediate Emergency Ambulance (Call 108). Keep patient resting. Do not exert.",
        "action_hi": "तुरंत 108 एम्बुलेंस बुलाएं। मरीज को आराम की स्थिति में रखें। चलने-फिरने न दें।",
    },
    {
        "id": "STROKE_BEFAST",
        "category": "Neurological Emergency",
        "keywords_en": ["slurred speech", "facial drooping", "face numbness", "sudden paralysis", "arm weakness", "sudden loss of vision", "stroke"],
        "keywords_hi": ["लकवा", "चेहरे का टेढ़ा होना", "बोलने में लड़खड़ाहट", "एक तरफ कमजोरी", "हाथ का काम न करना", "अचानक अंधापन"],
        "action_en": "Acute Stroke Warning: Time is brain. Transport immediately to a stroke-ready hospital within golden hour.",
        "action_hi": "स्ट्रोक की चेतावनी: मरीज को तुरंत निकटतम सीटी स्कैन युक्त अस्पताल ले जाएं।",
    },
    {
        "id": "ACUTE_RESPIRATORY_FAILURE",
        "category": "Respiratory Emergency",
        "keywords_en": ["severe breathlessness", "gasping for air", "blue lips", "cannot speak full sentences", "choking"],
        "keywords_hi": ["सांस लेने में भारी तकलीफ", "दम घुटना", "होठ नीले पड़ना", "सांस न आना", "गला रुंधना"],
        "action_en": "Severe respiratory distress. Administer supplemental oxygen if available and call 108 immediately.",
        "action_hi": "गंभीर सांस संकट। यदि उपलब्ध हो तो ऑक्सीजन दें और तुरंत 108 डायल करें।",
    },
    {
        "id": "PEDIATRIC_DANGER_SIGNS",
        "category": "Pediatric Emergency",
        "keywords_en": ["infant high fever", "child lethargy", "convulsions", "child fits", "child unconscious", "inability to feed"],
        "keywords_hi": ["बच्चे को तेज बुखार", "बच्चे को दौरे", "बच्चे का सुस्त पड़ना", "दूध न पीना", "बेहोश बच्चा"],
        "action_en": "Pediatric red flag. Take child immediately to nearest pediatric intensive care or civil hospital.",
        "action_hi": "शिशु आपात संकेत। बच्चे को तुरंत नजदीकी बाल रोग विशेषज्ञ या जिला अस्पताल ले जाएं।",
    },
    {
        "id": "SEVERE_HEMORRHAGE",
        "category": "Trauma / Bleeding",
        "keywords_en": ["uncontrolled bleeding", "vomiting blood", "coughing blood", "black tarry stools", "head injury unconscious"],
        "keywords_hi": ["खून की उल्टी", "खांसी में खून", "बेकाबू खून बहना", "सिर की गंभीर चोट"],
        "action_en": "Active severe hemorrhage or severe trauma. Apply direct pressure to wound and call 108.",
        "action_hi": "घाव पर साफ कपड़े से सीधा दबाव बनाएं और तुरंत आपातकालीन सहायता लें।",
    }
]

def check_for_red_flags(text: str) -> list:
    """
    Scans free text in English or Hindi for emergency clinical warning patterns.
    """
    text_lower = text.lower()
    detected = []
    
    for flag in RED_FLAGS:
        matched = False
        matched_term = None
        for kw in flag["keywords_en"]:
            if kw in text_lower:
                matched = True
                matched_term = kw
                break
        if not matched:
            for kw in flag["keywords_hi"]:
                if kw in text:
                    matched = True
                    matched_term = kw
                    break
        
        if matched:
            detected.append({
                "flag_id": flag["id"],
                "category": flag["category"],
                "trigger_term": matched_term,
                "action_en": flag["action_en"],
                "action_hi": flag["action_hi"],
            })
            
    return detected
