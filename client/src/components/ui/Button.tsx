import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "gradient" | "glass";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const variants = {
      primary:
        "bg-teal-600 text-white hover:bg-teal-700 shadow-sm hover:shadow-teal-500/20 active:scale-[0.98]",
      gradient:
        "bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-600 text-white hover:from-teal-500 hover:to-emerald-500 shadow-md hover:shadow-teal-500/25 active:scale-[0.98]",
      secondary:
        "bg-slate-100 text-slate-800 hover:bg-slate-200 active:scale-[0.98]",
      outline:
        "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:border-slate-300 shadow-sm active:scale-[0.98]",
      glass:
        "bg-white/80 backdrop-blur-md border border-slate-200/80 hover:bg-white text-slate-800 shadow-sm hover:shadow active:scale-[0.98]",
      ghost:
        "hover:bg-slate-100/80 text-slate-700 hover:text-slate-900 active:scale-[0.98]",
      danger:
        "bg-rose-600 text-white hover:bg-rose-700 shadow-sm hover:shadow-rose-500/20 active:scale-[0.98]",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs font-medium rounded-lg gap-1.5",
      md: "h-10 px-4 py-2 text-sm font-medium rounded-xl gap-2",
      lg: "h-12 px-6 text-base font-semibold rounded-xl gap-2.5",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
