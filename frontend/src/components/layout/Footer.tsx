import React from 'react';
import { PageId } from '../../types/navigation';
import { 
  Activity, 
  ShieldCheck, 
  PhoneCall, 
  Heart, 
  MapPin, 
  Mail, 
  Sparkles,
  ExternalLink,
  Lock
} from 'lucide-react';

interface FooterProps {
  onNavigate: (page: PageId) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
      
      {/* Emergency Strip */}
      <div className="bg-gradient-to-r from-rose-900/60 via-slate-900 to-rose-950/60 border-b border-rose-900/40 py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-rose-200">
            <PhoneCall className="w-4 h-4 text-rose-400 animate-pulse" />
            <span className="font-bold text-white">Emergency Medical Assistance:</span>
            <span>Dial 108 for immediate ambulance dispatch across India.</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-slate-400">National Health Helpline:</span>
            <span className="font-mono font-bold text-white">1800-180-1104</span>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('home')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-sky-500 flex items-center justify-center text-white shadow-md">
                <Activity className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xl text-white tracking-tight">SwasthyaSetu</span>
                <span className="bg-teal-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">AI</span>
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              SwasthyaSetu AI is an affordable, scalable digital health corridor bridging the rural-urban divide in India through Indic voice-first triage, 2G-resilient telemedicine, and Jan Aushadhi generic medicine optimization.
            </p>

            <div className="space-y-1.5 pt-2 text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-teal-400" />
                <span>Nodal Centers: Sitapur (UP), Bengaluru (KA), New Delhi</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-teal-400" />
                <span>support@swasthyasetu.ai • grievances@swasthyasetu.ai</span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 bg-slate-800 text-teal-300 px-2.5 py-1 rounded-md text-[10px] font-mono border border-slate-700">
                <ShieldCheck className="w-3 h-3 text-teal-400" />
                ABDM Milestone 1, 2, 3 Certified
              </span>
              <span className="inline-flex items-center gap-1 bg-slate-800 text-sky-300 px-2.5 py-1 rounded-md text-[10px] font-mono border border-slate-700">
                <Lock className="w-3 h-3 text-sky-400" />
                DPDP Act 2023 Compliant
              </span>
            </div>
          </div>

          {/* Col 2: Patient & Core Services */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Patient Services</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => onNavigate('ai-assistant')} className="hover:text-teal-400 text-left">AI Voice Symptom Triage</button></li>
              <li><button onClick={() => onNavigate('find-doctors')} className="hover:text-teal-400 text-left">Find Verified Doctors</button></li>
              <li><button onClick={() => onNavigate('book-appointment')} className="hover:text-teal-400 text-left">Book Video / Audio Consult</button></li>
              <li><button onClick={() => onNavigate('telemedicine')} className="hover:text-teal-400 text-left">Telemedicine Room (2G Resilient)</button></li>
              <li><button onClick={() => onNavigate('affordable-centers')} className="hover:text-teal-400 text-left">Jan Aushadhi Centers & Kendras</button></li>
              <li><button onClick={() => onNavigate('services')} className="hover:text-teal-400 text-left">All Healthcare Services</button></li>
            </ul>
          </div>

          {/* Col 3: Records & Health Portals */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Health Portals</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => onNavigate('patient-dashboard')} className="hover:text-teal-400 text-left">Patient Dashboard</button></li>
              <li><button onClick={() => onNavigate('health-records')} className="hover:text-teal-400 text-left">ABHA Health Locker (FHIR R4)</button></li>
              <li><button onClick={() => onNavigate('health-monitoring')} className="hover:text-teal-400 text-left">Vitals & Remote Monitoring</button></li>
              <li><button onClick={() => onNavigate('doctor-dashboard')} className="hover:text-teal-400 text-left">Doctor Clinical Workspace</button></li>
              <li><button onClick={() => onNavigate('admin-dashboard')} className="hover:text-teal-400 text-left">Public Health & Surveillance</button></li>
              <li><button onClick={() => onNavigate('auth')} className="hover:text-teal-400 text-left">Account Login / Register</button></li>
            </ul>
          </div>

          {/* Col 4: About & Regulatory */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Company & Legal</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => onNavigate('about')} className="hover:text-teal-400 text-left">About SwasthyaSetu AI</button></li>
              <li><button onClick={() => onNavigate('contact')} className="hover:text-teal-400 text-left">Contact & District Grievance</button></li>
              <li><span className="text-slate-500">Telemedicine Practice Guidelines 2020</span></li>
              <li><span className="text-slate-500">PMBJP Generic Drug Equivalency</span></li>
              <li><span className="text-slate-500">NMC Medical Registration Verification</span></li>
              <li><span className="text-slate-500">Privacy Policy & Patient Consent</span></li>
            </ul>
          </div>

        </div>

        {/* Clinical Disclaimer */}
        <div className="mt-12 pt-6 border-t border-slate-800 text-[11px] text-slate-500 leading-relaxed">
          <p>
            <strong>Clinical Safety Disclaimer:</strong> SwasthyaSetu AI provides algorithmic pre-consultation triage, educational guidance, and generic medicine cost comparisons. It is designed to assist registered medical practitioners and community health workers. It does not replace independent clinical judgment by a qualified physician. For medical emergencies (acute chest pain, stroke symptoms, severe breathlessness), users are directed immediately to the National Ambulance Dispatch (108).
          </p>
        </div>

        {/* Bottom copyright */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>© 2026 SwasthyaSetu AI Technologies Pvt. Ltd. Engineered for Bharat.</div>
          <div className="flex items-center space-x-4">
            <button onClick={() => onNavigate('about')} className="hover:text-slate-300">About</button>
            <button onClick={() => onNavigate('services')} className="hover:text-slate-300">Services</button>
            <button onClick={() => onNavigate('contact')} className="hover:text-slate-300">Support</button>
          </div>
        </div>

      </div>
    </footer>
  );
};
