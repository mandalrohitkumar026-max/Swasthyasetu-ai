export type UserRole = 'patient' | 'doctor' | 'health_admin' | 'platform_admin';

export interface UserProfile {
  id: string;
  role: UserRole;
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
  age?: number;
  gender?: string;
  bloodGroup?: string;
}

export interface Doctor {
  id: string;
  name: string;
  qualification: string;
  specialty: string;
  experience: string;
  experienceYears: number;
  regNo: string;
  council: string;
  rating: number;
  reviewsCount: number;
  languages: string[];
  fee: number;
  nextSlot: string;
  isOnline: boolean;
  hospital: string;
  avatar: string;
  bio: string;
  availableDays: string[];
}

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
  therapeuticCategory: string;
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
  hasPharmacist: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  scheduledTime: string;
  scheduledDate: string;
  status: 'waiting' | 'in_progress' | 'completed' | 'scheduled' | 'cancelled';
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
    bloodGlucose?: number;
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

export interface VitalsReading {
  id: string;
  timestamp: string;
  date: string;
  systolic: number;
  diastolic: number;
  bloodGlucose: number;
  pulse: number;
  spo2: number;
  temperature: number;
  notes?: string;
  status: 'normal' | 'elevated' | 'high' | 'critical';
}

export interface TriageResult {
  triagePriority: 'emergency' | 'urgent' | 'routine' | 'self_care';
  isEmergency: boolean;
  alertTitle?: string;
  alertMessage?: string;
  emergencyHotline?: string;
  immediateActionSteps?: string[];
  provisionalCondition?: string;
  icd10Code?: string;
  specialistRecommended?: string;
  suggestedInvestigations?: string[];
  clinicalSummary?: string;
  estimatedWaitTimeMinutes?: number;
  vernacularAdvice?: string;
}
