import React, { useState } from 'react';
import { PageId } from '../types/navigation';
import { Search, Filter, Languages, Stethoscope } from 'lucide-react';
import { useHealth } from '../context/HealthContext';
import { DoctorCard } from '../components/shared/DoctorCard';
import { Doctor } from '../types';

interface FindDoctorsPageProps {
  onNavigate: (page: PageId, data?: any) => void;
}

export const FindDoctorsPage: React.FC<FindDoctorsPageProps> = ({ onNavigate }) => {
  const { doctors } = useHealth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');

  const specialties = ["All", "General Physician", "Gynecology", "Pediatrician", "Diabetologist", "Pulmonology", "Dermatologist"];
  const languages = ["All", "Hindi", "English", "Kannada", "Tamil", "Bhojpuri", "Bengali"];

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.hospital.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSpecialty = selectedSpecialty === 'All' || doc.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase());
    const matchesLang = selectedLanguage === 'All' || doc.languages.some(l => l.toLowerCase() === selectedLanguage.toLowerCase());

    return matchesSearch && matchesSpecialty && matchesLang;
  });

  const handleBookDoctor = (doc: Doctor) => {
    onNavigate('book-appointment', { selectedDoctor: doc });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/60">
          NMC Verified Telehealth Practitioners
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Find Verified Doctors for Teleconsultation
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
          Every doctor on SwasthyaSetu AI is authenticated against the National Medical Commission (NMC) registry. Experience high-quality teleconsultations in your native tongue at affordable public rates.
        </p>
      </div>

      {/* Search & Filters Row */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by doctor name, medical council registration, condition (e.g. Diabetes, Fever), or district hospital..."
            className="w-full text-xs sm:text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Specialty:
            </span>
            {specialties.map(spec => (
              <button
                key={spec}
                onClick={() => setSelectedSpecialty(spec)}
                className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                  selectedSpecialty === spec
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
              <Languages className="w-3.5 h-3.5" />
              Language:
            </span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              {languages.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Doctors List Grid using reusable DoctorCard */}
      {filteredDoctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDoctors.map(doc => (
            <DoctorCard
              key={doc.id}
              doctor={doc}
              onBook={handleBookDoctor}
            />
          ))}
        </div>
      ) : (
        <div className="bg-slate-50 rounded-3xl border border-dashed border-slate-200 p-12 text-center space-y-3">
          <Stethoscope className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-800 text-base">No doctors matched your filter</h3>
          <p className="text-xs text-slate-500">Try clearing the specialty or language filter to view all available teleconsultants.</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedSpecialty('All'); setSelectedLanguage('All'); }}
            className="text-xs font-bold text-teal-700 underline cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

    </div>
  );
};
