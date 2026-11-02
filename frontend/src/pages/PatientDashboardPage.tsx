import React, { useState, useEffect } from 'react';
import { PageId } from '../types/navigation';
import { 
  User, 
  Calendar, 
  FileText, 
  Pill, 
  HeartPulse, 
  ShieldCheck, 
  ArrowRight, 
  Video, 
  Sparkles,
  Building2,
  Activity,
  Bell,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  X,
  PlusCircle,
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine,
  Legend 
} from 'recharts';
import { useHealth } from '../context/HealthContext';
import { Sidebar } from '../components/shared/Sidebar';
import { DashboardCard } from '../components/shared/DashboardCard';
import { api } from '../services/api';

interface PatientDashboardPageProps {
  onNavigate: (page: PageId, data?: any) => void;
}

export const PatientDashboardPage: React.FC<PatientDashboardPageProps> = ({ onNavigate }) => {
  const { currentRole, setCurrentRole, currentUser } = useHealth();
  
  // Dashboard state
  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [chartRange, setChartRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [appointmentFilter, setAppointmentFilter] = useState<'all' | 'video' | 'kiosk'>('all');
  const [dismissedNotifIds, setDismissedNotifIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadPatientData();
  }, []);

  const loadPatientData = async () => {
    setIsLoading(true);
    try {
      const res = await api.dashboard.getPatientDashboard();
      if (res.success) {
        setDashboardData(res);
      }
    } catch (err) {
      console.error('Failed to load patient dashboard summary', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismissNotification = (id: string) => {
    setDismissedNotifIds(prev => [...prev, id]);
  };

  // Profile and data fallbacks
  const profile = dashboardData?.patientProfile || {
    name: currentUser.name || 'Ramesh Patel',
    age: currentUser.age || 48,
    gender: currentUser.gender || 'Male',
    abhaNumber: currentUser.abhaNumber || '14-8921-4321-7654',
    abhaAddress: currentUser.abhaAddress || 'ramesh.patel@abdm',
    district: currentUser.district || 'Sitapur',
    state: currentUser.state || 'Uttar Pradesh',
    avatarUrl: currentUser.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    bloodGroup: 'B Positive'
  };

  const vitals = dashboardData?.healthOverview?.vitalsLatest || {
    bloodPressure: '144/92 mmHg',
    bloodPressureStatus: 'Elevated (Stage-1)',
    bloodPressureColor: 'text-amber-600',
    bloodGlucose: '242 mg/dL',
    bloodGlucoseStatus: 'High (Target < 130)',
    bloodGlucoseColor: 'text-rose-600',
    pulse: '84 bpm',
    pulseStatus: 'Normal (60-100)',
    pulseColor: 'text-teal-600',
    spo2: '98%',
    spo2Status: 'Optimal (95-100%)',
    spo2Color: 'text-emerald-600',
    lastSyncedAt: '18 minutes ago via Sitapur Gram Kiosk #01'
  };

  const glucoseSeries = dashboardData?.healthOverview?.metricsChartSeries?.bloodGlucose7d || [
    { day: '25 Oct', value: 260, target: 130 },
    { day: '26 Oct', value: 248, target: 130 },
    { day: '27 Oct', value: 255, target: 130 },
    { day: '28 Oct', value: 240, target: 130 },
    { day: '29 Oct', value: 235, target: 130 },
    { day: '30 Oct', value: 245, target: 130 },
    { day: '01 Nov', value: 242, target: 130 },
  ];

  const bpSeries = dashboardData?.healthOverview?.metricsChartSeries?.bloodPressure7d || [
    { day: '25 Oct', systolic: 148, diastolic: 96, targetSys: 120, targetDia: 80 },
    { day: '26 Oct', systolic: 144, diastolic: 92, targetSys: 120, targetDia: 80 },
    { day: '27 Oct', systolic: 146, diastolic: 94, targetSys: 120, targetDia: 80 },
    { day: '28 Oct', systolic: 142, diastolic: 90, targetSys: 120, targetDia: 80 },
    { day: '29 Oct', systolic: 140, diastolic: 88, targetSys: 120, targetDia: 80 },
    { day: '30 Oct', systolic: 142, diastolic: 90, targetSys: 120, targetDia: 80 },
    { day: '01 Nov', systolic: 144, diastolic: 92, targetSys: 120, targetDia: 80 },
  ];

  const upcomingApts = (dashboardData?.upcomingAppointments || []).filter((apt: any) => {
    if (appointmentFilter === 'all') return true;
    return apt.consultationMode === appointmentFilter;
  });

  const activeNotifications = (dashboardData?.notifications || []).filter(
    (n: any) => !dismissedNotifIds.includes(n.id)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. WELCOME SECTION */}
      <div className="bg-gradient-to-r from-teal-800 via-sky-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <img 
            src={profile.avatarUrl} 
            alt={profile.name} 
            className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-400 shadow-md"
          />
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black">Namaste, {profile.name}</h1>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                ABDM Verified
              </span>
            </div>
            <div className="text-xs text-slate-300">
              {profile.age} years • {profile.gender} • Blood Group: {profile.bloodGroup} • {profile.district}, {profile.state}
            </div>
            <div className="text-xs font-mono text-teal-300 flex items-center gap-2">
              <span>ABHA ID: {profile.abhaNumber}</span>
              <span className="text-slate-400">•</span>
              <span>{profile.abhaAddress}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('ai-assistant')}
            className="bg-white text-teal-900 hover:bg-slate-50 font-bold text-xs px-4 py-2.5 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>AI Voice Triage</span>
          </button>
          
          <button
            onClick={() => onNavigate('health-records')}
            className="bg-teal-700/60 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-white/20 cursor-pointer flex items-center gap-1.5 transition-all"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ABHA Health Card</span>
          </button>
        </div>
      </div>

      {/* Main Layout with Sidebar */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Role Sidebar */}
        <Sidebar
          currentRole={currentRole}
          currentPage="patient-dashboard"
          onNavigate={onNavigate}
          onRoleChange={setCurrentRole}
          userName={profile.name}
          userSubtitle={`ABHA: ${profile.abhaNumber}`}
        />

        {/* Right Dashboard Body (8 Sections) */}
        <div className="flex-1 space-y-8">

          {/* 2. HEALTH OVERVIEW (Telemetry Metric Cards) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 text-teal-600" />
                  <span>Current Health Overview & Vital Telemetry</span>
                </h2>
                <p className="text-xs text-slate-500">{vitals.lastSyncedAt}</p>
              </div>

              <button
                onClick={() => onNavigate('health-monitoring')}
                className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
              >
                <span>Full Telemetry Studio</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-[11px] font-bold uppercase text-slate-400">Blood Pressure</span>
                <div className="text-xl font-extrabold text-slate-900">{vitals.bloodPressure}</div>
                <div className={`text-[11px] font-bold ${vitals.bloodPressureColor}`}>{vitals.bloodPressureStatus}</div>
                <div className="text-[10px] text-slate-400">Normal: &lt; 120/80 mmHg</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-[11px] font-bold uppercase text-slate-400">Capillary Glucose</span>
                <div className="text-xl font-extrabold text-slate-900">{vitals.bloodGlucose}</div>
                <div className={`text-[11px] font-bold ${vitals.bloodGlucoseColor}`}>{vitals.bloodGlucoseStatus}</div>
                <div className="text-[10px] text-slate-400">Fasting Target: &lt; 130 mg/dL</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-[11px] font-bold uppercase text-slate-400">Pulse Rate</span>
                <div className="text-xl font-extrabold text-slate-900">{vitals.pulse}</div>
                <div className={`text-[11px] font-bold ${vitals.pulseColor}`}>{vitals.pulseStatus}</div>
                <div className="text-[10px] text-slate-400">Resting: 60 - 100 bpm</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-[11px] font-bold uppercase text-slate-400">Blood Oxygen (SpO2)</span>
                <div className="text-xl font-extrabold text-slate-900">{vitals.spo2}</div>
                <div className={`text-[11px] font-bold ${vitals.spo2Color}`}>{vitals.spo2Status}</div>
                <div className="text-[10px] text-slate-400">Normal Range: 95 - 100%</div>
              </div>

            </div>
          </div>

          {/* 3. HEALTH METRICS CHARTS (RECHARTS VISUALIZATION) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-teal-600" />
                  <span>Longitudinal Health Metrics & Thresholds</span>
                </h3>
                <p className="text-xs text-slate-500">Track fasting blood sugar trends and blood pressure variance over time.</p>
              </div>

              {/* Date Range Selector */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {(['7d', '30d', '90d'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setChartRange(r)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      chartRange === r ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : '90 Days'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Chart 1: Blood Glucose Area Chart */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">Fasting Capillary Glucose (mg/dL)</span>
                  <span className="text-[11px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                    Target: &lt; 130 mg/dL
                  </span>
                </div>
                <div className="h-60 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={glucoseSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="patientGlucoseGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis domain={[100, 300]} tick={{ fontSize: 11, fill: '#64748b' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '12px', fontSize: '12px' }} />
                      <ReferenceLine y={130} stroke="#10b981" strokeDasharray="4 4" label={{ value: 'Target 130', fill: '#10b981', fontSize: 10 }} />
                      <Area type="monotone" dataKey="value" stroke="#0d9488" strokeWidth={2.5} fillOpacity={1} fill="url(#patientGlucoseGrad)" name="Blood Glucose" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Blood Pressure Dual Bar Chart */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">Blood Pressure (Systolic / Diastolic mmHg)</span>
                  <span className="text-[11px] text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                    Normal: 120 / 80
                  </span>
                </div>
                <div className="h-60 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bpSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis domain={[60, 180]} tick={{ fontSize: 11, fill: '#64748b' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '12px', fontSize: '12px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                      <Bar dataKey="systolic" name="Systolic (Upper)" fill="#0284c7" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="diastolic" name="Diastolic (Lower)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>

          {/* 4. UPCOMING APPOINTMENTS */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-teal-600" />
                  <span>Upcoming Consultations & Appointments</span>
                </h3>
                <p className="text-xs text-slate-500">Live telemedicine slots, Gram Panchayat kiosk sessions, and doctor follow-ups.</p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setAppointmentFilter('all')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      appointmentFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    All Modes
                  </button>
                  <button
                    onClick={() => setAppointmentFilter('video')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      appointmentFilter === 'video' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Video
                  </button>
                  <button
                    onClick={() => setAppointmentFilter('kiosk')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      appointmentFilter === 'kiosk' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    2G Kiosk
                  </button>
                </div>

                <button
                  onClick={() => onNavigate('find-doctors')}
                  className="inline-flex items-center gap-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors shadow-xs"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Book New</span>
                </button>
              </div>
            </div>

            {upcomingApts.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-600">No appointments scheduled for selected filter.</p>
                <button
                  onClick={() => onNavigate('find-doctors')}
                  className="text-xs font-semibold text-teal-700 hover:underline"
                >
                  Find doctors and book a consultation →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingApts.map((apt: any) => (
                  <div
                    key={apt.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:shadow-md transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
                        {apt.consultationMode === 'video' ? 'HD Video Call' : '2G Kiosk Telemed'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <Clock className="w-3 h-3" />
                        {apt.scheduledTime}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{apt.doctorName}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1">{apt.aiClinicalSummary || apt.chiefComplaints?.[0]}</p>
                    </div>

                    <div className="pt-2 flex items-center gap-2 border-t border-slate-200">
                      <button
                        onClick={() => onNavigate('telemedicine', { appointmentId: apt.id })}
                        className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join Consultation</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 5. MEDICAL HISTORY & RECENT PRESCRIPTIONS */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-600" />
                  <span>Clinical Medical History & Active Diagnoses</span>
                </h3>
                <p className="text-xs text-slate-500">Documented chronic conditions, past surgeries, and Jan Aushadhi generic prescriptions.</p>
              </div>

              <button
                onClick={() => onNavigate('health-records')}
                className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1"
              >
                <span>View Full FHIR Locker</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Chronic Conditions */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Chronic Illnesses</p>
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>Type 2 Diabetes Mellitus</span>
                  </div>
                  <p className="text-[11px] text-slate-500 pl-3.5">Diagnosed 2021 • On Metformin + Glimepiride</p>
                  
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 pt-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Essential Stage-1 Hypertension</span>
                  </div>
                  <p className="text-[11px] text-slate-500 pl-3.5">Diagnosed 2022 • On Telmisartan 40mg</p>
                </div>
              </div>

              {/* Allergies & Procedures */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Allergies & Surgeries</p>
                <div className="space-y-2 text-xs">
                  <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-semibold">
                    Allergy: Penicillin (Moderate skin rash)
                  </div>
                  <div className="text-slate-600">
                    <span className="font-semibold text-slate-800">Past Procedure:</span> Inguinal Hernia Repair (2018 at Sitapur Civil Hospital)
                  </div>
                </div>
              </div>

              {/* Jan Aushadhi Generic Savings */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Generic Medicines</p>
                  <span className="text-[10px] font-extrabold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-300">
                    79% Relief
                  </span>
                </div>
                <p className="text-xs font-semibold text-emerald-950">Active Generic Substitutions:</p>
                <ul className="text-xs text-emerald-900 space-y-1">
                  <li>• Tab Metformin 500mg + Glimepiride 2mg (₹38)</li>
                  <li>• Tab Telmisartan 40mg (₹22)</li>
                  <li>• Cap Pan-D 40/30 (₹16.25)</li>
                </ul>
                <p className="text-[10px] text-emerald-700 pt-1">
                  Total Monthly Jan Aushadhi Savings: <strong>₹407 / month</strong>
                </p>
              </div>

            </div>
          </div>

          {/* 6. AI HEALTH ASSISTANT SHORTCUT */}
          <div className="bg-gradient-to-r from-teal-500 via-sky-600 to-indigo-600 rounded-3xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-xl">
              <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-[11px] font-bold px-3 py-0.5 rounded-full backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5" />
                Indic Voice & Multi-Language Symptom Triage
              </span>
              <h3 className="text-lg font-black">Need instant health guidance or second opinion?</h3>
              <p className="text-xs text-slate-100 leading-relaxed">
                Describe your symptoms in Hindi, Bengali, Tamil, Telugu or English. Get verified care recommendations and emergency warning sign screening.
              </p>
            </div>

            <button
              onClick={() => onNavigate('ai-assistant')}
              className="bg-white text-teal-800 hover:bg-slate-50 text-xs font-black px-5 py-3 rounded-2xl shadow-md transition-all shrink-0 flex items-center gap-2 cursor-pointer"
            >
              <span>Start AI Consultation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 7. NOTIFICATIONS & ALERTS DRAWER */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-extrabold text-slate-900">Notifications & Care Reminders</h3>
                <span className="text-xs font-bold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-200">
                  {activeNotifications.length} Active
                </span>
              </div>
            </div>

            {activeNotifications.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No unread notifications at this time.</p>
            ) : (
              <div className="space-y-2.5">
                {activeNotifications.map((n: any) => (
                  <div
                    key={n.id}
                    className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        n.priority === 'high' ? 'bg-rose-500' : n.priority === 'medium' ? 'bg-amber-500' : 'bg-teal-500'
                      }`} />
                      <div>
                        <h4 className="font-bold text-slate-900">{n.title}</h4>
                        <p className="text-slate-600 mt-0.5">{n.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1 inline-block">{n.time}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDismissNotification(n.id)}
                      className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                      title="Dismiss notification"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 8. PERSONALIZED HEALTHCARE RECOMMENDATIONS */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <span>Personalized Preventive Healthcare Recommendations</span>
              </h3>
              <p className="text-xs text-slate-500">
                Clinically validated advice based on your vital telemetry trends and diabetic profile.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(dashboardData?.healthcareRecommendations || [
                {
                  id: 'rec-01',
                  category: 'Diet & Nutrition',
                  title: 'Reduce Dietary Sodium & High Glycemic Staples',
                  description: 'Replace polished white rice with coarse grains (bajra, barley) and restrict daily table salt to under 1 teaspoon (<5g) to assist blood pressure regulation.',
                  urgency: 'Action Recommended'
                },
                {
                  id: 'rec-02',
                  category: 'Physical Activity',
                  title: '30-Minute Morning Brisk Walking',
                  description: 'Regular moderate aerobic walking stimulates muscle glucose uptake independently of insulin, improving insulin sensitivity.',
                  urgency: 'Daily Routine'
                },
                {
                  id: 'rec-03',
                  category: 'Preventive Screening',
                  title: 'Quarterly HbA1c & Diabetic Foot Examination',
                  description: 'Your next HbA1c test is recommended before Nov 24. Free test available at Sitapur Civil Hospital Diagnostic Hub.',
                  urgency: 'Upcoming Test'
                }
              ]).map((rec: any) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-xs transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                        {rec.category}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">{rec.urgency}</span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-900">{rec.title}</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{rec.description}</p>
                  </div>

                  <button
                    onClick={() => onNavigate('rural-access')}
                    className="text-[11px] font-bold text-teal-700 hover:text-teal-900 pt-2 border-t border-slate-200/60 flex items-center gap-1"
                  >
                    <span>Read Guideline Pamphlet</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
export default PatientDashboardPage;
