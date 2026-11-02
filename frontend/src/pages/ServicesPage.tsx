import React from 'react';
import { PageId } from '../types/navigation';
import { 
  Sparkles, 
  Mic, 
  Video, 
  Pill, 
  ShieldCheck, 
  Building2, 
  Activity, 
  Baby, 
  ScanLine, 
  ArrowRight,
  Check,
  X
} from 'lucide-react';

interface ServicesPageProps {
  onNavigate: (page: PageId) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onNavigate }) => {
  const allServices = [
    {
      title: "Indic Voice AI Symptom Triage",
      desc: "Multilingual conversational intake in 10+ Indian languages. Evaluates emergency red flags and creates structured ICD-10 notes.",
      icon: <Mic className="w-6 h-6 text-teal-600" />,
      features: ["Dialect recognition", "108 ambulance prompt", "Fasting & vitals correlation", "Doctor-ready brief"],
      actionPage: 'ai-assistant' as PageId,
      actionText: "Try Voice Triage"
    },
    {
      title: "2G-Resilient Telemedicine",
      desc: "Connects patients to MBBS doctors and specialists over WebRTC. Dynamic fallback to 16 kbps Opus audio under 25% packet loss.",
      icon: <Video className="w-6 h-6 text-sky-600" />,
      features: ["Zero call-drop guarantee", "In-call peer chat", "Camera & mic controls", "Instant prescription delivery"],
      actionPage: 'telemedicine' as PageId,
      actionText: "Open Telemed Room"
    },
    {
      title: "PMBJP Generic Medicine Optimizer",
      desc: "Automatically substitutes expensive branded medicines with active bioequivalent Jan Aushadhi generic salts, saving 70% to 85%.",
      icon: <Pill className="w-6 h-6 text-emerald-600" />,
      features: ["1,000+ chemical salt mappings", "Jan Aushadhi Kendra finder", "Rupee savings calculator", "Stock availability check"],
      actionPage: 'affordable-centers' as PageId,
      actionText: "Compare Medicine Costs"
    },
    {
      title: "ABDM & ABHA Health Locker",
      desc: "Official 14-digit ABHA creation, longitudinal FHIR R4 clinical documents, and DPDP-compliant revocable consent manager.",
      icon: <ShieldCheck className="w-6 h-6 text-indigo-600" />,
      features: ["14-digit ABHA card PDF", "FHIR R4 JSON explorer", "1-click consent revocation", "National gateway linked"],
      actionPage: 'health-records' as PageId,
      actionText: "Manage ABHA Records"
    },
    {
      title: "Gram Panchayat Assisted Kiosks",
      desc: "Tablet-optimized offline-first software empowering ASHA facilitators to register villagers and conduct assisted consults.",
      icon: <Building2 className="w-6 h-6 text-amber-600" />,
      features: ["Offline SQLite caching", "Community queue management", "Bluetooth glucometer sync", "Receipt printing"],
      actionPage: 'admin-dashboard' as PageId,
      actionText: "Kiosk Management Desk"
    },
    {
      title: "Chronic Disease & Vitals Telemetry",
      desc: "Continuous care tracking for Type 2 Diabetes and Hypertension with automated blood sugar & BP threshold alerts.",
      icon: <Activity className="w-6 h-6 text-rose-600" />,
      features: ["BP and Glucose trend graphs", "Monthly generic refill reminders", "Dietary advice in vernacular", "Physician alert hooks"],
      actionPage: 'health-monitoring' as PageId,
      actionText: "View Vitals Telemetry"
    },
    {
      title: "Maternal & Child Health Tracking",
      desc: "Automated immunization reminders via voice calls in regional dialects (Bhojpuri, Maithili, Kannada) for mothers.",
      icon: <Baby className="w-6 h-6 text-purple-600" />,
      features: ["Vaccination milestone tracker", "Nutrition advice", "ASHA home visit alerts", "Govt subsidy linkage"],
      actionPage: 'contact' as PageId,
      actionText: "Contact Maternal Health Desk"
    },
    {
      title: "Prescription Vision OCR",
      desc: "Extract medicine names and schedules from photos of handwritten doctor slips and convert them into digital FHIR prescriptions.",
      icon: <ScanLine className="w-6 h-6 text-cyan-600" />,
      features: ["Handwritten OCR model", "Dosage extraction", "Auto generic matching", "Savings breakdown"],
      actionPage: 'affordable-centers' as PageId,
      actionText: "Scan Prescription"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/60">
          Platform Capabilities
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Comprehensive Digital Healthcare Services
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          From voice-based symptom triage and 2G-resilient teleconsultations to government-backed generic medicine substitution and longitudinal ABHA records.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {allServices.map((svc, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-teal-300 transition-all">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                {svc.icon}
              </div>
              <h3 className="font-bold text-base text-slate-900">{svc.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{svc.desc}</p>
              
              <div className="pt-2 space-y-1.5 border-t border-slate-100">
                {svc.features.map((f, fIdx) => (
                  <div key={fIdx} className="text-[11px] text-slate-600 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => onNavigate(svc.actionPage)}
              className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-800 text-xs font-bold flex items-center justify-center gap-1 border border-slate-200 hover:border-teal-300 transition-all cursor-pointer"
            >
              <span>{svc.actionText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Comparison Table: Traditional Healthcare vs SwasthyaSetu AI */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            How SwasthyaSetu AI Transforms the Care Experience
          </h2>
          <p className="text-xs text-slate-500">Comparing traditional outpatient visits against our AI-enabled digital corridor.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Feature / Metric</th>
                <th className="py-3 px-4 text-slate-400">Traditional Clinic OPD</th>
                <th className="py-3 px-4 text-teal-800 font-bold bg-teal-50/70">SwasthyaSetu AI Platform</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3.5 px-4 font-bold text-slate-800">Average Wait Time</td>
                <td className="py-3.5 px-4 text-rose-600">2 to 4 hours in physical OPD queue</td>
                <td className="py-3.5 px-4 text-teal-700 font-bold bg-teal-50/40">Under 5 minutes via intelligent triage queue</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-slate-800">Prescription Cost</td>
                <td className="py-3.5 px-4 text-rose-600">Expensive branded markups (300%–800%)</td>
                <td className="py-3.5 px-4 text-teal-700 font-bold bg-teal-50/40">70% to 85% saved with PMBJP Jan Aushadhi</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-slate-800">Travel & Lost Wages</td>
                <td className="py-3.5 px-4 text-rose-600">30–60 km travel + full day's wage lost</td>
                <td className="py-3.5 px-4 text-teal-700 font-bold bg-teal-50/40">Zero travel; available at home or Panchayat kiosk</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-slate-800">Linguistic Barriers</td>
                <td className="py-3.5 px-4 text-rose-600">Often limited to English / Hindi doctors</td>
                <td className="py-3.5 px-4 text-teal-700 font-bold bg-teal-50/40">Indic voice support in 10+ local languages</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-slate-800">Medical History</td>
                <td className="py-3.5 px-4 text-rose-600">Lost paper slips & duplicate tests</td>
                <td className="py-3.5 px-4 text-teal-700 font-bold bg-teal-50/40">14-digit ABHA ID & encrypted FHIR R4 records</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
