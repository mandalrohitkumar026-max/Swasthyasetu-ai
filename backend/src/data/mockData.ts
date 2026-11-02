export interface MedicineItem {
  id: string;
  brandName: string;
  genericSalt: string;
  manufacturer: string;
  form: string;
  dosage: string;
  brandedPrice: number;
  janAushadhiPrice: number;
  savingsPercentage: number;
  janAushadhiCode: string;
  indications: string[];
  contraindications: string[];
  inStock: boolean;
}

export interface JanAushadhiKendra {
  id: string;
  name: string;
  address: string;
  district: string;
  state: string;
  pincode: string;
  contactNumber: string;
  distanceKm: number;
  operatingHours: string;
  rating: number;
}

export interface UserProfile {
  id: string;
  role: 'patient' | 'doctor' | 'health_admin' | 'platform_admin';
  name: string;
  phone: string;
  email: string;
  avatarUrl: string;
  preferredLanguage: string;
  abhaNumber?: string;
  abhaAddress?: string;
  specialization?: string;
  medicalCouncilRegNo?: string;
  facilityName?: string;
  district?: string;
  state?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  doctorId: string;
  doctorName: string;
  scheduledTime: string;
  status: 'waiting' | 'in_progress' | 'completed' | 'scheduled';
  consultationMode: 'video' | 'audio' | 'kiosk';
  triagePriority: 'emergency' | 'urgent' | 'routine' | 'self_care';
  chiefComplaints: string[];
  aiClinicalSummary: string;
  webrtcRoomId: string;
  vitals?: {
    bp: string;
    pulse: number;
    spo2: number;
    temperature: string;
  };
}

export interface Prescription {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  doctorRegNo: string;
  diagnosis: string;
  clinicalNotes: string;
  prescribedAt: string;
  signatureHash: string;
  totalBrandedCost: number;
  totalJanAushadhiCost: number;
  totalSavings: number;
  items: {
    medicineId: string;
    brandName: string;
    genericSalt: string;
    dosageInstruction: string;
    durationDays: number;
    quantity: number;
    price: number;
    isGenericSubstituted: boolean;
  }[];
  fhirBundleId: string;
}

