import React, { useState } from 'react';
import { PageId } from '../types/navigation';
import { 
  Calendar, 
  Clock, 
  Video, 
  Phone, 
  Building2, 
  User, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Stethoscope
} from 'lucide-react';
import { useHealth } from '../context/HealthContext';

interface BookAppointmentPageProps {
  onNavigate: (page: PageId, data?: any) => void;
  bookingData?: any;
}

export const BookAppointmentPage: React.FC<BookAppointmentPageProps> = ({
  onNavigate,
  bookingData,
}) => {
  const { bookAppointment, currentUser, doctors } = useHealth();

  const initialDoc = bookingData?.selectedDoctor || doctors[0];
  const [selectedDoctorId, setSelectedDoctorId] = useState(initialDoc?.id || 'doc-01');
  const [consultationMode, setConsultationMode] = useState<'video' | 'audio' | 'kiosk'>('video');
  const [selectedDate, setSelectedDate] = useState('Today (Immediate Queue)');
  const [selectedSlot, setSelectedSlot] = useState('11:30 AM');
  const [patientName, setPatientName] = useState(currentUser.name || 'Ramesh Kumar');
  const [patientAge, setPatientAge] = useState(currentUser.age?.toString() || '48');
  const [patientPhone, setPatientPhone] = useState(currentUser.phone || '+91 98765 43210');
  const [symptomsNote, setSymptomsNote] = useState('Excessive thirst, fatigue, dizziness upon standing since 1 week.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookedApt, setBookedApt] = useState<any>(null);

  const activeDoc = doctors.find(d => d.id === selectedDoctorId) || doctors[0];

  const dates = [
    { label: "Today (Immediate)", value: "Today (Immediate Queue)" },
    { label: "Tomorrow", value: "Tomorrow, 02 Nov" },
    { label: "Monday", value: "Monday, 03 Nov" },
  ];

  const slots = ["10:30 AM", "11:00 AM", "11:30 AM", "02:00 PM", "03:30 PM", "04:15 PM"];

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const created = bookAppointment({
        patientName,
        patientAge: Number(patientAge) || 48,
        patientGender: currentUser.gender || 'Male',
        patientPhone,
        doctorId: activeDoc.id,
        doctorName: activeDoc.name,
        doctorSpecialty: activeDoc.specialty,
        scheduledTime: selectedSlot,
        scheduledDate: selectedDate,
        consultationMode,
        triagePriority: 'urgent',
        chiefComplaints: [symptomsNote],
        aiClinicalSummary: `Patient booked teleconsultation. Chief Complaints: "${symptomsNote}". Mode: ${consultationMode}.`,
        vitals: {
          bp: "138/88 mmHg",
          pulse: 80,
          spo2: 98,
          temperature: "98.6 °F"
        }
      });

      setBookedApt(created);
      setIsSubmitting(false);
      setBookingSuccess(true);
    }, 500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/60">
          Seamless Telehealth Scheduling
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Book Teleconsultation
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm">
          Connect with a certified medical practitioner from the comfort of your home or local village kiosk.
        </p>
      </div>

      {bookingSuccess ? (
        <div className="bg-white rounded-3xl border border-teal-200 p-8 shadow-xl text-center space-y-5 animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900">Appointment Confirmed!</h2>
            <p className="text-xs text-slate-500">
              Your appointment with <strong className="text-slate-800">{activeDoc.name}</strong> is locked into the OPD queue.
            </p>
          </div>

          <div className="max-w-md mx-auto bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left text-xs space-y-2 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Patient:</span>
              <span className="font-bold text-slate-800">{patientName} ({patientAge}y)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Doctor:</span>
              <span className="font-bold text-teal-800">{activeDoc.name} ({activeDoc.specialty})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Mode:</span>
              <span className="font-bold text-teal-700 capitalize">{consultationMode} (2G Resilient)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Time Slot:</span>
              <span className="font-bold text-slate-800">{selectedDate} at {selectedSlot}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">ABHA Linked:</span>
              <span className="font-bold text-emerald-700">{currentUser.abhaNumber || '91-4521-8890-1234'}</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('telemedicine')}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Video className="w-4 h-4" />
              <span>Enter Telemedicine Room Now</span>
            </button>
            <button
              onClick={() => onNavigate('patient-dashboard')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-5 py-3 rounded-xl cursor-pointer"
            >
              Go to Patient Dashboard
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleConfirmBooking} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          
          {/* Step 1: Doctor Info Card / Dropdown */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Assigned Practitioner</span>
              <span className="text-xs font-bold text-teal-700">Fee: ₹{activeDoc.fee}</span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <img src={activeDoc.avatar} alt={activeDoc.name} className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                <div>
                  <div className="font-extrabold text-sm text-slate-900">{activeDoc.name}</div>
                  <div className="text-[11px] text-teal-700 font-semibold">{activeDoc.qualification} • {activeDoc.specialty}</div>
                  <div className="text-[10px] text-slate-500">Reg: {activeDoc.regNo} ({activeDoc.council})</div>
                </div>
              </div>

              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-none cursor-pointer"
              >
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Step 2: Choose Consultation Mode */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wide text-slate-700 block">
              1. Choose Consultation Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                onClick={() => setConsultationMode('video')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-1.5 ${
                  consultationMode === 'video'
                    ? 'bg-teal-50/80 border-teal-500 ring-1 ring-teal-400'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Video className="w-5 h-5 text-teal-600" />
                  {consultationMode === 'video' && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
                </div>
                <div className="font-bold text-xs text-slate-900">HD Video Call</div>
                <div className="text-[11px] text-slate-500">For 3G/4G/Wi-Fi with adaptive step-down</div>
              </div>

              <div
                onClick={() => setConsultationMode('audio')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-1.5 ${
                  consultationMode === 'audio'
                    ? 'bg-teal-50/80 border-teal-500 ring-1 ring-teal-400'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Phone className="w-5 h-5 text-sky-600" />
                  {consultationMode === 'audio' && <CheckCircle2 className="w-4 h-4 text-sky-600" />}
                </div>
                <div className="font-bold text-xs text-slate-900">Resilient Audio Call</div>
                <div className="text-[11px] text-slate-500">16 kbps Opus mode for 2G rural networks</div>
              </div>

              <div
                onClick={() => setConsultationMode('kiosk')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-1.5 ${
                  consultationMode === 'kiosk'
                    ? 'bg-teal-50/80 border-teal-500 ring-1 ring-teal-400'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  {consultationMode === 'kiosk' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                </div>
                <div className="font-bold text-xs text-slate-900">Gram Panchayat Kiosk</div>
                <div className="text-[11px] text-slate-500">Assisted visit with ASHA facilitator</div>
              </div>
            </div>
          </div>

          {/* Step 3: Date & Slot Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wide text-slate-700 block">
              2. Select Date & Slot
            </label>
            <div className="flex flex-wrap gap-2">
              {dates.map(d => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setSelectedDate(d.value)}
                  className={`text-xs px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
                    selectedDate === d.value
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1">
              {slots.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedSlot(s)}
                  className={`text-xs py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                    selectedSlot === s
                      ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Step 4: Patient Details */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="text-xs font-bold uppercase tracking-wide text-slate-700 block">
              3. Patient Details & Chief Symptoms
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Patient Full Name"
                className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800"
              />
              <input
                type="number"
                required
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                placeholder="Age"
                className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800"
              />
              <input
                type="tel"
                required
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                placeholder="Mobile number"
                className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800"
              />
            </div>
            <textarea
              rows={3}
              required
              value={symptomsNote}
              onChange={(e) => setSymptomsNote(e.target.value)}
              placeholder="Describe your health symptoms or reason for visit..."
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 focus:bg-white resize-none"
            />
          </div>

          {/* Confirm Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Calendar className="w-4 h-4" />
              )}
              <span>Confirm & Lock Consultation Slot (₹{activeDoc.fee})</span>
            </button>
          </div>

        </form>
      )}

    </div>
  );
};
