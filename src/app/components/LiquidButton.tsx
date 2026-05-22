import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/utils";

interface LiquidButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  fullWidth?: boolean;
}

export function LiquidButton({ 
  children, 
  variant = 'primary', 
  fullWidth = false,
  className,
  ...props 
}: LiquidButtonProps) {
  const baseClasses = "relative overflow-hidden rounded-2xl font-medium transition-all duration-300 active:scale-95 flex items-center justify-center";
  
  const variants = {
    primary: "bg-gradient-to-r from-cyan-600/80 to-purple-600/80 hover:from-cyan-500/90 hover:to-purple-500/90 text-white border border-white/20 shadow-[0_0_20px_rgba(0,240,255,0.3)] backdrop-blur-md",
    secondary: "bg-white/5 hover:bg-white/10 text-white border border-white/10 backdrop-blur-md",
    danger: "bg-red-500/20 hover:bg-red-500/30 text-red-100 border border-red-500/30 backdrop-blur-md",
    ghost: "bg-transparent hover:bg-white/5 text-slate-300 hover:text-white"
  };

  return (
    <button
      className={cn(
        baseClasses,
        variants[variant],
        fullWidth ? "w-full" : "",
        "px-6 py-4",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
      <div className="relative z-10 flex items-center gap-2">
        {children}
      </div>
    </button>
  );
}
