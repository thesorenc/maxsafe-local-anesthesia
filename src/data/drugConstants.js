// Local Anesthetic Drug Constants
// Concentrations: percentage (%) means g/100mL, so 2% = 20mg/mL
// Epinephrine ratios: 1:100,000 = 0.01mg/mL = 10mcg/mL

// Available epinephrine concentration ratios
export const EPI_RATIOS = {
  '1:50,000':  0.02,
  '1:80,000':  0.0125,
  '1:100,000': 0.01,
  '1:200,000': 0.005,
};

// CDC weight-for-age reference data (3rd-97th percentile, sex-averaged)
// Used for weight validation only, not drug restrictions
const WEIGHT_FOR_AGE = [
  { minMonths: 6,   maxMonths: 11,  min: 5,  max: 13 },
  { minMonths: 12,  maxMonths: 35,  min: 6,  max: 20 },
  { minMonths: 36,  maxMonths: 71,  min: 10, max: 30 },
  { minMonths: 72,  maxMonths: 143, min: 15, max: 55 },
  { minMonths: 144, maxMonths: 215, min: 25, max: 100 },
];

export const LOCAL_ANESTHETICS = [
  {
    id: 'lidocaine-2-epi-100k',
    name: 'Lidocaine 2%',
    epiRatio: '1:100,000',
    concentration: 20, // mg/mL (2% = 20mg/mL)
    // Adult defaults (backward compatible)
    maxDosePerKg: 7,
    absoluteMax: 500,
    epiConcentration: 0.01, // mg/mL (1:100,000)
    carpuleSize: 1.7, // mL
    color: 'blue',
    category: 'amide',
    onset: '2-4 min',
    duration: '2.5-3.5 hrs',
    mrd: {
      adult:   { maxDosePerKg: 7.0, absoluteMax: 500 },
      pedAAPD: { maxDosePerKg: 4.4, absoluteMax: 300 },
      pedFDA:  { maxDosePerKg: 7.0, absoluteMax: 500 },
    },
    availableEpiRatios: ['1:50,000', '1:80,000', '1:100,000', '1:200,000'],
    defaultEpiRatio: '1:100,000',
    pediatric: {
      // Age restrictions by MRD standard
      fda:  { minAgeMonths: 6 },   // No specific FDA age restriction; app minimum is 6mo
      aapd: { minAgeMonths: 6 },   // AAPD lists for all pediatric ages
    }
  },
  {
    id: 'articaine-4-epi-100k',
    name: 'Articaine 4%',
    epiRatio: '1:100,000',
    concentration: 40,
    maxDosePerKg: 7,
    absoluteMax: 500,
    epiConcentration: 0.01,
    carpuleSize: 1.7,
    color: 'emerald',
    category: 'amide',
    onset: '1-9 min',
    duration: '1-2 hrs',
    halfLife: '44 min',
    mrd: {
      adult:   { maxDosePerKg: 7.0, absoluteMax: 500 },
      pedAAPD: { maxDosePerKg: 7.0, absoluteMax: 500 },
      pedFDA:  { maxDosePerKg: 7.0, absoluteMax: 500 },
    },
    availableEpiRatios: ['1:100,000', '1:200,000'],
    defaultEpiRatio: '1:100,000',
    pediatric: {
      // FDA label: not recommended <4 years. AAPD lists it with footnote re manufacturer rec.
      fda:  { minAgeMonths: 48 },  // 4 years per FDA labeling
      aapd: { minAgeMonths: 6 },   // AAPD does not restrict by age
    }
  },
  {
    id: 'bupivacaine-05-epi-200k',
    name: 'Bupivacaine 0.5%',
    epiRatio: '1:200,000',
    concentration: 5,
    maxDosePerKg: 2,
    absoluteMax: 90,
    epiConcentration: 0.005,
    carpuleSize: 1.8,
    color: 'amber',
    category: 'amide',
    onset: '2-10 min',
    duration: 'up to 7 hrs',
    halfLife: '2.7 hrs',
    mrd: {
      adult:   { maxDosePerKg: 2.0, absoluteMax: 90 },
      pedAAPD: { maxDosePerKg: 1.3, absoluteMax: 90 },
      pedFDA:  { maxDosePerKg: 2.0, absoluteMax: 90 },
    },
    availableEpiRatios: ['1:200,000'],
    defaultEpiRatio: '1:200,000',
    pediatric: {
      // Both FDA and AAPD: not recommended <12 years
      fda:  { minAgeMonths: 144 }, // 12 years
      aapd: { minAgeMonths: 144 }, // 12 years (AAPD: "long-acting LA not recommended for children")
      warnings: { general: 'Risk of prolonged soft tissue numbness and self-inflicted injury.' },
    }
  },
  {
    id: 'mepivacaine-3-plain',
    name: 'Mepivacaine 3%',
    epiRatio: 'Plain',
    concentration: 30,
    maxDosePerKg: 6.6,
    absoluteMax: 400,
    epiConcentration: 0,
    carpuleSize: 1.7,
    color: 'purple',
    category: 'amide',
    onset: '0.5-4 min',
    duration: '20-40 min',
    halfLife: '1.9-3.2 hrs',
    mrd: {
      adult:   { maxDosePerKg: 6.6, absoluteMax: 400 },
      pedAAPD: { maxDosePerKg: 4.4, absoluteMax: 300 },
      pedFDA:  { maxDosePerKg: 6.6, absoluteMax: 400 },
    },
    availableEpiRatios: [],
    defaultEpiRatio: null,
    pediatric: {
      fda:  { minAgeMonths: 6 },
      aapd: { minAgeMonths: 6 },
      warnings: { infantMonths: 12, infantWarning: 'Immature hepatic CYP enzymes — use lowest effective dose.' },
    }
  },
  {
    id: 'prilocaine-4-plain',
    name: 'Prilocaine 4%',
    epiRatio: 'Plain',
    concentration: 40,
    maxDosePerKg: 6, // Conservative per UpToDate (FDA label: 8 mg/kg)
    absoluteMax: 400, // Conservative per UpToDate (FDA label: 600 mg)
    epiConcentration: 0,
    carpuleSize: 1.8,
    color: 'cyan',
    category: 'amide',
    onset: '2-3 min',
    duration: '20 min - 2.5 hrs',
    halfLife: '1.6 hrs',
    mrd: {
      adult:   { maxDosePerKg: 6.0, absoluteMax: 400 },
      pedAAPD: { maxDosePerKg: 6.0, absoluteMax: 400 },
      pedFDA:  { maxDosePerKg: 8.0, absoluteMax: 600 },
    },
    availableEpiRatios: [],
    defaultEpiRatio: null,
    pediatric: {
      // FDA: no specific age restriction in dental label (but methemoglobinemia risk documented)
      // AAPD: relatively contraindicated in patients susceptible to methemoglobinemia; max 2.5 mg/kg <6yr
      fda:  { minAgeMonths: 6 },   // Hidden <6mo (universal safety)
      aapd: { minAgeMonths: 6 },   // Hidden <6mo; dose-capped <6yr in AAPD mode
      // AAPD-specific: reduce MRD to 2.5 mg/kg for children <6 years (72 months)
      aapdMethemoglobinemia: {
        maxAgeMonths: 71, // applies to ages <72 months (6 years)
        maxDosePerKg: 2.5,
        warning: 'Methemoglobinemia risk — max 2.5 mg/kg for children <6 years. Monitor SpO₂.',
      },
    }
  }
];

