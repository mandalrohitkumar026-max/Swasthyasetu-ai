import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Wifi, 
  Plus, 
  Trash2, 
  FileCheck2, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  HeartPulse, 
  ShieldCheck, 
  FileText,
  Percent,
  Download,
  Users,
  Calendar,
  Search,
  Filter,
  Check,
  X,
  AlertCircle,
  Eye,
  Activity,
  ChevronRight,
  TrendingUp,
  Tag,
  Save
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { Appointment, MedicineItem, Prescription, UserProfile } from '../types';
import { api } from '../services/api';

interface DoctorPortalViewProps {
  currentUser: UserProfile | null;
  onPrescriptionCreated?: (rx: Prescription) => void;
}

export const DoctorPortalView: React.FC<DoctorPortalViewProps> = ({
  currentUser,
  onPrescriptionCreated,
}) => {
  // Navigation Tabs for Doctor Workspace
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<
    'opd_queue' | 'patient_management' | 'consultation_history' | 'appointment_requests' | 'patient_records' | 'consultation_notes' | 'workload_analytics'
  >('opd_queue');

  // Core Data States
  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);
  const [catalogMedicines, setCatalogMedicines] = useState<MedicineItem[]>([]);
  const [patientRoster, setPatientRoster] = useState<any[]>([]);
  const [appointmentRequests, setAppointmentRequests] = useState<any[]>([]);
  const [consultationNotes, setConsultationNotes] = useState<any[]>([]);
  const [prescriptionsHistory, setPrescriptionsHistory] = useState<any[]>([]);
  
  // Selected Patient for Authorized Records Access
  const [selectedPatientForRecord, setSelectedPatientForRecord] = useState<any | null>(null);

  // Search & Filter States
  const [searchPatientQuery, setSearchPatientQuery] = useState('');
  const [patientConditionFilter, setPatientConditionFilter] = useState('All');

  // Call Controls State
  const [inCall, setInCall] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [lowBandwidthMode, setLowBandwidthMode] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // E-Prescription State
  const [diagnosis, setDiagnosis] = useState('');
  const [clinicalAdvice, setClinicalAdvice] = useState('');
  const [prescriptionItems, setPrescriptionItems] = useState<any[]>([]);
  const [selectedMedId, setSelectedMedId] = useState('');
  const [dosageInstruction, setDosageInstruction] = useState('1 tablet daily after meal');
  const [durationDays, setDurationDays] = useState(30);
  const [isGenericAutoSubstituted, setIsGenericAutoSubstituted] = useState(true);
  const [isSigning, setIsSigning] = useState(false);
  const [createdPrescription, setCreatedPrescription] = useState<Prescription | null>(null);

  // New Consultation Note Form State
  const [notePatientId, setNotePatientId] = useState('usr-pat-01');
  const [noteDiagnosis, setNoteDiagnosis] = useState('Type 2 Diabetes Mellitus with Essential Stage-1 Hypertension');
  const [noteContent, setNoteContent] = useState('Patient advised lifestyle modifications, salt restriction (<5g/day), and weekly fasting glucose logging.');
  const [noteTag, setNoteTag] = useState('NCD');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [noteSavedFeedback, setNoteSavedFeedback] = useState<string | null>(null);

  // Fetch initial appointments and catalog
  useEffect(() => {
    loadData();
  }, []);

  // Timer for active call
  useEffect(() => {
    let timer: any;
    if (inCall) {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [inCall]);

  const loadData = async () => {
    try {
      const [dashRes, apts, meds] = await Promise.all([
        api.dashboard.getDoctorDashboard().catch(() => null),
        api.getAppointments().catch(() => []),
        api.getMedicines().catch(() => [])
      ]);

      if (dashRes && dashRes.success) {
        setDashboardData(dashRes);
        setPatientRoster(dashRes.patientManagement || []);
        setAppointmentRequests(dashRes.appointmentRequests || []);
        setConsultationNotes(dashRes.consultationNotes || []);
        setPrescriptionsHistory(dashRes.consultationHistory || []);
        if (dashRes.authorizedPatientRecords?.length > 0) {
          setSelectedPatientForRecord(dashRes.authorizedPatientRecords[0]);
        }
      }

      setAppointments(apts);
      setCatalogMedicines(meds);
      if (apts.length > 0) {
        selectAppointment(apts[0]);
      }
    } catch (err) {
      console.error("Failed to load doctor portal data", err);
    }
  };

  const selectAppointment = (apt: Appointment) => {
    setActiveAppointment(apt);
    setDiagnosis(apt.triagePriority === 'urgent' 
      ? 'Type 2 Diabetes Mellitus with Stage-1 Hypertension' 
      : 'Upper Respiratory Tract Infection');
    setClinicalAdvice('Advised low glycemic diet, daily brisk walk for 30 minutes. Monitor fasting capillary blood sugar weekly.');
    
    // Seed default prescription items based on case
    if (apt.id === 'apt-001' || apt.triagePriority === 'urgent') {
      setPrescriptionItems([
        {
          medicineId: "med-003",
          brandName: "Glycomet-GP 2",
          genericSalt: "Metformin (500mg) + Glimepiride (2mg)",
          dosageInstruction: "1 tablet daily before breakfast",
          durationDays: 30,
          quantity: 30,
          brandedPrice: 220,
          janAushadhiPrice: 38,
          isGenericSubstituted: true
        },
        {
          medicineId: "med-004",
          brandName: "Telma-40",
          genericSalt: "Telmisartan (40mg)",
          dosageInstruction: "1 tablet daily morning after breakfast",
          durationDays: 30,
          quantity: 30,
          brandedPrice: 195,
          janAushadhiPrice: 22,
          isGenericSubstituted: true
        }
      ]);
    } else {
      setPrescriptionItems([
        {
          medicineId: "med-001",
          brandName: "Augmentin 625 Duo",
          genericSalt: "Amoxicillin (500mg) + Clavulanic Acid (125mg)",
          dosageInstruction: "1 tablet twice daily after meals",
          durationDays: 5,
          quantity: 10,
          brandedPrice: 200,
          janAushadhiPrice: 55,
          isGenericSubstituted: true
        }
      ]);
    }
  };

  const handleAddMedicine = () => {
    if (!selectedMedId) return;
    const med = catalogMedicines.find(m => m.id === selectedMedId);
    if (!med) return;

    const newItem = {
      medicineId: med.id,
      brandName: med.brandName,
      genericSalt: med.genericSalt,
      dosageInstruction: dosageInstruction,
      durationDays: durationDays,
      quantity: durationDays * (dosageInstruction.toLowerCase().includes('twice') ? 2 : 1),
      brandedPrice: med.brandedPrice,
      janAushadhiPrice: med.janAushadhiPrice,
      isGenericSubstituted: isGenericAutoSubstituted
    };

    setPrescriptionItems(prev => [...prev, newItem]);
    setSelectedMedId('');
  };

  const handleRemoveItem = (index: number) => {
    setPrescriptionItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleToggleItemGeneric = (index: number) => {
    setPrescriptionItems(prev => prev.map((item, i) => {
      if (i === index) {
        return { ...item, isGenericSubstituted: !item.isGenericSubstituted };
      }
      return item;
    }));
  };

  const handleSignPrescription = async () => {
    if (!activeAppointment || prescriptionItems.length === 0) return;
    setIsSigning(true);
    try {
      const payload = {
        appointmentId: activeAppointment.id,
        patientId: activeAppointment.patientId,
        patientName: activeAppointment.patientName,
        diagnosis,
        clinicalNotes: clinicalAdvice,
        items: prescriptionItems
      };

      const result = await api.createPrescription(payload);
      setCreatedPrescription(result);
      if (onPrescriptionCreated) {
        onPrescriptionCreated(result);
      }
      
      // Update appointment status to completed
      await api.updateAppointment(activeAppointment.id, { status: 'completed' });
      setAppointments(prev => prev.map(a => a.id === activeAppointment.id ? { ...a, status: 'completed' } : a));
      
      // Reload history
      loadData();
    } catch (err) {
      console.error("Prescription signing failed", err);
    } finally {
      setIsSigning(false);
    }
  };

  const handleAcceptRequest = async (reqId: string) => {
    try {
      const res = await api.dashboard.acceptAppointmentRequest(reqId, {
        scheduledTime: 'Today 03:30 PM',
        consultationMode: 'kiosk'
      });
      if (res.success) {
        setAppointmentRequests(prev => prev.filter(r => r.id !== reqId));
        loadData();
      }
    } catch (err) {
      console.error('Failed to accept appointment request', err);
    }
  };

  const handleSaveConsultationNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingNote(true);
    setNoteSavedFeedback(null);
    try {
      const res = await api.dashboard.saveConsultationNotes({
        appointmentId: activeAppointment?.id || 'apt-001',
        patientId: notePatientId,
        patientName: patientRoster.find(p => p.id === notePatientId)?.name || 'Ramesh Patel',
        diagnosis: noteDiagnosis,
        notes: noteContent,
        tags: [noteTag]
      });

      if (res.success) {
        setConsultationNotes(prev => [res.data, ...prev]);
        setNoteSavedFeedback('Consultation note recorded and attached to EHR.');
        setTimeout(() => setNoteSavedFeedback(null), 3000);
      }
    } catch (err) {
      console.error('Failed to save note', err);
    } finally {
      setIsSavingNote(false);
    }
  };

  // Calculations
  const totalBrandedCost = prescriptionItems.reduce((acc, item) => acc + item.brandedPrice, 0);
  const totalPatientCost = prescriptionItems.reduce((acc, item) => 
    acc + (item.isGenericSubstituted ? item.janAushadhiPrice : item.brandedPrice), 0);
  const totalSavings = totalBrandedCost - totalPatientCost;
  const savingsPercent = totalBrandedCost > 0 ? Math.round((totalSavings / totalBrandedCost) * 100) : 0;

  // Filtered patients
  const filteredPatients = patientRoster.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchPatientQuery.toLowerCase()) ||
                          p.abhaNumber.includes(searchPatientQuery);
    const matchesCondition = patientConditionFilter === 'All' || 
                             p.chronicConditions.some((c: string) => c.toLowerCase().includes(patientConditionFilter.toLowerCase()));
    return matchesSearch && matchesCondition;
  });

  const workloadStats = dashboardData?.workloadStats || {
    consultationCaseMix: [
      { name: 'Diabetes & Metabolism', value: 42, color: '#0d9488' },
      { name: 'Cardiology & Hypertension', value: 28, color: '#0284c7' },
      { name: 'Respiratory & Infections', value: 18, color: '#f59e0b' },
      { name: 'General Medicine & Triage', value: 12, color: '#6366f1' },
    ],
    weeklyActivity: [
      { day: 'Mon', completed: 18, urgent: 4, waitTime: 4.8 },
      { day: 'Tue', completed: 22, urgent: 6, waitTime: 4.1 },
      { day: 'Wed', completed: 19, urgent: 3, waitTime: 3.9 },
      { day: 'Thu', completed: 25, urgent: 5, waitTime: 4.5 },
      { day: 'Fri', completed: 21, urgent: 4, waitTime: 4.0 },
      { day: 'Sat', completed: 16, urgent: 2, waitTime: 3.5 },
      { day: 'Sun', completed: 12, urgent: 2, waitTime: 3.2 },
    ]
  };

  const workspaceTabs = [
    { id: 'opd_queue', label: "Today's Queue & Studio", count: appointments.filter(a => a.status === 'waiting').length },
    { id: 'patient_management', label: 'Patient Management', count: patientRoster.length },
    { id: 'appointment_requests', label: 'Appointment Requests', count: appointmentRequests.length },
    { id: 'patient_records', label: 'Authorized Health Records (ABHA)', count: patientRoster.length },
    { id: 'consultation_notes', label: 'Consultation Notes', count: consultationNotes.length },
    { id: 'consultation_history', label: 'Consultation History', count: prescriptionsHistory.length },
    { id: 'workload_analytics', label: 'Clinical Workload Analytics' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Workspace Navigation Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
        {workspaceTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveWorkspaceTab(tab.id as any)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeWorkspaceTab === tab.id
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                activeWorkspaceTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: TODAY'S APPOINTMENT OPD QUEUE & E-PRESCRIPTION STUDIO */}
      {/* ========================================================================= */}
      {activeWorkspaceTab === 'opd_queue' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Waiting Queue List (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Today's OPD Queue</h3>
                <p className="text-[11px] text-slate-500">Live triage priority order</p>
              </div>
              <span className="text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full">
                {appointments.filter(a => a.status === 'waiting').length} Waiting
              </span>
            </div>

            <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  onClick={() => selectAppointment(apt)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    activeAppointment?.id === apt.id
                      ? 'border-teal-500 bg-teal-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{apt.patientName}</span>
                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      apt.triagePriority === 'urgent'
                        ? 'bg-rose-100 text-rose-700'
                        : apt.triagePriority === 'emergency'
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {apt.triagePriority}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-1">{apt.aiClinicalSummary || apt.chiefComplaints[0]}</p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                    <span>{apt.patientAge}y • {apt.patientGender}</span>
                    <span className="font-semibold text-teal-700 capitalize">{apt.consultationMode} Mode</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Consultation Studio & E-Prescription (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
            {activeAppointment ? (
              <div className="space-y-6">
                
                {/* Active Patient Brief Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-base text-slate-900">{activeAppointment.patientName}</h3>
                      <span className="text-[10px] font-bold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-md border border-teal-200">
                        {activeAppointment.patientAge} yrs • {activeAppointment.patientGender}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Chief Complaint: <span className="font-medium text-slate-800">{activeAppointment.chiefComplaints?.join(', ')}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setInCall(!inCall)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        inCall ? 'bg-rose-600 text-white' : 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm'
                      }`}
                    >
                      {inCall ? <PhoneOff className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
                      <span>{inCall ? 'End Call' : 'Launch Video Room'}</span>
                    </button>
                  </div>
                </div>

                {/* Vitals Summary Strip */}
                {activeAppointment.vitals && (
                  <div className="grid grid-cols-4 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">BP</span>
                      <span className="font-black text-slate-800">{activeAppointment.vitals.bp}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Glucose</span>
                      <span className="font-black text-rose-600">242 mg/dL</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Pulse</span>
                      <span className="font-black text-slate-800">{activeAppointment.vitals.pulse} bpm</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">SpO2</span>
                      <span className="font-black text-emerald-600">{activeAppointment.vitals.spo2}%</span>
                    </div>
                  </div>
                )}

                {/* Clinical Diagnosis Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Clinical Diagnosis (ICD-10 Aligned)</label>
                  <input
                    type="text"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* E-Prescription Medicine Builder */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Prescribed Pharmaceuticals ({prescriptionItems.length})
                    </h4>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Jan Aushadhi Auto-Substitution Active
                    </span>
                  </div>

                  {/* Add Med Controls */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                    <select
                      value={selectedMedId}
                      onChange={(e) => setSelectedMedId(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">-- Select drug from PMBJP essential formulary --</option>
                      {catalogMedicines.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.brandName} ({m.genericSalt}) • Jan Aushadhi: ₹{m.janAushadhiPrice} (vs Branded ₹{m.brandedPrice})
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={dosageInstruction}
                          onChange={(e) => setDosageInstruction(e.target.value)}
                          placeholder="Dosage"
                          className="text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800"
                        />
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <input
                            type="number"
                            value={durationDays}
                            onChange={(e) => setDurationDays(Number(e.target.value))}
                            className="w-14 text-xs bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-slate-800"
                          />
                          <span>days</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddMedicine}
                        disabled={!selectedMedId}
                        className="bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white text-xs font-bold px-4 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Drug</span>
                      </button>
                    </div>
                  </div>

                  {/* Prescription Item Rows */}
                  <div className="space-y-2">
                    {prescriptionItems.map((item, idx) => (
                      <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-white text-xs flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900">{item.brandName}</div>
                          <div className="text-[11px] text-slate-500">{item.genericSalt} • {item.dosageInstruction} ({item.durationDays}d)</div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggleItemGeneric(idx)}
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-lg cursor-pointer ${
                              item.isGenericSubstituted ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {item.isGenericSubstituted ? `Jan Aushadhi: ₹${item.janAushadhiPrice}` : `Branded: ₹${item.brandedPrice}`}
                          </button>

                          <button
                            onClick={() => handleRemoveItem(idx)}
                            className="text-slate-400 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Savings & Sign Bar */}
                  {prescriptionItems.length > 0 && (
                    <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                        <span>Patient Jan Aushadhi Cost: ₹{totalPatientCost.toFixed(2)}</span>
                        <span>Saved: ₹{totalSavings.toFixed(2)} ({savingsPercent}%)</span>
                      </div>

                      <button
                        disabled={isSigning}
                        onClick={handleSignPrescription}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
                      >
                        {isSigning ? (
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FileCheck2 className="w-4 h-4" />
                        )}
                        <span>Digitally Sign & Issue Prescription</span>
                      </button>

                      {createdPrescription && (
                        <div className="p-2.5 bg-white rounded-xl border border-emerald-300 text-[11px] text-emerald-900 font-semibold flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Prescription {createdPrescription.id} digitally signed & issued with NMC registration verification!</span>
                        </div>
                      )}
                    </div>
                  )}

                </div>

              </div>
            ) : (
              <div className="py-20 text-center text-xs text-slate-400 space-y-2">
                <Stethoscope className="w-10 h-10 mx-auto text-slate-300" />
                <p>Select a patient from the OPD queue on the left to start consultation.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PATIENT MANAGEMENT (ROSTER & SEARCH) */}
      {/* ========================================================================= */}
      {activeWorkspaceTab === 'patient_management' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600" />
                <span>Empanelled Patient Roster & Continuity of Care</span>
              </h3>
              <p className="text-xs text-slate-500">Search assigned patients, review compliance scores, and launch historical records.</p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchPatientQuery}
                  onChange={(e) => setSearchPatientQuery(e.target.value)}
                  placeholder="Search name or ABHA ID..."
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <select
                value={patientConditionFilter}
                onChange={(e) => setPatientConditionFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="All">All Conditions</option>
                <option value="Diabetes">Diabetes</option>
                <option value="Hypertension">Hypertension</option>
                <option value="Anemia">Maternal Anemia</option>
                <option value="Coronary">Cardiac Care</option>
              </select>
            </div>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Patient Name & ABHA ID</th>
                  <th className="py-3 px-4">Age / Gender</th>
                  <th className="py-3 px-4">Chronic Diagnoses</th>
                  <th className="py-3 px-4">District</th>
                  <th className="py-3 px-4">Compliance</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredPatients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{p.name}</div>
                      <div className="font-mono text-[10px] text-teal-700">{p.abhaNumber}</div>
                    </td>
                    <td className="py-3 px-4">{p.age}y • {p.gender}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {p.chronicConditions?.map((c: string, idx: number) => (
                          <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded-md">
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{p.district}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px]">
                        {p.complianceRate}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => {
                          setSelectedPatientForRecord(p);
                          setActiveWorkspaceTab('patient_records');
                        }}
                        className="text-xs font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View EHR</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: APPOINTMENT REQUESTS QUEUE */}
      {/* ========================================================================= */}
      {activeWorkspaceTab === 'appointment_requests' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-600" />
                <span>Pending Teleconsultation Requests</span>
              </h3>
              <p className="text-xs text-slate-500">Incoming requests booked from rural kiosks and mobile devices awaiting physician approval.</p>
            </div>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
              {appointmentRequests.length} Pending Approval
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {appointmentRequests.map((req) => (
              <div key={req.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
                      {req.modality} telemed
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">{req.requestedAt}</span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900">{req.patientName} ({req.patientAge}y • {req.patientGender})</h4>
                  <p className="text-xs text-slate-500">{req.district}</p>
                  
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700">
                    <strong>Chief Complaint:</strong> {req.chiefComplaint}
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2 border-t border-slate-200/60">
                  <button
                    onClick={() => handleAcceptRequest(req.id)}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1 shadow-xs transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Accept Slot</span>
                  </button>
                  <button
                    onClick={() => setAppointmentRequests(prev => prev.filter(r => r.id !== req.id))}
                    className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}

            {appointmentRequests.length === 0 && (
              <div className="col-span-2 p-8 text-center bg-slate-50 rounded-2xl text-xs text-slate-400">
                All incoming appointment requests have been approved.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: AUTHORIZED PATIENT RECORDS (ABHA CONSENT GATED) */}
      {/* ========================================================================= */}
      {activeWorkspaceTab === 'patient_records' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-base text-slate-900">ABHA Authorized Clinical Records Viewer</h3>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Consent Verified • DPDP Act 2023 Compliant
                </span>
              </div>
              <p className="text-xs text-slate-500">Longitudinal diagnostics, past medications, and lab reports released by citizen consent token.</p>
            </div>

            {/* Switch Patient Dropdown */}
            <select
              value={selectedPatientForRecord?.id || ''}
              onChange={(e) => {
                const found = patientRoster.find(p => p.id === e.target.value);
                if (found) setSelectedPatientForRecord(found);
              }}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {patientRoster.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.abhaNumber})</option>
              ))}
            </select>
          </div>

          {selectedPatientForRecord ? (
            <div className="space-y-5">
              
              {/* Patient Banner */}
              <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-black text-sm text-slate-900">{selectedPatientForRecord.name}</h4>
                  <p className="text-xs text-slate-600">
                    {selectedPatientForRecord.age} years • {selectedPatientForRecord.gender} • {selectedPatientForRecord.district}, {selectedPatientForRecord.state}
                  </p>
                  <p className="font-mono text-[11px] text-teal-800">ABHA: {selectedPatientForRecord.abhaNumber}</p>
                </div>

                <div className="text-right text-xs space-y-1">
                  <div className="font-semibold text-slate-600">Compliance Rate: <span className="font-bold text-emerald-700">{selectedPatientForRecord.complianceRate}</span></div>
                  <div className="text-slate-500 text-[11px]">Allergies: {selectedPatientForRecord.allergies?.join(', ')}</div>
                </div>
              </div>

              {/* Lab Reports Table */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                  NABL Laboratory Diagnostic Reports (Recent)
                </h4>
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-4">Test Name</th>
                        <th className="py-2.5 px-4">Measured Result</th>
                        <th className="py-2.5 px-4">Reference Range</th>
                        <th className="py-2.5 px-4">Report Date</th>
                        <th className="py-2.5 px-4">Clinical Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {selectedPatientForRecord.labReports?.map((r: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="py-2.5 px-4 font-semibold text-slate-900">{r.testName}</td>
                          <td className="py-2.5 px-4 font-bold text-slate-800">{r.result}</td>
                          <td className="py-2.5 px-4 text-slate-500">{r.normalRange}</td>
                          <td className="py-2.5 px-4 text-slate-500">{r.date}</td>
                          <td className="py-2.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              r.status === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Past Prescriptions */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                  Historical Prescriptions Issued
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedPatientForRecord.pastPrescriptions?.map((rx: any, idx: number) => (
                    <div key={idx} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>{rx.id}</span>
                        <span className="text-[10px] font-normal text-slate-500">{rx.date}</span>
                      </div>
                      <p className="text-[11px] text-teal-700 font-semibold">{rx.doctor}</p>
                      <ul className="text-[11px] text-slate-600 space-y-0.5">
                        {rx.drugs?.map((d: string, dIdx: number) => (
                          <li key={dIdx}>• {d}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-8">Select a patient to view authorized ABHA health records.</p>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: CONSULTATION CLINICAL NOTES STUDIO */}
      {/* ========================================================================= */}
      {activeWorkspaceTab === 'consultation_notes' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Form to Add Clinical Note (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                <span>Record Clinical Note</span>
              </h3>
              <p className="text-xs text-slate-500">Document subjective complaint, objective findings, and follow-up guidance.</p>
            </div>

            <form onSubmit={handleSaveConsultationNote} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Patient</label>
                <select
                  value={notePatientId}
                  onChange={(e) => setNotePatientId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                >
                  {patientRoster.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.district})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Working Diagnosis</label>
                <input
                  type="text"
                  value={noteDiagnosis}
                  onChange={(e) => setNoteDiagnosis(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Clinical Evaluation & Treatment Plan</label>
                <textarea
                  rows={4}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Care Category Tag</label>
                <select
                  value={noteTag}
                  onChange={(e) => setNoteTag(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                >
                  <option value="NCD">NCD (Diabetes / Hypertension)</option>
                  <option value="Maternal Health">Maternal Health (ANC / PNC)</option>
                  <option value="Pediatrics">Pediatrics & Nutrition</option>
                  <option value="Infectious Disease">Infectious / Vector Fever</option>
                </select>
              </div>

              {noteSavedFeedback && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{noteSavedFeedback}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSavingNote}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingNote ? 'Saving to Records...' : 'Save Consultation Note'}</span>
              </button>
            </form>
          </div>

          {/* Historical Consultation Notes List (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">Documented Consultation Notes ({consultationNotes.length})</h3>

            <div className="space-y-3">
              {consultationNotes.map((note) => (
                <div key={note.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{note.patientName}</span>
                    <span className="text-[10px] text-slate-400">{note.createdAt}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md text-[10px]">
                      {note.diagnosis}
                    </span>
                    {note.tags?.map((t: string, idx: number) => (
                      <span key={idx} className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md text-[10px]">
                        {t}
                      </span>
                    ))}
                  </div>

                  <p className="text-slate-600 leading-relaxed pt-1">{note.notes}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: CONSULTATION HISTORY */}
      {/* ========================================================================= */}
      {activeWorkspaceTab === 'consultation_history' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-600" />
                <span>Completed Consultation History</span>
              </h3>
              <p className="text-xs text-slate-500">Past teleconsultation sessions with digital signatures and Jan Aushadhi substitution records.</p>
            </div>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
              {prescriptionsHistory.length} Recorded
            </span>
          </div>

          <div className="space-y-3">
            {prescriptionsHistory.map((rx) => (
              <div key={rx.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-slate-900">{rx.patientName}</span>
                    <span className="text-slate-400 ml-2 font-mono">({rx.id})</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{rx.prescribedAt}</span>
                </div>

                <div className="font-semibold text-teal-800">{rx.diagnosis}</div>
                <p className="text-slate-600">{rx.clinicalNotes}</p>

                <div className="pt-2 flex items-center justify-between text-[11px] border-t border-slate-200/60 font-mono">
                  <span className="text-slate-400 truncate max-w-xs">{rx.signatureHash}</span>
                  <span className="font-extrabold text-emerald-700">Relief: ₹{rx.totalSavings} saved</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: CLINICAL WORKLOAD & CASE-MIX ANALYTICS (RECHARTS) */}
      {/* ========================================================================= */}
      {activeWorkspaceTab === 'workload_analytics' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-600" />
              <span>Clinical Practice Workload & Diagnostic Distribution</span>
            </h3>
            <p className="text-xs text-slate-500">Weekly patient throughput, triage urgency distribution, and diagnostic case-mix breakdown.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart 1: Diagnostic Case Mix Pie Chart */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
              <h4 className="font-bold text-xs text-slate-800">Diagnostic Specialty Case-Mix (%)</h4>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={workloadStats.consultationCaseMix}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    >
                      {workloadStats.consultationCaseMix.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '12px', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Weekly Consultations Bar Chart */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
              <h4 className="font-bold text-xs text-slate-800">Weekly Consultation Throughput (Completed vs Urgent)</h4>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={workloadStats.weeklyActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '12px', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="completed" name="Completed Consults" fill="#0d9488" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="urgent" name="Urgent Triage" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
export default DoctorPortalView;
