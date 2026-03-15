// Philippine Withholding Tax Calculator (BIR Revised Withholding Tax Table 2025/2026)
// Based on TRAIN Law (RA 10963) per-period tax tables.
// Contributions: SSS (private), GSIS (govt), PhilHealth, Pag-IBIG (HDMF)

export type EmploymentType = "private" | "government";
export type CivilStatus = "single" | "parent" | "married";
export type PayrollPeriod = "weekly" | "semi-monthly" | "monthly";

export interface PhWithholdingInput {
  employmentType: EmploymentType;
  civilStatus: CivilStatus;
  payrollPeriod: PayrollPeriod;
  grossSalary: number;         // basic salary per payslip period
  overtimePay: number;         // OT pay per payslip period
  otherTaxableAllowances: number;
  otherTaxableBenefits: number;
}

export interface PhWithholdingResult {
  grossIncome: number;
  sss: number;
  gsis: number;
  philhealth: number;
  pagibig: number;
  totalContributions: number;
  taxableIncome: number;
  withholdingTax: number;
}

// ─── Period divisor ───────────────────────────────────────────────────────

function periodDivisor(period: PayrollPeriod): number {
  if (period === "weekly") return 4;
  if (period === "semi-monthly") return 2;
  return 1; // monthly
}

// ─── Contributions ────────────────────────────────────────────────────────

function computeContributions(
  employmentType: EmploymentType,
  payrollPeriod: PayrollPeriod,
  grossSalary: number,
  otherTaxableAllowances: number,
): { sss: number; gsis: number; philhealth: number; pagibig: number } {
  const divisor = periodDivisor(payrollPeriod);

  // SSS — Private employees only
  // Base = salary + allowances, rate = 5%, max monthly share = ₱1,750
  const sss =
    employmentType === "private"
      ? Math.min((grossSalary + otherTaxableAllowances) * 0.05, 1750) / divisor
      : 0;

  // GSIS — Government employees only, 9% of actual salary, no ceiling
  const gsis = employmentType === "government" ? grossSalary * 0.09 : 0;

  // PhilHealth — 2.5% of salary, ceiling ₱100,000 → max ₱2,500/month
  // Deducted monthly per BIR computation (not divided by period per spreadsheet formula)
  const philhealth = Math.min(grossSalary * 0.025, 2500);

  // Pag-IBIG (HDMF) — 2% of salary, max ₱200/month, prorated per period
  const pagibig = Math.min(grossSalary * 0.02, 200) / divisor;

  return { sss, gsis, philhealth, pagibig };
}

// ─── Tax bracket tables ───────────────────────────────────────────────────

interface Bracket {
  from: number;
  to: number;          // Infinity for the top bracket
  base: number;        // initial tax at bottom of bracket
  rate: number;        // marginal rate for excess
  over: number;        // threshold for excess
}

const WEEKLY_BRACKETS: Bracket[] = [
  { from: 0,       to: 4807,    base: 0,         rate: 0,    over: 0 },
  { from: 4808,    to: 7691,    base: 0,          rate: 0.15, over: 4808 },
  { from: 7692,    to: 15384,   base: 432.60,     rate: 0.20, over: 7692 },
  { from: 15385,   to: 38461,   base: 1971.20,    rate: 0.25, over: 15385 },
  { from: 38462,   to: 153845,  base: 7740.45,    rate: 0.30, over: 38462 },
  { from: 153846,  to: Infinity, base: 42355.65,  rate: 0.35, over: 153846 },
];

const SEMI_MONTHLY_BRACKETS: Bracket[] = [
  { from: 0,       to: 10416,   base: 0,          rate: 0,    over: 0 },
  { from: 10417,   to: 16666,   base: 0,           rate: 0.15, over: 10417 },
  { from: 16667,   to: 33332,   base: 937.50,      rate: 0.20, over: 16667 },
  { from: 33333,   to: 83332,   base: 4270.70,     rate: 0.25, over: 33333 },
  { from: 83333,   to: 333332,  base: 16770.70,    rate: 0.30, over: 83333 },
  { from: 333333,  to: Infinity, base: 91770.70,   rate: 0.35, over: 333333 },
];

const MONTHLY_BRACKETS: Bracket[] = [
  { from: 0,       to: 20832,   base: 0,           rate: 0,    over: 0 },
  { from: 20833,   to: 33332,   base: 0,            rate: 0.15, over: 20833 },
  { from: 33333,   to: 66666,   base: 1875.00,      rate: 0.20, over: 33333 },
  { from: 66667,   to: 166666,  base: 8541.80,      rate: 0.25, over: 66667 },
  { from: 166667,  to: 666666,  base: 33541.80,     rate: 0.30, over: 166667 },
  { from: 666667,  to: Infinity, base: 183541.80,   rate: 0.35, over: 666667 },
];

function getBrackets(period: PayrollPeriod): Bracket[] {
  if (period === "weekly") return WEEKLY_BRACKETS;
  if (period === "semi-monthly") return SEMI_MONTHLY_BRACKETS;
  return MONTHLY_BRACKETS;
}

function applyBrackets(taxableIncome: number, period: PayrollPeriod): number {
  if (taxableIncome <= 0) return 0;
  const brackets = getBrackets(period);
  const bracket = brackets.findLast((b) => taxableIncome >= b.from);
  if (!bracket || bracket.rate === 0 && bracket.base === 0) return 0;
  return bracket.base + (taxableIncome - bracket.over) * bracket.rate;
}

// ─── Main calculation ─────────────────────────────────────────────────────

export function calcPhWithholding(input: PhWithholdingInput): PhWithholdingResult {
  const {
    employmentType,
    payrollPeriod,
    grossSalary,
    overtimePay,
    otherTaxableAllowances,
    otherTaxableBenefits,
  } = input;

  const grossIncome = grossSalary + overtimePay + otherTaxableAllowances + otherTaxableBenefits;

  const { sss, gsis, philhealth, pagibig } = computeContributions(
    employmentType,
    payrollPeriod,
    grossSalary,
    otherTaxableAllowances,
  );

  const totalContributions = sss + gsis + philhealth + pagibig;
  const taxableIncome = Math.max(grossIncome - totalContributions, 0);
  const withholdingTax = applyBrackets(taxableIncome, payrollPeriod);

  return {
    grossIncome,
    sss,
    gsis,
    philhealth,
    pagibig,
    totalContributions,
    taxableIncome,
    withholdingTax,
  };
}
