import React, { useState, useMemo, useEffect } from 'react';
import { Shield, AlertTriangle, Moon, Sun, RefreshCw } from 'lucide-react';
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
  const [resetKey, setResetKey] = useState(0);

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
          isDarkMode={isDarkMode}
        />

        {/* Calculator */}
        <div className="mt-4">
          <LocalAnesthesiaCalculator
            weightKg={weightKg}
            isCardiac={isCardiac}
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

      {/* Cardiac Warning Banner */}
      {isCardiac && (
        <div role="alert" className={`fixed top-[72px] left-0 right-0 py-2 px-4 z-40 ${
          isDarkMode
            ? 'bg-amber-600/20 border-b border-amber-500/30'
            : 'bg-amber-100 border-b border-amber-300'
        }`}>
          <div className={`max-w-2xl mx-auto flex items-center justify-center gap-2 text-sm ${
            isDarkMode ? 'text-amber-400' : 'text-amber-700'
          }`}>
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">Cardiac/Compromised Patient - Epi limit: 0.04mg</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
