import * as React from "react";
import { X } from "lucide-react";
import { cn } from "./button";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export const Dialog: React.FC<DialogProps> = ({
  open,
  onOpenChange,
  children,
  title,
  description,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 z-10 animate-in zoom-in-95 duration-150 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between pb-2">
          <div>
            {title && <h3 className="text-base font-extrabold text-slate-900">{title}</h3>}
            {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
};
