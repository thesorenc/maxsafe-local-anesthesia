import React from 'react';
import { Scale, Heart, AlertTriangle, User } from 'lucide-react';

export default function GlobalSettings({
  weight,
  setWeight,
  weightUnit,
  setWeightUnit,
  isCardiac,
  setIsCardiac,
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

  // Get weight in kg for calculations
  const weightInKg = weightUnit === 'kg' ? weight : weight / 2.205;

  return (
    <div className={`rounded-2xl p-4 mb-4 border transition-colors ${
      isDarkMode
        ? 'bg-or-dark-800/80 border-slate-700/50'
        : 'bg-white border-slate-200'
    }`}>
      <div className="flex items-center gap-2 mb-4">
        <User className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
        <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
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
          {weight > 0 && (
            <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              = {weightInKg.toFixed(1)} kg
            </p>
          )}
        </div>

        {/* Patient Status */}
        <div className="space-y-2">
          <label className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            <Heart className="w-4 h-4" />
            Patient Status
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setIsCardiac(false)}
              aria-pressed={!isCardiac}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-150 touch-manipulation select-none flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                !isCardiac
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                  : isDarkMode
                    ? 'bg-or-dark-700 text-slate-400 hover:bg-or-dark-600 border border-slate-600/50'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              <span className="text-lg">✓</span>
              Healthy
            </button>
            <button
              onClick={() => setIsCardiac(true)}
              aria-pressed={isCardiac}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-150 touch-manipulation select-none flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                isCardiac
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/25'
                  : isDarkMode
                    ? 'bg-or-dark-700 text-slate-400 hover:bg-or-dark-600 border border-slate-600/50'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              Cardiac
            </button>
          </div>
          {isCardiac && (
            <p className={`text-xs flex items-center gap-1 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
              <AlertTriangle className="w-3 h-3" />
              Epinephrine limit: 0.04mg (40 mcg)
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
