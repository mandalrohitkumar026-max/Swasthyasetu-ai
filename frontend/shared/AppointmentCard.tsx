import React from 'react';
import { Appointment } from '../../types';
import { Calendar, Clock, Video, Phone, Building2, User, Stethoscope } from 'lucide-react';

interface AppointmentCardProps {
  appointment: Appointment;
  onJoin?: (appointment: Appointment) => void;
  onCancel?: (appointment: Appointment) => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onJoin,
  onCancel,
}) => {
  const getModeIcon = () => {
    switch (appointment.consultationMode) {
      case 'video': return <Video className="w-3.5 h-3.5 text-sky-600" />;
      case 'audio': return <Phone className="w-3.5 h-3.5 text-teal-600" />;
      case 'kiosk': return <Building2 className="w-3.5 h-3.5 text-indigo-600" />;
      default: return <Video className="w-3.5 h-3.5 text-teal-600" />;
    }
  };

  const getPriorityBadge = () => {
    switch (appointment.triagePriority) {
      case 'emergency': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'urgent': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-teal-100 text-teal-800 border-teal-200';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4 hover:border-teal-300 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-slate-900">{appointment.doctorName}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getPriorityBadge()}`}>
              {appointment.triagePriority}
            </span>
          </div>
          <div className="text-xs text-teal-700 font-semibold">{appointment.doctorSpecialty}</div>
          <div className="text-xs text-slate-500 flex items-center gap-1.5 pt-0.5">
            <User className="w-3 h-3 text-slate-400" />
            <span>Patient: {appointment.patientName} ({appointment.patientAge}y, {appointment.patientGender})</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl text-[11px] font-semibold text-slate-700 capitalize">
          {getModeIcon()}
          <span>{appointment.consultationMode}</span>
        </div>
      </div>

      {/* Chief Complaint */}
      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700">
        <span className="font-bold text-slate-800 block text-[10px] uppercase text-slate-400 mb-0.5">Chief Symptom:</span>
        <p className="line-clamp-2">{appointment.chiefComplaints[0]}</p>
      </div>

      {/* Date, Time & Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 text-xs">
        <div className="flex items-center space-x-3 text-slate-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{appointment.scheduledDate}</span>
          </div>
          <div className="flex items-center gap-1 font-bold text-slate-800">
            <Clock className="w-3.5 h-3.5 text-teal-600" />
            <span>{appointment.scheduledTime}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onCancel && appointment.status !== 'completed' && (
            <button
              onClick={() => onCancel(appointment)}
              className="text-xs text-slate-500 hover:text-rose-600 font-bold px-3 py-1.5 rounded-xl hover:bg-rose-50 cursor-pointer"
            >
              Cancel
            </button>
          )}

          {onJoin && appointment.status !== 'completed' && (
            <button
              onClick={() => onJoin(appointment)}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Join Call</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
