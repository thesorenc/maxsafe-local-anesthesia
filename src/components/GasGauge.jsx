import React from 'react';
import { AlertTriangle, CheckCircle, AlertOctagon } from 'lucide-react';

export default function GasGauge({ percentage: rawPercentage, label, sublabel, detail, isDarkMode }) {
  // Guard against NaN/undefined
  const percentage = Number.isFinite(rawPercentage) ? rawPercentage : 0;
  // Clamp percentage for display but keep actual value for warnings
  const displayPercentage = Math.min(percentage, 100);
  const isOverLimit = percentage > 100;
  const isWarning = percentage > 80 && percentage <= 100;

  // Determine color scheme
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
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isOverLimit ? (
            <AlertOctagon className="w-5 h-5 text-red-500" />
          ) : isWarning ? (
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          ) : (
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          )}
          <span className={`font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{label}</span>
        </div>
        <span className={`text-2xl font-bold ${colors.text}`}>
          {percentage.toFixed(1)}%
        </span>
      </div>

      {/* Progress bar container */}
      <div className={`relative h-6 rounded-full overflow-hidden ${
        isDarkMode ? 'bg-or-dark-700' : 'bg-slate-200'
      }`}>
        {/* Warning zone markers */}
        <div className="absolute inset-0 flex">
          <div className={`w-[80%] border-r ${isDarkMode ? 'border-slate-600/50' : 'border-slate-300'}`} />
          <div className={`w-[20%] ${isDarkMode ? 'bg-amber-500/5' : 'bg-amber-100/50'}`} />
        </div>

        {/* Actual progress bar */}
        <div
          className={`absolute inset-y-0 left-0 ${colors.bar} transition-all duration-300 ease-out rounded-full ${colors.glow ? `shadow-lg ${colors.glow}` : ''}`}
          style={{ width: `${displayPercentage}%` }}
        />

        {/* 100% line marker */}
        <div className={`absolute right-0 top-0 bottom-0 w-0.5 ${isDarkMode ? 'bg-slate-500' : 'bg-slate-400'}`} />
      </div>

      {/* Status text */}
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className={isDarkMode ? 'text-slate-500' : 'text-slate-400'}>{sublabel}</span>
        <span className={colors.text}>
          {isOverLimit ? 'OVER LIMIT!' : isWarning ? 'Approaching limit' : 'Within safe range'}
        </span>
      </div>

      {/* Optional detail line */}
      {detail && (
        <div className={`mt-1 text-center text-sm font-semibold ${colors.text}`}>
          {detail}
        </div>
      )}
    </div>
  );
}
