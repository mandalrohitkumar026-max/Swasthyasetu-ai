import React, { useState } from 'react';
import { PageId } from '../types/navigation';
import { 
  Sparkles, 
  Mic, 
  MicOff, 
  Send, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Stethoscope, 
  HeartPulse, 
  Volume2, 
  ShieldAlert, 
  ArrowRight,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { TriageResult } from '../types';

interface AiAssistantPageProps {
  onNavigate: (page: PageId) => void;
  selectedLanguage: string;
}

export const AiAssistantPage: React.FC<AiAssistantPageProps> = ({
  onNavigate,
  selectedLanguage,
}) => {
  const [symptomsInput, setSymptomsInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);

  // Vitals State
  const [bp, setBp] = useState('138/88');
  const [pulse, setPulse] = useState(80);
  const [spo2, setSpo2] = useState(98);
  const [temp, setTemp] = useState('98.6');

  const samplePrompts = [
    {
      title: "Diabetes Symptoms (Rural Hindi)",
      text: "मुझे पिछले एक हफ्ते से बहुत ज्यादा प्यास लग रही है, बार-बार पेशाब जाना पड़ रहा है और खड़े होने पर चक्कर आते हैं।",
      badge: "Chronic: Hyperglycemia"
    },
    {
      title: "Emergency Chest Pain (Cardiac Red Flag)",
      text: "सीने में तेज दबाव और दर्द हो रहा है जो बाएं हाथ की तरफ जा रहा है और सांस लेने में बहुत भारीपन महसूस हो रहा है।",
      badge: "Emergency 108 Alert"
    },
    {
      title: "Persistent Cough & Fever (Hinglish)",
      text: "Continuous dry cough, low-grade evening fever, and throat irritation for 5 days. SpO2 is 98%.",
      badge: "Routine: URTI"
    },
    {
      title: "Migraine & Screen Fatigue (Urban)",
      text: "Severe throbbing headache on right forehead, light sensitivity, and nausea after 12 hours of screen work.",
      badge: "Neurological"
    }
  ];

  const handleToggleVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition is not supported in this browser. Please use Chrome/Edge or type your symptoms.");
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

    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSymptomsInput(prev => (prev ? `${prev} ${transcript}` : transcript));
      setIsRecording(false);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognition.start();
  };

  const [followUpQuestions, setFollowUpQuestions] = useState<any[]>([]);
  const [aiConfidence, setAiConfidence] = useState<{ score: number; level: string; pathway?: string } | null>(null);

  const handleAssess = async (textToAssess?: string) => {
    const text = textToAssess || symptomsInput;
    if (!text.trim()) return;

    setIsLoading(true);
    setFollowUpQuestions([]);
    try {
      // 1. Query Python FastAPI AI service
      let aiResult: any = null;
      try {
        aiResult = await api.ai.triageSymptoms({
          symptoms_text: text,
          language: selectedLanguage,
          patient_age: 48,
          duration_days: 2,
        });
      } catch (aiErr) {
        console.warn("Direct FastAPI call failed, falling back to Node backend", aiErr);
      }

      if (aiResult && aiResult.provisional_triage_category) {
        setAiConfidence({
          score: aiResult.confidence_score,
          level: aiResult.confidence_level,
          pathway: aiResult.recommended_care_pathway
        });
        if (aiResult.follow_up_questions && aiResult.follow_up_questions.length > 0) {
          setFollowUpQuestions(aiResult.follow_up_questions);
        }

        setTriageResult({
          triagePriority: aiResult.is_emergency ? 'emergency' : aiResult.provisional_triage_category?.includes('Urgent') ? 'urgent' : 'routine',
          isEmergency: aiResult.is_emergency,
          alertTitle: aiResult.is_emergency ? 'EMERGENCY RED FLAG IDENTIFIED (108)' : undefined,
          alertMessage: aiResult.emergency_warning || undefined,
          emergencyHotline: '108',
          immediateActionSteps: aiResult.is_emergency ? [aiResult.emergency_warning] : aiResult.educational_health_guidance,
          provisionalCondition: aiResult.identified_symptoms?.join(', ') || 'Clinical Evaluation',
          icd10Code: aiResult.is_emergency ? 'I21.9' : 'R05',
          specialistRecommended: aiResult.suggested_specialist,
          suggestedInvestigations: aiResult.home_comfort_measures,
          clinicalSummary: aiResult.recommended_care_pathway,
          vernacularAdvice: aiResult.clinical_safety_notice,
          estimatedWaitTimeMinutes: 5,
        });
      } else {
        const result = await api.assessTriage({
          symptomsText: text,
          language: selectedLanguage,
          patientName: 'Ramesh Kumar',
          patientAge: 48,
          patientGender: 'Male',
          vitals: {
            bp: `${bp} mmHg`,
            pulse,
            spo2,
            temperature: `${temp} °F`
          }
        });
        setTriageResult(result);
      }
    } catch (err) {
      console.error("Triage failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-sky-800 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 bg-teal-500/20 border border-teal-400/30 px-3 py-1 rounded-full text-teal-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Indic Conversational Clinical Triage</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            AI Health Assistant & Triage Engine
          </h1>

          <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
            Speak in your regional language or type your symptoms. Our AI conducts structured clinical intake, checks for emergency red flags, suggests differential impressions, and connects you to certified doctors.
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
            <span className="bg-white/10 px-2.5 py-1 rounded-lg">Language: <strong className="text-white uppercase">{selectedLanguage}</strong></span>
            <span className="bg-white/10 px-2.5 py-1 rounded-lg">Failsafe: <strong className="text-emerald-300">108 Emergency Trigger Active</strong></span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input Box & Vitals (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-teal-600" />
                Describe Your Health Concern / लक्षण बताएं
              </label>
              <span className="text-[11px] text-slate-500 font-medium">
                Tap microphone to speak
              </span>
            </div>

            <div className="relative">
              <textarea
                rows={4}
                value={symptomsInput}
                onChange={(e) => setSymptomsInput(e.target.value)}
                placeholder="Type or tap 'Speak' to describe symptoms (e.g., 'I have fever and throat pain since 3 days' or 'मुझे बहुत प्यास लग रही है और चक्कर आते हैं')..."
                className="w-full text-xs sm:text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none transition-all"
              />

              {isRecording && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-rose-600 text-white text-[11px] px-2.5 py-1 rounded-full animate-pulse shadow-sm font-bold">
                  <span className="w-2 h-2 rounded-full bg-white"></span>
                  Listening...
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={handleToggleVoice}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isRecording
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200'
                }`}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-teal-600" />}
                <span>{isRecording ? 'Stop Voice Recording' : 'Speak (बोलें)'}</span>
              </button>

              <button
                type="button"
                disabled={isLoading || !symptomsInput.trim()}
                onClick={() => handleAssess()}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Run Clinical Triage</span>
              </button>
            </div>

            {/* Quick Sample Prompts */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                Try Clinical Sample Vignettes:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {samplePrompts.map((p, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSymptomsInput(p.text);
                      handleAssess(p.text);
                    }}
                    className="p-3 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-teal-50 hover:border-teal-300 cursor-pointer transition-all text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{p.title}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        p.badge.includes('Emergency') ? 'bg-rose-100 text-rose-700' : 'bg-teal-100 text-teal-800'
                      }`}>
                        {p.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{p.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Vitals Telemetry Inputs */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <HeartPulse className="w-4 h-4 text-rose-500" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Patient Vitals (Optional)</h3>
              </div>
              <span className="text-[10px] text-slate-400">Captured at Kiosk or Home</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Blood Pressure</span>
                <input
                  type="text"
                  value={bp}
                  onChange={(e) => setBp(e.target.value)}
                  className="mt-1 font-bold text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-2 py-1 w-full"
                />
                <span className="text-[9px] text-slate-400">mmHg</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Pulse Rate</span>
                <input
                  type="number"
                  value={pulse}
                  onChange={(e) => setPulse(Number(e.target.value))}
                  className="mt-1 font-bold text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-2 py-1 w-full"
                />
                <span className="text-[9px] text-slate-400">bpm</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Oxygen (SpO2)</span>
                <input
                  type="number"
                  value={spo2}
                  onChange={(e) => setSpo2(Number(e.target.value))}
                  className="mt-1 font-bold text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-2 py-1 w-full"
                />
                <span className="text-[9px] text-slate-400">%</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Temperature</span>
                <input
                  type="text"
                  value={temp}
                  onChange={(e) => setTemp(e.target.value)}
                  className="mt-1 font-bold text-xs text-slate-800 bg-white border border-slate-300 rounded-lg px-2 py-1 w-full"
                />
                <span className="text-[9px] text-slate-400">°F</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: AI Triage Output & Next Steps (5 cols) */}
        <div className="lg:col-span-5">
          {triageResult ? (
            <div className="space-y-6">
              
              {/* Emergency Banner */}
              {triageResult.isEmergency ? (
                <div className="bg-rose-50 border-2 border-rose-500 rounded-3xl p-6 text-rose-900 shadow-xl space-y-4 animate-pulse">
                  <div className="flex items-center space-x-3">
                    <ShieldAlert className="w-8 h-8 text-rose-600 shrink-0" />
                    <div>
                      <h3 className="font-black text-base text-rose-700">{triageResult.alertTitle}</h3>
                      <p className="text-[11px] text-rose-600 font-semibold">Immediate Emergency Protocol Activated</p>
                    </div>
                  </div>

                  <p className="text-xs font-semibold bg-white p-3.5 rounded-2xl border border-rose-200 leading-relaxed">
                    {triageResult.alertMessage}
                  </p>

                  <div className="bg-rose-600 text-white rounded-2xl p-4 text-center space-y-1">
                    <span className="text-[10px] uppercase font-bold text-rose-200">National Emergency Dispatch</span>
                    <div className="text-3xl font-black">{triageResult.emergencyHotline}</div>
                  </div>

                  <div className="text-xs space-y-1.5 pt-1">
                    <span className="font-bold text-rose-800 block">Immediate Patient Guidance:</span>
                    {triageResult.immediateActionSteps?.map((s, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Routine / Urgent Assessment Card */
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-md space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-teal-600" />
                      <h3 className="font-bold text-slate-900 text-sm">AI Triage Working Summary</h3>
                    </div>
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase ${
                      triageResult.triagePriority === 'urgent' ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'
                    }`}>
                      {triageResult.triagePriority} Priority
                    </span>
                  </div>

                  {/* Impression */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Provisional Clinical Impression</div>
                    <div className="font-extrabold text-sm text-slate-900">{triageResult.provisionalCondition}</div>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="bg-slate-200 text-slate-700 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                        ICD-10: {triageResult.icd10Code}
                      </span>
                      <span className="text-xs text-slate-600">
                        Recommended: <strong>{triageResult.specialistRecommended}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Confidence & Pathway Badge */}
                  {aiConfidence && (
                    <div className="flex items-center justify-between bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-xl text-xs text-teal-800">
                      <span className="font-bold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                        AI Confidence: {(aiConfidence.score * 100).toFixed(0)}% ({aiConfidence.level})
                      </span>
                      <span className="text-[10px] text-teal-700 bg-teal-100 font-semibold px-2 py-0.5 rounded">
                        {aiConfidence.pathway}
                      </span>
                    </div>
                  )}

                  {/* Clinical Follow-up Questions */}
                  {followUpQuestions && followUpQuestions.length > 0 && (
                    <div className="space-y-2 p-3 bg-amber-50/70 border border-amber-200 rounded-2xl">
                      <span className="text-[11px] font-black text-amber-900 block uppercase tracking-wide">
                        Clinical Clarification Questions:
                      </span>
                      <div className="space-y-2">
                        {followUpQuestions.map((fq, idx) => (
                          <div key={idx} className="bg-white p-2.5 rounded-xl border border-amber-200/60 shadow-xs space-y-1">
                            <p className="text-xs font-bold text-slate-800">{idx + 1}. {fq.question}</p>
                            <div className="flex flex-wrap gap-1">
                              {fq.options?.map((opt: string, optIdx: number) => (
                                <button
                                  key={optIdx}
                                  type="button"
                                  onClick={() => handleAssess(`${symptomsInput} (Clarification: ${opt})`)}
                                  className="text-[10px] bg-slate-100 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 border border-slate-200 px-2 py-0.5 rounded cursor-pointer transition-colors"
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                            <span className="text-[9px] text-slate-400 block italic">Rationale: {fq.clinical_rationale}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {triageResult.vernacularAdvice && (
                    <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-teal-900 font-medium leading-relaxed">
                      {triageResult.vernacularAdvice}
                    </div>
                  )}

                  {/* Suggested Tests */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 uppercase block mb-1.5">
                      Suggested Investigations:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {triageResult.suggestedInvestigations?.map((inv, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-lg border border-slate-200">
                          {inv}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Teleconsultation Bridge */}
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-teal-600" />
                        Wait: ~{triageResult.estimatedWaitTimeMinutes} mins
                      </span>
                      <span className="text-teal-700 font-bold">Dr. Arvind Rao (Online)</span>
                    </div>

                    <button
                      onClick={() => onNavigate('book-appointment')}
                      className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-teal-600/20 cursor-pointer"
                    >
                      <Stethoscope className="w-4 h-4" />
                      <span>Proceed to Book Teleconsultation</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="h-full min-h-[350px] bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-700 text-sm">Awaiting Symptom Intake</h3>
              <p className="text-xs text-slate-500 max-w-xs">
                Speak or select a clinical vignette on the left to trigger the clinical reasoning pipeline and differential diagnosis.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Statutory Clinical Safety & Emergency Advisory Banner */}
      <div className="mt-8 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-amber-900">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Clinical Safety Notice & DPDP Compliance: </span>
            SwasthyaSetu AI provides algorithmic pre-consultation triage and health education. It does NOT constitute a definitive medical diagnosis or prescription. In life-threatening emergencies (acute cardiac distress, stroke, severe trauma), dial <strong className="text-rose-700 font-bold underline">108</strong> immediately for National Emergency Medical Services.
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-white text-amber-800 font-semibold border border-amber-200 text-[11px]">
            CDSCO / ABDM Compliant
          </span>
        </div>
      </div>

    </div>
  );
};
