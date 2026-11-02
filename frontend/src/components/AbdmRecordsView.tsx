import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  QrCode, 
  FileCode2, 
  Lock, 
  UserCheck, 
  Download, 
  CheckCircle2, 
  Sparkles,
  AlertCircle,
  Eye,
  Trash2
} from 'lucide-react';
import { UserProfile } from '../types';
import { api } from '../services/api';

interface AbdmRecordsViewProps {
  currentUser: UserProfile | null;
}

export const AbdmRecordsView: React.FC<AbdmRecordsViewProps> = ({ currentUser }) => {
  const [abhaNumber, setAbhaNumber] = useState(currentUser?.abhaNumber || '91-4521-8890-1234');
  const [abhaAddress, setAbhaAddress] = useState(currentUser?.abhaAddress || 'ramesh.sitapur@abdm');
  const [phoneInput, setPhoneInput] = useState('9876543210');
  const [nameInput, setNameInput] = useState('Ramesh Kumar');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSuccess, setGenerationSuccess] = useState(false);

  // FHIR R4 State
  const [fhirBundle, setFhirBundle] = useState<any | null>(null);
  const [selectedFhirTab, setSelectedFhirTab] = useState<'all' | 'condition' | 'medication'>('all');
  const [consents, setConsents] = useState<any[]>([]);

  useEffect(() => {
    loadFhirAndConsents();
  }, []);

  const loadFhirAndConsents = async () => {
    try {
      const [bundle, cons] = await Promise.all([
        api.getFhirBundle(currentUser?.id || 'usr-pat-01'),
        api.getConsents()
      ]);
      setFhirBundle(bundle);
      setConsents(cons);
    } catch (err) {
      console.error("Failed to load FHIR bundle", err);
    }
  };

  const handleGenerateAbha = async () => {
    setIsGenerating(true);
    try {
      const res = await api.generateAbha(phoneInput, nameInput);
      setAbhaNumber(res.abhaNumber);
      setAbhaAddress(res.abhaAddress);
      setGenerationSuccess(true);
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
      console.error("Consent revocation failed", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-blue-500/20 border border-blue-400/30 px-3 py-1 rounded-full text-blue-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ayushman Bharat Digital Mission (ABDM) Gateway</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Digital Health Records & ABHA Identity (FHIR R4)
          </h1>
          <p className="mt-2 text-slate-300 text-xs sm:text-sm leading-relaxed">
            Patient-centric, interoperable health records under the National Digital Health Ecosystem. Full adherence to the Digital Personal Data Protection (DPDP) Act 2023 with cryptographic consent management.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Official ABHA Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card Component */}
          <div className="bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 shadow-2xl border border-slate-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

            {/* Header of Card */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center font-black text-white text-xs shadow-md">
                  NDHM
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white tracking-tight">ABHA Health Card</h3>
                  <p className="text-[10px] text-slate-400">National Health Authority • Govt. of India</p>
                </div>
              </div>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Active
              </span>
            </div>

            {/* Body */}
            <div className="py-6 flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-white p-1.5 shrink-0 shadow-md flex items-center justify-center">
                <QrCode className="w-full h-full text-slate-900" />
              </div>

              <div className="space-y-1">
                <div className="text-sm font-extrabold text-white">{nameInput}</div>
                <div className="text-[11px] text-slate-300 font-medium">DOB: 12-04-1978 • Male</div>
                <div className="text-[11px] text-slate-300">Sitapur, Uttar Pradesh</div>
                <div className="text-xs font-mono font-bold text-amber-300 pt-1">
                  ABHA ID: {abhaNumber}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-mono text-emerald-300">{abhaAddress}</span>
              <button 
                onClick={() => alert("ABHA ID Card downloaded as PDF")}
                className="flex items-center gap-1 text-slate-200 hover:text-white font-bold cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* Quick ABHA Generator Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Generate New 14-Digit ABHA ID (Aadhaar / Mobile)
            </h4>

            <div className="space-y-2">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Full Name as on Aadhaar"
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
              />
              <input
                type="text"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="Mobile Number (linked to Aadhaar)"
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
              />
            </div>

            <button
              onClick={handleGenerateAbha}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-xl shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              {isGenerating ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <ShieldCheck className="w-3.5 h-3.5" />
              )}
              <span>Create ABHA & Link Health Locker</span>
            </button>

            {generationSuccess && (
              <div className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>ABHA generated and synchronized with ABDM gateway!</span>
              </div>
            )}
          </div>

          {/* DPDP Act Consent Management */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-600" />
                Active Consent Artifacts (DPDP Act)
              </h4>
              <span className="text-[10px] text-slate-500 font-semibold">Patient Sovereignty</span>
            </div>

            <div className="space-y-2">
              {consents.map(c => (
                <div key={c.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{c.requesterName}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      c.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {c.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">{c.purpose}</div>
                  <div className="text-[10px] text-slate-400">Valid until: {c.expiryDate}</div>
                  
                  {c.status === 'active' && (
                    <button
                      onClick={() => handleRevokeConsent(c.id)}
                      className="mt-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Revoke Doctor Access</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: FHIR R4 JSON Bundle Explorer (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <FileCode2 className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">FHIR R4 Longitudinal Clinical Record</h3>
                  <p className="text-[11px] text-slate-500">Standardized Interoperable Health Document Bundle</p>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setSelectedFhirTab('all')}
                  className={`px-3 py-1 rounded-lg ${selectedFhirTab === 'all' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'}`}
                >
                  Raw FHIR JSON
                </button>
                <button
                  onClick={() => setSelectedFhirTab('condition')}
                  className={`px-3 py-1 rounded-lg ${selectedFhirTab === 'condition' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'}`}
                >
                  Conditions
                </button>
                <button
                  onClick={() => setSelectedFhirTab('medication')}
                  className={`px-3 py-1 rounded-lg ${selectedFhirTab === 'medication' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'}`}
                >
                  Medications
                </button>
              </div>
            </div>

            {/* Content Display */}
            {selectedFhirTab === 'all' ? (
              <div className="mt-4">
                <pre className="p-4 bg-slate-900 text-slate-200 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-[500px] leading-relaxed">
                  {JSON.stringify(fhirBundle, null, 2)}
                </pre>
              </div>
            ) : selectedFhirTab === 'condition' ? (
              <div className="mt-4 space-y-3">
                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-indigo-900">Type 2 Diabetes Mellitus</span>
                    <span className="bg-indigo-200 text-indigo-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                      ICD-10: E11.9
                    </span>
                  </div>
                  <p className="text-xs text-indigo-800">
                    Active clinical condition diagnosed during teleconsultation. Recorded in FHIR Condition resource structure.
                  </p>
                  <div className="text-[10px] text-indigo-600 font-mono">
                    Subject: urn:uuid:patient-01 | Practitioner: Dr. Arvind Rao
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-emerald-900">
                      Metformin 500mg + Glimepiride 2mg
                    </span>
                    <span className="bg-emerald-200 text-emerald-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                      PMBJP-DIAB-022
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800">
                    Dosage: 1 tablet daily before breakfast x 30 days. Bioequivalent generic substitute.
                  </p>
                  <div className="text-[10px] text-emerald-700 font-mono">
                    Status: Active | Intent: Order | Resource: MedicationRequest
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
