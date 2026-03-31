import React, { useState, useMemo, useEffect } from 'react';
import { Shield, AlertTriangle, Moon, Sun, RefreshCw, Info } from 'lucide-react';
import GlobalSettings from './components/GlobalSettings';
import LocalAnesthesiaCalculator from './components/LocalAnesthesiaCalculator';

function App() {
  // Theme state - check localStorage or system preference
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('maxsafe-theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Global state
  const [weight, setWeight] = useState(70);
  const [weightUnit, setWeightUnit] = useState('kg');
  const [isCardiac, setIsCardiac] = useState(false);
  const [isPregnant, setIsPregnant] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  // Pediatric mode state
  const [patientType, setPatientType] = useState('adult'); // 'adult' | 'pediatric'
  const [ageTier, setAgeTier] = useState('school-age');
  const [mrdStandard, setMrdStandard] = useState('aapd'); // 'aapd' | 'fda'

  // Organ impairment state (advisory only — no dose modifications)
  const [hepaticStatus, setHepaticStatus] = useState('none'); // 'none' | 'mild' | 'moderate-severe'
  const [renalImpairment, setRenalImpairment] = useState(false);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('maxsafe-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Calculate weight in kg for all calculations
  const weightKg = useMemo(() => {
    if (!weight || weight <= 0) return 0;
    return weightUnit === 'kg' ? weight : weight / 2.205;
  }, [weight, weightUnit]);

  // Reset all data (resetKey increment triggers child state resets)
  const handleReset = () => {
    if (confirm('Reset all patient data?')) {
      setWeight(70);
      setWeightUnit('kg');
      setIsCardiac(false);
      setIsPregnant(false);
      setPatientType('adult');
      setAgeTier('school-age');
      setMrdStandard('aapd');
      setHepaticStatus('none');
      setRenalImpairment(false);
      setResetKey(k => k + 1);
    }
  };

  // Toggle theme
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDarkMode
        ? 'bg-or-dark-900 text-slate-100'
        : 'bg-slate-100 text-slate-900'
    }`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-sm border-b transition-colors duration-200 ${
        isDarkMode
          ? 'bg-or-dark-900/95 border-slate-800'
          : 'bg-white/95 border-slate-200'
      }`}>
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-xl font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                  MaxSafe
                </h1>
                <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  Local Anesthesia Calculator
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                  isDarkMode
                    ? 'hover:bg-or-dark-700'
                    : 'hover:bg-slate-200'
                }`}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-amber-400" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-600" />
                )}
              </button>
              <button
                onClick={handleReset}
                className={`p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                  isDarkMode
                    ? 'hover:bg-or-dark-700'
                    : 'hover:bg-slate-200'
                }`}
                aria-label="Reset all data"
                title="Reset all data"
              >
                <RefreshCw className={`w-5 h-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-4">
        {/* Global Settings */}
        <GlobalSettings
          weight={weight}
          setWeight={setWeight}
          weightUnit={weightUnit}
          setWeightUnit={setWeightUnit}
          isCardiac={isCardiac}
          setIsCardiac={setIsCardiac}
          isPregnant={isPregnant}
          setIsPregnant={setIsPregnant}
          patientType={patientType}
          setPatientType={setPatientType}
          ageTier={ageTier}
          setAgeTier={setAgeTier}
          mrdStandard={mrdStandard}
          setMrdStandard={setMrdStandard}
          hepaticStatus={hepaticStatus}
          setHepaticStatus={setHepaticStatus}
          renalImpairment={renalImpairment}
          setRenalImpairment={setRenalImpairment}
          isDarkMode={isDarkMode}
        />

        {/* Status Warning Banners — inline between settings and calculator */}
        {(isCardiac || isPregnant || hepaticStatus !== 'none' || renalImpairment) && (
          <div role="alert" className="space-y-2 mt-4">
            {isCardiac && (
              <div className={`py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm ${
                isDarkMode ? 'bg-amber-600/20 text-amber-400' : 'bg-amber-100 text-amber-700'
              }`}>
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">Cardiac/Compromised Patient — Epi limit: 0.04mg</span>
              </div>
            )}
            {isPregnant && (
              <div className={`py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm ${
                isDarkMode ? 'bg-purple-600/20 text-purple-400' : 'bg-purple-100 text-purple-700'
              }`}>
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">Pregnant Patient — Epi limit: 0.04mg. Prefer lidocaine. Avoid prilocaine.</span>
              </div>
            )}
            {hepaticStatus === 'moderate-severe' && (
              <div className={`py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm ${
                isDarkMode ? 'bg-orange-600/20 text-orange-400' : 'bg-orange-100 text-orange-700'
              }`}>
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">Hepatic Impairment — Reduce dose. Prefer articaine (extraplasmatic metabolism).</span>
              </div>
            )}
            {hepaticStatus === 'mild' && (
              <div className={`py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm ${
                isDarkMode ? 'bg-yellow-600/15 text-yellow-400' : 'bg-yellow-50 text-yellow-700'
              }`}>
                <Info className="w-4 h-4" />
                <span className="font-medium">Mild Hepatic Impairment — Use minimum effective dose. Consider articaine.</span>
              </div>
            )}
            {renalImpairment && (
              <div className={`py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm ${
                isDarkMode ? 'bg-blue-600/15 text-blue-400' : 'bg-blue-50 text-blue-700'
              }`}>
                <Info className="w-4 h-4" />
                <span className="font-medium">Renal Impairment — Verify electrolytes. Prefer articaine. Avoid repeated doses.</span>
              </div>
            )}
          </div>
        )}

        {/* Calculator */}
        <div className="mt-4">
          <LocalAnesthesiaCalculator
            weightKg={weightKg}
            isCardiac={isCardiac}
            isPregnant={isPregnant}
            patientType={patientType}
            ageTier={ageTier}
            mrdStandard={mrdStandard}
            hepaticStatus={hepaticStatus}
            renalImpairment={renalImpairment}
            isDarkMode={isDarkMode}
            resetKey={resetKey}
          />
        </div>

        {/* Medical Disclaimer */}
        <div className={`mt-6 rounded-2xl p-4 border text-xs ${
          isDarkMode
            ? 'bg-or-dark-800/50 border-slate-700/50 text-slate-500'
            : 'bg-slate-50 border-slate-200 text-slate-400'
        }`}>
          <p className="font-medium mb-1">Disclaimer</p>
          <p>
            This calculator is intended as a clinical decision support tool only. It does not replace
            professional judgment. Always verify doses independently and consider patient-specific
            factors (hepatic/renal function, drug interactions, age, comorbidities). The authors
            assume no liability for clinical decisions made using this tool.
          </p>
        </div>
      </main>

    </div>
  );
}

export default App;
