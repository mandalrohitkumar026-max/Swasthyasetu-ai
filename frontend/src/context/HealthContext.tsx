import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Appointment, Doctor, MedicineItem, Prescription, UserProfile, UserRole, VitalsReading } from '../types';
import { mockUsers, sampleAppointments, sampleDoctors, sampleMedicines, samplePrescriptions, sampleVitalsHistory } from '../data/sampleData';
import { api } from '../services/api';

interface HealthContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUser: UserProfile;
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
  appointments: Appointment[];
  bookAppointment: (aptData: Partial<Appointment>) => Promise<Appointment>;
  cancelAppointment: (id: string) => Promise<void>;
  prescriptions: Prescription[];
  addPrescription: (rxData: any) => Promise<Prescription>;
  vitalsHistory: VitalsReading[];
  logVitals: (reading: Omit<VitalsReading, 'id'>) => void;
  doctors: Doctor[];
  medicines: MedicineItem[];
  isLoading: boolean;
  isBackendConnected: boolean;
  refreshData: () => Promise<void>;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export const HealthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('patient');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('hi');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('swasthya_appointments');
    return saved ? JSON.parse(saved) : sampleAppointments;
  });
  
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() => {
    const saved = localStorage.getItem('swasthya_prescriptions');
    return saved ? JSON.parse(saved) : samplePrescriptions;
  });

  const [vitalsHistory, setVitalsHistory] = useState<VitalsReading[]>(() => {
    const saved = localStorage.getItem('swasthya_vitals');
    return saved ? JSON.parse(saved) : sampleVitalsHistory;
  });

  const [medicines, setMedicines] = useState<MedicineItem[]>(sampleMedicines);
  const [doctors] = useState<Doctor[]>(sampleDoctors);

  const currentUser = mockUsers[currentRole] || mockUsers.patient;

  // Hydrate data from backend API
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Check health
      await api.checkHealth();
      setIsBackendConnected(true);

      const [remoteApts, remoteRxs, remoteMeds] = await Promise.all([
        api.getAppointments().catch(() => null),
        api.getPrescriptions().catch(() => null),
        api.getMedicines().catch(() => null)
      ]);

      if (remoteApts && Array.isArray(remoteApts) && remoteApts.length > 0) {
        setAppointments(remoteApts);
        localStorage.setItem('swasthya_appointments', JSON.stringify(remoteApts));
      }

      if (remoteRxs && Array.isArray(remoteRxs) && remoteRxs.length > 0) {
        setPrescriptions(remoteRxs);
        localStorage.setItem('swasthya_prescriptions', JSON.stringify(remoteRxs));
      }

      if (remoteMeds && Array.isArray(remoteMeds) && remoteMeds.length > 0) {
        setMedicines(remoteMeds);
      }
    } catch (err) {
      console.warn("Backend API unavailable or offline, operating in resilient local mode", err);
      setIsBackendConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('swasthya_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('swasthya_prescriptions', JSON.stringify(prescriptions));
  }, [prescriptions]);

  useEffect(() => {
    localStorage.setItem('swasthya_vitals', JSON.stringify(vitalsHistory));
  }, [vitalsHistory]);

  const bookAppointment = async (aptData: Partial<Appointment>): Promise<Appointment> => {
    let created: Appointment;

    try {
      created = await api.createAppointment(aptData);
      setIsBackendConnected(true);
    } catch (err) {
      console.warn("Using offline appointment creation", err);
      created = {
        id: `apt-${Date.now().toString().slice(-4)}`,
        patientId: currentUser.id,
        patientName: aptData.patientName || currentUser.name,
        patientAge: aptData.patientAge || 48,
        patientGender: aptData.patientGender || "Male",
        patientPhone: aptData.patientPhone || currentUser.phone,
        doctorId: aptData.doctorId || "doc-01",
        doctorName: aptData.doctorName || "Dr. Arvind Rao",
        doctorSpecialty: aptData.doctorSpecialty || "General Physician & Diabetologist",
        scheduledTime: aptData.scheduledTime || "11:30 AM",
        scheduledDate: aptData.scheduledDate || "Today",
        status: "waiting",
        consultationMode: aptData.consultationMode || "video",
        triagePriority: aptData.triagePriority || "urgent",
        chiefComplaints: aptData.chiefComplaints || ["Scheduled consultation"],
        aiClinicalSummary: aptData.aiClinicalSummary || "Booked through SwasthyaSetu AI portal.",
        webrtcRoomId: `swasthya-room-${Date.now()}`,
        vitals: aptData.vitals || {
          bp: "138/88 mmHg",
          pulse: 80,
          spo2: 98,
          temperature: "98.6 °F"
        }
      };
    }

    setAppointments(prev => [created, ...prev.filter(a => a.id !== created.id)]);
    return created;
  };

  const cancelAppointment = async (id: string) => {
    try {
      await api.updateAppointment(id, { status: 'cancelled' });
    } catch (err) {
      console.warn("Failed to cancel on backend, updating local state", err);
    }
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
  };

  const addPrescription = async (rxData: any): Promise<Prescription> => {
    let created: Prescription;
    try {
      created = await api.createPrescription(rxData);
    } catch (err) {
      console.warn("Failed to create prescription on backend, using local synthesis", err);
      created = {
        id: `rx-${Date.now().toString().slice(-4)}`,
        appointmentId: rxData.appointmentId || "apt-001",
        patientId: rxData.patientId || currentUser.id,
        patientName: currentUser.name,
        doctorId: "doc-01",
        doctorName: "Dr. Arvind Rao, MD",
        doctorRegNo: "MCI/UP-2012/048821",
        diagnosis: rxData.diagnosis || "Clinical Diagnosis",
        clinicalNotes: rxData.clinicalNotes || "Advised generic medication and follow-up.",
        prescribedAt: new Date().toISOString(),
        signatureHash: `0xSHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}-NMC-VERIFIED`,
        totalBrandedCost: 450,
        totalJanAushadhiCost: 95,
        totalSavings: 355,
        items: rxData.items || [],
        fhirBundleId: `urn:uuid:fhir-bundle-${Date.now()}`
      };
    }

    setPrescriptions(prev => [created, ...prev.filter(r => r.id !== created.id)]);
    return created;
  };

  const logVitals = (reading: Omit<VitalsReading, 'id'>) => {
    const newEntry: VitalsReading = {
      id: `vit-${Date.now().toString().slice(-4)}`,
      ...reading
    };
    setVitalsHistory(prev => [newEntry, ...prev]);

    // Send to backend API
    if (reading.bloodGlucose) {
      api.patient.logHealthMetric({
        metricType: 'blood_glucose',
        value: reading.bloodGlucose,
        unit: 'mg/dL',
        details: { note: reading.notes }
      }).catch(() => {});
    }
    if (reading.systolic && reading.diastolic) {
      api.patient.logHealthMetric({
        metricType: 'blood_pressure',
        value: `${reading.systolic}/${reading.diastolic}`,
        unit: 'mmHg',
        details: { systolic: reading.systolic, diastolic: reading.diastolic, note: reading.notes }
      }).catch(() => {});
    }
  };

  return (
    <HealthContext.Provider value={{
      currentRole,
      setCurrentRole,
      currentUser,
      selectedLanguage,
      setSelectedLanguage,
      appointments,
      bookAppointment,
      cancelAppointment,
      prescriptions,
      addPrescription,
      vitalsHistory,
      logVitals,
      doctors,
      medicines,
      isLoading,
      isBackendConnected,
      refreshData
    }}>
      {children}
    </HealthContext.Provider>
  );
};

export const useHealth = () => {
  const context = useContext(HealthContext);
  if (!context) {
    throw new Error('useHealth must be used within a HealthProvider');
  }
  return context;
};