// 1. Medicines & Generic Salt Mapping
export const mockMedicines: MedicineItem[] = [
  {
    id: "med-001",
    brandName: "Augmentin 625 Duo",
    genericSalt: "Amoxicillin (500mg) + Clavulanic Acid (125mg)",
    manufacturer: "GSK Pharmaceuticals",
    form: "Tablet",
    dosage: "625mg",
    brandedPrice: 215.50,
    janAushadhiPrice: 48.00,
    savingsPercentage: 77.7,
    janAushadhiCode: "PMBJP-ANTI-012",
    indications: ["Bacterial infections", "Respiratory tract infection", "Sinusitis", "Otitis media"],
    contraindications: ["Penicillin hypersensitivity", "Hepatic impairment"],
    inStock: true
  },
  {
    id: "med-002",
    brandName: "Pan-D Capsule",
    genericSalt: "Pantoprazole (40mg) + Domperidone (30mg)",
    manufacturer: "Alkem Laboratories",
    form: "Capsule",
    dosage: "40mg/30mg",
    brandedPrice: 198.00,
    janAushadhiPrice: 32.50,
    savingsPercentage: 83.6,
    janAushadhiCode: "PMBJP-GASTRO-004",
    indications: ["Gastroesophageal Reflux Disease (GERD)", "Acidity", "Heartburn"],
    contraindications: ["GI hemorrhage", "Mechanical obstruction"],
    inStock: true
  },
  {
    id: "med-003",
    brandName: "Glycomet-GP 2",
    genericSalt: "Metformin (500mg) + Glimepiride (2mg)",
    manufacturer: "USV Ltd",
    form: "Tablet",
    dosage: "500mg/2mg",
    brandedPrice: 172.00,
    janAushadhiPrice: 38.00,
    savingsPercentage: 77.9,
    janAushadhiCode: "PMBJP-DIAB-022",
    indications: ["Type 2 Diabetes Mellitus", "Blood sugar regulation"],
    contraindications: ["Severe renal impairment (eGFR < 30)", "Ketoacidosis"],
    inStock: true
  },
  {
    id: "med-004",
    brandName: "Telma-40",
    genericSalt: "Telmisartan (40mg)",
    manufacturer: "Glenmark Pharmaceuticals",
    form: "Tablet",
    dosage: "40mg",
    brandedPrice: 145.00,
    janAushadhiPrice: 22.00,
    savingsPercentage: 84.8,
    janAushadhiCode: "PMBJP-CARDIO-015",
    indications: ["Essential Hypertension", "Cardiovascular risk reduction"],
    contraindications: ["Pregnancy", "Biliary obstructive disorders"],
    inStock: true
  },
  {
    id: "med-005",
    brandName: "Atorva 10",
    genericSalt: "Atorvastatin (10mg)",
    manufacturer: "Zydus Cadila",
    form: "Tablet",
    dosage: "10mg",
    brandedPrice: 135.00,
    janAushadhiPrice: 20.00,
    savingsPercentage: 85.2,
    janAushadhiCode: "PMBJP-LIPID-008",
    indications: ["Hypercholesterolemia", "Prevention of Atherosclerosis"],
    contraindications: ["Active liver disease", "Unexplained persistent transaminase elevations"],
    inStock: true
  },
  {
    id: "med-006",
    brandName: "Azithral 500",
    genericSalt: "Azithromycin (500mg)",
    manufacturer: "Alembic Pharmaceuticals",
    form: "Tablet",
    dosage: "500mg",
    brandedPrice: 140.00,
    janAushadhiPrice: 35.00,
    savingsPercentage: 75.0,
    janAushadhiCode: "PMBJP-ANTI-005",
    indications: ["Community-acquired pneumonia", "Strep throat", "Skin infections"],
    contraindications: ["Cholestatic jaundice history", "QT prolongation"],
    inStock: true
  },
  {
    id: "med-007",
    brandName: "Calpol 650",
    genericSalt: "Paracetamol (650mg)",
    manufacturer: "GSK India",
    form: "Tablet",
    dosage: "650mg",
    brandedPrice: 34.00,
    janAushadhiPrice: 9.50,
    savingsPercentage: 72.1,
    janAushadhiCode: "PMBJP-ANALG-001",
    indications: ["Pyrexia (Fever)", "Mild to moderate analgesia"],
    contraindications: ["Severe hepatocellular insufficiency"],
    inStock: true
  },
  {
    id: "med-008",
    brandName: "Montair-LC",
    genericSalt: "Montelukast (10mg) + Levocetirizine (5mg)",
    manufacturer: "Cipla",
    form: "Tablet",
    dosage: "10mg/5mg",
    brandedPrice: 248.00,
    janAushadhiPrice: 42.00,
    savingsPercentage: 83.1,
    janAushadhiCode: "PMBJP-RESP-018",
    indications: ["Allergic rhinitis", "Asthmatic bronchospasm prevention"],
    contraindications: ["Severe renal impairment"],
    inStock: true
  }
];

// 2. Jan Aushadhi Kendras (Kiosks & Pharmacies)
export const mockKendras: JanAushadhiKendra[] = [
  {
    id: "kendra-101",
    name: "PMBJP Kendra #1084 - Sitapur Sadar",
    address: "Near District Hospital Gate, Station Road",
    district: "Sitapur",
    state: "Uttar Pradesh",
    pincode: "261001",
    contactNumber: "+91 94500 12345",
    distanceKm: 2.3,
    operatingHours: "08:00 AM - 09:00 PM",
    rating: 4.8
  },
  {
    id: "kendra-102",
    name: "PMBJP Kendra #3205 - Laharpur Health Post",
    address: "Opposite Gram Panchayat Bhawan, Main Bazaar",
    district: "Sitapur",
    state: "Uttar Pradesh",
    pincode: "261135",
    contactNumber: "+91 94150 98765",
    distanceKm: 8.6,
    operatingHours: "09:00 AM - 07:00 PM",
    rating: 4.6
  },
  {
    id: "kendra-103",
    name: "PMBJP Kendra #5411 - Bengaluru Indiranagar",
    address: "12th Main Road, HAL 2nd Stage",
    district: "Bengaluru Urban",
    state: "Karnataka",
    pincode: "560038",
    contactNumber: "+91 98450 44321",
    distanceKm: 1.8,
    operatingHours: "08:30 AM - 10:00 PM",
    rating: 4.9
  }
];

