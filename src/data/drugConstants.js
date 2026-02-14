// Local Anesthetic Drug Constants
// Concentrations: percentage (%) means g/100mL, so 2% = 20mg/mL
// Epinephrine ratios: 1:100,000 = 0.01mg/mL = 10mcg/mL

export const LOCAL_ANESTHETICS = [
  {
    id: 'lidocaine-2-epi-100k',
    name: 'Lidocaine 2%',
    epiRatio: '1:100,000',
    concentration: 20, // mg/mL (2% = 20mg/mL)
    maxDosePerKg: 7, // mg/kg
    absoluteMax: 500, // mg
    epiConcentration: 0.01, // mg/mL (1:100,000)
    carpuleSize: 1.7, // mL
    color: 'blue',
    category: 'amide',
    onset: '2-4 min',
    duration: '2.5-3.5 hrs'
  },
  {
    id: 'articaine-4-epi-100k',
    name: 'Articaine 4%',
    epiRatio: '1:100,000',
    concentration: 40, // mg/mL (4% = 40mg/mL)
    maxDosePerKg: 7,
    absoluteMax: 500, // Conservative ceiling
    epiConcentration: 0.01,
    carpuleSize: 1.7, // mL
    color: 'emerald',
    category: 'amide',
    onset: '1-9 min',
    duration: '1-2 hrs',
    halfLife: '44 min'
  },
  {
    id: 'bupivacaine-05-epi-100k',
    name: 'Bupivacaine 0.5%',
    epiRatio: '1:100,000',
    concentration: 5, // mg/mL (0.5% = 5mg/mL)
    maxDosePerKg: 2,
    absoluteMax: 90,
    epiConcentration: 0.01,
    carpuleSize: 1.8, // mL - Marcaine uses 1.8mL carpules
    color: 'amber',
    category: 'amide',
    onset: '2-10 min',
    duration: 'up to 7 hrs',
    halfLife: '2.7 hrs'
  },
  {
    id: 'mepivacaine-3-plain',
    name: 'Mepivacaine 3%',
    epiRatio: 'Plain',
    concentration: 30, // mg/mL (3% = 30mg/mL)
    maxDosePerKg: 6.6,
    absoluteMax: 400,
    epiConcentration: 0, // No epinephrine
    carpuleSize: 1.7, // mL
    color: 'purple',
    category: 'amide',
    onset: '0.5-4 min',
    duration: '20-40 min',
    halfLife: '1.9-3.2 hrs'
  },
  {
    id: 'prilocaine-4-plain',
    name: 'Prilocaine 4%',
    epiRatio: 'Plain',
    concentration: 40, // mg/mL (4% = 40mg/mL)
    maxDosePerKg: 6, // Updated per UpToDate
    absoluteMax: 400, // Updated per UpToDate
    epiConcentration: 0,
    carpuleSize: 1.7, // mL
    color: 'cyan',
    category: 'amide',
    onset: '2-3 min',
    duration: '20 min - 2.5 hrs',
    halfLife: '1.6 hrs'
  }
];

// Epinephrine limits
export const EPINEPHRINE_LIMITS = {
  healthy: 0.2, // mg (200 mcg)
  cardiac: 0.04 // mg (40 mcg) - for cardiac/medically compromised
};