// Epinephrine limits
export const EPINEPHRINE_LIMITS = {
  healthy: 0.2,           // mg (200 mcg) — adult healthy
  cardiac: 0.04,          // mg (40 mcg) — adult cardiac/compromised
  pregnant: 0.04,         // mg (40 mcg) — pregnant (same as cardiac)
  pediatricPerKg: 0.001,  // mg/kg (1 mcg/kg) — pediatric weight-based
};

// --- Helper functions ---

/**
 * Check if a drug is available for the given age and MRD standard.
 */
export function isDrugAvailable(drug, ageMonths, mrdStandard) {
  const restrictions = mrdStandard === 'aapd' ? drug.pediatric.aapd : drug.pediatric.fda;
  return ageMonths >= restrictions.minAgeMonths;
}

/**
 * Get the effective MRD (maxDosePerKg and absoluteMax) for a drug
 * given the patient context.
 */
export function getEffectiveMrd(drug, patientType, mrdStandard, ageMonths) {
  if (patientType === 'adult') {
    return drug.mrd.adult;
  }

  // Pediatric mode
  const key = mrdStandard === 'aapd' ? 'pedAAPD' : 'pedFDA';
  let mrd = drug.mrd[key];

  // AAPD-specific: prilocaine methemoglobinemia dose cap for <6yr
  if (mrdStandard === 'aapd' && drug.pediatric.aapdMethemoglobinemia) {
    const rule = drug.pediatric.aapdMethemoglobinemia;
    if (ageMonths <= rule.maxAgeMonths) {
      mrd = { maxDosePerKg: rule.maxDosePerKg, absoluteMax: mrd.absoluteMax };
    }
  }

  return mrd;
}

