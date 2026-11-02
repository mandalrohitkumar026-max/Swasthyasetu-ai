import React from 'react';
import { Doctor } from '../../types';
import { Star, ShieldCheck, MapPin, Languages, Clock, Calendar } from 'lucide-react';

interface DoctorCardProps {
  doctor: Doctor;
  onBook: (doctor: Doctor) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onBook }) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:border-teal-300 transition-all space-y-4 flex flex-col justify-between">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="relative">
              <img 
                src={doctor.avatar} 
                alt={doctor.name} 
                className="w-14 h-14 rounded-2xl object-cover border border-slate-100" 
              />
              {doctor.isOnline && (
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white absolute -bottom-1 -right-1" title="Online for Teleconsult"></span>
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">{doctor.name}</h3>
              <div className="text-[11px] font-semibold text-teal-700">{doctor.qualification}</div>
              <div className="text-xs text-slate-500">{doctor.specialty} • {doctor.experience}</div>
            </div>
          </div>

          <span className="text-xs font-bold text-slate-900 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-xl flex items-center gap-1 shrink-0">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span>{doctor.rating}</span>
          </span>
        </div>

        {/* NMC Registration & Hospital */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1 text-xs">
          <div className="flex items-center gap-1 text-emerald-800 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">Reg: {doctor.regNo} ({doctor.council})</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500 text-[11px]">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{doctor.hospital}</span>
          </div>
        </div>

        {/* Languages & Next Slot */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1 gap-2">
          <div className="flex items-center gap-1">
            <Languages className="w-3.5 h-3.5 text-slate-400" />
            <span>{doctor.languages.join(', ')}</span>
          </div>
          <div className="flex items-center gap-1 text-teal-700 font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>{doctor.nextSlot}</span>
          </div>
        </div>
      </div>

      {/* Price & Book Button */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Consultation Fee</span>
          <span className="text-lg font-black text-slate-900">₹{doctor.fee}</span>
        </div>

        <button
          onClick={() => onBook(doctor)}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-teal-600/20 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Book Consult</span>
        </button>
      </div>
    </div>
  );
};
