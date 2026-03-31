import React, { useState, useRef, useEffect } from 'react';
import { Scale, Heart, AlertTriangle, User, Baby, Info, ShieldAlert, ChevronDown } from 'lucide-react';
import { validateWeightForAge, ageToMonths } from '../data/drugConstants';

// Custom age dropdown matching the app's design language
const AGE_OPTIONS = [
  ...Array.from({ length: 17 }, (_, i) => ({ value: String(i + 1), label: `${i + 1} yr` })),
  { value: 'adult', label: 'Adult' },
];

function AgeDropdown({ value, onChange, isDarkMode }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    if (isOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  const selected = AGE_OPTIONS.find(o => o.value === value) || AGE_OPTIONS[AGE_OPTIONS.length - 1];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 rounded-xl text-lg text-left flex items-center justify-between transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
          isDarkMode
            ? 'bg-or-dark-700 border border-slate-600/50 text-slate-100'
            : 'bg-slate-100 border border-slate-300 text-slate-900'
        }`}
      >
        <span>{selected.label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''} ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
      </button>

      {isOpen && (
        <div className={`absolute z-50 mt-1 w-full rounded-xl border shadow-lg overflow-hidden ${
          isDarkMode ? 'bg-or-dark-800 border-slate-700' : 'bg-white border-slate-200'
        }`}>
          <div className="max-h-60 overflow-y-auto py-1">
            {AGE_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                  opt.value === value
                    ? isDarkMode ? 'bg-blue-600/20 text-blue-400 font-semibold' : 'bg-blue-50 text-blue-600 font-semibold'
                    : isDarkMode ? 'text-slate-300 hover:bg-or-dark-700' : 'text-slate-700 hover:bg-slate-100'
                } ${opt.value === 'adult' ? `border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}` : ''}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

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
    <div className={`rounded-2xl p-4 mb-4 border transition-colors card-shadow relative z-20 ${
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

        {/* Patient Age — custom dropdown */}
        <div className="space-y-2">
          <label className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            <Baby className="w-4 h-4" />
            Patient Age
          </label>
          <AgeDropdown
            value={isPediatric ? String(ageYears) : 'adult'}
            onChange={(val) => {
              if (val === 'adult') {
                setPatientType('adult');
              } else {
                setPatientType('pediatric');
                setAgeYears(parseInt(val));
              }
            }}
            isDarkMode={isDarkMode}
          />
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

      {/* Clinical Considerations — collapsed by default, auto-opens when non-normal */}
      <details className="mt-4" open={hepaticStatus !== 'none' || renalImpairment || undefined}>
        <summary className={`flex items-center gap-2 text-sm cursor-pointer select-none list-none px-3 py-2 rounded-xl transition-colors ${
          isDarkMode ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/15' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
        }`}>
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium">Clinical Considerations</span>
          <span className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            — {hepaticStatus === 'none' ? 'Hepatic: Normal' : hepaticStatus === 'mild' ? 'Hepatic: Mild' : 'Hepatic: Mod-Severe'}
            {' · '}{renalImpairment ? 'Renal: Impaired' : 'Renal: Normal'}
          </span>
        </summary>
        <div className={`mt-2 p-3 rounded-xl border ${
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
      </details>
    </div>
  );
}
