export interface PublishedPrice {
  serviceName: string;
  governmentRate: number;
  privateMarketAverageRate: number;
  isSubsidizedOrFree: boolean;
  notes?: string;
}

export interface HealthcareCenterResource {
  _id: string;
  name: string;
  category: 'clinic' | 'hospital' | 'diagnostic_lab' | 'pharmacy' | 'government_resource';
  type: string;
  address: string;
  district: string;
  state: string;
  pincode: string;
  contactNumber: string;
  operatingHours: string;
  emergencyCasualtyAvailable?: boolean;
  hasStockAvailable?: boolean;
  kioskUptimePercentage?: number;
  servicesOffered: string[];
  accreditations: string[];
  schemesAccepted: string[];
  publishedPricing: PublishedPrice[];
}

export const FALLBACK_HEALTHCARE_CENTERS: HealthcareCenterResource[] = [
  {
    _id: 'res-phc-maholi-01',
    name: 'Primary Health Centre (PHC) & Ayushman Arogya Mandir - Maholi',
    category: 'clinic',
    type: 'phc',
    address: 'Near Block Development Office, Maholi',
    district: 'Sitapur',
    state: 'Uttar Pradesh',
    pincode: '261141',
    contactNumber: '+91 5862 248101',
    operatingHours: '08:00 AM - 04:00 PM',
    emergencyCasualtyAvailable: false,
    hasStockAvailable: true,
    kioskUptimePercentage: 99.4,
    servicesOffered: [
      'General OPD Consultation',
      'Maternal Antenatal Care (ANC)',
      'NCD Diabetes & BP Screening',
      'National Immunization Schedule',
      'Free Essential Diagnostics'
    ],
    accreditations: ['Ayushman Arogya Mandir Certified', 'National Health Mission'],
    schemesAccepted: ['Ayushman Bharat (PM-JAY)', 'Free Essential Drugs Scheme', 'Janani Suraksha Yojana'],
    publishedPricing: [
      { serviceName: 'General Physician OPD Consultation', governmentRate: 0, privateMarketAverageRate: 350, isSubsidizedOrFree: true, notes: '100% Free under National Health Mission' },
      { serviceName: 'Antenatal Checkup & Iron-Folic Supplements', governmentRate: 0, privateMarketAverageRate: 500, isSubsidizedOrFree: true, notes: 'Free under Janani Suraksha Yojana' },
      { serviceName: 'Random Blood Sugar Screening', governmentRate: 0, privateMarketAverageRate: 100, isSubsidizedOrFree: true, notes: 'Free NCD point-of-care test' }
    ]
  },
  {
    _id: 'res-uphc-sitapur-02',
    name: 'Urban Primary Health Centre (UPHC) - Civil Lines, Sitapur',
    category: 'clinic',
    type: 'uphc',
    address: 'Near Old Bus Stand, Civil Lines, Sitapur',
    district: 'Sitapur',
    state: 'Uttar Pradesh',
    pincode: '261001',
    contactNumber: '+91 5862 250114',
    operatingHours: '08:00 AM - 02:00 PM',
    emergencyCasualtyAvailable: false,
    hasStockAvailable: true,
    kioskUptimePercentage: 99.1,
    servicesOffered: [
      'Urban Day OPD',
      'Geriatric Chronic Care',
      'Routine Pathology Sample Collection',
      'Free Jan Aushadhi Dispensing Kiosk'
    ],
    accreditations: ['Urban Health Mission (NUHM)'],
    schemesAccepted: ['Ayushman Bharat PM-JAY', 'UP Mukhyamantri Jan Arogya Yojana'],
    publishedPricing: [
      { serviceName: 'OPD Clinical Consultation', governmentRate: 0, privateMarketAverageRate: 400, isSubsidizedOrFree: true },
      { serviceName: 'Blood Pressure & ECG Checkup', governmentRate: 0, privateMarketAverageRate: 300, isSubsidizedOrFree: true }
    ]
  },
  {
    _id: 'res-hosp-sitapur-03',
    name: 'Sitapur District Civil Hospital (300-Bed Govt Secondary Care)',
    category: 'hospital',
    type: 'district_hospital',
    address: 'Hospital Road, Civil Lines, Sitapur',
    district: 'Sitapur',
    state: 'Uttar Pradesh',
    pincode: '261001',
    contactNumber: '+91 5862 251900',
    operatingHours: '24x7 Emergency Casualty & Inpatient Services',
    emergencyCasualtyAvailable: true,
    hasStockAvailable: true,
    kioskUptimePercentage: 99.8,
    servicesOffered: [
      '24x7 Emergency Casualty & Trauma',
      'Inpatient Surgery & Medical Wards',
      'Intensive Care Unit (ICU)',
      'Hemodialysis Care Unit',
      'Dedicated 24x7 Blood Bank'
    ],
    accreditations: ['NQAS Certified Level-1', 'NABH Empaneled'],
    schemesAccepted: ['Ayushman Bharat PM-JAY (Cashless Treatment)', 'Rashtriya Arogya Nidhi'],
    publishedPricing: [
      { serviceName: 'Emergency Casualty Admission & Resuscitation', governmentRate: 0, privateMarketAverageRate: 2500, isSubsidizedOrFree: true, notes: 'Zero out-of-pocket for eligible citizens' },
      { serviceName: 'Renal Hemodialysis Session', governmentRate: 0, privateMarketAverageRate: 1800, isSubsidizedOrFree: true, notes: 'Free under PM National Dialysis Programme' },
      { serviceName: 'Chest X-Ray Digital 2-View', governmentRate: 40, privateMarketAverageRate: 450, isSubsidizedOrFree: true, notes: 'Subsidized at nominal UP Govt tariff' }
    ]
  },
  {
    _id: 'res-lab-sitapur-04',
    name: 'Government Integrated Public Health Diagnostic Lab (IPHL)',
    category: 'diagnostic_lab',
    type: 'pathology_lab',
    address: 'District Hospital Campus, Sitapur',
    district: 'Sitapur',
    state: 'Uttar Pradesh',
    pincode: '261001',
    contactNumber: '+91 5862 252044',
    operatingHours: '07:30 AM - 05:00 PM (Emergency 24x7)',
    emergencyCasualtyAvailable: false,
    hasStockAvailable: true,
    kioskUptimePercentage: 99.5,
    servicesOffered: [
      'Complete Blood Count (CBC) Automated',
      'HbA1c Glycated Hemoglobin',
      'Lipid Profile & Liver Function Tests',
      'Thyroid Function (TSH, T3, T4)',
      'Digital Ultrasound & ECG'
    ],
    accreditations: ['NABL Accredited', 'ICMR Quality Network'],
    schemesAccepted: ['Free Diagnostics Service Initiative (FDSI)', 'Ayushman Bharat PM-JAY'],
    publishedPricing: [
      { serviceName: 'Complete Blood Count (CBC)', governmentRate: 0, privateMarketAverageRate: 320, isSubsidizedOrFree: true, notes: 'Free under NHM Free Diagnostics Initiative' },
      { serviceName: 'Glycated Hemoglobin (HbA1c)', governmentRate: 0, privateMarketAverageRate: 550, isSubsidizedOrFree: true, notes: 'Free for enrolled diabetes registry patients' },
      { serviceName: 'Complete Lipid Profile (Cholesterol + Triglycerides)', governmentRate: 50, privateMarketAverageRate: 650, isSubsidizedOrFree: true, notes: 'Subsidized tariff' }
    ]
  },
  {
    _id: 'res-pharma-jan-aushadhi-05',
    name: 'Pradhan Mantri Jan Aushadhi Kendra (PMBI Store #4412)',
    category: 'pharmacy',
    type: 'jan_aushadhi',
    address: 'Opposite Gate No. 2, District Hospital, Civil Lines, Sitapur',
    district: 'Sitapur',
    state: 'Uttar Pradesh',
    pincode: '261001',
    contactNumber: '+91 9415 128940',
    operatingHours: '08:00 AM - 09:00 PM (All 7 Days)',
    emergencyCasualtyAvailable: false,
    hasStockAvailable: true,
    kioskUptimePercentage: 99.7,
    servicesOffered: [
      'Generic WHO-GMP Certified Medicines',
      'Affordable Surgical Consumables & Gauze',
      'Ayushman Suvidha Oxo-Biodegradable Sanitary Pads',
      'Chronic Diabetes & Hypertension Pill Dispensing'
    ],
    accreditations: ['Pharmaceuticals & Medical Devices Bureau of India (PMBI)'],
    schemesAccepted: ['Direct Subsidized Retail (50% to 90% cheaper than branded drugs)'],
    publishedPricing: [
      { serviceName: 'Metformin 500mg SR (Strip of 10 Tablets)', governmentRate: 4.5, privateMarketAverageRate: 35, isSubsidizedOrFree: true, notes: '87% Savings vs branded glucophage' },
      { serviceName: 'Amlodipine 5mg (Strip of 10 Tablets)', governmentRate: 6.0, privateMarketAverageRate: 42, isSubsidizedOrFree: true, notes: '85% Savings' },
      { serviceName: 'Paracetamol 650mg (Strip of 10 Tablets)', governmentRate: 7.5, privateMarketAverageRate: 32, isSubsidizedOrFree: true, notes: '76% Savings' }
    ]
  },
  {
    _id: 'res-govt-abdm-06',
    name: 'UP Health Department Help Desk & Ayushman Mitra Assistance Hub',
    category: 'government_resource',
    type: 'government_helpline',
    address: 'Collectorate Compound & CMO Office, Sitapur',
    district: 'Sitapur',
    state: 'Uttar Pradesh',
    pincode: '261001',
    contactNumber: '108 / 104 / 14555',
    operatingHours: '24 Hours Toll-Free Citizen Support',
    emergencyCasualtyAvailable: true,
    hasStockAvailable: true,
    kioskUptimePercentage: 99.9,
    servicesOffered: [
      '108 National Ambulance Emergency Dispatch',
      '104 Health Information & Doctor Tele-Triage Helpline',
      '14555 PM-JAY Golden Card Eligibility & KYC Assistance',
      'ABHA Health ID Instant Creation & Linking'
    ],
    accreditations: ['Government of Uttar Pradesh', 'National Health Authority (NHA)'],
    schemesAccepted: ['100% Free Public Citizen Welfare Helpline'],
    publishedPricing: [
      { serviceName: '108 Emergency Ambulance Dispatch to Hospital', governmentRate: 0, privateMarketAverageRate: 1500, isSubsidizedOrFree: true, notes: '100% Toll-Free public emergency response' },
      { serviceName: 'Ayushman Bharat Golden Card Issuance & KYC', governmentRate: 0, privateMarketAverageRate: 150, isSubsidizedOrFree: true, notes: 'Completely Free across all kiosks' }
    ]
  }
];

export const FALLBACK_CATEGORY_COUNTS = {
  clinic: 2,
  hospital: 1,
  diagnostic_lab: 1,
  pharmacy: 1,
  government_resource: 1,
  total: 6,
};
