// Local Anesthetic Drug Constants
// Concentrations: percentage (%) means g/100mL, so 2% = 20mg/mL
// Epinephrine ratios: 1:100,000 = 0.01mg/mL = 10mcg/mL

// Age tier definitions for pediatric mode
// Weight ranges from CDC growth charts (3rd-97th percentile, sex-averaged)
export const AGE_TIERS = [
  { id: 'infant',      label: 'Infant (6-11 mo)',      minMonths: 6,   maxMonths: 11,
    weightRange: { min: 5, max: 13, p50: 8 } },
  { id: 'toddler',     label: 'Toddler (1-3 yr)',      minMonths: 12,  maxMonths: 47,
    weightRange: { min: 6, max: 20, p50: 12 } },
  { id: 'young-child', label: 'Young Child (4-6 yr)',   minMonths: 48,  maxMonths: 83,
    weightRange: { min: 10, max: 30, p50: 19 } },
  { id: 'school-age',  label: 'School Age (7-11 yr)',   minMonths: 84,  maxMonths: 143,
    weightRange: { min: 15, max: 55, p50: 30 } },
  { id: 'adolescent',  label: 'Adolescent (12-17 yr)',  minMonths: 144, maxMonths: 215,
    weightRange: { min: 25, max: 100, p50: 50 } },
];

// Tier ordering for comparison (lower index = younger)
const TIER_ORDER = ['infant', 'toddler', 'young-child', 'school-age', 'adolescent'];

// Available epinephrine concentration ratios
export const EPI_RATIOS = {
  '1:80,000':  0.0125,
  '1:100,000': 0.01,
  '1:200,000': 0.005,
};

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
    // MRD values by dosing standard
    mrd: {
      adult:   { maxDosePerKg: 7.0, absoluteMax: 500 },
      pedAAPD: { maxDosePerKg: 4.4, absoluteMax: 300 },
      pedFDA:  { maxDosePerKg: 7.0, absoluteMax: 500 },
    },
    // Available epi concentrations for this formulation
    availableEpiRatios: ['1:80,000', '1:100,000', '1:200,000'],
    defaultEpiRatio: '1:100,000',
    // Pediatric restrictions and warnings
    pediatric: {
      minAgeTier: 'infant', // available from 6 months
      warnings: {},
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
      pedAAPD: { maxDosePerKg: 7.0, absoluteMax: 500 }, // AAPD Table: same as FDA
      pedFDA:  { maxDosePerKg: 7.0, absoluteMax: 500 },
    },
    availableEpiRatios: ['1:100,000', '1:200,000'],
    defaultEpiRatio: '1:100,000',
    pediatric: {
      minAgeTier: 'young-child', // FDA: not recommended <4 years
      warnings: {},
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
      minAgeTier: 'adolescent', // FDA + AAPD: not recommended <12 years
      warnings: {
        general: 'Risk of prolonged soft tissue numbness and self-inflicted injury.',
      },
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
      minAgeTier: 'infant', // available from 6 months
      warnings: {
        infant: 'Immature hepatic CYP enzymes in infants — use lowest effective dose.',
      },
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
      pedAAPD: { maxDosePerKg: 6.0, absoluteMax: 400 }, // Not in AAPD Table; from endorsed literature
      pedFDA:  { maxDosePerKg: 8.0, absoluteMax: 600 },
    },
    availableEpiRatios: [],
    defaultEpiRatio: null,
    pediatric: {
      minAgeTier: 'toddler', // hidden for infants (methemoglobinemia)
      warnings: {
        toddler:       'Methemoglobinemia risk — max 2.5 mg/kg for children <6 years. Monitor SpO₂.',
        'young-child': 'Methemoglobinemia risk — max 2.5 mg/kg for children <6 years. Monitor SpO₂.',
      },
      // Override MRD for young tiers due to methemoglobinemia risk
      mrdOverrides: {
        toddler:       { maxDosePerKg: 2.5, absoluteMax: 400 },
        'young-child': { maxDosePerKg: 2.5, absoluteMax: 400 },
      }
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
 * Check if a drug is available for the given age tier in pediatric mode.
 */
export function isDrugAvailableForTier(drug, ageTierId) {
  const minTierIndex = TIER_ORDER.indexOf(drug.pediatric.minAgeTier);
  const currentTierIndex = TIER_ORDER.indexOf(ageTierId);
  return currentTierIndex >= minTierIndex;
}

/**
 * Get the effective MRD (maxDosePerKg and absoluteMax) for a drug
 * given the patient context.
 */
export function getEffectiveMrd(drug, patientType, mrdStandard, ageTierId) {
  if (patientType === 'adult') {
    return drug.mrd.adult;
  }

  // Pediatric mode
  const key = mrdStandard === 'aapd' ? 'pedAAPD' : 'pedFDA';
  let mrd = drug.mrd[key];

  // Check for age-tier-specific MRD overrides (e.g., prilocaine <6yr)
  if (drug.pediatric.mrdOverrides && drug.pediatric.mrdOverrides[ageTierId]) {
    mrd = drug.pediatric.mrdOverrides[ageTierId];
  }

  return mrd;
}

/**
 * Compute the epinephrine limit for the current patient context.
 */
export function getEpiLimit(patientType, isCardiac, isPregnant, weightKg) {
  if (patientType === 'pediatric') {
    const weightBased = weightKg * EPINEPHRINE_LIMITS.pediatricPerKg;
    // For pediatric cardiac patients, use the lesser of weight-based and cardiac limit
    if (isCardiac) {
      return Math.min(weightBased, EPINEPHRINE_LIMITS.cardiac);
    }
    return weightBased;
  }

  // Adult
  if (isCardiac) return EPINEPHRINE_LIMITS.cardiac;
  if (isPregnant) return EPINEPHRINE_LIMITS.pregnant;
  return EPINEPHRINE_LIMITS.healthy;
}

/**
 * Get warnings for a drug at the given age tier.
 * Returns an array of warning strings.
 */
export function getDrugWarnings(drug, ageTierId) {
  const warnings = [];
  if (drug.pediatric.warnings[ageTierId]) {
    warnings.push(drug.pediatric.warnings[ageTierId]);
  }
  if (drug.pediatric.warnings.general) {
    warnings.push(drug.pediatric.warnings.general);
  }
  return warnings;
}

/**
 * Validate weight against expected range for age tier.
 * Returns null if valid, or a warning string if outside range.
 */
export function validateWeightForAge(ageTierId, weightKg) {
  const tier = AGE_TIERS.find(t => t.id === ageTierId);
  if (!tier || !weightKg || weightKg <= 0) return null;

  const { min, max } = tier.weightRange;
  if (weightKg < min || weightKg > max) {
    return `Weight of ${weightKg.toFixed(1)} kg is outside the typical range (${min}-${max} kg) for ${tier.label}. Please verify.`;
  }
  return null;
}

/**
 * Get the effective epi concentration for a drug, considering user overrides.
 */
export function getEffectiveEpiConcentration(drug, epiOverrides) {
  if (!drug.availableEpiRatios || drug.availableEpiRatios.length === 0) {
    return drug.epiConcentration; // Plain drugs: always 0
  }
  const selectedRatio = epiOverrides?.[drug.id];
  if (selectedRatio && EPI_RATIOS[selectedRatio] !== undefined) {
    return EPI_RATIOS[selectedRatio];
  }
  return drug.epiConcentration; // Default
}
