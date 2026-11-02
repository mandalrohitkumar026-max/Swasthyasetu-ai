import React from 'react';
import { PageId } from '../types/navigation';
import { 
  Activity, 
  Target, 
  Compass, 
  Award, 
  Users, 
  ShieldCheck, 
  Building2, 
  Sparkles, 
  HeartHandshake, 
  Stethoscope,
  Globe2
} from 'lucide-react';

interface AboutPageProps {
  onNavigate: (page: PageId) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const leadershipTeam = [
    {
      name: "Dr. Arvind Rao, MD",
      role: "Chief Medical Officer & Co-Founder",
      bio: "14+ years in internal medicine and public health administration. Former advisor to state telemedicine initiatives.",
      avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=160"
    },
    {
      name: "Dr. Sunita Patil, MBBS, DGO",
      role: "Head of Rural Maternal & Child Health",
      bio: "Pioneered mobile maternal immunization tracking across 12 primary health centers in Karnataka and Maharashtra.",
      avatar: "https://images.unsplash.com/photo-1594824813583-05701c905307?w=160"
    },
    {
      name: "Rajesh Nair",
      role: "Director of Kiosk Operations & Field Logistics",
      bio: "Expert in Common Service Center (CSC) grassroots networks with 10+ years scaling rural connectivity in Uttar Pradesh & Bihar.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160"
    },
    {
      name: "Priya Mehta",
      role: "Head of Health Informatics & ABDM Compliance",
      bio: "Former health IT architect specialized in HL7 FHIR R4 document bundles and DPDP Act 2023 zero-knowledge data pipelines.",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Hero / Vision */}
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/60">
          Our Story & Vision
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Democratizing Quality Healthcare Across Bharat
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          SwasthyaSetu AI was founded with a singular conviction: access to a qualified doctor and life-saving medicines should never depend on someone's pincode, language, or daily wage.
        </p>
      </div>

      {/* Mission & Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Our Mission</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            To provide an affordable, AI-powered digital healthcare highway that connects 100+ million underserved citizens in Tier-3, Tier-4, and rural Panchayats with certified doctors, while slashing catastrophic medical expenditures through bioequivalent generic medicine substitution.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center">
            <Compass className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Our Core Philosophy</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            We reject the idea that technology must be high-bandwidth and English-first. We engineer for real ground realities: 16 kbps 2G connections, vernacular voice dialects, assisted ASHA tablets, and uncompromised clinical safety guidelines.
          </p>
        </div>
      </div>

      {/* The Healthcare Divide We Tackle */}
      <div className="bg-slate-50 p-8 sm:p-12 rounded-3xl border border-slate-200/80 space-y-8">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold text-teal-700 uppercase">Ground Reality in Numbers</span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">The Problem We Are Solving</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <div className="text-3xl font-black text-rose-600">1 : 1,456</div>
            <div className="text-xs font-bold text-slate-800 mt-2">Doctor to Patient Ratio</div>
            <p className="text-[11px] text-slate-500 mt-1">Well below WHO's recommended 1:1,000 threshold, with 75% practicing in metropolitan cities.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <div className="text-3xl font-black text-amber-600">48%</div>
            <div className="text-xs font-bold text-slate-800 mt-2">Out-of-Pocket Expenditure</div>
            <p className="text-[11px] text-slate-500 mt-1">High branded medicine costs push an estimated 35 million Indian citizens into poverty each year.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <div className="text-3xl font-black text-teal-600">30–60 km</div>
            <div className="text-xs font-bold text-slate-800 mt-2">Average Distance to Specialist</div>
            <p className="text-[11px] text-slate-500 mt-1">Rural villagers lose daily wages simply traveling to district hospitals for basic primary consults.</p>
          </div>
        </div>
      </div>

      {/* Leadership & Clinical Advisors */}
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Clinical Leadership</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Guided by Clinicians & Rural Health Experts
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {leadershipTeam.map((lead, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 text-center space-y-3">
              <img src={lead.avatar} alt={lead.name} className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-teal-500/20" />
              <div>
                <h3 className="font-bold text-sm text-slate-900">{lead.name}</h3>
                <div className="text-[11px] font-semibold text-teal-700">{lead.role}</div>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">{lead.bio}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-teal-50 to-sky-50 rounded-3xl p-8 border border-teal-200/60 text-center space-y-4">
        <h3 className="text-xl font-bold text-slate-900">Partner With SwasthyaSetu AI</h3>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          We collaborate with State Health Missions, Primary Health Centers, CSR initiatives, and verified doctors to expand affordable healthcare access.
        </p>
        <div className="flex justify-center gap-3">
          <button 
            onClick={() => onNavigate('contact')}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md cursor-pointer"
          >
            Contact Partner Desk
          </button>
        </div>
      </div>

    </div>
  );
};
