import React from 'react';
import { Scale, Heart, AlertTriangle, User, Baby, Info, ShieldAlert } from 'lucide-react';
import { validateWeightForAge, ageToMonths } from '../data/drugConstants';

export default function GlobalSettings({
  weight,
  setWeight,
  weightUnit,
  setWeightUnit,
  isCardiac,
  setIsCardiac,
  isPregnant,
  setIsPregnant,
  patientType,
  setPatientType,
  ageYears,
  setAgeYears,
  mrdStandard,
  setMrdStandard,
  hepaticStatus,
  setHepaticStatus,
  renalImpairment,
  setRenalImpairment,
  isDarkMode
}) {
  // Convert weight when unit changes
  const handleUnitChange = (newUnit) => {
    if (newUnit === weightUnit) return;

    if (newUnit === 'kg' && weightUnit === 'lbs') {
      setWeight(Math.round(weight / 2.205 * 10) / 10);
    } else if (newUnit === 'lbs' && weightUnit === 'kg') {
      setWeight(Math.round(weight * 2.205 * 10) / 10);
    }
    setWeightUnit(newUnit);
  };

  // Get weight in kg for display/validation
  const weightInKg = weightUnit === 'kg' ? weight : weight / 2.205;

  const isPediatric = patientType === 'pediatric';

  // Weight-for-age validation (pediatric only)
  const ageMonths = ageToMonths(ageYears);
  const weightWarning = isPediatric && weightInKg > 0 && ageYears > 0
    ? validateWeightForAge(ageMonths, weightInKg)
    : null;

  // Segmented control button helper
  const segBtn = (isActive, activeColor, onClick, children) => (
    <button
      onClick={onClick}
      aria-pressed={isActive}
      className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-150 touch-manipulation select-none flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
        isActive
          ? `${activeColor} text-white shadow-lg`
          : isDarkMode
            ? 'bg-or-dark-700 text-slate-400 hover:bg-or-dark-600 border border-slate-600/50'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300'
      }`}
    >
      {children}
    </button>
  );

  // Small toggle button for secondary controls
  const smallToggle = (isActive, activeColor, onClick, label) => (
    <button
      onClick={onClick}
      aria-pressed={isActive}
      className={`py-2 px-3 rounded-lg text-sm font-medium transition-all duration-150 touch-manipulation select-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
        isActive
          ? `${activeColor} text-white shadow-md`
          : isDarkMode
            ? 'bg-or-dark-700 text-slate-400 hover:bg-or-dark-600 border border-slate-600/50'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className={`rounded-2xl p-4 mb-4 border transition-colors ${
      isDarkMode
        ? 'bg-or-dark-800/80 border-slate-700/50'
        : 'bg-white border-slate-200'
    }`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <User className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
        <h2 className={`text-lg font-semibold font-display ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
          Patient Settings
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weight Input */}
        <div className="space-y-2">
          <label className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            <Scale className="w-4 h-4" />
            Patient Weight
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={weight || ''}
              onChange={(e) => setWeight(Math.max(0, parseFloat(e.target.value) || 0))}
              placeholder="Enter weight"
              className={`min-w-0 flex-1 px-4 py-3 rounded-xl text-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                isDarkMode
                  ? 'bg-or-dark-700 border border-slate-600/50 text-slate-100 placeholder-slate-500'
                  : 'bg-slate-100 border border-slate-300 text-slate-900 placeholder-slate-400'
              }`}
              min="0"
              step="0.1"
            />
            <div className={`flex-shrink-0 flex rounded-xl overflow-hidden border ${
              isDarkMode ? 'border-slate-600/50' : 'border-slate-300'
            }`}>
              <button
                onClick={() => handleUnitChange('kg')}
                className={`px-3 py-2 text-sm font-medium transition-all ${
                  weightUnit === 'kg'
                    ? 'bg-blue-600 text-white'
                    : isDarkMode
                      ? 'bg-or-dark-700 text-slate-400 hover:bg-or-dark-600'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                kg
              </button>
              <button
                onClick={() => handleUnitChange('lbs')}
                className={`px-3 py-2 text-sm font-medium transition-all ${
                  weightUnit === 'lbs'
                    ? 'bg-blue-600 text-white'
                    : isDarkMode
                      ? 'bg-or-dark-700 text-slate-400 hover:bg-or-dark-600'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                lbs
              </button>
            </div>
          </div>
          {weightWarning && (
            <p className={`text-xs flex items-start gap-1 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
              <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
              {weightWarning}
            </p>
          )}
        </div>

        {/* Patient Age */}
        <div className="space-y-2">
          <label className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            <Baby className="w-4 h-4" />
            Patient Age
          </label>
          <select
            value={isPediatric ? String(ageYears) : 'adult'}
            onChange={(e) => {
              if (e.target.value === 'adult') {
                setPatientType('adult');
              } else {
                setPatientType('pediatric');
                setAgeYears(parseInt(e.target.value));
              }
            }}
            className={`w-full px-4 py-3 rounded-xl text-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
              isDarkMode
                ? 'bg-or-dark-700 border border-slate-600/50 text-slate-100'
                : 'bg-slate-100 border border-slate-300 text-slate-900'
            }`}
          >
            {Array.from({ length: 17 }, (_, i) => i + 1).map(age => (
              <option key={age} value={String(age)}>{age} yr</option>
            ))}
            <option value="adult">Adult</option>
          </select>
          {isPediatric && (
            <div className="flex gap-2 items-center">
              <span className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>MRD:</span>
              {smallToggle(
                mrdStandard === 'aapd',
                'bg-blue-600',
                () => setMrdStandard('aapd'),
                'AAPD'
              )}
              {smallToggle(
                mrdStandard === 'fda',
                'bg-slate-600',
                () => setMrdStandard('fda'),
                'FDA'
              )}
            </div>
          )}
          {isPediatric && weightInKg > 40 && (
            <p className={`text-xs flex items-start gap-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
              Weight exceeds 40 kg. Consider Adult dosing.
            </p>
          )}
        </div>
      </div>

      {/* Patient Status — Cardiac and Pregnant are independent toggles */}
      <div className="mt-4 space-y-2">
        <label className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          <Heart className="w-4 h-4" />
          Patient Status
        </label>
        <div className="flex gap-2">
          {segBtn(
            isCardiac,
            'bg-amber-600 shadow-amber-500/25',
            () => setIsCardiac(!isCardiac),
            <><AlertTriangle className="w-4 h-4" /> Cardiac</>
          )}
          {segBtn(
            isPregnant,
            'bg-purple-600 shadow-purple-500/25',
            () => setIsPregnant(!isPregnant),
            <><span className="text-lg">♀</span> Pregnant</>
          )}
        </div>
        {(isCardiac || isPregnant) && (
          <p className={`text-xs flex items-center gap-1 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
            <AlertTriangle className="w-3 h-3" />
            Epi limit: 0.04mg (40 mcg){isPregnant ? '. Prefer lidocaine. Avoid prilocaine.' : ''}
          </p>
        )}
      </div>

      {/* Clinical Considerations — always visible */}
      <div className="mt-4">
        <label className={`flex items-center gap-2 text-sm mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          <ShieldAlert className="w-4 h-4" />
          Clinical Considerations
          {(hepaticStatus !== 'none' || renalImpairment) && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400">
              Active
            </span>
          )}
        </label>
        <div className={`p-3 rounded-xl border ${
          isDarkMode ? 'bg-or-dark-700/50 border-slate-600/50' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="grid grid-cols-2 gap-3">
            {/* Hepatic Impairment */}
            <div className="space-y-1">
              <label className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Hepatic
              </label>
              <div className="flex flex-col gap-1.5">
                {smallToggle(
                  hepaticStatus === 'none',
                  'bg-emerald-600',
                  () => setHepaticStatus('none'),
                  'Normal'
                )}
                {smallToggle(
                  hepaticStatus === 'mild',
                  'bg-yellow-600',
                  () => setHepaticStatus('mild'),
                  'Mild'
                )}
                {smallToggle(
                  hepaticStatus === 'moderate-severe',
                  'bg-orange-600',
                  () => setHepaticStatus('moderate-severe'),
                  'Mod-Severe'
                )}
              </div>
            </div>

            {/* Renal Impairment */}
            <div className="space-y-1">
              <label className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Renal
              </label>
              <div className="flex flex-col gap-1.5">
                {smallToggle(
                  !renalImpairment,
                  'bg-emerald-600',
                  () => setRenalImpairment(false),
                  'Normal'
                )}
                {smallToggle(
                  renalImpairment,
                  'bg-blue-600',
                  () => setRenalImpairment(true),
                  'Impaired'
                )}
              </div>
            </div>
          </div>
          <p className={`text-xs mt-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            Advisory only — no dose modifications.
          </p>
        </div>
      </div>
    </div>
  );
}
