import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number; // 0 to 100
  label?: string;
  showValue?: boolean;
  valueSuffix?: string;
  color?: 'purple' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  id?: string;
}

export function ProgressBar({
  value,
  label,
  showValue = true,
  valueSuffix = '%',
  color = 'purple',
  size = 'md',
  className,
  id,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const colorClasses = {
    purple: 'bg-purple-600',
    cyan: 'bg-cyan-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    gradient: 'bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-400',
  };

  return (
    <div id={id} className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1 text-xs">
          {label && <span className="text-slate-300 font-medium">{label}</span>}
          {showValue && (
            <span className="text-slate-200 font-semibold">
              {clamped}
              {valueSuffix}
            </span>
          )}
        </div>
      )}
      <div className={cn('w-full bg-slate-800/90 rounded-full overflow-hidden border border-slate-700/50', sizeClasses[size])}>
        <div
          className={cn('h-full transition-all duration-500 ease-out rounded-full', colorClasses[color])}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

export function TripleProbBar({
  homeProb,
  drawProb,
  awayProb,
  homeLabel = 'Home',
  drawLabel = 'Draw',
  awayLabel = 'Away',
}: {
  homeProb: number;
  drawProb: number;
  awayProb: number;
  homeLabel?: string;
  drawLabel?: string;
  awayLabel?: string;
}) {
  return (
    <div className="w-full space-y-1.5">
      <div className="flex justify-between text-xs font-semibold">
        <span className="text-purple-400">
          {homeLabel} {homeProb}%
        </span>
        <span className="text-slate-400">
          {drawLabel} {drawProb}%
        </span>
        <span className="text-cyan-400">
          {awayLabel} {awayProb}%
        </span>
      </div>
      <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex border border-slate-700/60 p-0.5">
        <div
          className="h-full bg-purple-600 rounded-l-full transition-all duration-300"
          style={{ width: `${homeProb}%` }}
          title={`${homeLabel}: ${homeProb}%`}
        />
        <div
          className="h-full bg-slate-600 transition-all duration-300"
          style={{ width: `${drawProb}%` }}
          title={`${drawLabel}: ${drawProb}%`}
        />
        <div
          className="h-full bg-cyan-500 rounded-r-full transition-all duration-300"
          style={{ width: `${awayProb}%` }}
          title={`${awayLabel}: ${awayProb}%`}
        />
      </div>
    </div>
  );
}
