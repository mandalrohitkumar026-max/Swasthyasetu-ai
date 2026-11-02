import React from 'react';

interface HealthMetricCardProps {
  title: string;
  value: string | number;
  unit: string;
  normalRange: string;
  status: 'normal' | 'elevated' | 'high' | 'critical';
  icon: React.ReactNode;
  lastUpdated?: string;
}

export const HealthMetricCard: React.FC<HealthMetricCardProps> = ({
  title,
  value,
  unit,
  normalRange,
  status,
  icon,
  lastUpdated = "Today",
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'normal': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'elevated': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'high': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'critical': return 'bg-red-200 text-red-900 border-red-300 animate-pulse';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{title}</span>
        <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-700">
          {icon}
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-baseline space-x-1.5">
          <span className="text-2xl font-black text-slate-900 tracking-tight">{value}</span>
          <span className="text-xs font-semibold text-slate-500">{unit}</span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${getStatusBadge()}`}>
            {status}
          </span>
          <span className="text-[10px] text-slate-400">Ref: {normalRange}</span>
        </div>
      </div>

      {lastUpdated && (
        <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100">
          Last measured: {lastUpdated}
        </div>
      )}
    </div>
  );
};
