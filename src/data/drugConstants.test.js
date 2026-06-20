import { describe, it, expect } from 'vitest';
import { LOCAL_ANESTHETICS, getEffectiveMrd, getMethemoglobinemiaCap } from './drugConstants';

// Mirrors the calculator's systemic-LAST denominator: min(mgPerKg * weight, absoluteMax).
const effectiveMax = (mrd, weightKg) => Math.min(mrd.maxDosePerKg * weightKg, mrd.absoluteMax);

describe('Systemic-LAST MRD invariant — a pediatric ceiling must never exceed the adult ceiling', () => {
  // min(p*w, P) <= min(a*w, A) for ALL weights iff p <= a AND P <= A (both terms monotone).
  // Guards the original "a child appears to tolerate more than an adult" inversion.
  // Applies to the SYSTEMIC (LAST) rows only — methemoglobinemia is a separate axis (below).
  for (const drug of LOCAL_ANESTHETICS) {
    const { adult } = drug.mrd;
    for (const pedKey of ['pedFDA', 'pedAAPD']) {
      const ped = drug.mrd[pedKey];
      it(`${drug.name}: ${pedKey} mg/kg (${ped.maxDosePerKg}) <= adult (${adult.maxDosePerKg})`, () => {
        expect(ped.maxDosePerKg).toBeLessThanOrEqual(adult.maxDosePerKg);
      });
      it(`${drug.name}: ${pedKey} absoluteMax (${ped.absoluteMax}) <= adult (${adult.absoluteMax})`, () => {
        expect(ped.absoluteMax).toBeLessThanOrEqual(adult.absoluteMax);
      });
    }
  }
});

describe('Prilocaine 4% plain — LAST sum uses the systemic ceiling, not the metHb cap', () => {
  const prilo = LOCAL_ANESTHETICS.find((d) => d.id === 'prilocaine-4-plain');

  it('LAST ceilings are systemic (8/600 FDA, 6/600 conservative) — never the 400 mg metHb cap', () => {
    expect(prilo.mrd.adult).toEqual({ maxDosePerKg: 8.0, absoluteMax: 600 });
    expect(prilo.mrd.pedFDA).toEqual({ maxDosePerKg: 8.0, absoluteMax: 600 });
    expect(prilo.mrd.pedAAPD).toEqual({ maxDosePerKg: 6.0, absoluteMax: 600 });
  });

  it('no child>adult inversion at 70 kg: adult and 5yr-FDA share the systemic ceiling (both 560 mg)', () => {
    const adultMax = effectiveMax(getEffectiveMrd(prilo, 'adult', 'fda'), 70);
    const pedFdaMax = effectiveMax(getEffectiveMrd(prilo, 'pediatric', 'fda'), 70);
    expect(adultMax).toBe(560); // min(8*70, 600)
    expect(pedFdaMax).toBe(560);
    expect(pedFdaMax).toBeLessThanOrEqual(adultMax);
  });

  it('AAPD mode no longer collapses prilocaine LAST onto a metHb cap (the old conflation bug)', () => {
    expect(getEffectiveMrd(prilo, 'pediatric', 'aapd')).toEqual({ maxDosePerKg: 6.0, absoluteMax: 600 });
  });
});

describe('Methemoglobinemia — separate, prilocaine-only axis, applied in all modes', () => {
  const prilo = LOCAL_ANESTHETICS.find((d) => d.id === 'prilocaine-4-plain');

  it('only prilocaine carries a metHb cap; every other amide returns null', () => {
    for (const drug of LOCAL_ANESTHETICS) {
      const cap = getMethemoglobinemiaCap(drug, 70, 480);
      if (drug.id === 'prilocaine-4-plain') expect(cap).toBe(400);
      else expect(cap).toBeNull();
    }
  });

  it('older child / adult uses the 400 mg Citanest Plain absolute cap', () => {
    expect(getMethemoglobinemiaCap(prilo, 70, 480)).toBe(400); // adult
    expect(getMethemoglobinemiaCap(prilo, 40, 120)).toBe(400); // 10 yr, 40 kg (>=6 yr)
  });

  it('young child (<6 yr) uses the stricter 2.5 mg/kg cap', () => {
    expect(getMethemoglobinemiaCap(prilo, 20, 60)).toBe(50);  // 5 yr, 20 kg: min(400, 2.5*20)
    expect(getMethemoglobinemiaCap(prilo, 70, 60)).toBe(175); // min(400, 2.5*70)
  });

  it('reported case (70 kg, 360 mg): metHb 90% adult / 206% at 5 yr, while LAST stays 64% either age', () => {
    // metHb axis (separate from the additive sum)
    expect((360 / getMethemoglobinemiaCap(prilo, 70, 480)) * 100).toBeCloseTo(90.0, 1); // adult
    expect((360 / getMethemoglobinemiaCap(prilo, 70, 60)) * 100).toBeCloseTo(205.7, 1); // 5 yr
    // LAST axis (additive-sum denominator) — age-consistent, no inversion
    expect((360 / effectiveMax(getEffectiveMrd(prilo, 'adult', 'fda'), 70)) * 100).toBeCloseTo(64.3, 1);
    expect((360 / effectiveMax(getEffectiveMrd(prilo, 'pediatric', 'fda'), 70)) * 100).toBeCloseTo(64.3, 1);
  });
});
