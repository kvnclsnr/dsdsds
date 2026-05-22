import { ReactNode } from "react";
import { cn } from "../lib/utils";

interface LiquidCardProps {
  children: ReactNode;
  className?: string;
  glow?: 'cyan' | 'purple' | 'none';
}

export function LiquidCard({ children, className, glow = 'none' }: LiquidCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg",
        glow === 'cyan' && "shadow-[0_0_15px_rgba(0,240,255,0.1)] border-cyan-400/20",
        glow === 'purple' && "shadow-[0_0_15px_rgba(176,38,255,0.15)] border-fuchsia-400/20",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white-[0.08] to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
      {children}
    </div>
  );
}
