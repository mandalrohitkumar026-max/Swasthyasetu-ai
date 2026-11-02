import React from 'react';
import { UserRole, UserProfile } from '../types';
import { 
  Stethoscope, 
  User, 
  ShieldCheck, 
  Building2, 
  Activity, 
  Globe2, 
  Sparkles,
  Wifi
} from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  currentUser: UserProfile | null;
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  currentUser,
  selectedLanguage,
  onLanguageChange,
  activeTab,
  onTabChange,
}) => {
  const roles: { id: UserRole; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'patient', label: 'Patient', icon: <User className="w-4 h-4" />, desc: 'Ramesh Kumar (Rural Sitapur)' },
    { id: 'doctor', label: 'Doctor', icon: <Stethoscope className="w-4 h-4" />, desc: 'Dr. Arvind Rao (Teleconsultant)' },
    { id: 'health_admin', label: 'Health Admin', icon: <Building2 className="w-4 h-4" />, desc: 'CHC & Kiosks Manager' },
    { id: 'platform_admin', label: 'Platform Admin', icon: <ShieldCheck className="w-4 h-4" />, desc: 'NHA & DPDP Compliance' },
  ];

  const languages = [
    { code: 'hi', label: 'हिन्दी (Hindi)' },
    { code: 'en', label: 'English' },
    { code: 'bn', label: 'বাংলা (Bengali)' },
    { code: 'te', label: 'తెలుగు (Telugu)' },
    { code: 'mr', label: 'मराठी (Marathi)' },
    { code: 'ta', label: 'தமிழ் (Tamil)' },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
      {/* Top Banner: India Health Mission & Low-Bandwidth Status */}
      <div className="bg-emerald-700 text-white text-xs py-1.5 px-4 flex flex-wrap items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="bg-emerald-800 text-emerald-100 px-2 py-0.5 rounded-full font-medium text-[11px] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-300" />
            ABDM & PMBJP Compliant
          </span>
          <span className="hidden sm:inline text-emerald-100">
            National Health Corridor • Affordable & Scalable Health Tech
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 text-emerald-100">
            <Wifi className="w-3.5 h-3.5 text-emerald-300" />
            <span>Resilient 2G/3G Adaptive WebRTC Active</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Globe2 className="w-3.5 h-3.5 text-emerald-300" />
            <select
              value={selectedLanguage}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="bg-emerald-800 text-white text-xs rounded px-1.5 py-0.5 border border-emerald-600 focus:outline-none cursor-pointer"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo & Vision */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onTabChange('triage')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Activity className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-xl text-slate-900 tracking-tight">SwasthyaSetu</span>
                <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-md font-semibold">AI</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Affordable • Scalable • Accessible</p>
            </div>
          </div>

          {/* Navigation Links based on active persona */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => onTabChange('triage')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'triage'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              AI Voice Triage
            </button>
            <button
              onClick={() => onTabChange('telemed')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'telemed'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Teleconsultation & Rx
            </button>
            <button
              onClick={() => onTabChange('pharmacy')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'pharmacy'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Generic Drug & Kendras
            </button>
            <button
              onClick={() => onTabChange('abdm')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'abdm'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ABHA & Health Records
            </button>
            <button
              onClick={() => onTabChange('admin')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'admin'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kiosk & Public Health
            </button>
          </nav>

          {/* Role Switcher Dropdown & Active User Badge */}
          <div className="flex items-center space-x-3">
            <div className="text-right hidden lg:block">
              <div className="text-xs font-semibold text-slate-800">{currentUser?.name}</div>
              <div className="text-[10px] text-emerald-600 font-medium">
                {currentUser?.specialization || currentUser?.facilityName || currentUser?.district || 'User'}
              </div>
            </div>

            <div className="relative flex items-center bg-slate-50 border border-slate-300 rounded-lg p-0.5">
              <span className="text-[11px] font-medium text-slate-500 px-2 hidden sm:inline">Role:</span>
              <select
                value={currentRole}
                onChange={(e) => onRoleChange(e.target.value as UserRole)}
                className="bg-transparent text-xs font-semibold text-slate-800 py-1.5 px-2 focus:outline-none cursor-pointer"
              >
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
