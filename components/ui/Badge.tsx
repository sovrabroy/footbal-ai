import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'cyan' | 'success' | 'warning' | 'neutral' | 'outline' | 'purple' | 'emerald' | 'amber' | 'rose';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  id?: string;
}

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  className,
  id,
}: BadgeProps) {
  const variantStyles = {
    primary: 'bg-purple-900/60 text-purple-300 border-purple-500/40',
    purple: 'bg-purple-600/20 text-purple-300 border-purple-500/30',
    cyan: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40',
    success: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40',
    emerald: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40',
    warning: 'bg-amber-950/60 text-amber-300 border-amber-500/40',
    amber: 'bg-amber-950/60 text-amber-300 border-amber-500/40',
    rose: 'bg-rose-950/60 text-rose-300 border-rose-500/40',
    neutral: 'bg-slate-800/80 text-slate-300 border-slate-700/60',
    outline: 'bg-transparent text-slate-300 border-slate-700',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
    lg: 'text-sm px-3 py-1.5 font-semibold',
  };

  return (
    <span
      id={id}
      className={cn(
        'inline-flex items-center justify-center rounded-full border whitespace-nowrap tracking-wide leading-none',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}

export function FormPill({ result }: { result: 'W' | 'D' | 'L' }) {
  const colors = {
    W: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-bold',
    D: 'bg-amber-500/20 text-amber-400 border-amber-500/40 font-bold',
    L: 'bg-rose-500/20 text-rose-400 border-rose-500/40 font-bold',
  };

  return (
    <span
      className={cn(
        'w-5 h-5 rounded flex items-center justify-center text-[10px] border shadow-xs',
        colors[result]
      )}
      title={result === 'W' ? 'Win' : result === 'D' ? 'Draw' : 'Loss'}
    >
      {result}
    </span>
  );
}