// 3. User Profiles for all 4 Roles
export const mockUsers: Record<string, UserProfile> = {
  patient: {
    id: "usr-pat-01",
    role: "patient",
    name: "Ramesh Kumar",
    phone: "+91 98765 43210",
    email: "ramesh.kumar@gram.in",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    preferredLanguage: "hi",
    abhaNumber: "91-4521-8890-1234",
    abhaAddress: "ramesh.sitapur@abdm",
    district: "Sitapur",
    state: "Uttar Pradesh"
  },
  doctor: {
    id: "usr-doc-01",
    role: "doctor",
    name: "Dr. Arvind Rao, MD",
    phone: "+91 91234 56789",
    email: "dr.arvind@swasthyasetu.ai",
    avatarUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150",
    preferredLanguage: "en",
    specialization: "General Physician & Internal Medicine",
    medicalCouncilRegNo: "MCI/UP-2012/048821",
    facilityName: "District Telehealth Hub & Apollo Clinics",
    district: "Lucknow",
    state: "Uttar Pradesh"
  },
  health_admin: {
    id: "usr-adm-01",
    role: "health_admin",
    name: "Rajesh Nair",
    phone: "+91 94470 11223",
    email: "rajesh.nair@phc.sitapur.gov.in",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    preferredLanguage: "en",
    facilityName: "Sitapur Community Health Center (CHC) & 14 Gram Kiosks",
    district: "Sitapur",
    state: "Uttar Pradesh"
  },
  platform_admin: {
    id: "usr-plt-01",
    role: "platform_admin",
    name: "Priya Mehta",
    phone: "+91 99880 77665",
    email: "priya.mehta@swasthyasetu.ai",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
    preferredLanguage: "en",
    facilityName: "National Health Mission - Digital Architecture Cell",
    district: "New Delhi",
    state: "Delhi"
  }
};

// 4. Active Appointments Queue
export const mockAppointments: Appointment[] = [
  {
    id: "apt-001",
    patientId: "usr-pat-01",
    patientName: "Ramesh Kumar",
    patientAge: 48,
    patientGender: "Male",
    doctorId: "usr-doc-01",
    doctorName: "Dr. Arvind Rao, MD",
    scheduledTime: "Today, 10:30 AM",
    status: "waiting",
    consultationMode: "kiosk",
    triagePriority: "urgent",
    chiefComplaints: [
      "Frequent excessive thirst (Polydipsia)",
      "Unexplained fatigue for 10 days",
      "Persistent dizziness upon standing"
    ],
    aiClinicalSummary: "Patient presents with classical hyperglycemic triad symptoms in rural setting. Fasting capillary glucose tested via ASHA glucometer was 242 mg/dL. Blood pressure 144/92 mmHg. High probability of decompensated Type 2 Diabetes Mellitus. Red flags for acute ketoacidosis currently negative.",
    webrtcRoomId: "swasthya-room-sitapur-kiosk-01",
    vitals: {
      bp: "144/92 mmHg",
      pulse: 84,
      spo2: 98,
      temperature: "98.4 °F"
    }
  },
  {
    id: "apt-002",
    patientId: "usr-pat-02",
    patientName: "Sunita Devi",
    patientAge: 32,
    patientGender: "Female",
    doctorId: "usr-doc-01",
    doctorName: "Dr. Arvind Rao, MD",
    scheduledTime: "Today, 11:00 AM",
    status: "scheduled",
    consultationMode: "video",
    triagePriority: "routine",
    chiefComplaints: [
      "Productive cough for 5 days",
      "Low grade intermittent evening fever",
      "Throat irritation"
    ],
    aiClinicalSummary: "Upper respiratory tract infection. No dyspnea or hemoptysis. SpO2 99%. Recommending routine teleconsultation and supportive medication.",
    webrtcRoomId: "swasthya-room-tele-02",
    vitals: {
      bp: "118/76 mmHg",
      pulse: 76,
      spo2: 99,
      temperature: "99.8 °F"
    }
  },
  {
    id: "apt-003",
    patientId: "usr-pat-03",
    patientName: "Mohammed Farooq",
    patientAge: 62,
    patientGender: "Male",
    doctorId: "usr-doc-01",
    doctorName: "Dr. Arvind Rao, MD",
    scheduledTime: "Today, 11:30 AM",
    status: "scheduled",
    consultationMode: "audio",
    triagePriority: "routine",
    chiefComplaints: [
      "Knee osteoarthritis stiffness",
      "Requires generic medicine renewal for hypertension"
    ],
    aiClinicalSummary: "Routine chronic care follow-up. Existing Telmisartan 40mg prescription due for monthly renewal.",
    webrtcRoomId: "swasthya-room-tele-03",
    vitals: {
      bp: "132/84 mmHg",
      pulse: 72,
      spo2: 97,
      temperature: "98.2 °F"
    }
  }
];

