import React, { useState } from 'react';
import { PageId } from '../types/navigation';
import { 
  PhoneCall, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  Building2,
  AlertCircle
} from 'lucide-react';

interface ContactPageProps {
  onNavigate: (page: PageId) => void;
}

export const ContactPage: React.FC<ContactPageProps> = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('Patient Support');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/60">
          24x7 Helpdesk & Nodal Desks
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Contact & Grievance Redressal
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
          Reach our clinical support team, district kiosk coordinators, or DPDP Act compliance grievance officers.
        </p>
      </div>

      {/* Emergency Strip */}
      <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 text-rose-900 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <PhoneCall className="w-8 h-8 text-rose-600 shrink-0 animate-pulse" />
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-rose-800">Experiencing a Medical Emergency?</h3>
            <p className="text-xs text-rose-600">Dial 108 immediately for National Emergency Ambulance Dispatch. Do not wait for a support ticket.</p>
          </div>
        </div>
        <a
          href="tel:108"
          className="bg-rose-600 hover:bg-rose-700 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-md cursor-pointer whitespace-nowrap"
        >
          Call 108 Dispatch
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Inquiry Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
            Send an Inquiry or Grievance
          </h2>

          {submitted ? (
            <div className="p-8 text-center space-y-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-base text-emerald-900">Message Received!</h3>
              <p className="text-xs text-emerald-700 max-w-sm mx-auto">
                Thank you, {name}. A ticket has been logged and assigned to the district health nodal coordinator. You will receive an SMS update shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-xs font-bold text-teal-800 underline mt-2"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Inquiry Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 font-semibold focus:bg-white"
                >
                  <option value="Patient Support">Patient Support & Teleconsultation</option>
                  <option value="Doctor Onboarding">Physician Onboarding (NMC Registration)</option>
                  <option value="Panchayat Kiosk Setup">Panchayat Kiosk & CSC Setup Inquiry</option>
                  <option value="DPDP Privacy Grievance">DPDP Act Data Privacy Grievance</option>
                  <option value="Jan Aushadhi Partner">Jan Aushadhi Kendra Stock Query</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Your Message / Concern</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Provide details about your query or grievance..."
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-800 focus:bg-white resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Inquiry Ticket</span>
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Nodal Offices & Grievance (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-teal-600" />
              Nodal Operational Hubs
            </h3>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">Rural Health Corridor Hub (Sitapur)</div>
                <div className="text-slate-500">Near District Hospital Gate, Station Road, Sitapur, UP - 261001</div>
                <div className="text-[11px] font-mono text-teal-700">Phone: +91 94500 12345</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">Tech & AI Architecture Center (Bengaluru)</div>
                <div className="text-slate-500">12th Main Road, HAL 2nd Stage, Indiranagar, Bengaluru - 560038</div>
                <div className="text-[11px] font-mono text-teal-700">Phone: +91 98450 44321</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">National Regulatory Liaison (New Delhi)</div>
                <div className="text-slate-500">National Health Authority Gateway Liaison, Connaught Place, New Delhi - 110001</div>
                <div className="text-[11px] font-mono text-teal-700">Email: abdm-liaison@swasthyasetu.ai</div>
              </div>
            </div>
          </div>

          {/* DPDP Act Grievance Officer */}
          <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 shadow-xs space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>DPDP Act 2023 Grievance Redressal Officer</span>
            </div>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              Name: Priya Mehta • Email: grievance-officer@swasthyasetu.ai <br />
              Statutory timeline for grievance resolution: Within 72 working hours as mandated by Indian Data Protection laws.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
