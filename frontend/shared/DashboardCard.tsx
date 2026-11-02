import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  isPositive?: boolean;
  icon: React.ReactNode;
  iconBgColor?: string;
  onClick?: () => void;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  subtitle,
  change,
  isPositive = true,
  icon,
  iconBgColor = 'bg-teal-50 text-teal-700',
  onClick,
}) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 transition-all ${
        onClick ? 'cursor-pointer hover:border-teal-300 hover:shadow-md hover:shadow-teal-500/5' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{title}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBgColor}`}>
          {icon}
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-2xl font-black text-slate-900 tracking-tight">{value}</div>
        <div className="flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-500 font-medium">{subtitle}</span>}
          {change && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {change}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
