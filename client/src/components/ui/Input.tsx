import React from "react";
import { cn } from "./Button";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            className={cn(
              "flex h-11 w-full rounded-xl border border-slate-200 bg-white/90 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60 shadow-xs",
              error && "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10",
              className
            )}
            {...props}
          />
        </div>
        {error ? (
          <p className="text-xs font-medium text-rose-500 flex items-center gap-1 mt-1">
            <span>•</span> {error}
          </p>
        ) : helperText ? (
          <p className="text-xs text-slate-400 mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";