/**
 * Compute the epinephrine limit for the current patient context.
 */
export function getEpiLimit(patientType, isCardiac, isPregnant, weightKg) {
  if (patientType === 'pediatric') {
    const weightBased = weightKg * EPINEPHRINE_LIMITS.pediatricPerKg;
    if (isCardiac) {
      return Math.min(weightBased, EPINEPHRINE_LIMITS.cardiac);
    }
    return weightBased;
  }

  if (isCardiac) return EPINEPHRINE_LIMITS.cardiac;
  if (isPregnant) return EPINEPHRINE_LIMITS.pregnant;
  return EPINEPHRINE_LIMITS.healthy;
}

/**
 * Get warnings for a drug at the given age.
 * Returns an array of warning strings.
 */
export function getDrugWarnings(drug, ageMonths, mrdStandard) {
  const warnings = [];

  // General warnings (e.g., bupivacaine soft tissue injury)
  if (drug.pediatric.warnings?.general) {
    warnings.push(drug.pediatric.warnings.general);
  }

  // Infant hepatic immaturity warning (mepivacaine)
  if (drug.pediatric.warnings?.infantMonths && ageMonths < drug.pediatric.warnings.infantMonths) {
    warnings.push(drug.pediatric.warnings.infantWarning);
  }

  // AAPD methemoglobinemia warning (prilocaine <6yr)
  if (mrdStandard === 'aapd' && drug.pediatric.aapdMethemoglobinemia) {
    const rule = drug.pediatric.aapdMethemoglobinemia;
    if (ageMonths <= rule.maxAgeMonths) {
      warnings.push(rule.warning);
    }
  }

  return warnings;
}

/**
 * Validate weight against expected CDC range for age.
 * Returns null if valid, or a warning string if outside range.
 */
export function validateWeightForAge(ageMonths, weightKg) {
  if (!ageMonths || ageMonths < 6 || !weightKg || weightKg <= 0) return null;

  const range = WEIGHT_FOR_AGE.find(r => ageMonths >= r.minMonths && ageMonths <= r.maxMonths);
  if (!range) return null;

  if (weightKg < range.min || weightKg > range.max) {
    let msg = `Weight of ${weightKg.toFixed(1)} kg is outside the typical range (${range.min}-${range.max} kg) for this age.`;
    if (weightKg > 40) {
      msg += ' Consider switching to Adult dosing.';
    }
    return msg;
  }
  return null;
}

/**
 * Get the effective epi concentration for a drug, considering user overrides.
 */
export function getEffectiveEpiConcentration(drug, epiOverrides) {
  if (!drug.availableEpiRatios || drug.availableEpiRatios.length === 0) {
    return drug.epiConcentration;
  }
  const selectedRatio = epiOverrides?.[drug.id];
  if (selectedRatio && EPI_RATIOS[selectedRatio] !== undefined) {
    return EPI_RATIOS[selectedRatio];
  }
  return drug.epiConcentration;
}

/**
 * Convert age input to months for internal use.
 * Accepts { years, months } object.
 */
export function ageToMonths(years, months = 0) {
  return (years || 0) * 12 + (months || 0);
}
