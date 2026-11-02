import { Appointment, JanAushadhiKendra, MedicineItem, Prescription, TriageResult, UserProfile, UserRole } from '../types';

export const BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';
export const AI_SERVICE_ROOT = (import.meta as any).env?.VITE_AI_SERVICE_URL || 'http://localhost:8000';
export const AI_BASE_URL = `${AI_SERVICE_ROOT}/api/ai`;

// Token storage helpers
export const getToken = (): string | null => {
  return localStorage.getItem('swasthya_jwt_token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('swasthya_jwt_token', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('swasthya_jwt_token');
};

const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  // 1. System Health
  checkHealth: async () => {
    const res = await fetch(`${BASE_URL}/health`);
    return res.json();
  },

  // AI Microservice (Python / FastAPI)
  ai: {
    checkHealth: async () => {
      const res = await fetch(`${AI_SERVICE_ROOT}/health`);
      return res.json();
    },
    getStatus: async () => {
      const res = await fetch(`${AI_BASE_URL}/status`);
      return res.json();
    },

    triageSymptoms: async (payload: {
      symptoms_text: string;
      language?: string;
      duration_days?: number;
      patient_age?: number;
      user_consent_given?: boolean;
    }) => {
      const res = await fetch(`${AI_BASE_URL}/assistant/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_consent_given: true, ...payload }),
      });
      return res.json();
    },
    analyzePreventiveMetrics: async (metrics: any[], language = 'en') => {
      const res = await fetch(`${AI_BASE_URL}/preventive/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics, language, user_consent_given: true }),
      });
      return res.json();
    },
    assessDiabetesRisk: async (data: {
      age: number;
      waist_circumference_cm: number;
      gender: string;
      physical_activity_level: string;
      family_history_diabetes: string;
    }) => {
      const res = await fetch(`${AI_BASE_URL}/risk/diabetes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, user_consent_given: true }),
      });
      return res.json();
    },
    assessCvdRisk: async (data: {
      age: number;
      gender: string;
      systolic_bp: number;
      is_smoker: boolean;
      has_diabetes: boolean;
    }) => {
      const res = await fetch(`${AI_BASE_URL}/risk/cvd`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, user_consent_given: true }),
      });
      return res.json();
    },
    getAffordableCare: async (params: {
      patient_latitude?: number;
      patient_longitude?: number;
      district?: string;
      requested_service?: string;
      max_distance_km?: number;
    }) => {
      const res = await fetch(`${AI_BASE_URL}/recommendations/affordable-care`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      return res.json();
    },
    translateAssist: async (query_text: string, target_language = 'en') => {
      const res = await fetch(`${AI_BASE_URL}/multilingual/translate-assist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query_text, target_language }),
      });
      return res.json();
    },
  },

  // 2. Authentication
  auth: {
    login: async (emailOrPhone: string, password = 'Pass@123') => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone, password }),
      });
      const data = await res.json();
      if (data.success && data.data?.token) {
        setToken(data.data.token);
      }
      return data;
    },

    registerPatient: async (payload: any) => {
      const res = await fetch(`${BASE_URL}/auth/register-patient`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.data?.token) {
        setToken(data.data.token);
      }
      return data;
    },

    registerDoctor: async (payload: any) => {
      const res = await fetch(`${BASE_URL}/auth/register-doctor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.data?.token) {
        setToken(data.data.token);
      }
      return data;
    },

    getMe: async () => {
      const res = await fetch(`${BASE_URL}/auth/me`, {
        headers: getAuthHeaders(),
      });
      return res.json();
    },

    logout: async () => {
      removeToken();
      const res = await fetch(`${BASE_URL}/auth/logout`, { method: 'POST' });
      return res.json();
    },
  },

  // 3. Patient APIs
  patient: {
    getMe: async () => {
      const res = await fetch(`${BASE_URL}/patients/me`, { headers: getAuthHeaders() });
      return res.json();
    },
    updateProfile: async (updates: any) => {
      const res = await fetch(`${BASE_URL}/patients/me`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      return res.json();
    },
    getAppointments: async () => {
      const res = await fetch(`${BASE_URL}/patients/appointments`, { headers: getAuthHeaders() });
      return res.json();
    },
    bookAppointment: async (appointmentData: any) => {
      const res = await fetch(`${BASE_URL}/patients/appointments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(appointmentData),
      });
      return res.json();
    },
    cancelAppointment: async (id: string, cancelReason?: string) => {
      const res = await fetch(`${BASE_URL}/patients/appointments/${id}/cancel`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ cancelReason }),
      });
      return res.json();
    },
    getHealthMetrics: async (metricType?: string) => {
      const url = metricType ? `${BASE_URL}/patients/health-metrics?metricType=${metricType}` : `${BASE_URL}/patients/health-metrics`;
      const res = await fetch(url, { headers: getAuthHeaders() });
      return res.json();
    },
    logHealthMetric: async (data: any) => {
      const res = await fetch(`${BASE_URL}/patients/health-metrics`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return res.json();
    },
    getMedicalRecords: async () => {
      const res = await fetch(`${BASE_URL}/patients/medical-records`, { headers: getAuthHeaders() });
      return res.json();
    },
    getConsultations: async () => {
      const res = await fetch(`${BASE_URL}/patients/consultations`, { headers: getAuthHeaders() });
      return res.json();
    },
  },

  // 4. Doctor APIs
  doctor: {
    getMe: async () => {
      const res = await fetch(`${BASE_URL}/doctors/me`, { headers: getAuthHeaders() });
      return res.json();
    },
    getAppointments: async (status?: string) => {
      const url = status ? `${BASE_URL}/doctors/appointments?status=${status}` : `${BASE_URL}/doctors/appointments`;
      const res = await fetch(url, { headers: getAuthHeaders() });
      return res.json();
    },
    updateAppointmentStatus: async (id: string, status: string, cancelReason?: string) => {
      const res = await fetch(`${BASE_URL}/doctors/appointments/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, cancelReason }),
      });
      return res.json();
    },
    getPatientRecords: async (patientId: string) => {
      const res = await fetch(`${BASE_URL}/doctors/patients/${patientId}/records`, { headers: getAuthHeaders() });
      return res.json();
    },
    createConsultation: async (consultationData: any) => {
      const res = await fetch(`${BASE_URL}/doctors/consultations`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(consultationData),
      });
      return res.json();
    },
  },

  // 5. Admin APIs
  admin: {
    getUsers: async (role?: string) => {
      const url = role ? `${BASE_URL}/admin/users?role=${role}` : `${BASE_URL}/admin/users`;
      const res = await fetch(url, { headers: getAuthHeaders() });
      return res.json();
    },
    updateUserStatus: async (id: string, status: string) => {
      const res = await fetch(`${BASE_URL}/admin/users/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      return res.json();
    },
    getPendingDoctors: async () => {
      const res = await fetch(`${BASE_URL}/admin/doctors/pending`, { headers: getAuthHeaders() });
      return res.json();
    },
    verifyDoctor: async (id: string, verificationStatus: 'verified' | 'rejected') => {
      const res = await fetch(`${BASE_URL}/admin/doctors/${id}/verify`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ verificationStatus }),
      });
      return res.json();
    },
    getStats: async () => {
      const res = await fetch(`${BASE_URL}/admin/stats`, { headers: getAuthHeaders() });
      return res.json();
    },
    getCenters: async (district?: string) => {
      const url = district ? `${BASE_URL}/admin/centers?district=${encodeURIComponent(district)}` : `${BASE_URL}/admin/centers`;
      const res = await fetch(url, { headers: getAuthHeaders() });
      return res.json();
    },
    createCenter: async (centerData: any) => {
      const res = await fetch(`${BASE_URL}/admin/centers`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(centerData),
      });
      return res.json();
    },
  },

  // 6. Public Directories
  getPublicDoctors: async (params?: { specialty?: string; language?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.specialty) query.append('specialty', params.specialty);
    if (params?.language) query.append('language', params.language);
    if (params?.search) query.append('search', params.search);
    const res = await fetch(`${BASE_URL}/public-doctors?${query.toString()}`);
    return res.json();
  },

  getPublicCenters: async (district?: string) => {
    const url = district ? `${BASE_URL}/centers?district=${encodeURIComponent(district)}` : `${BASE_URL}/centers`;
    const res = await fetch(url);
    return res.json();
  },

  submitFeedback: async (feedbackData: { rating: number; comment: string; category?: string }) => {
    const res = await fetch(`${BASE_URL}/feedback`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(feedbackData),
    });
    return res.json();
  },

  // 7. Backward Compatible Legacy Callers
  getUser: async (role: UserRole): Promise<UserProfile> => {
    const email = role === 'doctor' ? 'doctor@swasthyasetu.org' : role === 'health_admin' ? 'admin@swasthyasetu.org' : 'patient@swasthyasetu.org';
    const authRes = await api.auth.login(email, 'Pass@123').catch(() => null);
    if (authRes?.data?.profile) return authRes.data.profile;
    const res = await fetch(`${BASE_URL}/users/${role}`).catch(() => null);
    return res ? res.json() : ({} as UserProfile);
  },

  assessTriage: async (payload: {
    symptomsText: string;
    language?: string;
    patientName?: string;
    patientAge?: number;
    patientGender?: string;
    vitals?: any;
  }): Promise<TriageResult> => {
    const res = await fetch(`${BASE_URL}/triage/assess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  getMedicines: async (query?: string): Promise<MedicineItem[]> => {
    const url = query ? `${BASE_URL}/pharmacy/medicines?q=${encodeURIComponent(query)}` : `${BASE_URL}/pharmacy/medicines`;
    const res = await fetch(url);
    return res.json();
  },

  getMedicineComparison: async (id: string) => {
    const res = await fetch(`${BASE_URL}/pharmacy/compare/${id}`);
    return res.json();
  },

  getKendras: async (district?: string): Promise<JanAushadhiKendra[]> => {
    const url = district ? `${BASE_URL}/pharmacy/kendras?district=${encodeURIComponent(district)}` : `${BASE_URL}/pharmacy/kendras`;
    const res = await fetch(url);
    return res.json();
  },

  scanPrescriptionOcr: async (sampleText?: string) => {
    const res = await fetch(`${BASE_URL}/pharmacy/ocr-scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sampleText }),
    });
    return res.json();
  },

  getAppointments: async (role?: string, status?: string): Promise<Appointment[]> => {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (status) params.append('status', status);
    const res = await fetch(`${BASE_URL}/telemed/appointments?${params.toString()}`);
    return res.json();
  },

  createAppointment: async (appointmentData: Partial<Appointment>): Promise<Appointment> => {
    const res = await fetch(`${BASE_URL}/telemed/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointmentData),
    });
    return res.json();
  },

  updateAppointment: async (id: string, updates: { status?: string; consultationMode?: string }): Promise<Appointment> => {
    const res = await fetch(`${BASE_URL}/telemed/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  getPrescriptions: async (): Promise<Prescription[]> => {
    const res = await fetch(`${BASE_URL}/telemed/prescriptions`);
    return res.json();
  },

  createPrescription: async (rxData: any): Promise<Prescription> => {
    const res = await fetch(`${BASE_URL}/telemed/prescriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rxData),
    });
    return res.json();
  },

  generateAbha: async (aadhaarOrPhone: string, fullName: string) => {
    const res = await fetch(`${BASE_URL}/abdm/generate-abha`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aadhaarOrPhone, fullName }),
    });
    return res.json();
  },

  getFhirBundle: async (patientId: string) => {
    const res = await fetch(`${BASE_URL}/abdm/fhir-bundle/${patientId}`);
    return res.json();
  },

  getConsents: async () => {
    const res = await fetch(`${BASE_URL}/abdm/consents`);
    return res.json();
  },

  revokeConsent: async (consentId: string) => {
    const res = await fetch(`${BASE_URL}/abdm/consents/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consentId }),
    });
    return res.json();
  },

  getSystemMetrics: async () => {
    const res = await fetch(`${BASE_URL}/admin/metrics`);
    return res.json();
  },

  getSurveillanceData: async () => {
    const res = await fetch(`${BASE_URL}/admin/surveillance`);
    return res.json();
  },

  getDoctorVerifications: async () => {
    const res = await fetch(`${BASE_URL}/admin/doctors`);
    return res.json();
  },

  verifyDoctor: async (id: string, approved: boolean) => {
    const res = await fetch(`${BASE_URL}/admin/doctors/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, approved }),
    });
    return res.json();
  },

  getAuditLogs: async () => {
    const res = await fetch(`${BASE_URL}/admin/audit-logs`);
    return res.json();
  },

  // Affordable Healthcare Discovery & Resource Directory
  resources: {
    getDirectory: async (params: {
      category?: string;
      type?: string;
      district?: string;
      search?: string;
      page?: number;
      limit?: number;
      lite?: boolean;
      sortBy?: string;
      sortOrder?: string;
    } = {}) => {
      const q = new URLSearchParams();
      if (params.category && params.category !== 'all') q.append('category', params.category);
      if (params.type) q.append('type', params.type);
      if (params.district && params.district !== 'All') q.append('district', params.district);
      if (params.search) q.append('search', params.search);
      if (params.page) q.append('page', String(params.page));
      if (params.limit) q.append('limit', String(params.limit));
      if (params.lite !== undefined) q.append('lite', String(params.lite));
      if (params.sortBy) q.append('sortBy', params.sortBy);
      if (params.sortOrder) q.append('sortOrder', params.sortOrder);

      const res = await fetch(`${BASE_URL}/resources?${q.toString()}`);
      return res.json();
    },

    getPriceComparison: async () => {
      const res = await fetch(`${BASE_URL}/resources/pricing-comparison`);
      return res.json();
    },

    getCategories: async () => {
      const res = await fetch(`${BASE_URL}/resources/categories`);
      return res.json();
    },

    getFacility: async (id: string) => {
      const res = await fetch(`${BASE_URL}/resources/${id}`);
      return res.json();
    },

    uploadPhoto: async (imageBase64: string, facilityId?: string, description?: string) => {
      const res = await fetch(`${BASE_URL}/resources/upload-photo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, facilityId, description }),
      });
      return res.json();
    },
  },

  // Rural Healthcare Access & Low-Bandwidth Suite
  rural: {
    getHealthEducation: async (category?: string, lang = 'en') => {
      const q = new URLSearchParams();
      if (category && category !== 'all') q.append('category', category);
      if (lang) q.append('lang', lang);

      const res = await fetch(`${BASE_URL}/rural/health-education?${q.toString()}`);
      return res.json();
    },

    getKiosks: async () => {
      const res = await fetch(`${BASE_URL}/rural/kiosks`);
      return res.json();
    },

    getLowBandwidthBundle: async () => {
      const res = await fetch(`${BASE_URL}/rural/low-bandwidth-bundle`);
      return res.json();
    },
  },

  // Telemedicine Enhancements
  telemedExtended: {
    getAvailability: async (doctorId: string, date?: string) => {
      const q = date ? `?date=${date}` : '';
      const res = await fetch(`${BASE_URL}/telemed/availability/${doctorId}${q}`);
      return res.json();
    },

    scheduleFollowUp: async (data: {
      appointmentId: string;
      patientId: string;
      doctorId: string;
      scheduledDate: string;
      reason: string;
      clinicalGoals?: string[];
      patientName?: string;
      doctorName?: string;
      recoveryNotes?: string;
    }) => {
      const res = await fetch(`${BASE_URL}/telemed/follow-ups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },

    getFollowUps: async (params: { patientId?: string; doctorId?: string; status?: string } = {}) => {
      const q = new URLSearchParams();
      if (params.patientId) q.append('patientId', params.patientId);
      if (params.doctorId) q.append('doctorId', params.doctorId);
      if (params.status) q.append('status', params.status);

      const res = await fetch(`${BASE_URL}/telemed/follow-ups?${q.toString()}`);
      return res.json();
    },

    updateFollowUp: async (id: string, updates: { status?: string; recoveryNotes?: string }) => {
      const res = await fetch(`${BASE_URL}/telemed/follow-ups/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return res.json();
    },

    getRoomInfo: async (appointmentId: string) => {
      const res = await fetch(`${BASE_URL}/telemed/rooms/${appointmentId}`);
      return res.json();
    },
  },

  // Professional Dashboards Suite (Patient, Doctor, Admin)
  dashboard: {
    getAdminAnalytics: async (range = '30d', district = 'All') => {
      const q = new URLSearchParams({ range, district });
      const res = await fetch(`${BASE_URL}/admin/dashboard-analytics?${q.toString()}`);
      return res.json();
    },

    getDoctorDashboard: async () => {
      const res = await fetch(`${BASE_URL}/telemed/doctor/dashboard-summary`);
      return res.json();
    },

    getPatientDashboard: async () => {
      const res = await fetch(`${BASE_URL}/telemed/patient/dashboard-summary`);
      return res.json();
    },

    saveConsultationNotes: async (notesData: {
      appointmentId: string;
      patientId: string;
      patientName?: string;
      diagnosis: string;
      notes: string;
      tags?: string[];
    }) => {
      const res = await fetch(`${BASE_URL}/telemed/consultation-notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notesData),
      });
      return res.json();
    },

    acceptAppointmentRequest: async (appointmentId: string, payload?: any) => {
      const res = await fetch(`${BASE_URL}/telemed/appointments/${appointmentId}/accept-request`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload || {}),
      });
      return res.json();
    },
  },
};

