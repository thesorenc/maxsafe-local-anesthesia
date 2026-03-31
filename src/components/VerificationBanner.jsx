import React from 'react';
import { AlertTriangle, AlertOctagon } from 'lucide-react';

/**
 * VerificationBanner — Displays when toxicity or epi load exceeds 80%.
 * Shows all patient parameters alongside calculated outputs for
 * meaningful verification. No button — purely informational.
 */
export default function VerificationBanner({
  toxicityPercent,
  epiPercent,
  weightKg,
  patientType,
  isCardiac,
  isPregnant,
  ageMonths,
  mrdStandard,
  epiLimit,
  drugSummary,
  isDarkMode
}) {
  const isOverLimit = toxicityPercent > 100 || epiPercent > 100;

  // Don't render if below threshold
  if (toxicityPercent <= 80 && epiPercent <= 80) return null;

  const isPed = patientType === 'pediatric';

  return (
    <div className={`rounded-2xl p-4 border transition-all ${
      isOverLimit
        ? isDarkMode ? 'bg-red-500/10 border-red-500/40' : 'bg-red-50 border-red-300'
        : isDarkMode ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'
    }`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        {isOverLimit ? (
          <AlertOctagon className="w-5 h-5 text-red-500" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-amber-500" />
        )}
        <span className={`font-bold font-display ${
          isOverLimit
            ? 'text-red-500'
            : isDarkMode ? 'text-amber-400' : 'text-amber-700'
        }`}>
          {isOverLimit ? 'MAXIMUM RECOMMENDED DOSE EXCEEDED' : 'APPROACHING MAXIMUM DOSE'}
        </span>
      </div>

      {/* Verification content */}
      <div className={`space-y-2 text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
        {/* Patient parameters */}
        <div className={`rounded-lg p-2.5 space-y-1 ${isDarkMode ? 'bg-or-dark-900/50' : 'bg-white'}`}>
          <div className="flex justify-between">
            <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Weight</span>
            <span className="font-semibold">{weightKg.toFixed(1)} kg</span>
          </div>
          <div className="flex justify-between">
            <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Status</span>
            <span className="font-semibold">
              {[isCardiac && 'Cardiac', isPregnant && 'Pregnant', isPed && 'Pediatric'].filter(Boolean).join(', ') || 'Standard'}
            </span>
          </div>
          {isPed && (
            <div className="flex justify-between">
              <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>MRD Standard</span>
              <span className="font-semibold">{mrdStandard === 'aapd' ? 'AAPD Conservative' : 'FDA Label'}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Epi Limit</span>
            <span className="font-semibold">{epiLimit.toFixed(3)} mg ({(epiLimit * 1000).toFixed(0)} mcg)</span>
          </div>
        </div>

        {/* Drug breakdown */}
        {drugSummary && drugSummary.length > 0 && (
          <div className={`rounded-lg p-2.5 space-y-1 ${isDarkMode ? 'bg-or-dark-900/50' : 'bg-white'}`}>
            {drugSummary.map((d, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span>{d.drugName} × {d.carpuleCount}</span>
                <span className="font-mono">{d.mgDelivered.toFixed(0)} mg ({d.percentOfMax.toFixed(0)}%)</span>
              </div>
            ))}
            <div className={`border-t pt-1 mt-1 flex justify-between font-semibold ${
              isDarkMode ? 'border-slate-700' : 'border-slate-200'
            }`}>
              <span>Combined fractional toxicity</span>
              <span className={isOverLimit ? 'text-red-500' : 'text-amber-500'}>
                {toxicityPercent.toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
