import React, { useState, useMemo } from 'react';
import { Syringe, Plus, Trash2, Minus, Info, ChevronDown, AlertTriangle } from 'lucide-react';
import {
  LOCAL_ANESTHETICS,
  EPI_RATIOS,
  isDrugAvailable,
  getEffectiveMrd,
  getEpiLimit,
  getDrugWarnings,
} from '../data/drugConstants';
import GasGauge from './GasGauge';
import VerificationBanner from './VerificationBanner';

// Initialize carpules: each drug gets { [defaultEpiRatio or 'plain']: 0 }
const INITIAL_CARPULES = LOCAL_ANESTHETICS.reduce((acc, drug) => ({
  ...acc,
  [drug.id]: { [drug.defaultEpiRatio || 'plain']: 0 }
}), {});

// Get total carpules for a drug across all concentrations
const getTotalCarpules = (drugEntry) =>
  Object.values(drugEntry || {}).reduce((sum, c) => sum + c, 0);

// Get active (non-zero) concentration entries for a drug
const getActiveConcentrations = (drugEntry) =>
  Object.entries(drugEntry || {}).filter(([, count]) => count > 0);

export default function LocalAnesthesiaCalculator({
  weightKg, isCardiac, isPregnant, patientType, ageMonths, mrdStandard,
  hepaticStatus, renalImpairment, isDarkMode, resetKey
}) {
  const [showInfo, setShowInfo] = useState(false);
  const [showRestrictions, setShowRestrictions] = useState(false);

  // Carpule counts: { drugId: { epiRatio: count } }
  const [drugCarpules, setDrugCarpules] = useState(INITIAL_CARPULES);

  // Track which drugs have expanded concentration rows
  const [expandedConcentrations, setExpandedConcentrations] = useState({});

  // Reset when resetKey changes
  const [lastResetKey, setLastResetKey] = useState(resetKey);
  if (resetKey !== lastResetKey) {
    setLastResetKey(resetKey);
    setDrugCarpules(INITIAL_CARPULES);
    setExpandedConcentrations({});
  }

  const isPediatric = patientType === 'pediatric';

  // Filter drugs based on pediatric age restrictions
  const visibleDrugs = useMemo(() => {
    if (!isPediatric) return LOCAL_ANESTHETICS;
    return LOCAL_ANESTHETICS.filter(drug => isDrugAvailable(drug, ageMonths, mrdStandard));
  }, [isPediatric, ageMonths, mrdStandard]);

  const hiddenDrugs = useMemo(() => {
    if (!isPediatric) return [];
    return LOCAL_ANESTHETICS.filter(drug => !isDrugAvailable(drug, ageMonths, mrdStandard));
  }, [isPediatric, ageMonths, mrdStandard]);

  // Flatten all drug+concentration entries for dose calculation
  const addedDrugs = useMemo(() => {
    const entries = [];
    visibleDrugs.forEach(drug => {
      const drugEntry = drugCarpules[drug.id] || {};
      Object.entries(drugEntry).forEach(([ratio, count]) => {
        if (count > 0) {
          const epiConc = ratio === 'plain' ? 0 : (EPI_RATIOS[ratio] || 0);
          const volumeMl = count * drug.carpuleSize;
          entries.push({
            drugId: drug.id,
            epiRatio: ratio,
            drugName: drug.name,
            carpuleCount: count,
            volumeMl,
            mgDelivered: volumeMl * drug.concentration,
            epiDelivered: volumeMl * epiConc,
            color: drug.color
          });
        }
      });
    });
    return entries;
  }, [drugCarpules, visibleDrugs]);

  // Add/remove carpule for a specific drug + concentration
  const addCarpule = (drugId, epiRatio, amount = 1) => {
    if (!weightKg || weightKg <= 0) return;
    setDrugCarpules(prev => {
      const drugEntry = { ...(prev[drugId] || {}) };
      drugEntry[epiRatio] = Math.max(0, (drugEntry[epiRatio] || 0) + amount);
      return { ...prev, [drugId]: drugEntry };
    });
  };

  // Add a new concentration row to a drug
  const addConcentration = (drugId, ratio) => {
    setDrugCarpules(prev => {
      const drugEntry = { ...(prev[drugId] || {}) };
      if (!(ratio in drugEntry)) {
        drugEntry[ratio] = 0;
      }
      return { ...prev, [drugId]: drugEntry };
    });
    setExpandedConcentrations(prev => ({
      ...prev,
      [drugId]: [...(prev[drugId] || []), ratio]
    }));
  };

  const clearAll = () => {
    setDrugCarpules(INITIAL_CARPULES);
    setExpandedConcentrations({});
  };

  // Calculate cumulative toxicity
  const calculations = useMemo(() => {
    const epiLimit = getEpiLimit(patientType, isCardiac, isPregnant, weightKg);

    if (!weightKg || weightKg <= 0 || addedDrugs.length === 0) {
      return { totalFraction: 0, totalEpi: 0, epiFraction: 0, epiLimit, byDrug: [], activeDrugCount: 0 };
    }

    // Group by base drug for fractional toxicity
    const drugTotals = {};
    let totalEpi = 0;

    addedDrugs.forEach(entry => {
      if (!drugTotals[entry.drugId]) {
        drugTotals[entry.drugId] = { mgDelivered: 0, drugId: entry.drugId, drugName: entry.drugName, color: entry.color };
      }
      drugTotals[entry.drugId].mgDelivered += entry.mgDelivered;
      totalEpi += entry.epiDelivered;
    });

    let totalFraction = 0;
    const byDrug = [];

    Object.values(drugTotals).forEach(dt => {
      const drug = LOCAL_ANESTHETICS.find(d => d.id === dt.drugId);
      const mrd = getEffectiveMrd(drug, patientType, mrdStandard, ageMonths);
      const effectiveMax = Math.min(mrd.maxDosePerKg * weightKg, mrd.absoluteMax);
      const fraction = effectiveMax > 0 ? dt.mgDelivered / effectiveMax : 0;
      totalFraction += fraction;
      byDrug.push({
        drugName: dt.drugName,
        totalMg: dt.mgDelivered.toFixed(1),
        maxMg: effectiveMax.toFixed(0),
        fraction: (fraction * 100).toFixed(1),
        color: dt.color
      });
    });

    const epiFraction = epiLimit > 0 ? (totalEpi / epiLimit) * 100 : 0;

    return {
      totalFraction: totalFraction * 100,
      totalEpi,
      epiFraction,
      epiLimit,
      byDrug,
      activeDrugCount: Object.keys(drugTotals).length
    };
  }, [addedDrugs, weightKg, isCardiac, isPregnant, patientType, mrdStandard, ageMonths]);

  // Drug card color helper
  const getDrugColors = (color) => {
    const colors = {
      blue:    { bg: isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50', border: isDarkMode ? 'border-blue-500/30' : 'border-blue-200', text: isDarkMode ? 'text-blue-400' : 'text-blue-600', accent: 'bg-blue-500' },
      emerald: { bg: isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50', border: isDarkMode ? 'border-emerald-500/30' : 'border-emerald-200', text: isDarkMode ? 'text-emerald-400' : 'text-emerald-600', accent: 'bg-emerald-500' },
      amber:   { bg: isDarkMode ? 'bg-amber-500/10' : 'bg-amber-50', border: isDarkMode ? 'border-amber-500/30' : 'border-amber-200', text: isDarkMode ? 'text-amber-400' : 'text-amber-600', accent: 'bg-amber-500' },
      purple:  { bg: isDarkMode ? 'bg-purple-500/10' : 'bg-purple-50', border: isDarkMode ? 'border-purple-500/30' : 'border-purple-200', text: isDarkMode ? 'text-purple-400' : 'text-purple-600', accent: 'bg-purple-500' },
      cyan:    { bg: isDarkMode ? 'bg-cyan-500/10' : 'bg-cyan-50', border: isDarkMode ? 'border-cyan-500/30' : 'border-cyan-200', text: isDarkMode ? 'text-cyan-400' : 'text-cyan-600', accent: 'bg-cyan-500' },
    };
    return colors[color] || colors.blue;
  };

  const summaryColor = calculations.totalFraction > 80 || calculations.epiFraction > 80
    ? 'red' : calculations.totalFraction > 50 || calculations.epiFraction > 50
    ? 'amber' : 'emerald';

  // Render a single concentration row with +/- buttons
  const renderConcentrationRow = (drug, epiRatio, count, isDefault) => {
    const isPlain = epiRatio === 'plain';
    const epiConc = isPlain ? 0 : (EPI_RATIOS[epiRatio] || 0);
    const volumeMl = count * drug.carpuleSize;
    const mgDelivered = volumeMl * drug.concentration;
    const epiDelivered = volumeMl * epiConc;

    return (
      <div key={`${drug.id}-${epiRatio}`} className="flex items-center gap-2">
        {/* Concentration label */}
        <div className={`w-20 flex-shrink-0 text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          {isPlain ? 'Plain' : epiRatio}
        </div>

        {/* Counter */}
        <button
          onClick={() => addCarpule(drug.id, epiRatio, -1)}
          disabled={count === 0 || !weightKg}
          aria-label={`Remove one ${drug.name} ${epiRatio} carpule`}
          className={`w-10 h-10 rounded-lg text-lg font-bold flex items-center justify-center btn-press focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
            count === 0 || !weightKg
              ? isDarkMode ? 'bg-or-dark-700/50 text-slate-600 cursor-not-allowed' : 'bg-slate-100 text-slate-300 cursor-not-allowed'
              : isDarkMode ? 'bg-or-dark-700 text-slate-200 hover:bg-or-dark-600' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          <Minus className="w-4 h-4" />
        </button>

        <div className="flex-1 text-center min-w-[60px]">
          <div className={`text-xl font-bold font-mono ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{count}</div>
          {count > 0 && (
            <div className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              {mgDelivered.toFixed(0)}mg
              {epiDelivered > 0 && (
                <span className={isDarkMode ? 'text-amber-400/70' : 'text-amber-600'}> · {(epiDelivered * 1000).toFixed(0)}mcg epi</span>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => addCarpule(drug.id, epiRatio, 1)}
          disabled={!weightKg}
          aria-label={`Add one ${drug.name} ${epiRatio} carpule`}
          className={`w-10 h-10 rounded-lg text-lg font-bold flex items-center justify-center btn-press focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
            !weightKg
              ? isDarkMode ? 'bg-or-dark-700/50 text-slate-600 cursor-not-allowed' : 'bg-slate-100 text-slate-300 cursor-not-allowed'
              : isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Syringe className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          <h2 className={`text-lg font-semibold font-display ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
            Drugs
          </h2>
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          aria-label={showInfo ? 'Hide info' : 'Show info'}
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
          isDarkMode ? 'bg-blue-500/5 border-blue-500/20 text-slate-300' : 'bg-blue-50 border-blue-200 text-slate-700'
        }`}>
          <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Fractional Toxicity Rule</h3>
          <p className="mb-2">When combining local anesthetics, toxicity is additive:</p>
          <div className={`p-2 rounded-lg font-mono text-center mb-2 ${isDarkMode ? 'bg-or-dark-900/50' : 'bg-white'}`}>
            (Dose₁ / Max₁) + (Dose₂ / Max₂) + ... ≤ 1.0 (100%)
          </div>
        </div>
      </div>

      {/* Gauges */}
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
            isPediatric ? ' (1 mcg/kg)' : (isCardiac || isPregnant) ? ' (Reduced)' : ' (Healthy)'
          }`}
          detail={`${calculations.totalEpi.toFixed(3)}mg (${(calculations.totalEpi * 1000).toFixed(0)} mcg)`}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Summary Strip */}
      {addedDrugs.length > 0 && (
        <div className={`rounded-xl px-4 py-2.5 text-sm font-medium text-center transition-colors ${
          summaryColor === 'red'
            ? isDarkMode ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-red-50 text-red-600 border border-red-200'
            : summaryColor === 'amber'
            ? isDarkMode ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-amber-50 text-amber-600 border border-amber-200'
            : isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
        }`}>
          <span className="font-mono">{calculations.totalFraction.toFixed(1)}%</span> toxicity
          {' · '}
          <span className="font-mono">{(calculations.totalEpi * 1000).toFixed(0)}</span> mcg epi (<span className="font-mono">{calculations.epiFraction.toFixed(0)}%</span>)
          {' · '}
          {calculations.activeDrugCount} drug{calculations.activeDrugCount !== 1 ? 's' : ''}
        </div>
      )}

      {/* Verification Banner */}
      <VerificationBanner
        toxicityPercent={calculations.totalFraction}
        epiPercent={calculations.epiFraction}
        weightKg={weightKg || 0}
        patientType={patientType}
        isCardiac={isCardiac}
        isPregnant={isPregnant}
        ageMonths={ageMonths}
        mrdStandard={mrdStandard}
        epiLimit={calculations.epiLimit}
        drugSummary={calculations.byDrug.map(d => ({
          drugName: d.drugName,
          carpuleCount: addedDrugs.filter(e => e.drugName === d.drugName).reduce((s, e) => s + e.carpuleCount, 0),
          mgDelivered: parseFloat(d.totalMg),
          percentOfMax: parseFloat(d.fraction)
        }))}
        isDarkMode={isDarkMode}
      />

      {/* Drug Cards */}
      <div className="grid grid-cols-1 gap-3">
        {visibleDrugs.map(drug => {
          const colors = getDrugColors(drug.color);
          const drugEntry = drugCarpules[drug.id] || {};
          const totalCount = getTotalCarpules(drugEntry);
          const mrd = getEffectiveMrd(drug, patientType, mrdStandard, ageMonths);
          const maxDose = weightKg > 0 ? Math.min(mrd.maxDosePerKg * weightKg, mrd.absoluteMax) : mrd.absoluteMax;
          const totalMg = Object.entries(drugEntry).reduce((sum, [, count]) => sum + count * drug.carpuleSize * drug.concentration, 0);
          const percentUsed = weightKg > 0 && totalCount > 0 ? (totalMg / maxDose) * 100 : 0;
          const warnings = isPediatric ? getDrugWarnings(drug, ageMonths, mrdStandard) : [];
          const isDisabledByPregnancy = isPregnant && drug.id === 'prilocaine-4-plain';

          // Determine which concentration rows to show
          const isPlainDrug = !drug.availableEpiRatios || drug.availableEpiRatios.length === 0;
          const defaultRatio = drug.defaultEpiRatio || 'plain';
          const concentrationRows = Object.keys(drugEntry);
          const hasMultiConcentration = drug.availableEpiRatios && drug.availableEpiRatios.length > 1;
          const unusedConcentrations = hasMultiConcentration
            ? drug.availableEpiRatios.filter(r => !concentrationRows.includes(r))
            : [];
          const showAddConc = hasMultiConcentration && unusedConcentrations.length > 0 && totalCount > 0;

          // Left border color based on dose level
          const borderLeftColor = totalCount > 0
            ? percentUsed > 100 ? '#ef4444' : percentUsed > 80 ? '#f59e0b' : '#10b981'
            : isDarkMode ? 'rgba(100,116,139,0.2)' : 'rgba(203,213,225,0.5)';

          return (
            <div
              key={drug.id}
              className={`rounded-2xl p-4 border-t border-r border-b transition-all relative ${colors.bg} ${colors.border} ${
                isDisabledByPregnancy ? 'opacity-50 pointer-events-none' : ''
              } border-l-4 overflow-hidden`}
              style={{ borderLeftColor }}
            >
              {isDisabledByPregnancy && (
                <div className={`absolute inset-0 rounded-2xl flex items-center justify-center z-10 pointer-events-none ${
                  isDarkMode ? 'bg-or-dark-900/60' : 'bg-white/60'
                }`}>
                  <span className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
                    isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'
                  }`}>Not recommended in pregnancy</span>
                </div>
              )}

              {/* Drug Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${colors.accent}`} />
                  <div className="min-w-0">
                    <h3 className={`font-semibold font-display ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                      {drug.name}
                    </h3>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {mrd.maxDosePerKg}mg/kg (max {mrd.absoluteMax}mg)
                      {isPediatric && <span className={isDarkMode ? 'text-teal-400' : 'text-teal-600'}> — {mrdStandard === 'aapd' ? 'AAPD' : 'FDA'}</span>}
                      {' · '}{drug.carpuleSize}mL
                    </p>
                    {totalCount > 0 && (
                      <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        {drug.onset && <span>Onset: {drug.onset}</span>}
                        {drug.onset && drug.duration && <span> · </span>}
                        {drug.duration && <span>Duration: {drug.duration}</span>}
                      </p>
                    )}
                  </div>
                </div>
                <span className={`text-lg font-bold font-mono flex-shrink-0 transition-opacity duration-200 ${
                  totalCount > 0 && weightKg > 0 ? 'opacity-100' : 'opacity-30'
                } ${
                  totalCount > 0 && weightKg > 0
                    ? percentUsed > 100 ? 'text-red-500' : percentUsed > 80 ? 'text-amber-500' : 'text-emerald-500'
                    : isDarkMode ? 'text-slate-500' : 'text-slate-400'
                }`}>{percentUsed.toFixed(0)}%</span>
              </div>

              {/* Pediatric warnings */}
              {warnings.length > 0 && (
                <div className={`mb-2 p-2 rounded-lg text-xs flex items-start gap-2 ${
                  isDarkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-700'
                }`}>
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <div>{warnings.map((w, i) => <p key={i}>{w}</p>)}</div>
                </div>
              )}

              {/* Concentration rows */}
              <div className="space-y-2">
                {concentrationRows.map(ratio =>
                  renderConcentrationRow(drug, ratio, drugEntry[ratio] || 0, ratio === defaultRatio)
                )}
              </div>

              {/* Add concentration button */}
              {showAddConc && (
                <div className="mt-2">
                  {unusedConcentrations.length === 1 ? (
                    <button
                      onClick={() => addConcentration(drug.id, unusedConcentrations[0])}
                      className={`text-xs font-medium ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                    >
                      + Add {unusedConcentrations[0]}
                    </button>
                  ) : (
                    <details className="relative">
                      <summary className={`text-xs font-medium cursor-pointer select-none ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>
                        + Add concentration
                      </summary>
                      <div className={`mt-1 p-2 rounded-lg space-y-1 ${isDarkMode ? 'bg-or-dark-700' : 'bg-white border border-slate-200'}`}>
                        {unusedConcentrations.map(ratio => (
                          <button
                            key={ratio}
                            onClick={() => {
                              addConcentration(drug.id, ratio);
                              // Close the details
                              const el = document.activeElement?.closest('details');
                              if (el) el.open = false;
                            }}
                            className={`block w-full text-left px-3 py-2 rounded-lg text-sm btn-press ${
                              isDarkMode ? 'hover:bg-or-dark-600 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            {ratio}
                          </button>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Hidden drugs explanation */}
      {hiddenDrugs.length > 0 && (
        <details>
          <summary className={`flex items-center gap-2 text-sm cursor-pointer select-none ${
            isDarkMode ? 'text-slate-500 hover:text-slate-400' : 'text-slate-400 hover:text-slate-500'
          }`}>
            <ChevronDown className="w-4 h-4" />
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
                  {drug.id === 'prilocaine-4-plain' && ' — Methemoglobinemia risk. Hidden for safety.'}
                </div>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Clear All */}
      <button
        onClick={clearAll}
        disabled={addedDrugs.length === 0}
        className={`w-full py-3 rounded-xl font-medium transition-all btn-press focus:outline-none focus:ring-2 focus:ring-red-500/50 ${
          addedDrugs.length === 0
            ? isDarkMode ? 'bg-red-500/5 text-red-400/40 border border-red-500/15 cursor-not-allowed' : 'bg-red-50/50 text-red-400 border border-red-200/50 cursor-not-allowed'
            : isDarkMode ? 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20' : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
        }`}
      >
        <Trash2 className="w-4 h-4 inline mr-2" />
        Clear All
      </button>

      {/* No weight warning */}
      {(!weightKg || weightKg <= 0) && (
        <div className={`rounded-2xl p-4 border ${isDarkMode ? 'bg-amber-500/5 border-amber-500/20' : 'bg-amber-50 border-amber-200'}`}>
          <p className={`text-sm text-center ${isDarkMode ? 'text-amber-400' : 'text-amber-700'}`}>
            Enter patient weight above to enable calculations
          </p>
        </div>
      )}
    </div>
  );
}
