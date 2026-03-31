import React, { useRef, useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, AlertOctagon } from 'lucide-react';

/**
 * Enhanced progress bar gauge with animated number counting.
 * Clean bar design with tick marks at 80% and 100% thresholds.
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

  // Color scheme
  const getColorScheme = () => {
    if (isOverLimit) return {
      bar: 'bg-red-500',
      text: 'text-red-500',
      bg: isDarkMode ? 'bg-red-500/10' : 'bg-red-50',
      border: isDarkMode ? 'border-red-500/50' : 'border-red-300',
      glow: 'shadow-red-500/30'
    };
    if (isWarning) return {
      bar: 'bg-amber-500',
      text: 'text-amber-500',
      bg: isDarkMode ? 'bg-amber-500/10' : 'bg-amber-50',
      border: isDarkMode ? 'border-amber-500/30' : 'border-amber-300',
      glow: 'shadow-amber-500/20'
    };
    return {
      bar: 'bg-emerald-500',
      text: 'text-emerald-500',
      bg: isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50',
      border: isDarkMode ? 'border-slate-600/50' : 'border-emerald-200',
      glow: ''
    };
  };

  const colors = getColorScheme();

  return (
    <div className={`rounded-2xl p-4 border transition-colors ${colors.bg} ${colors.border} ${isOverLimit ? 'animate-pulse' : ''}`}>
      {/* Header row: icon + label + animated number */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isOverLimit ? (
            <AlertOctagon className="w-5 h-5 text-red-500" />
          ) : isWarning ? (
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          ) : (
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          )}
          <span className={`font-medium font-display ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{label}</span>
        </div>
        <span className={`text-2xl font-bold font-mono ${colors.text}`}>
          {displayNum.toFixed(1)}%
        </span>
      </div>

      {/* Progress bar with tick marks */}
      <div className={`relative h-6 rounded-full overflow-hidden ${
        isDarkMode ? 'bg-or-dark-700' : 'bg-slate-200'
      }`}>
        {/* Warning zone background */}
        <div className="absolute inset-0 flex">
          <div className={`w-[80%] border-r ${isDarkMode ? 'border-slate-600/50' : 'border-slate-300'}`} />
          <div className={`w-[20%] ${isDarkMode ? 'bg-amber-500/5' : 'bg-amber-100/50'}`} />
        </div>

        {/* Fill bar */}
        <div
          className={`absolute inset-y-0 left-0 ${colors.bar} rounded-full transition-all duration-500 ease-out ${colors.glow ? `shadow-lg ${colors.glow}` : ''}`}
          style={{ width: `${displayPercentage}%` }}
        />

        {/* 100% line marker */}
        <div className={`absolute right-0 top-0 bottom-0 w-0.5 ${isDarkMode ? 'bg-slate-500' : 'bg-slate-400'}`} />
      </div>

      {/* Status text row */}
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className={isDarkMode ? 'text-slate-500' : 'text-slate-400'}>{sublabel}</span>
        <span className={colors.text}>
          {isOverLimit ? 'OVER LIMIT!' : isWarning ? 'Approaching limit' : 'Within safe range'}
        </span>
      </div>

      {/* Optional detail line */}
      {detail && (
        <div className={`mt-1 text-center text-sm font-semibold font-mono ${colors.text}`}>
          {detail}
        </div>
      )}
    </div>
  );
}
