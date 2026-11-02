import React, { useState } from 'react';
import { 
  Mic, 
  MicOff, 
  Send, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Stethoscope, 
  HeartPulse, 
  Volume2, 
  Sparkles,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { TriageResult, UserProfile } from '../types';
import { api } from '../services/api';

interface PatientTriageViewProps {
  currentUser: UserProfile | null;
  selectedLanguage: string;
  onAppointmentBooked: (triageData: any) => void;
}

export const PatientTriageView: React.FC<PatientTriageViewProps> = ({
  currentUser,
  selectedLanguage,
  onAppointmentBooked,
}) => {
  const [symptomsInput, setSymptomsInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  
  // Vitals State (Often captured by ASHA worker or patient)
  const [bp, setBp] = useState('140/90');
  const [pulse, setPulse] = useState(82);
  const [spo2, setSpo2] = useState(98);
  const [temperature, setTemperature] = useState('98.6');

  // Quick preset voice prompts simulating rural & urban Indian patients
  const samplePrompts = [
    {
      title: "Hyperglycemia & Dehydration (Hindi)",
      text: "मुझे पिछले एक हफ्ते से बहुत ज्यादा प्यास लग रही है, बार-बार पेशाब जाना पड़ रहा है और खड़े होने पर चक्कर आते हैं।",
      badge: "Rural Case: Diabetes"
    },
    {
      title: "Chest Pain Red Flag (Emergency)",
      text: "सीने में तेज दर्द हो रहा है जो बाएं हाथ की तरफ जा रहा है और सांस लेने में बहुत भारीपन महसूस हो रहा है।",
      badge: "Emergency Failsafe"
    },
    {
      title: "Productive Cough & Fever (English/Hinglish)",
      text: "Experiencing continuous dry cough, mild evening fever and throat pain since 4 days. SpO2 is normal.",
      badge: "Routine URTI"
    },
    {
      title: "Migraine & Acidity (Urban)",
      text: "Severe pulsating headache on right temple with nausea and hyperacidity after working on laptop for 10 hours.",
      badge: "Urban Lifestyle"
    }
  ];

  // Web Speech API Voice Recognition
  const handleToggleVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition is not supported in this browser. Please use Chrome/Edge or type directly.");
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = selectedLanguage === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSymptomsInput(prev => (prev ? `${prev} ${transcript}` : transcript));
      setIsRecording(false);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const handleAssess = async (textToAssess?: string) => {
    const text = textToAssess || symptomsInput;
    if (!text.trim()) return;

    setIsLoading(true);
    try {
      const result = await api.assessTriage({
        symptomsText: text,
        language: selectedLanguage,
        patientName: currentUser?.name || 'Ramesh Kumar',
        patientAge: 48,
        patientGender: 'Male',
        vitals: {
          bp: `${bp} mmHg`,
          pulse,
          spo2,
          temperature: `${temperature} °F`
        }
      });
      setTriageResult(result);
    } catch (err) {
      console.error("Triage assessment failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQueueConsultation = async () => {
    if (!triageResult) return;

    const appointmentPayload = {
      patientName: currentUser?.name || 'Ramesh Kumar',
      patientAge: 48,
      patientGender: 'Male',
      triagePriority: triageResult.triagePriority,
      chiefComplaints: [symptomsInput || "Triage assessed condition"],
      aiClinicalSummary: triageResult.clinicalSummary,
      consultationMode: 'video' as const,
      vitals: {
        bp: `${bp} mmHg`,
        pulse,
        spo2,
        temperature: `${temperature} °F`
      }
    };

    try {
      const created = await api.createAppointment(appointmentPayload);
      onAppointmentBooked(created);
    } catch (err) {
      console.error("Failed to queue consultation", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="mb-8 bg-gradient-to-r from-emerald-900 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-10 pointer-events-none">
          <HeartPulse className="w-96 h-96 text-white" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 rounded-full text-emerald-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Indic Multilingual Voice Triage Engine</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {selectedLanguage === 'hi' ? 'अपनी भाषा में स्वास्थ्य समस्या बताएं' : 'Speak or Type Your Health Symptoms'}
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed">
            Our clinical AI listens in Indian vernacular dialects, instantly screens for emergency red flags, generates structured doctor briefs, and maps affordable generic medicines.
          </p>

          {/* Patient Profile Chip */}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-300">
            <span className="bg-white/10 px-3 py-1 rounded-lg backdrop-blur-xs">
              Patient: <strong className="text-white">{currentUser?.name}</strong> (48y, Male)
            </span>
            <span className="bg-white/10 px-3 py-1 rounded-lg backdrop-blur-xs">
              Location: <strong className="text-white">{currentUser?.district}, {currentUser?.state}</strong>
            </span>
            <span className="bg-emerald-500/30 text-emerald-200 px-3 py-1 rounded-lg font-mono">
              ABHA: {currentUser?.abhaAddress}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Voice/Text Intake & Vitals */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Symptom Intake Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-600" />
                Describe Your Symptoms / लक्षण बताएं
              </label>
              <span className="text-xs text-slate-500">
                Language: <strong className="text-emerald-700 uppercase">{selectedLanguage}</strong>
              </span>
            </div>

            <div className="relative">
              <textarea
                value={symptomsInput}
                onChange={(e) => setSymptomsInput(e.target.value)}
                placeholder={selectedLanguage === 'hi' 
                  ? "यहाँ टाइप करें या माइक दबाकर बोलें... उदाहरण: 'मुझे बहुत ज्यादा प्यास लग रही है और चक्कर आ रहे हैं'" 
                  : "Type your symptoms or tap the microphone to speak in English/Hindi..."}
                rows={4}
                className="w-full text-slate-800 placeholder-slate-400 bg-slate-50 border border-slate-300 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all resize-none"
              />

              {/* Voice recording pulsating indicator */}
              {isRecording && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-rose-500 text-white text-xs px-2.5 py-1 rounded-full animate-pulse shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-white"></span>
                  Listening in {selectedLanguage.toUpperCase()}...
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleToggleVoice}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isRecording 
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30' 
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-600" />}
                <span>{isRecording ? 'Stop Recording' : 'Speak (बोलकर बताएं)'}</span>
              </button>

              <button
                type="button"
                disabled={isLoading || !symptomsInput.trim()}
                onClick={() => handleAssess()}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Run AI Clinical Triage</span>
              </button>
            </div>

            {/* Quick Prompts Carousel / Pills */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2.5">
                Try Clinical Sample Scenarios:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {samplePrompts.map((p, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSymptomsInput(p.text);
                      handleAssess(p.text);
                    }}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-emerald-50 hover:border-emerald-300 cursor-pointer transition-all text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{p.title}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        p.badge.includes('Emergency') 
                          ? 'bg-rose-100 text-rose-700' 
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {p.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-1">{p.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Vitals Telemetry Box (Kiosk / ASHA / Bluetooth Sync) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <HeartPulse className="w-4 h-4 text-rose-500" />
                <h3 className="text-sm font-bold text-slate-800">Field Vitals (Kiosk / ASHA Telemetry)</h3>
              </div>
              <span className="text-[11px] bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-md">
                Bluetooth / Manual
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="text-[10px] font-bold text-slate-500 block uppercase">Blood Pressure</label>
                <input
                  type="text"
                  value={bp}
                  onChange={(e) => setBp(e.target.value)}
                  className="mt-1 font-bold text-slate-800 bg-white border border-slate-300 rounded px-2 py-1 text-xs w-full"
                />
                <span className="text-[10px] text-slate-400">mmHg</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="text-[10px] font-bold text-slate-500 block uppercase">Pulse Rate</label>
                <input
                  type="number"
                  value={pulse}
                  onChange={(e) => setPulse(Number(e.target.value))}
                  className="mt-1 font-bold text-slate-800 bg-white border border-slate-300 rounded px-2 py-1 text-xs w-full"
                />
                <span className="text-[10px] text-slate-400">bpm</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="text-[10px] font-bold text-slate-500 block uppercase">Oxygen (SpO2)</label>
                <input
                  type="number"
                  value={spo2}
                  onChange={(e) => setSpo2(Number(e.target.value))}
                  className="mt-1 font-bold text-slate-800 bg-white border border-slate-300 rounded px-2 py-1 text-xs w-full"
                />
                <span className="text-[10px] text-slate-400">%</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="text-[10px] font-bold text-slate-500 block uppercase">Temperature</label>
                <input
                  type="text"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="mt-1 font-bold text-slate-800 bg-white border border-slate-300 rounded px-2 py-1 text-xs w-full"
                />
                <span className="text-[10px] text-slate-400">°F</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: AI Triage Assessment Output */}
        <div className="lg:col-span-5">
          {triageResult ? (
            <div className="space-y-6">
              
              {/* Emergency Banner if Red Flag */}
              {triageResult.isEmergency ? (
                <div className="bg-rose-50 border-2 border-rose-500 rounded-2xl p-6 text-rose-900 shadow-lg animate-pulse">
                  <div className="flex items-center space-x-3 mb-3">
                    <ShieldAlert className="w-7 h-7 text-rose-600" />
                    <div>
                      <h3 className="font-extrabold text-lg text-rose-700">{triageResult.alertTitle}</h3>
                      <p className="text-xs text-rose-600 font-medium">Life-Threatening Emergency Protocol Triggered</p>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm font-semibold mb-4 bg-white/70 p-3 rounded-xl border border-rose-200">
                    {triageResult.alertMessage}
                  </p>

                  <div className="bg-rose-600 text-white rounded-xl p-4 mb-4 text-center">
                    <span className="text-xs uppercase tracking-wider block font-bold text-rose-200">National Emergency Dispatch</span>
                    <span className="text-3xl font-black tracking-tight">{triageResult.emergencyHotline}</span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <span className="font-bold text-rose-800 block">Immediate Actions:</span>
                    {triageResult.immediateActionSteps?.map((step, sIdx) => (
                      <div key={sIdx} className="flex items-start gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Routine / Urgent Triage Brief */
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-md">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 text-emerald-600" />
                      <h3 className="font-bold text-slate-900">AI Clinical Triage Summary</h3>
                    </div>
                    <span className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase ${
                      triageResult.triagePriority === 'urgent'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {triageResult.triagePriority} Priority
                    </span>
                  </div>

                  {/* Diagnosis & ICD-10 */}
                  <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="text-xs text-slate-500 font-semibold uppercase">Working Impression</div>
                    <div className="text-base font-bold text-slate-800">{triageResult.provisionalCondition}</div>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="bg-slate-200 text-slate-700 text-[11px] font-mono font-semibold px-2 py-0.5 rounded">
                        ICD-10: {triageResult.icd10Code}
                      </span>
                      <span className="text-xs text-slate-600">
                        Assigned: <strong>{triageResult.specialistRecommended}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Vernacular Advice */}
                  {triageResult.vernacularAdvice && (
                    <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium">
                      {triageResult.vernacularAdvice}
                    </div>
                  )}

                  {/* Suggested Investigations */}
                  <div className="mt-4">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-2">
                      Recommended Investigations:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {triageResult.suggestedInvestigations?.map((inv, iIdx) => (
                        <span key={iIdx} className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-lg border border-slate-200">
                          {inv}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Estimated Wait & Action Button */}
                  <div className="mt-6 pt-5 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        Queue Wait: ~{triageResult.estimatedWaitTimeMinutes} mins
                      </span>
                      <span className="text-emerald-700 font-semibold">Doctor Arvind Rao (Online)</span>
                    </div>

                    <button
                      onClick={handleQueueConsultation}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                    >
                      <Stethoscope className="w-4 h-4" />
                      <span>Connect to Doctor Consultation</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          ) : (
            /* Blank state waiting for input */
            <div className="h-full min-h-[380px] bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-700 text-base">Awaiting Symptom Intake</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1.5">
                Speak or select one of the clinical sample scenarios on the left to activate algorithmic differential diagnosis and red flag checks.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
