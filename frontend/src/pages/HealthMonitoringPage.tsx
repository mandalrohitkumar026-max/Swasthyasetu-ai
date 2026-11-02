import React, { useState } from 'react';
import { PageId } from '../types/navigation';
import { 
  HeartPulse, 
  Activity, 
  TrendingUp, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Bluetooth, 
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Brain,
  Stethoscope,
  ChevronRight,
  X
} from 'lucide-react';
import { useHealth } from '../context/HealthContext';
import { HealthMetricCard } from '../components/shared/HealthMetricCard';
import { GlucoseTrendChart, BloodPressureChart } from '../components/charts/VitalsCharts';
import { api } from '../services/api';

interface HealthMonitoringPageProps {
  onNavigate: (page: PageId) => void;
}

export const HealthMonitoringPage: React.FC<HealthMonitoringPageProps> = ({ onNavigate }) => {
  const { vitalsHistory, logVitals } = useHealth();

  const [systolic, setSystolic] = useState('138');
  const [diastolic, setDiastolic] = useState('88');
  const [bloodSugar, setBloodSugar] = useState('210');
  const [spo2, setSpo2] = useState('98');
  const [pulse, setPulse] = useState('80');
  const [temperature, setTemperature] = useState('98.6');
  const [logSuccess, setLogSuccess] = useState(false);
  const [activeChartTab, setActiveChartTab] = useState<'glucose' | 'bp'>('glucose');

  // AI Feature States
  const [aiInsights, setAiInsights] = useState<any | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [riskAssessmentType, setRiskAssessmentType] = useState<'diabetes' | 'cvd'>('diabetes');
  const [riskResult, setRiskResult] = useState<any | null>(null);
  const [isCalculatingRisk, setIsCalculatingRisk] = useState(false);

  // Risk Inputs
  const [age, setAge] = useState(52);
  const [waist, setWaist] = useState(94);
  const [gender, setGender] = useState('male');
  const [physicalActivity, setPhysicalActivity] = useState('sedentary');
  const [familyHistory, setFamilyHistory] = useState('one_parent');
  const [isSmoker, setIsSmoker] = useState(false);
  const [hasDiabetes, setHasDiabetes] = useState(true);

  const handleRunAiAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const metricData: any[] = vitalsHistory.map(v => ({
        timestamp: v.date || v.timestamp,
        metric_type: 'blood_glucose',
        value: v.bloodGlucose,
        systolic: v.systolic,
        diastolic: v.diastolic
      }));
      // Add BP metric points
      vitalsHistory.forEach(v => {
        metricData.push({
          timestamp: v.date || v.timestamp,
          metric_type: 'blood_pressure',
          value: `${v.systolic}/${v.diastolic}`,
          systolic: v.systolic,
          diastolic: v.diastolic
        });
      });

      const res = await api.ai.analyzePreventiveMetrics(metricData, 'en');
      setAiInsights(res);
    } catch (err) {
      console.warn("AI analysis fallback", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCalculateRisk = async () => {
    setIsCalculatingRisk(true);
    try {
      if (riskAssessmentType === 'diabetes') {
        const res = await api.ai.assessDiabetesRisk({
          age,
          waist_circumference_cm: waist,
          gender,
          physical_activity_level: physicalActivity,
          family_history_diabetes: familyHistory
        });
        setRiskResult(res);
      } else {
        const res = await api.ai.assessCvdRisk({
          age,
          gender,
          systolic_bp: Number(systolic) || 140,
          is_smoker: isSmoker,
          has_diabetes: hasDiabetes
        });
        setRiskResult(res);
      }
    } catch (err) {
      console.warn("Risk calculation error", err);
    } finally {
      setIsCalculatingRisk(false);
    }
  };

  const latest = vitalsHistory[0] || {
    systolic: 138,
    diastolic: 88,
    bloodGlucose: 210,
    pulse: 80,
    spo2: 98,
    temperature: 98.6
  };

  const handleLogReading = (e: React.FormEvent) => {
    e.preventDefault();
    const glucoseNum = Number(bloodSugar);
    const statusVal = glucoseNum > 220 ? 'high' : glucoseNum > 140 ? 'elevated' : 'normal';

    logVitals({
      timestamp: 'Just now',
      date: 'Today',
      systolic: Number(systolic),
      diastolic: Number(diastolic),
      bloodGlucose: glucoseNum,
      pulse: Number(pulse),
      spo2: Number(spo2),
      temperature: Number(temperature),
      status: statusVal
    });

    setLogSuccess(true);
    setTimeout(() => setLogSuccess(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-sky-800 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-wrap items-center justify-between gap-6">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-semibold px-3 py-1 rounded-full">
            <HeartPulse className="w-3.5 h-3.5" />
            <span>Continuous Vitals & Chronic Care Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Remote Patient Health Monitoring
          </h1>
          <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
            Track daily blood glucose, blood pressure, and pulse oximetry. Recharts telemetry visualizes your 7-day recovery trends with automated physician threshold warnings.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-end gap-2.5">
          <button
            type="button"
            onClick={handleRunAiAnalysis}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-teal-800 font-bold px-3.5 py-2 rounded-2xl text-xs shadow-md cursor-pointer transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>{isAnalyzing ? "Analyzing Telemetry..." : "AI Preventive Trend Analysis"}</span>
          </button>
          <button
            type="button"
            onClick={() => { setShowRiskModal(true); setRiskResult(null); }}
            className="flex items-center gap-1.5 bg-teal-500 hover:bg-teal-600 text-white font-bold px-3.5 py-2 rounded-2xl text-xs shadow-md cursor-pointer transition-all"
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Clinical Risk Assessment</span>
          </button>
        </div>
      </div>

      {/* AI Preventive Insights Panel */}
      {aiInsights && (
        <div className="bg-gradient-to-br from-teal-50 via-sky-50 to-white rounded-3xl border border-teal-200 p-6 shadow-md space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-teal-200/60">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-600" />
              <h3 className="font-black text-slate-900 text-sm">
                AI Longitudinal Preventive Health Insights
              </h3>
            </div>
            <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-full">
              Confidence: {(aiInsights.confidence_score * 100).toFixed(0)}% ({aiInsights.confidence_level})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiInsights.insights?.map((ins: any, idx: number) => (
              <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-slate-800">{ins.metric_type.replace('_', ' ')}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                    ins.trend_direction.includes('deteriorating') || ins.trend_direction.includes('elevated')
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    Trend: {ins.trend_direction}
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">{ins.clinical_observation}</p>
                <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-teal-900 font-semibold border border-slate-100">
                  {ins.preventive_recommendation}
                </div>
                {ins.outlier_points?.length > 0 && (
                  <div className="text-[10px] text-rose-700 space-y-0.5 pt-1">
                    <span className="font-bold">Atypical Outliers Flagged for Review:</span>
                    {ins.outlier_points.map((pt: string, ptIdx: number) => (
                      <div key={ptIdx} className="flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Screening Suggestions & Doctor Warning */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Suggested Screenings:</span>
              {aiInsights.suggested_screening_tests?.map((t: string, idx: number) => (
                <span key={idx} className="bg-white border border-teal-200 text-teal-800 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                  {t}
                </span>
              ))}
            </div>
            {aiInsights.doctor_review_suggested && (
              <span className="text-[11px] font-black text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-xl flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Physician Consultation Advised for Baseline Shift
              </span>
            )}
          </div>
        </div>
      )}

      {/* Reusable HealthMetricCards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <HealthMetricCard
          title="Blood Pressure"
          value={`${latest.systolic}/${latest.diastolic}`}
          unit="mmHg"
          normalRange="120/80"
          status={latest.systolic > 140 ? 'high' : latest.systolic > 130 ? 'elevated' : 'normal'}
          icon={<Activity className="w-5 h-5 text-teal-600" />}
          lastUpdated="Today"
        />

        <HealthMetricCard
          title="Fasting Blood Glucose"
          value={latest.bloodGlucose}
          unit="mg/dL"
          normalRange="70–130"
          status={latest.bloodGlucose > 200 ? 'high' : latest.bloodGlucose > 140 ? 'elevated' : 'normal'}
          icon={<HeartPulse className="w-5 h-5 text-rose-500" />}
          lastUpdated="Today"
        />

        <HealthMetricCard
          title="Pulse Rate"
          value={latest.pulse}
          unit="bpm"
          normalRange="60–100"
          status="normal"
          icon={<Activity className="w-5 h-5 text-sky-600" />}
          lastUpdated="Today"
        />

        <HealthMetricCard
          title="Oxygen Saturation"
          value={latest.spo2}
          unit="% SpO2"
          normalRange="95–100"
          status="normal"
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
          lastUpdated="Today"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Recharts Interactive Visualizations & Table (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Chart Switcher */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
              <button
                onClick={() => setActiveChartTab('glucose')}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                  activeChartTab === 'glucose' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
                }`}
              >
                Fasting Glucose Trend
              </button>
              <button
                onClick={() => setActiveChartTab('bp')}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                  activeChartTab === 'bp' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
                }`}
              >
                Blood Pressure Variance
              </button>
            </div>
            <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
              Data points: Last 7 verified checkups
            </span>
          </div>

          {/* Active Recharts Component */}
          {activeChartTab === 'glucose' ? (
            <GlucoseTrendChart data={vitalsHistory} />
          ) : (
            <BloodPressureChart data={vitalsHistory} />
          )}

          {/* Historical Table */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Longitudinal Telemetry Log</h3>
              <span className="text-[11px] text-teal-700 font-bold bg-teal-50 px-2.5 py-0.5 rounded-full">
                {vitalsHistory.length} Recorded Entries
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-y border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Date & Timestamp</th>
                    <th className="py-2.5 px-3">Blood Pressure</th>
                    <th className="py-2.5 px-3">Glucose</th>
                    <th className="py-2.5 px-3">Pulse</th>
                    <th className="py-2.5 px-3">SpO2</th>
                    <th className="py-2.5 px-3">Clinical Evaluation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vitalsHistory.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-900">{row.timestamp}</td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-800">{row.systolic}/{row.diastolic} mmHg</td>
                      <td className="py-3 px-3 font-mono font-black text-rose-600">{row.bloodGlucose} mg/dL</td>
                      <td className="py-3 px-3 font-mono text-slate-700">{row.pulse} bpm</td>
                      <td className="py-3 px-3 font-mono text-emerald-700 font-bold">{row.spo2}%</td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          row.status === 'high' ? 'bg-rose-100 text-rose-800' : row.status === 'elevated' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column: Log New Vitals Form (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 h-fit">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Log New Measurement
            </h3>
            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-bold">Manual / IoT</span>
          </div>
          <p className="text-xs text-slate-500">
            Enter manual vitals or sync readings from your village kiosk glucometer.
          </p>

          <form onSubmit={handleLogReading} className="space-y-3 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">Systolic BP</label>
                <input
                  type="number"
                  required
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">Diastolic BP</label>
                <input
                  type="number"
                  required
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">Fasting Glucose (mg/dL)</label>
              <input
                type="number"
                required
                value={bloodSugar}
                onChange={(e) => setBloodSugar(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">Pulse (bpm)</label>
                <input
                  type="number"
                  required
                  value={pulse}
                  onChange={(e) => setPulse(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">SpO2 (%)</label>
                <input
                  type="number"
                  required
                  value={spo2}
                  onChange={(e) => setSpo2(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md cursor-pointer transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Record & Sync with ABHA</span>
            </button>

            {logSuccess && (
              <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-[11px] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Reading successfully logged to Recharts timeline!</span>
              </div>
            )}
          </form>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => onNavigate('book-appointment')}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Schedule Doctor Review for Vitals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Clinical Risk Assessment Modal */}
      {showRiskModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in zoom-in-95">
            <button
              type="button"
              onClick={() => setShowRiskModal(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                <Brain className="w-3 h-3 text-teal-600" />
                Validated Clinical Risk Screening
              </div>
              <h2 className="text-xl font-black text-slate-900">
                Educational Health Risk Calculator
              </h2>
              <p className="text-xs text-slate-500">
                Grounded in MDRF-ICMR Indian Diabetes Risk Score (IDRS) & WHO/ISH South Asian Cardiovascular charts.
              </p>
            </div>

            {/* Assessment Type Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => { setRiskAssessmentType('diabetes'); setRiskResult(null); }}
                className={`py-2 rounded-xl transition-all cursor-pointer ${
                  riskAssessmentType === 'diabetes' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
                }`}
              >
                Type-2 Diabetes (IDRS)
              </button>
              <button
                type="button"
                onClick={() => { setRiskAssessmentType('cvd'); setRiskResult(null); }}
                className={`py-2 rounded-xl transition-all cursor-pointer ${
                  riskAssessmentType === 'cvd' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
                }`}
              >
                Cardiovascular (CVD) 10-Yr
              </button>
            </div>

            {/* Input Form */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Age (Years)</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              {riskAssessmentType === 'diabetes' ? (
                <>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Waist Circumference (cm)</label>
                      <input
                        type="number"
                        value={waist}
                        onChange={(e) => setWaist(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Physical Activity</label>
                      <select
                        value={physicalActivity}
                        onChange={(e) => setPhysicalActivity(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                      >
                        <option value="sedentary">Sedentary (No Exercise)</option>
                        <option value="moderate">Moderate (Brisk Walk/Work)</option>
                        <option value="vigorous">Vigorous (Strenuous Daily)</option>
                      </select>
                    </div>
                  </div>

                  <div className="text-xs">
                    <label className="font-bold text-slate-700 block mb-1">Family History of Diabetes</label>
                    <select
                      value={familyHistory}
                      onChange={(e) => setFamilyHistory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                    >
                      <option value="none">No diabetic parents</option>
                      <option value="one_parent">One parent has diabetes</option>
                      <option value="both_parents">Both parents have diabetes</option>
                    </select>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <input
                      type="checkbox"
                      id="smoker"
                      checked={isSmoker}
                      onChange={(e) => setIsSmoker(e.target.checked)}
                      className="rounded text-teal-600"
                    />
                    <label htmlFor="smoker" className="font-bold text-slate-700 text-xs">Current Smoker / Tobacco</label>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <input
                      type="checkbox"
                      id="diabetes"
                      checked={hasDiabetes}
                      onChange={(e) => setHasDiabetes(e.target.checked)}
                      className="rounded text-teal-600"
                    />
                    <label htmlFor="diabetes" className="font-bold text-slate-700 text-xs">Known Diabetics</label>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleCalculateRisk}
                disabled={isCalculatingRisk}
                className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <Brain className="w-4 h-4" />
                <span>{isCalculatingRisk ? "Calculating Clinical Model..." : "Calculate Educational Risk Score"}</span>
              </button>
            </div>

            {/* Risk Results */}
            {riskResult && (
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Resulting Risk Tier</span>
                    <h3 className="text-base font-black text-slate-900">{riskResult.risk_category}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Calculated Score</span>
                    <span className="text-lg font-black text-teal-700">{riskResult.calculated_score} / {riskResult.max_possible_score}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {riskResult.projected_risk_description}
                </p>

                {/* Contributing Factor Breakdown */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Factor Contribution Breakdown:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {riskResult.contributing_factors?.map((f: any, idx: number) => (
                      <div key={idx} className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs space-y-0.5">
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>{f.factor_name}</span>
                          <span className="text-teal-700">+{f.points_assigned} pts</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-snug">{f.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Evidence Basis & Disclaimer */}
                <div className="p-3 bg-amber-50 rounded-xl text-[10px] text-amber-900 border border-amber-200 space-y-1">
                  <span className="font-bold block">Scientific Framework: {riskResult.clinical_evidence_basis}</span>
                  <p>{riskResult.diagnostic_disclaimer}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
