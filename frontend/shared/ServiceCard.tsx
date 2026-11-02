import React from 'react';
import { ArrowRight } from 'lucide-react';

interface ServiceCardProps {
  title: string;
  desc: string;
  icon: React.ReactNode;
  badge?: string;
  features?: string[];
  actionText?: string;
  onAction?: () => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  desc,
  icon,
  badge,
  features,
  actionText = "Access Service",
  onAction,
}) => {
  return (
    <div 
      onClick={onAction}
      className="group bg-white p-6 rounded-3xl border border-slate-200 hover:border-teal-300 hover:shadow-lg hover:shadow-teal-500/5 transition-all cursor-pointer flex flex-col justify-between"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 group-hover:bg-teal-50 flex items-center justify-center transition-colors">
            {icon}
          </div>
          {badge && (
            <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200/50 uppercase tracking-wider">
              {badge}
            </span>
          )}
        </div>

        <div>
          <h3 className="font-bold text-base text-slate-900 group-hover:text-teal-700 transition-colors">
            {title}
          </h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            {desc}
          </p>
        </div>

        {features && features.length > 0 && (
          <div className="pt-2 space-y-1.5 border-t border-slate-100">
            {features.map((feat, idx) => (
              <div key={idx} className="text-[11px] text-slate-600 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0"></span>
                <span>{feat}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-600">
        <span>{actionText}</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
};
