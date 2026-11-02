import React from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { VitalsReading } from '../../types';

interface VitalsChartsProps {
  data: VitalsReading[];
}

export const GlucoseTrendChart: React.FC<VitalsChartsProps> = ({ data }) => {
  const chartData = [...data].reverse().map(item => ({
    date: item.date,
    glucose: item.bloodGlucose,
    target: 130
  }));

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Fasting Blood Glucose Longitudinal Trend</h3>
          <p className="text-xs text-slate-500">Normal Fasting: 70–100 mg/dL | Pre-Diabetes: 100–125 | Target: &lt; 130</p>
        </div>
        <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full">
          Recharts Live Telemetry
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="glucoseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} domain={[100, 260]} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
              labelStyle={{ fontWeight: 'bold' }}
            />
            <ReferenceLine y={130} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Target 130', fill: '#f59e0b', fontSize: 10 }} />
            <Area type="monotone" dataKey="glucose" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#glucoseGradient)" name="Fasting Glucose (mg/dL)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const BloodPressureChart: React.FC<VitalsChartsProps> = ({ data }) => {
  const chartData = [...data].reverse().map(item => ({
    date: item.date,
    systolic: item.systolic,
    diastolic: item.diastolic
  }));

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Blood Pressure Variance (Systolic vs Diastolic)</h3>
          <p className="text-xs text-slate-500">Standard Baseline: 120 / 80 mmHg</p>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-bold">
          <span className="flex items-center gap-1 text-teal-700">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span> Systolic
          </span>
          <span className="flex items-center gap-1 text-sky-700">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span> Diastolic
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} domain={[60, 160]} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
            />
            <Bar dataKey="systolic" fill="#0d9488" radius={[6, 6, 0, 0]} name="Systolic (mmHg)" />
            <Bar dataKey="diastolic" fill="#0284c7" radius={[6, 6, 0, 0]} name="Diastolic (mmHg)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
