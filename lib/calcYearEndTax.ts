// Philippine Year-End Tax Adjustment Calculator
// BIR Annual Tax Table (TRAIN Law, 2026 onwards)
// Handles multiple employers; consolidates compensation income.
// Three comparison columns: Itemised, 40% OSD, 8% Flat Rate.

export interface EmployerInput {
  grossCompensation: number;
  thirteenthMonthPay: number;     // total 13th month + other benefits from this employer
  governmentContributions: number; // SSS/GSIS/PHIC/HDMF employee share for this employer
  taxWithheld: number;             // cumulative WHT from this employer for the year
}

export interface YearEndInput {
  employers: EmployerInput[];  // 1–4 entries; employers[0] = present employer
}

// ─── Annual tax table (TRAIN, 2026+) ─────────────────────────────────────

interface Bracket {
  from: number;
  to: number;
  base: number;
  rate: number;
  over: number;
}

const ANNUAL_BRACKETS: Bracket[] = [
  { from: 0,         to: 250000,   base: 0,         rate: 0,    over: 0 },
  { from: 250001,    to: 400000,   base: 0,          rate: 0.15, over: 250000 },
  { from: 400001,    to: 800000,   base: 22500,       rate: 0.20, over: 400000 },
  { from: 800001,    to: 2000000,  base: 102500,      rate: 0.25, over: 800000 },
  { from: 2000001,   to: 8000000,  base: 402500,      rate: 0.30, over: 2000000 },
  { from: 8000001,   to: Infinity, base: 2202500,     rate: 0.35, over: 8000000 },
];

function applyAnnualBrackets(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
  let bracket = ANNUAL_BRACKETS[0];
  for (const b of ANNUAL_BRACKETS) {
    if (taxableIncome >= b.from) bracket = b;
  }
  return bracket.base + (taxableIncome - bracket.over) * bracket.rate;
}

// ─── Per-employer computation ─────────────────────────────────────────────

export interface EmployerResult {
  grossCompensation: number;
  thirteenthMonthExempt: number;   // portion that is exempt (capped at remaining headroom)
  thirteenthMonthTaxable: number;  // excess over cap
  governmentContributions: number;
  totalNonTaxable: number;
  taxableCompensation: number;
  taxWithheld: number;
}

// ─── Consolidated result ──────────────────────────────────────────────────

export interface YearEndResult {
  employers: EmployerResult[];

  // Consolidated totals
  totalGrossCompensation: number;
  total13thMonth: number;         // raw sum
  total13thMonthExempt: number;   // capped at 90,000
  total13thMonthTaxable: number;  // excess
  totalGovtContributions: number;
  totalNonTaxable: number;
  totalTaxableCompensation: number;

  // Tax computation
  incomeTaxItemised: number;      // progressive tax on (gross − non-taxable items)
  taxableForOSD: number;          // gross × 60% (40% OSD applied to gross compensation)
  incomeTaxOSD: number;           // progressive tax on taxableForOSD
  incomeTaxEightPct: number;      // 8% × (gross compensation − 250,000), min 0
  otherPercentageTaxItemised: number;
  otherPercentageTaxOSD: number;
  totalTaxItemised: number;
  totalTaxOSD: number;
  totalTaxEightPct: number;

  totalTaxWithheld: number;
  overUnderItemised: number;     // positive = over-withheld (refund); negative = under (due)
  overUnderOSD: number;
  overUnderEightPct: number;
}

const THIRTEENTH_MONTH_CEILING = 90000;

export function calcYearEndTax(input: YearEndInput): YearEndResult {
  const { employers } = input;

  // Step 1: compute raw totals to determine 13th-month cap allocation
  const rawTotal13th = employers.reduce((s, e) => s + e.thirteenthMonthPay, 0);
  const total13thMonthExempt = Math.min(rawTotal13th, THIRTEENTH_MONTH_CEILING);
  const total13thMonthTaxable = Math.max(rawTotal13th - THIRTEENTH_MONTH_CEILING, 0);

  // Step 2: per-employer results
  // Distribute the exempt cap proportionally across employers (for display)
  const exemptRatio = rawTotal13th > 0 ? total13thMonthExempt / rawTotal13th : 0;

  const employerResults: EmployerResult[] = employers.map((e) => {
    const thirteenthMonthExempt = e.thirteenthMonthPay * exemptRatio;
    const thirteenthMonthTaxable = e.thirteenthMonthPay - thirteenthMonthExempt;
    const totalNonTaxable = thirteenthMonthExempt + e.governmentContributions;
    const taxableCompensation = Math.max(
      e.grossCompensation - totalNonTaxable,
      0,
    );
    return {
      grossCompensation: e.grossCompensation,
      thirteenthMonthExempt,
      thirteenthMonthTaxable,
      governmentContributions: e.governmentContributions,
      totalNonTaxable,
      taxableCompensation,
      taxWithheld: e.taxWithheld,
    };
  });

  // Step 3: consolidated
  const totalGrossCompensation = employerResults.reduce(
    (s, r) => s + r.grossCompensation, 0,
  );
  const totalGovtContributions = employerResults.reduce(
    (s, r) => s + r.governmentContributions, 0,
  );
  const totalNonTaxable = total13thMonthExempt + totalGovtContributions;
  const totalTaxableCompensation = Math.max(
    totalGrossCompensation - totalNonTaxable,
    0,
  );

  // Step 4: tax under each method
  // Itemised: progressive tax on (gross − mandatory non-taxable items)
  const incomeTaxItemised = applyAnnualBrackets(totalTaxableCompensation);

  // OSD (40%): 40% of gross compensation is deducted; progressive tax on the remaining 60%.
  // Shown for comparison — strictly applies to self-employed / mixed-income earners.
  const taxableForOSD = totalGrossCompensation * 0.60;
  const incomeTaxOSD = applyAnnualBrackets(taxableForOSD);

  // 8% Flat Rate — 8% of (Gross - 250,000), only relevant for self-employed/mixed income
  // For compensation-only employees this is shown for reference; gross compensation included
  const incomeTaxEightPct = Math.max(
    (totalGrossCompensation - 250000) * 0.08,
    0,
  );

  // Other Percentage Tax (3% for non-VAT registered business, if any) — 0 for pure employees
  const otherPercentageTaxItemised = 0;
  const otherPercentageTaxOSD = 0;
  // Under 8% there is no OPT

  const totalTaxItemised = incomeTaxItemised + otherPercentageTaxItemised;
  const totalTaxOSD = incomeTaxOSD + otherPercentageTaxOSD;
  const totalTaxEightPct = incomeTaxEightPct;

  const totalTaxWithheld = employers.reduce((s, e) => s + e.taxWithheld, 0);

  return {
    employers: employerResults,
    totalGrossCompensation,
    total13thMonth: rawTotal13th,
    total13thMonthExempt,
    total13thMonthTaxable,
    totalGovtContributions,
    totalNonTaxable,
    totalTaxableCompensation,
    incomeTaxItemised,
    taxableForOSD,
    incomeTaxOSD,
    incomeTaxEightPct,
    otherPercentageTaxItemised,
    otherPercentageTaxOSD,
    totalTaxItemised,
    totalTaxOSD,
    totalTaxEightPct,
    totalTaxWithheld,
    overUnderItemised: totalTaxWithheld - totalTaxItemised,
    overUnderOSD: totalTaxWithheld - totalTaxOSD,
    overUnderEightPct: totalTaxWithheld - totalTaxEightPct,
  };
}
