import * as React from "react";
import { cn } from "./button";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "teal" | "emerald" | "amber";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-slate-900 text-white border-transparent",
    secondary: "bg-slate-100 text-slate-800 border-transparent",
    destructive: "bg-rose-100 text-rose-800 border-rose-200",
    teal: "bg-teal-50 text-teal-800 border-teal-200/60",
    emerald: "bg-emerald-50 text-emerald-800 border-emerald-200/60",
    amber: "bg-amber-50 text-amber-800 border-amber-200/60",
    outline: "text-slate-700 border-slate-200 bg-transparent",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
