import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "teal" | "emerald";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer";
    
    const variants = {
      default: "bg-slate-900 text-white hover:bg-slate-800 shadow-xs",
      teal: "bg-teal-600 text-white hover:bg-teal-700 shadow-md shadow-teal-600/15",
      emerald: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/15",
      destructive: "bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-600/15",
      outline: "border border-slate-200 bg-white hover:bg-slate-50 text-slate-800",
      secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200",
      ghost: "hover:bg-slate-100 text-slate-700",
      link: "text-teal-700 underline-offset-4 hover:underline p-0",
    };

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-8 rounded-xl px-3 text-[11px]",
      lg: "h-12 rounded-2xl px-6 text-sm",
      icon: "h-9 w-9 rounded-xl",
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
