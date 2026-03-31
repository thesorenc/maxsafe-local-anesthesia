import React, { useState, useEffect } from 'react';
import { AlertTriangle, AlertOctagon, ShieldCheck } from 'lucide-react';

/**
 * VerificationBanner — Appears when toxicity or epi load exceeds 80%.
 * Displays all patient parameters alongside calculated outputs for meaningful
 * verification (not a simple "Are you sure?" dialog).
 *
 * Based on automation bias literature:
 * - Goddard et al. 2012 (PMID 21685142): inputs displayed alongside outputs
 * - Lyell & Coiera 2017 (PMID 27516495): reduce verification complexity
 * - Labkoff et al. 2024 (PMID 39325508): AMIA CDS guidelines
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
  drugSummary, // Array of { drugName, carpuleCount, mgDelivered, percentOfMax }
  isDarkMode
}) {
  const [verified, setVerified] = useState(false);
  const [verifiedAt, setVerifiedAt] = useState(null);

  // Track the "signature" of all inputs — reset verification when anything changes
  const inputSignature = JSON.stringify({
    toxicityPercent: toxicityPercent.toFixed(1),
    epiPercent: epiPercent.toFixed(1),
    weightKg,
    patientType,
    isCardiac,
    isPregnant,
    ageMonths,
    mrdStandard,
    drugSummary
  });

  useEffect(() => {
    // Reset verification whenever inputs change
    setVerified(false);
    setVerifiedAt(null);
  }, [inputSignature]);

  const isOverLimit = toxicityPercent > 100 || epiPercent > 100;
  const isApproaching = (toxicityPercent > 80 || epiPercent > 80) && !isOverLimit;

  // Don't render if below threshold
  if (toxicityPercent <= 80 && epiPercent <= 80) return null;

  const handleVerify = () => {
    setVerified(true);
    setVerifiedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  };

  // Collapsed state after verification
  if (verified && !isOverLimit) {
    return (
      <div className={`rounded-xl px-4 py-2 text-xs flex items-center justify-between ${
        isDarkMode ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' : 'bg-amber-50 border border-amber-200 text-amber-700'
      }`}>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          <span>Parameters verified at {verifiedAt}</span>
        </div>
        <span className="font-mono">{toxicityPercent.toFixed(1)}% tox • {epiPercent.toFixed(1)}% epi</span>
      </div>
    );
  }

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
        <span className={`font-bold ${
          isOverLimit
            ? 'text-red-500'
            : isDarkMode ? 'text-amber-400' : 'text-amber-700'
        }`}>
          {isOverLimit ? 'MAXIMUM RECOMMENDED DOSE EXCEEDED' : 'APPROACHING MAXIMUM DOSE'}
        </span>
      </div>

      {/* Verification content: inputs alongside outputs */}
      <div className={`space-y-2 text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
        <p className={`font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Verify patient parameters:
        </p>

        {/* Patient parameters */}
        <div className={`rounded-lg p-2.5 space-y-1 ${
          isDarkMode ? 'bg-or-dark-900/50' : 'bg-white'
        }`}>
          <div className="flex justify-between">
            <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Weight</span>
            <span className="font-semibold">{weightKg.toFixed(1)} kg</span>
          </div>
          <div className="flex justify-between">
            <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Status</span>
            <span className="font-semibold">
              {isCardiac ? 'Cardiac' : isPregnant ? 'Pregnant' : 'Healthy'}
              {isPed ? ' (Pediatric)' : ''}
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
          <div className={`rounded-lg p-2.5 space-y-1 ${
            isDarkMode ? 'bg-or-dark-900/50' : 'bg-white'
          }`}>
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

      {/* Verification button */}
      <button
        onClick={handleVerify}
        className={`mt-3 w-full py-2.5 rounded-xl text-sm font-medium transition-all focus:outline-none focus:ring-2 ${
          isOverLimit
            ? isDarkMode
              ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30 focus:ring-red-500/50'
              : 'bg-red-100 text-red-700 border border-red-300 hover:bg-red-200 focus:ring-red-500/50'
            : isDarkMode
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30 focus:ring-amber-500/50'
              : 'bg-amber-100 text-amber-700 border border-amber-300 hover:bg-amber-200 focus:ring-amber-500/50'
        }`}
      >
        {isOverLimit
          ? 'I accept responsibility for exceeding MRD'
          : 'I have verified these parameters'}
      </button>
    </div>
  );
}
