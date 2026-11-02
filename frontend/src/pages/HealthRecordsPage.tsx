import React, { useState, useEffect } from 'react';
import { PageId } from '../types/navigation';
import { 
  ShieldCheck, 
  QrCode, 
  FileCode2, 
  Lock, 
  Download, 
  CheckCircle2, 
  Sparkles, 
  Trash2, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

interface HealthRecordsPageProps {
  onNavigate: (page: PageId) => void;
}

export const HealthRecordsPage: React.FC<HealthRecordsPageProps> = () => {
  const [abhaNumber, setAbhaNumber] = useState('91-4521-8890-1234');
  const [abhaAddress, setAbhaAddress] = useState('ramesh.sitapur@abdm');
  const [fullName, setFullName] = useState('Ramesh Kumar');
  const [phone, setPhone] = useState('9876543210');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSuccess, setGeneratedSuccess] = useState(false);

  const [fhirBundle, setFhirBundle] = useState<any | null>(null);
  const [consents, setConsents] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState<'card' | 'fhir' | 'consents'>('card');

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      const [bundle, cons] = await Promise.all([
        api.getFhirBundle('usr-pat-01'),
        api.getConsents()
      ]);
      setFhirBundle(bundle);
      setConsents(cons);
    } catch (err) {
      console.error("Failed to load records", err);
    }
  };

  const handleGenerateAbha = async () => {
    setIsGenerating(true);
    try {
      const res = await api.generateAbha(phone, fullName);
      setAbhaNumber(res.abhaNumber);
      setAbhaAddress(res.abhaAddress);
      setGeneratedSuccess(true);
    } catch (err) {
      console.error("Failed to generate ABHA", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRevokeConsent = async (consentId: string) => {
    try {
      await api.revokeConsent(consentId);
      const updated = await api.getConsents();
      setConsents(updated);
    } catch (err) {
      console.error("Failed to revoke consent", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-sky-800 to-indigo-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-wrap items-center justify-between gap-6">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-semibold px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ayushman Bharat Digital Mission (ABDM) Gateway</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Digital Health Records & ABHA Health Locker
          </h1>
          <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
            Take complete ownership of your medical history. Encrypted FHIR R4 clinical records linked directly to your 14-digit ABHA number, compliant with the Digital Personal Data Protection (DPDP) Act 2023.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-white/10 p-1.5 rounded-2xl border border-white/20 text-xs font-bold">
          <button
            onClick={() => setSelectedTab('card')}
            className={`px-3.5 py-2 rounded-xl transition-all ${selectedTab === 'card' ? 'bg-white text-teal-900 shadow-md' : 'text-white'}`}
          >
            ABHA Card
          </button>
          <button
            onClick={() => setSelectedTab('fhir')}
            className={`px-3.5 py-2 rounded-xl transition-all ${selectedTab === 'fhir' ? 'bg-white text-teal-900 shadow-md' : 'text-white'}`}
          >
            FHIR R4 Records
          </button>
          <button
            onClick={() => setSelectedTab('consents')}
            className={`px-3.5 py-2 rounded-xl transition-all ${selectedTab === 'consents' ? 'bg-white text-teal-900 shadow-md' : 'text-white'}`}
          >
            DPDP Consents
          </button>
        </div>
      </div>

      {/* Tab 1: Official ABHA Card & Creation */}
      {selectedTab === 'card' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Card Presentation (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-gradient-to-tr from-slate-900 via-slate-800 to-teal-950 text-white rounded-3xl p-6 shadow-2xl border border-slate-700 relative overflow-hidden space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center font-black text-white text-xs">
                    NDHM
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">ABHA Health Card</h3>
                    <p className="text-[10px] text-slate-400">National Health Authority • Govt. of India</p>
                  </div>
                </div>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Verified
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-white p-1.5 shrink-0 shadow-md flex items-center justify-center">
                  <QrCode className="w-full h-full text-slate-900" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-extrabold text-white">{fullName}</div>
                  <div className="text-[11px] text-slate-300">DOB: 12-04-1978 • Male</div>
                  <div className="text-[11px] text-slate-300">Sitapur, Uttar Pradesh</div>
                  <div className="text-xs font-mono font-bold text-amber-300 pt-1">
                    ABHA: {abhaNumber}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-teal-300">{abhaAddress}</span>
                <button
                  onClick={() => alert("Downloading official ABHA Health Card PDF...")}
                  className="flex items-center gap-1 text-slate-200 hover:text-white font-bold cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Card</span>
                </button>
              </div>
            </div>
          </div>

          {/* Form to Generate / Link New ABHA ID (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Generate New 14-Digit ABHA ID (Instant Aadhaar / Mobile OTP)
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Create your official digital health account to access universal electronic health records across all government and private hospitals in India.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="As per Aadhaar Card"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Mobile / Aadhaar Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateAbha}
              disabled={isGenerating}
              className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              {isGenerating ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <ShieldCheck className="w-3.5 h-3.5" />
              )}
              <span>Create ABHA & Link Health Locker</span>
            </button>

            {generatedSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>ABHA ID successfully created and linked with National Health Authority gateway!</span>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Tab 2: FHIR R4 JSON Bundle Explorer */}
      {selectedTab === 'fhir' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-teal-600" />
                Longitudinal FHIR R4 Clinical Bundle
              </h3>
              <p className="text-xs text-slate-500">Standardized interoperable health document structure</p>
            </div>
            <span className="text-xs font-mono bg-teal-50 text-teal-800 px-2.5 py-1 rounded-md font-bold">
              Profile: NRCeS / NDHM Bundle
            </span>
          </div>

          <pre className="p-4 bg-slate-900 text-slate-200 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-[480px] leading-relaxed">
            {JSON.stringify(fhirBundle, null, 2)}
          </pre>
        </div>
      )}

      {/* Tab 3: DPDP Consents */}
      {selectedTab === 'consents' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-600" />
                Active Consent Artifacts (DPDP Act 2023)
              </h3>
              <p className="text-xs text-slate-500">You hold complete data sovereignty. Revoke physician access anytime.</p>
            </div>
          </div>

          <div className="space-y-3">
            {consents.map(c => (
              <div key={c.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{c.requesterName}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      c.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {c.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">Purpose: {c.purpose}</div>
                  <div className="text-[10px] text-slate-400">Valid until: {c.expiryDate}</div>
                </div>

                {c.status === 'active' && (
                  <button
                    onClick={() => handleRevokeConsent(c.id)}
                    className="bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Revoke Access</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