// 5. Prescriptions History
export const mockPrescriptions: Prescription[] = [
  {
    id: "rx-9821",
    appointmentId: "apt-001",
    patientId: "usr-pat-01",
    patientName: "Ramesh Kumar",
    doctorId: "usr-doc-01",
    doctorName: "Dr. Arvind Rao, MD",
    doctorRegNo: "MCI/UP-2012/048821",
    diagnosis: "Type 2 Diabetes Mellitus with Essential Stage-1 Hypertension",
    clinicalNotes: "Dietary restriction of refined carbohydrates advised. Daily 30 min brisk walk. Follow-up fasting lipid profile and HbA1c in 4 weeks. Repeat blood pressure check at Gram Kiosk weekly.",
    prescribedAt: "2026-11-01T10:45:00Z",
    signatureHash: "0x8F9A43E...SHA256-DIGITAL-SIGNATURE-VERIFIED",
    totalBrandedCost: 515.00,
    totalJanAushadhiCost: 108.00,
    totalSavings: 407.00,
    items: [
      {
        medicineId: "med-003",
        brandName: "Glycomet-GP 2",
        genericSalt: "Metformin (500mg) + Glimepiride (2mg)",
        dosageInstruction: "1 tablet daily before breakfast",
        durationDays: 30,
        quantity: 30,
        price: 38.00,
        isGenericSubstituted: true
      },
      {
        medicineId: "med-004",
        brandName: "Telma-40",
        genericSalt: "Telmisartan (40mg)",
        dosageInstruction: "1 tablet daily morning after breakfast",
        durationDays: 30,
        quantity: 30,
        price: 22.00,
        isGenericSubstituted: true
      },
      {
        medicineId: "med-002",
        brandName: "Pan-D Capsule",
        genericSalt: "Pantoprazole (40mg) + Domperidone (30mg)",
        dosageInstruction: "1 capsule empty stomach morning (SOS / As needed)",
        durationDays: 15,
        quantity: 15,
        price: 16.25,
        isGenericSubstituted: true
      }
    ],
    fhirBundleId: "urn:uuid:fhir-bundle-rx-9821-abdm"
  }
];

// 6. Outbreak Surveillance Data for Health Admins
export const mockOutbreakData = [
  {
    id: "outbreak-01",
    disease: "Dengue & Viral Pyrexia",
    district: "Sitapur",
    subCentersAffected: ["Laharpur", "Maholi", "Khairabad"],
    casesCount: 42,
    weeklyTrend: "+28%",
    riskLevel: "High",
    alertGeneratedAt: "2026-10-31"
  },
  {
    id: "outbreak-02",
    disease: "Acute Gastroenteritis / Diarrheal Cluster",
    district: "Barabanki",
    subCentersAffected: ["Ramnagar", "Fatehpur"],
    casesCount: 19,
    weeklyTrend: "-12%",
    riskLevel: "Moderate",
    alertGeneratedAt: "2026-10-29"
  },
  {
    id: "outbreak-03",
    disease: "Seasonal Respiratory Syncytial Infection",
    district: "Lucknow Rural",
    subCentersAffected: ["Bakshi Ka Talab", "Mohanlalganj"],
    casesCount: 65,
    weeklyTrend: "+8%",
    riskLevel: "Moderate",
    alertGeneratedAt: "2026-10-30"
  }
];

// 7. System Health & Platform Metrics
export const mockSystemMetrics = {
  activeUsersToday: 48920,
  teleconsultationsCompletedToday: 3412,
  averageWaitTimeMinutes: 4.2,
  genericSavingsGeneratedINR: 1845200,
  activeKiosksOnline: 124,
  systemUptime: "99.98%",
  networkDegradationResilienceEvents: 1204,
  abdmSyncSuccessRate: "99.4%"
};
