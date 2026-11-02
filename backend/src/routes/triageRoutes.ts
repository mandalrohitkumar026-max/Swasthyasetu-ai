import { Router, Request, Response } from 'express';

const router = Router();

// Red flag emergency keyword patterns
const RED_FLAGS = [
  {
    pattern: /(chest pain|angina|heart attack|chhati me dard|seene me dard|left arm pain)/i,
    category: "Cardiovascular Emergency",
    action: "IMMEDIATE AMBULANCE (CALL 108): Possible Myocardial Infarction / Acute Coronary Syndrome. Advise patient to chew 300mg soluble Aspirin if not allergic and sit upright immediately."
  },
  {
    pattern: /(difficulty breathing|severe breathlessness|saans lene me takleef|choking|gasping|bluish lips)/i,
    category: "Severe Respiratory Distress",
    action: "EMERGENCY: Immediate oxygenation required. Transport immediately to nearest Community Health Center / Emergency room."
  },
  {
    pattern: /(face drooping|arm weakness|slurred speech|stroke|adhrang|falij|loss of consciousness|behoshi)/i,
    category: "Acute Neurological / Stroke (FAST)",
    action: "CRITICAL STROKE WINDOW: Patient may require immediate thrombolysis within 4.5 hours. Rush to comprehensive stroke center."
  },
  {
    pattern: /(severe bleeding|khun behna|vomiting blood|khun ki ulti|hemorrhage)/i,
    category: "Acute Hemorrhagic Emergency",
    action: "CRITICAL: Direct compression on hemorrhage site, prevent shock, elevate lower extremities, emergency transport."
  }
];

// Clinical diagnostic knowledge mappings
const CLINICAL_DIAGNOSTICS = [
  {
    keywords: /(sugar|diabetes|thirst|pyaas|frequent urination|bar bar peshab|chakkar|dizziness)/i,
    suspectedCondition: "Suspected Type 2 Diabetes Mellitus / Hyperglycemic Episode",
    icd10: "E11.9",
    suggestedInvestigations: ["Fasting Capillary Blood Glucose", "HbA1c", "Urine Ketones"],
    specialistType: "General Physician / Endocrinologist",
    priority: "urgent" as const
  },
  {
    keywords: /(cough|khansi|fever|bukhar|cold|sardi|throat|gale me dard)/i,
    suspectedCondition: "Acute Upper Respiratory Tract Infection (URTI) / Viral Pharyngitis",
    icd10: "J06.9",
    suggestedInvestigations: ["SpO2 via Pulse Oximeter", "Temperature check"],
    specialistType: "General Physician",
    priority: "routine" as const
  },
  {
    keywords: /(headache|sar dard|migraine|vomiting|ulti|nausea)/i,
    suspectedCondition: "Tension-Type Headache vs. Acute Migraine Episode",
    icd10: "G43.9",
    suggestedInvestigations: ["Blood Pressure Evaluation", "Visual Acuity Check"],
    specialistType: "General Physician / Neurologist",
    priority: "routine" as const
  },
  {
    keywords: /(joint pain|ghutne me dard|gathiya|back pain|kamar dard|swelling)/i,
    suspectedCondition: "Osteoarthritis / Lumbar Spondylosis",
    icd10: "M19.9",
    suggestedInvestigations: ["X-Ray AP/Lateral of affected joint", "Serum Uric Acid"],
    specialistType: "Orthopedic / General Physician",
    priority: "routine" as const
  },
  {
    keywords: /(loose motion|dast|pet dard|stomach ache|diarrhea|dehydration)/i,
    suspectedCondition: "Acute Infective Gastroenteritis",
    icd10: "A09.0",
    suggestedInvestigations: ["Oral Rehydration Salts (ORS) readiness", "Stool Routine"],
    specialistType: "General Physician",
    priority: "urgent" as const
  }
];

router.post('/assess', (req: Request, res: Response) => {
  const { symptomsText, language = 'en', patientName = 'Ramesh Kumar', patientAge = 48, patientGender = 'Male', vitals } = req.body;

  if (!symptomsText || typeof symptomsText !== 'string') {
    return res.status(400).json({ error: "symptomsText is required" });
  }

  // 1. Check for Emergency Red Flags
  for (const redFlag of RED_FLAGS) {
    if (redFlag.pattern.test(symptomsText)) {
      return res.json({
        triagePriority: 'emergency',
        isEmergency: true,
        alertTitle: `CRITICAL ALERT: ${redFlag.category}`,
        alertMessage: redFlag.action,
        emergencyHotline: "108 (National Ambulance Service)",
        immediateActionSteps: [
          "Do not delay or wait for regular teleconsultation.",
          "Alert nearby family members or village ASHA facilitator immediately.",
          "Keep patient in recovery posture; preserve airway.",
          "Proceed to the nearest Emergency Department / District Hospital."
        ],
        summaryForDoctor: `[EMERGENCY TRIAGE]: Patient described: "${symptomsText}". Immediate red flag triggered for ${redFlag.category}. Emergency protocol 108 activated.`
      });
    }
  }

  // 2. Identify clinical matches
  let matchedDiagnosis = CLINICAL_DIAGNOSTICS.find(cd => cd.keywords.test(symptomsText));
  
  if (!matchedDiagnosis) {
    matchedDiagnosis = {
      keywords: /.*/,
      suspectedCondition: "General Malaise & Primary Clinical Evaluation",
      icd10: "R53.83",
      suggestedInvestigations: ["Basic Complete Blood Count (CBC)", "Vitals Check"],
      specialistType: "General Physician",
      priority: "routine"
    };
  }

  // 3. Synthesize structured clinical triage note
  const clinicalSummary = `PATIENT TRIAGE BRIEF:
- Patient: ${patientName} (${patientAge}y, ${patientGender})
- Chief Symptom Input: "${symptomsText}"
- Primary Working Impression: ${matchedDiagnosis.suspectedCondition} [ICD-10: ${matchedDiagnosis.icd10}]
- Recommended Investigations: ${matchedDiagnosis.suggestedInvestigations.join(', ')}
- Suggested Care Path: Virtual teleconsultation with a ${matchedDiagnosis.specialistType}.
- Vitals Recorded: ${vitals?.bp ? `BP ${vitals.bp}, Pulse ${vitals.pulse} bpm, SpO2 ${vitals.spo2}%` : 'Standard vitals collection recommended during consultation.'}
- Cost Saving Note: Generic Jan Aushadhi substitution eligible for potential pharmacotherapy.`;

  return res.json({
    triagePriority: matchedDiagnosis.priority,
    isEmergency: false,
    provisionalCondition: matchedDiagnosis.suspectedCondition,
    icd10Code: matchedDiagnosis.icd10,
    specialistRecommended: matchedDiagnosis.specialistType,
    suggestedInvestigations: matchedDiagnosis.suggestedInvestigations,
    clinicalSummary,
    estimatedWaitTimeMinutes: matchedDiagnosis.priority === 'urgent' ? 3 : 8,
    vernacularAdvice: language === 'hi' 
      ? `आपके लक्षणों की जांच हो गई है। हमारी प्राथमिक समझ: "${matchedDiagnosis.suspectedCondition}"। डॉक्टर जल्द ही वीडियो या ऑडियो कॉल पर आपसे जुड़ेंगे।`
      : `Your symptoms have been analyzed. Working diagnosis: "${matchedDiagnosis.suspectedCondition}". A certified physician will attend to your consultation shortly.`
  });
});

export default router;
