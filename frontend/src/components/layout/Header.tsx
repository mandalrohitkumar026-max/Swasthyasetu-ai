import React, { useState } from 'react';
import { PageId } from '../../types/navigation';
import { useHealth } from '../../context/HealthContext';
import { 
  Activity, 
  Sparkles, 
  PhoneCall, 
  Menu, 
  X, 
  ChevronDown, 
  User, 
  Stethoscope, 
  ShieldCheck, 
  HeartHandshake, 
  Search,
  Globe2,
  Wifi
} from 'lucide-react';

interface HeaderProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  selectedLanguage,
  onLanguageChange,
}) => {
  const { isBackendConnected, currentUser } = useHealth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [portalDropdownOpen, setPortalDropdownOpen] = useState(false);

  const mainNavItems: { id: PageId; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'services', label: 'Services' },
    { id: 'ai-assistant', label: 'AI Assistant' },
    { id: 'find-doctors', label: 'Find Doctors' },
    { id: 'resources', label: 'Resources & Tariffs' },
    { id: 'rural-access', label: 'Rural 2G Care' },
    { id: 'contact', label: 'Contact' },
  ];

  const portalItems: { id: PageId; label: string; desc: string; icon: React.ReactNode }[] = [
    { id: 'resources', label: 'Healthcare Resources & Tariffs', desc: '5-tier directory & published CGHS/NHM rates', icon: <Activity className="w-4 h-4 text-teal-600" /> },
    { id: 'rural-access', label: 'Rural 2G Care & Education', desc: 'Low-bandwidth mode & clinical pamphlets', icon: <HeartHandshake className="w-4 h-4 text-emerald-600" /> },
    { id: 'patient-dashboard', label: 'Patient Portal', desc: 'Vitals, appointments & prescriptions', icon: <User className="w-4 h-4 text-sky-600" /> },
    { id: 'health-records', label: 'ABHA Health Locker', desc: '14-digit ABHA card & FHIR records', icon: <ShieldCheck className="w-4 h-4 text-teal-600" /> },
    { id: 'health-monitoring', label: 'Vitals & Telemetry', desc: 'BP, Glucose & SpO2 tracking', icon: <Activity className="w-4 h-4 text-emerald-600" /> },
    { id: 'doctor-dashboard', label: 'Doctor Clinical Workspace', desc: 'OPD queue & e-prescriptions', icon: <Stethoscope className="w-4 h-4 text-indigo-600" /> },
    { id: 'admin-dashboard', label: 'Admin & Surveillance Desk', desc: 'Outbreak clusters & compliance', icon: <Activity className="w-4 h-4 text-slate-700" /> },
  ];

  const languages = [
    { code: 'hi', label: 'हिन्दी (Hindi)' },
    { code: 'en', label: 'English' },
    { code: 'bn', label: 'বাংলা (Bengali)' },
    { code: 'te', label: 'తెలుగు (Telugu)' },
    { code: 'mr', label: 'मराठी (Marathi)' },
    { code: 'ta', label: 'தமிழ் (Tamil)' },
  ];

  const navigateTo = (page: PageId) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    setPortalDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      
      {/* Top Utility Ribbon */}
      <div className="bg-slate-50 border-b border-slate-200/60 py-1.5 px-4 sm:px-8 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center space-x-3 text-[11px]">
            <span className="inline-flex items-center gap-1.5 font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200/60">
              <Sparkles className="w-3 h-3 text-teal-600" />
              ABDM & PMBJP Certified
            </span>

            {/* Live Backend Indicator */}
            <span className={`inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full border ${
              isBackendConnected 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
              <span>{isBackendConnected ? 'API Live (Port 5000)' : 'Resilient Offline Cache'}</span>
            </span>

            <span className="hidden md:inline text-slate-400">|</span>
            <span className="hidden lg:inline text-slate-500">
              Serving 48,000+ daily citizens
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <a 
              href="tel:108" 
              className="inline-flex items-center gap-1 text-rose-600 font-bold hover:text-rose-700 transition-colors"
            >
              <PhoneCall className="w-3 h-3" />
              <span>National Ambulance: 108</span>
            </a>

            <div className="flex items-center space-x-1.5 text-slate-600">
              <Globe2 className="w-3.5 h-3.5 text-teal-600" />
              <select
                value={selectedLanguage}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="bg-transparent text-[11px] font-medium text-slate-700 hover:text-slate-900 focus:outline-none cursor-pointer py-0.5"
              >
                {languages.map(l => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
            </div>
          </div>

        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => navigateTo('home')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-600 via-sky-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-sky-500/15 group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xl text-slate-900 tracking-tight">SwasthyaSetu</span>
                <span className="bg-gradient-to-r from-teal-600 to-sky-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                  AI
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500">Affordable & Scalable Health Tech</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {mainNavItems.map(item => (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  currentPage === item.id
                    ? 'text-teal-700 bg-teal-50/80 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}

            {/* Portals Dropdown */}
            <div className="relative">
              <button
                onClick={() => setPortalDropdownOpen(!portalDropdownOpen)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                  ['patient-dashboard', 'health-records', 'health-monitoring', 'doctor-dashboard', 'admin-dashboard'].includes(currentPage)
                    ? 'text-sky-700 bg-sky-50 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>Portals & Desks</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {portalDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setPortalDropdownOpen(false)}
                >
                  <div className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1.5 tracking-wider">
                    Role-Based Access
                  </div>
                  {portalItems.map(p => (
                    <button
                      key={p.id}
                      onClick={() => navigateTo(p.id)}
                      className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start space-x-3 ${
                        currentPage === p.id ? 'bg-teal-50/70 text-teal-900' : 'hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="p-2 rounded-lg bg-slate-100 shrink-0 mt-0.5">
                        {p.icon}
                      </div>
                      <div>
                        <div className="text-xs font-bold">{p.label}</div>
                        <div className="text-[10px] text-slate-500">{p.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Desktop Right CTA Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            <button
              onClick={() => navigateTo('ai-assistant')}
              className="flex items-center gap-1.5 bg-gradient-to-r from-teal-50 to-sky-50 hover:from-teal-100 hover:to-sky-100 text-teal-800 border border-teal-200/80 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Voice Symptom Triage</span>
            </button>

            <button
              onClick={() => navigateTo('book-appointment')}
              className="flex items-center gap-1.5 bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-sky-600/15 transition-all"
            >
              <span>Book Doctor</span>
            </button>

            <button
              onClick={() => navigateTo('auth')}
              className="p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all border border-slate-200"
              title="Login / Account"
            >
              <User className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="lg:hidden flex items-center space-x-2">
            <button
              onClick={() => navigateTo('ai-assistant')}
              className="bg-teal-50 text-teal-700 p-2 rounded-xl border border-teal-200"
              title="AI Triage"
            >
              <Sparkles className="w-4 h-4 text-teal-600" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-100">
            <button
              onClick={() => navigateTo('ai-assistant')}
              className="flex items-center justify-center gap-1.5 bg-teal-600 text-white text-xs font-bold py-2.5 rounded-xl shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Voice Triage</span>
            </button>
            <button
              onClick={() => navigateTo('book-appointment')}
              className="flex items-center justify-center gap-1.5 bg-sky-600 text-white text-xs font-bold py-2.5 rounded-xl shadow-xs"
            >
              <span>Book Consult</span>
            </button>
          </div>

          <div className="space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">Main Pages</div>
            {mainNavItems.map(item => (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold ${
                  currentPage === item.id ? 'bg-teal-50 text-teal-700' : 'text-slate-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="space-y-1 pt-2 border-t border-slate-100">
            <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">Role Portals</div>
            {portalItems.map(p => (
              <button
                key={p.id}
                onClick={() => navigateTo(p.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between ${
                  currentPage === p.id ? 'bg-sky-50 text-sky-700' : 'text-slate-700'
                }`}
              >
                <span>{p.label}</span>
                {p.icon}
              </button>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={() => navigateTo('auth')}
              className="w-full text-center py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800"
            >
              Sign In / Register
            </button>
          </div>
        </div>
      )}

    </header>
  );
};
