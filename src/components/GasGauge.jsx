import React, { useRef, useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, AlertOctagon } from 'lucide-react';

/**
 * Enhanced progress bar gauge with hero percentage and animated counting.
 */
export default function GasGauge({ percentage: rawPercentage, label, sublabel, detail, isDarkMode }) {
  const percentage = Number.isFinite(rawPercentage) ? rawPercentage : 0;
  const displayPercentage = Math.min(percentage, 100);
  const isOverLimit = percentage > 100;
  const isWarning = percentage > 80 && percentage <= 100;

  // Animate the displayed number
  const [displayNum, setDisplayNum] = useState(0);
  const prevPercent = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const start = prevPercent.current;
    const end = percentage;
    const duration = 500;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayNum(start + (end - start) * eased);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    prevPercent.current = end;
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [percentage]);

  const getColorScheme = () => {
    if (isOverLimit) return {
      bar: 'bg-red-500', text: 'text-red-500',
      bg: isDarkMode ? 'bg-red-500/10' : 'bg-red-50',
      border: isDarkMode ? 'border-red-500/50' : 'border-red-300',
      glow: 'shadow-red-500/30'
    };
    if (isWarning) return {
      bar: 'bg-amber-500', text: 'text-amber-500',
      bg: isDarkMode ? 'bg-amber-500/10' : 'bg-amber-50',
      border: isDarkMode ? 'border-amber-500/30' : 'border-amber-300',
      glow: 'shadow-amber-500/20'
    };
    return {
      bar: 'bg-emerald-500', text: 'text-emerald-500',
      bg: isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50',
      border: isDarkMode ? 'border-slate-600/50' : 'border-emerald-200',
      glow: ''
    };
  };

  const colors = getColorScheme();
  const statusText = isOverLimit ? 'OVER LIMIT!' : isWarning ? 'Approaching limit' : 'Within safe range';

  return (
    <div className={`rounded-2xl p-4 border transition-colors ${colors.bg} ${colors.border}`}>
      {/* Label + icon */}
      <div className="flex items-center gap-2 mb-1">
        {isOverLimit ? (
          <AlertOctagon className="w-4 h-4 text-red-500" />
        ) : isWarning ? (
          <AlertTriangle className="w-4 h-4 text-amber-500" />
        ) : (
          <CheckCircle className="w-4 h-4 text-emerald-500" />
        )}
        <span className={`text-xs font-medium font-display uppercase tracking-wide ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          {label}
        </span>
      </div>

      {/* Hero percentage */}
      <div className={`text-4xl font-bold font-mono leading-none mb-2 ${colors.text}`}>
        {displayNum.toFixed(1)}
        <span className="text-xl">%</span>
      </div>

      {/* Progress bar */}
      <div className={`relative h-3 rounded-full overflow-hidden ${
        isDarkMode ? 'bg-or-dark-700' : 'bg-slate-200'
      }`}>
        {/* 80% tick */}
        <div className={`absolute top-0 bottom-0 left-[80%] w-px z-10 ${isDarkMode ? 'bg-slate-600' : 'bg-slate-300'}`} />
        {/* Fill */}
        <div
          className={`absolute inset-y-0 left-0 ${colors.bar} rounded-full transition-all duration-500 ease-out ${colors.glow ? `shadow-lg ${colors.glow}` : ''}`}
          style={{ width: `${displayPercentage}%` }}
        />
      </div>

      {/* Status row */}
      <div className="mt-1.5 flex items-center justify-between">
        <span className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{sublabel}</span>
        <span className={`text-[10px] font-medium ${colors.text}`}>{statusText}</span>
      </div>

      {/* Detail */}
      {detail && (
        <div className={`mt-1 text-xs font-mono font-semibold text-center ${colors.text}`}>
          {detail}
        </div>
      )}
    </div>
  );
}
