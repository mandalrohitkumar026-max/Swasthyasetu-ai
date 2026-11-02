import * as React from "react";
import { cn } from "./button";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-1">
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-2xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-800 transition-all placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-rose-500 focus:ring-rose-500",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-[10px] font-semibold text-rose-600">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
