import React, { useState, useMemo } from 'react';
import { Syringe, Plus, Trash2, Minus, Info, ChevronDown, AlertTriangle } from 'lucide-react';
import {
  LOCAL_ANESTHETICS,
  EPI_RATIOS,
  isDrugAvailableForTier,
  getEffectiveMrd,
  getEpiLimit,
  getDrugWarnings,
  getEffectiveEpiConcentration
} from '../data/drugConstants';
import GasGauge from './GasGauge';
import VerificationBanner from './VerificationBanner';

const INITIAL_CARPULES = LOCAL_ANESTHETICS.reduce((acc, drug) => ({ ...acc, [drug.id]: 0 }), {});

export default function LocalAnesthesiaCalculator({
  weightKg, isCardiac, isPregnant, patientType, ageTier, mrdStandard,
  hepaticStatus, renalImpairment, isDarkMode, resetKey
}) {
  const [showInfo, setShowInfo] = useState(false);
  const [showRestrictions, setShowRestrictions] = useState(false);

  // Single source of truth: carpule counts only. All other data is derived.
  const [drugCarpules, setDrugCarpules] = useState(INITIAL_CARPULES);

  // Epi concentration overrides per drug (for customizable epi)
  const [epiOverrides, setEpiOverrides] = useState({});

  // Reset when resetKey changes (triggered by global reset)
  const [lastResetKey, setLastResetKey] = useState(resetKey);
  if (resetKey !== lastResetKey) {
    setLastResetKey(resetKey);
    setDrugCarpules(INITIAL_CARPULES);
    setEpiOverrides({});
  }

  const isPediatric = patientType === 'pediatric';

  // Filter drugs based on pediatric age restrictions
  const visibleDrugs = useMemo(() => {
    if (!isPediatric) return LOCAL_ANESTHETICS;
    return LOCAL_ANESTHETICS.filter(drug => isDrugAvailableForTier(drug, ageTier));
  }, [isPediatric, ageTier]);

  // Hidden drugs (for the "Why are some drugs not shown?" section)
  const hiddenDrugs = useMemo(() => {
    if (!isPediatric) return [];
    return LOCAL_ANESTHETICS.filter(drug => !isDrugAvailableForTier(drug, ageTier));
  }, [isPediatric, ageTier]);

  // Derive all drug dose data from carpule counts
  const addedDrugs = useMemo(() => {
    return visibleDrugs
      .filter(drug => (drugCarpules[drug.id] || 0) > 0)
      .map(drug => {
        const count = drugCarpules[drug.id];
        const epiConc = getEffectiveEpiConcentration(drug, epiOverrides);
        const volumeMl = count * drug.carpuleSize;
        return {
          drugId: drug.id,
          drugName: `${drug.name} (${drug.epiRatio})`,
          carpuleCount: count,
          carpuleSize: drug.carpuleSize,
          volumeMl,
          mgDelivered: volumeMl * drug.concentration,
          epiDelivered: volumeMl * epiConc,
          color: drug.color
        };
      });
  }, [drugCarpules, visibleDrugs, epiOverrides]);

  // Use functional updater to prevent stale closure issues on rapid clicks
  const addCarpule = (drugId, amount = 1) => {
    if (!weightKg || weightKg <= 0) return;
    setDrugCarpules(prev => ({
      ...prev,
      [drugId]: Math.max(0, (prev[drugId] || 0) + amount)
    }));
  };

  // Clear all
  const clearAll = () => {
    setDrugCarpules(INITIAL_CARPULES);
    setEpiOverrides({});
  };

  // Calculate cumulative toxicity using the Fractional Rule
  const calculations = useMemo(() => {
    const epiLimit = getEpiLimit(patientType, isCardiac, isPregnant, weightKg);

    if (!weightKg || weightKg <= 0 || addedDrugs.length === 0) {
      return {
        totalFraction: 0,
        totalEpi: 0,
        epiFraction: 0,
        epiLimit,
        byDrug: [],
        activeDrugCount: 0
      };
    }

    let totalFraction = 0;
    let totalEpi = 0;
    const byDrug = [];

    addedDrugs.forEach(added => {
      const drug = LOCAL_ANESTHETICS.find(d => d.id === added.drugId);
      const mrd = getEffectiveMrd(drug, patientType, mrdStandard, ageTier);
      const weightBasedMax = mrd.maxDosePerKg * weightKg;
      const effectiveMax = Math.min(weightBasedMax, mrd.absoluteMax);
      const fraction = effectiveMax > 0 ? added.mgDelivered / effectiveMax : 0;
      totalFraction += fraction;
      totalEpi += added.epiDelivered;

      byDrug.push({
        drugName: `${drug.name} (${drug.epiRatio})`,
        totalMg: added.mgDelivered.toFixed(1),
        maxMg: effectiveMax.toFixed(0),
        fraction: (fraction * 100).toFixed(1),
        totalEpi: added.epiDelivered.toFixed(3),
        color: drug.color
      });
    });

    const epiFraction = epiLimit > 0 ? (totalEpi / epiLimit) * 100 : 0;

    return {
      totalFraction: totalFraction * 100,
      totalEpi,
      epiFraction,
      epiLimit,
      byDrug,
      activeDrugCount: addedDrugs.length
    };
  }, [addedDrugs, weightKg, isCardiac, isPregnant, patientType, mrdStandard, ageTier]);

  // Get color classes for drug cards
  const getDrugColors = (color) => {
    const colors = {
      blue: {
        bg: isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50',
        border: isDarkMode ? 'border-blue-500/30' : 'border-blue-200',
        text: isDarkMode ? 'text-blue-400' : 'text-blue-600',
        accent: 'bg-blue-500'
      },
      emerald: {
        bg: isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50',
        border: isDarkMode ? 'border-emerald-500/30' : 'border-emerald-200',
        text: isDarkMode ? 'text-emerald-400' : 'text-emerald-600',
        accent: 'bg-emerald-500'
      },
      amber: {
        bg: isDarkMode ? 'bg-amber-500/10' : 'bg-amber-50',
        border: isDarkMode ? 'border-amber-500/30' : 'border-amber-200',
        text: isDarkMode ? 'text-amber-400' : 'text-amber-600',
        accent: 'bg-amber-500'
      },
      purple: {
        bg: isDarkMode ? 'bg-purple-500/10' : 'bg-purple-50',
        border: isDarkMode ? 'border-purple-500/30' : 'border-purple-200',
        text: isDarkMode ? 'text-purple-400' : 'text-purple-600',
        accent: 'bg-purple-500'
      },
      cyan: {
        bg: isDarkMode ? 'bg-cyan-500/10' : 'bg-cyan-50',
        border: isDarkMode ? 'border-cyan-500/30' : 'border-cyan-200',
        text: isDarkMode ? 'text-cyan-400' : 'text-cyan-600',
        accent: 'bg-cyan-500'
      }
    };
    return colors[color] || colors.blue;
  };

  // Get epi display info for a drug
  const getEpiDisplay = (drug) => {
    if (drug.epiConcentration === 0) return { label: 'Plain', isPlain: true };
    const selectedRatio = epiOverrides[drug.id] || drug.defaultEpiRatio;
    const conc = getEffectiveEpiConcentration(drug, epiOverrides);
    return {
      label: selectedRatio,
      concentration: `${conc} mg/mL`,
      isPlain: false
    };
  };

  // Summary strip color
  const summaryColor = calculations.totalFraction > 80 || calculations.epiFraction > 80
    ? 'red' : calculations.totalFraction > 50 || calculations.epiFraction > 50
    ? 'amber' : 'emerald';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Syringe className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
            Local Anesthesia Calculator
          </h2>
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          aria-label={showInfo ? 'Hide fractional toxicity info' : 'Show fractional toxicity info'}
          className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
            isDarkMode ? 'hover:bg-or-dark-700' : 'hover:bg-slate-200'
          }`}
        >
          <Info className={`w-5 h-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
        </button>
      </div>

      {/* Info Panel */}
      <div className={`overflow-hidden transition-all duration-300 ${showInfo ? 'max-h-60' : 'max-h-0'}`}>
        <div className={`rounded-2xl p-4 border text-sm ${
          isDarkMode
            ? 'bg-blue-500/5 border-blue-500/20 text-slate-300'
            : 'bg-blue-50 border-blue-200 text-slate-700'
        }`}>
          <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
            Fractional Toxicity Rule
          </h3>
          <p className="mb-2">
            When combining local anesthetics, toxicity is additive. The fractional rule calculates:
          </p>
          <div className={`p-2 rounded-lg font-mono text-center mb-2 ${
            isDarkMode ? 'bg-or-dark-900/50' : 'bg-white'
          }`}>
            (Dose₁ / Max₁) + (Dose₂ / Max₂) + ... ≤ 1.0 (100%)
          </div>
          <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            If the sum exceeds 100%, you have exceeded the safe cumulative dose.
          </p>
        </div>
      </div>

      {/* Gas Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" aria-live="polite" aria-atomic="true">
        <GasGauge
          percentage={calculations.totalFraction}
          label="Cumulative LA Toxicity"
          sublabel="Fractional rule sum"
          isDarkMode={isDarkMode}
        />
        <GasGauge
          percentage={calculations.epiFraction}
          label="Epinephrine Load"
          sublabel={`Limit: ${calculations.epiLimit.toFixed(3)}mg${
            isPediatric ? ' (1 mcg/kg)' : isCardiac ? ' (Cardiac)' : isPregnant ? ' (Pregnant)' : ' (Healthy)'
          }`}
          detail={`${calculations.totalEpi.toFixed(3)}mg (${(calculations.totalEpi * 1000).toFixed(0)} mcg)`}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Cumulative Summary Strip */}
      {addedDrugs.length > 0 && (
        <div className={`rounded-xl px-4 py-2.5 text-sm font-medium text-center transition-colors ${
          summaryColor === 'red'
            ? isDarkMode ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-red-50 text-red-600 border border-red-200'
            : summaryColor === 'amber'
            ? isDarkMode ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-amber-50 text-amber-600 border border-amber-200'
            : isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
        }`}>
          {calculations.totalFraction.toFixed(1)}% toxicity
          {' • '}
          {(calculations.totalEpi * 1000).toFixed(0)} mcg epi ({calculations.epiFraction.toFixed(0)}%)
          {' • '}
          {calculations.activeDrugCount} drug{calculations.activeDrugCount !== 1 ? 's' : ''} active
        </div>
      )}

      {/* Verification Banner (appears at >80% toxicity or epi) */}
      <VerificationBanner
        toxicityPercent={calculations.totalFraction}
        epiPercent={calculations.epiFraction}
        weightKg={weightKg || 0}
        patientType={patientType}
        isCardiac={isCardiac}
        isPregnant={isPregnant}
        ageTier={ageTier}
        mrdStandard={mrdStandard}
        epiLimit={calculations.epiLimit}
        drugSummary={addedDrugs.map(d => {
          const drug = LOCAL_ANESTHETICS.find(dr => dr.id === d.drugId);
          const mrd = getEffectiveMrd(drug, patientType, mrdStandard, ageTier);
          const maxDose = weightKg > 0 ? Math.min(mrd.maxDosePerKg * weightKg, mrd.absoluteMax) : mrd.absoluteMax;
          return {
            drugName: drug.name,
            carpuleCount: d.carpuleCount,
            mgDelivered: d.mgDelivered,
            percentOfMax: maxDose > 0 ? (d.mgDelivered / maxDose) * 100 : 0
          };
        })}
        isDarkMode={isDarkMode}
      />

      {/* Drug Cards Grid */}
      <div className="grid grid-cols-1 gap-3">
        {visibleDrugs.map(drug => {
          const colors = getDrugColors(drug.color);
          const count = drugCarpules[drug.id] || 0;
          const epiConc = getEffectiveEpiConcentration(drug, epiOverrides);
          const volumeMl = count * drug.carpuleSize;
          const mgDelivered = volumeMl * drug.concentration;
          const epiDelivered = volumeMl * epiConc;
          const mrd = getEffectiveMrd(drug, patientType, mrdStandard, ageTier);
          const maxDose = weightKg > 0 ? Math.min(mrd.maxDosePerKg * weightKg, mrd.absoluteMax) : mrd.absoluteMax;
          const percentUsed = weightKg > 0 && count > 0 ? (mgDelivered / maxDose) * 100 : 0;
          const epiDisplay = getEpiDisplay(drug);
          const warnings = isPediatric ? getDrugWarnings(drug, ageTier) : [];

          return (
            <div
              key={drug.id}
              className={`rounded-2xl p-4 border transition-all ${colors.bg} ${colors.border}`}
            >
              {/* Drug Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${colors.accent}`} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                        {drug.name}
                      </h3>
                      {/* Enhanced epi display badge */}
                      {epiDisplay.isPlain ? (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          isDarkMode ? 'bg-slate-600/50 text-slate-400' : 'bg-slate-200 text-slate-500'
                        }`}>
                          Plain
                        </span>
                      ) : (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          isDarkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
                        }`}>
                          Epi {epiDisplay.label}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {mrd.maxDosePerKg}mg/kg (max {mrd.absoluteMax}mg)
                      {isPediatric && (
                        <span className={isDarkMode ? 'text-teal-400' : 'text-teal-600'}>
                          {' '}— {mrdStandard === 'aapd' ? 'AAPD' : 'FDA'}
                        </span>
                      )}
                      {' • '}{drug.carpuleSize}mL carpules
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                      {drug.onset && <span>Onset: {drug.onset}</span>}
                      {drug.onset && drug.duration && <span> • </span>}
                      {drug.duration && <span>Duration: {drug.duration}</span>}
                      {(drug.onset || drug.duration) && drug.halfLife && <span> • </span>}
                      {drug.halfLife && <span>t½: {drug.halfLife}</span>}
                    </p>
                  </div>
                </div>

                {/* Percentage indicator */}
                <span className={`text-lg font-bold transition-opacity duration-200 flex-shrink-0 ${
                  count > 0 && weightKg > 0 ? 'opacity-100' : 'opacity-30'
                } ${
                  count > 0 && weightKg > 0
                    ? percentUsed > 100 ? 'text-red-500' :
                      percentUsed > 80 ? 'text-amber-500' : 'text-emerald-500'
                    : isDarkMode ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  {percentUsed.toFixed(0)}%
                </span>
              </div>

              {/* Epi concentration selector (for drugs with multiple options) */}
              {drug.availableEpiRatios && drug.availableEpiRatios.length > 1 && (
                <div className="mb-3">
                  <select
                    value={epiOverrides[drug.id] || drug.defaultEpiRatio}
                    onChange={(e) => setEpiOverrides(prev => ({ ...prev, [drug.id]: e.target.value }))}
                    className={`px-2 py-1.5 rounded-lg text-xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                      isDarkMode
                        ? 'bg-or-dark-700 border border-slate-600/50 text-slate-300'
                        : 'bg-white border border-slate-300 text-slate-700'
                    }`}
                  >
                    {drug.availableEpiRatios.map(ratio => (
                      <option key={ratio} value={ratio}>
                        Epi {ratio} ({EPI_RATIOS[ratio]} mg/mL)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Pediatric warnings */}
              {warnings.length > 0 && (
                <div className={`mb-3 p-2 rounded-lg text-xs flex items-start gap-2 ${
                  isDarkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-700'
                }`}>
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <div>{warnings.map((w, i) => <p key={i}>{w}</p>)}</div>
                </div>
              )}

              {/* Carpule Counter */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => addCarpule(drug.id, -1)}
                  disabled={count === 0 || !weightKg}
                  aria-label={`Remove one ${drug.name} carpule`}
                  className={`w-12 h-12 rounded-xl text-xl font-bold flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                    count === 0 || !weightKg
                      ? isDarkMode
                        ? 'bg-or-dark-700/50 text-slate-600 cursor-not-allowed'
                        : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                      : isDarkMode
                        ? 'bg-or-dark-700 text-slate-200 hover:bg-or-dark-600 active:bg-or-dark-800'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300 active:bg-slate-400'
                  }`}
                >
                  <Minus className="w-5 h-5" />
                </button>

                <div className="flex-1 text-center">
                  <div className={`text-3xl font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                    {count}
                  </div>
                  <div className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    {count > 0 ? `${volumeMl.toFixed(1)} mL • ${mgDelivered.toFixed(0)} mg` : 'carpules'}
                    {count > 0 && epiDelivered > 0 && (
                      <span className={isDarkMode ? 'text-amber-400/70' : 'text-amber-600'}>
                        {' '}• {(epiDelivered * 1000).toFixed(0)} mcg epi
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => addCarpule(drug.id, 1)}
                  disabled={!weightKg}
                  aria-label={`Add one ${drug.name} carpule`}
                  className={`w-12 h-12 rounded-xl text-xl font-bold flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                    !weightKg
                      ? isDarkMode
                        ? 'bg-or-dark-700/50 text-slate-600 cursor-not-allowed'
                        : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                      : isDarkMode
                        ? 'bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700'
                        : 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'
                  }`}
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Progress bar for this drug */}
              <div className={`mt-3 h-2 rounded-full overflow-hidden ${
                isDarkMode ? 'bg-or-dark-700' : 'bg-slate-200'
              }`}>
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    percentUsed > 100 ? 'bg-red-500' :
                    percentUsed > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(percentUsed, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Hidden drugs explanation (pediatric mode) */}
      {hiddenDrugs.length > 0 && (
        <details
          open={showRestrictions}
          onToggle={(e) => setShowRestrictions(e.target.open)}
        >
          <summary className={`flex items-center gap-2 text-sm cursor-pointer select-none ${
            isDarkMode ? 'text-slate-500 hover:text-slate-400' : 'text-slate-400 hover:text-slate-500'
          }`}>
            <ChevronDown className={`w-4 h-4 transition-transform ${showRestrictions ? 'rotate-180' : ''}`} />
            Why are some drugs not shown? ({hiddenDrugs.length} hidden)
          </summary>
          <div className={`mt-2 p-3 rounded-xl border text-xs space-y-2 ${
            isDarkMode ? 'bg-or-dark-800/50 border-slate-700/50 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}>
            {hiddenDrugs.map(drug => (
              <div key={drug.id} className="flex items-start gap-2">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${getDrugColors(drug.color).accent}`} />
                <div>
                  <span className="font-medium">{drug.name}</span>
                  {drug.id === 'articaine-4-epi-100k' && ' — Not recommended for patients under 4 years (FDA labeling).'}
                  {drug.id === 'bupivacaine-05-epi-200k' && ' — Not recommended for patients under 12 years (FDA + AAPD).'}
                  {drug.id === 'prilocaine-4-plain' && ' — Methemoglobinemia risk in infants. Hidden for safety.'}
                </div>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Standalone Clear All Button */}
      <button
        onClick={clearAll}
        disabled={addedDrugs.length === 0}
        className={`w-full py-3 rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-red-500/50 ${
          addedDrugs.length === 0
            ? isDarkMode
              ? 'bg-red-500/5 text-red-400/40 border border-red-500/15 cursor-not-allowed'
              : 'bg-red-50/50 text-red-400 border border-red-200/50 cursor-not-allowed'
            : isDarkMode
              ? 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20'
              : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
        }`}
      >
        <Trash2 className="w-4 h-4 inline mr-2" />
        Clear All
      </button>

      {/* Warning if no weight */}
      {(!weightKg || weightKg <= 0) && (
        <div className={`rounded-2xl p-4 border ${
          isDarkMode
            ? 'bg-amber-500/5 border-amber-500/20'
            : 'bg-amber-50 border-amber-200'
        }`}>
          <p className={`text-sm text-center ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>
            Enter patient weight above to enable calculations
          </p>
        </div>
      )}
    </div>
  );
}
