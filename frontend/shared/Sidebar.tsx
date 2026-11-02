import React from 'react';
import { PageId } from '../../types/navigation';
import { UserRole } from '../../types';
import { 
  User, 
  Stethoscope, 
  ShieldCheck, 
  Activity, 
  Calendar, 
  FileText, 
  HeartPulse, 
  Building2, 
  LogOut, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  currentRole: UserRole;
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  onRoleChange: (role: UserRole) => void;
  userName?: string;
  userSubtitle?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  currentPage,
  onNavigate,
  onRoleChange,
  userName = "Ramesh Kumar",
  userSubtitle = "Sitapur, UP",
}) => {
  const patientNav = [
    { id: 'patient-dashboard' as PageId, label: 'Overview Dashboard', icon: <User className="w-4 h-4" /> },
    { id: 'health-monitoring' as PageId, label: 'Vitals & Telemetry', icon: <HeartPulse className="w-4 h-4" /> },
    { id: 'health-records' as PageId, label: 'ABHA Health Locker', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'book-appointment' as PageId, label: 'Book Consultation', icon: <Calendar className="w-4 h-4" /> },
    { id: 'telemedicine' as PageId, label: 'Telemedicine Room', icon: <Activity className="w-4 h-4" /> },
    { id: 'affordable-centers' as PageId, label: 'Jan Aushadhi Kendras', icon: <Building2 className="w-4 h-4" /> },
  ];

  const doctorNav = [
    { id: 'doctor-dashboard' as PageId, label: 'Clinical OPD Queue', icon: <Stethoscope className="w-4 h-4" /> },
    { id: 'telemedicine' as PageId, label: 'Teleconsultation Room', icon: <Activity className="w-4 h-4" /> },
    { id: 'find-doctors' as PageId, label: 'Doctor Directory', icon: <User className="w-4 h-4" /> },
    { id: 'admin-dashboard' as PageId, label: 'Public Health Telemetry', icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  const adminNav = [
    { id: 'admin-dashboard' as PageId, label: 'Outbreak Surveillance', icon: <Activity className="w-4 h-4" /> },
    { id: 'affordable-centers' as PageId, label: 'Kiosk & Kendra Network', icon: <Building2 className="w-4 h-4" /> },
    { id: 'health-records' as PageId, label: 'DPDP Audit Logs', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'doctor-dashboard' as PageId, label: 'Clinical Desk View', icon: <Stethoscope className="w-4 h-4" /> },
  ];

  const currentNav = currentRole === 'doctor' ? doctorNav : currentRole === 'health_admin' || currentRole === 'platform_admin' ? adminNav : patientNav;

  return (
    <aside className="w-full lg:w-64 bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-6 shrink-0 h-fit">
      
      {/* User Card */}
      <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
        <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold text-sm shrink-0">
          {userName.slice(0, 2).toUpperCase()}
        </div>
        <div className="overflow-hidden">
          <div className="font-extrabold text-sm text-slate-900 truncate">{userName}</div>
          <div className="text-[11px] text-teal-700 font-medium truncate">{userSubtitle}</div>
        </div>
      </div>

      {/* Role Switcher in Sidebar */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
          Switch Workspace
        </label>
        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
          <button
            onClick={() => { onRoleChange('patient'); onNavigate('patient-dashboard'); }}
            className={`py-1.5 rounded-lg transition-all cursor-pointer ${
              currentRole === 'patient' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            Patient
          </button>
          <button
            onClick={() => { onRoleChange('doctor'); onNavigate('doctor-dashboard'); }}
            className={`py-1.5 rounded-lg transition-all cursor-pointer ${
              currentRole === 'doctor' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            Doctor
          </button>
          <button
            onClick={() => { onRoleChange('health_admin'); onNavigate('admin-dashboard'); }}
            className={`py-1.5 rounded-lg transition-all cursor-pointer ${
              currentRole === 'health_admin' || currentRole === 'platform_admin' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            Admin
          </button>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="space-y-1">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1 mb-1">
          Menu
        </label>
        {currentNav.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
              currentPage === item.id
                ? 'bg-teal-50 text-teal-800 border border-teal-200/70 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <span className={currentPage === item.id ? 'text-teal-700' : 'text-slate-400'}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </div>
            {currentPage === item.id && <ChevronRight className="w-3.5 h-3.5 text-teal-600" />}
          </button>
        ))}
      </nav>

      {/* Quick Emergency Prompt */}
      <div className="pt-2 border-t border-slate-100">
        <a
          href="tel:108"
          className="w-full py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all text-center"
        >
          <span>Emergency Ambulance 108</span>
        </a>
      </div>

    </aside>
  );
};
