// BIR Form 2316 Validation Calculator — Philippines 2026
// All monetary inputs/outputs in Philippine Pesos (annual unless noted)

export type EmploymentType = "private" | "government";

export interface Bir2316Input {
  employmentType: EmploymentType;
  // Taxable compensation
  basicSalary: number;
  livingAllowances: number;
  overtimePay: number;
  otherTaxableRegular: number;
  thirteenthMonthPay: number; // actual received (C23)
  // Deductions / non-taxable
  unionDues: number;
  otherNonTaxable: number;
  // De minimis — units per field description (monthly vs annual)
  riceSubs: number; // per month (≤ ₱2,500)
  laundry: number; // per month (≤ ₱400)
  uniformClothing: number; // per year (≤ ₱8,000)
  medicalSemester: number; // per semester — ×2 (≤ ₱2,000)
  medicalMonthly: number; // per month (≤ ₱333)
  actualMedical: number; // per year (≤ ₱12,000)
  monetizedLeave: number; // per year — private, up to 12 days
  govtMonetizedLeave: number; // per year — govt, fully exempt
  achievementAwards: number; // per year (≤ ₱12,000)
  christmasGifts: number; // per year (≤ ₱6,000)
  mealAllowances: number; // annual de minimis portion
  cbaBenefits: number; // per year (≤ ₱12,000)
  // From BIR Form 2316
  taxWithheld: number;
}

export interface Bir2316Result {
  // Govt contributions
  sss: number;
  gsis: number;
  pagIbig: number;
  philHealth: number;
  totalGovtContribs: number;
  // Benefits
  totalBenefitsReceived: number;
  deMinimis: number;
  excessOverDeMinimis: number;
  // 13th month split
  nonTaxable13thAndBenefits: number; // Line 32
  taxable13th: number; // Line 46
  // Non-taxable total (Line 36)
  totalNonTaxable: number;
  // Taxable total (Line 50)
  totalTaxable: number;
  // Part IVA
  grossCompensation: number;
  taxDue: number;
  taxWithheld: number;
  difference: number; // positive = overwithheld, negative = underwithheld
}

function progressiveTax(income: number): number {
  if (income <= 250_000) return 0;
  if (income <= 400_000) return (income - 250_000) * 0.15;
  if (income <= 800_000) return 22_500 + (income - 400_000) * 0.2;
  if (income <= 2_000_000) return 102_500 + (income - 800_000) * 0.25;
  if (income <= 8_000_000) return 402_500 + (income - 2_000_000) * 0.3;
  return 2_202_500 + (income - 8_000_000) * 0.35;
}

export function calcBir2316(input: Bir2316Input): Bir2316Result {
  const {
    employmentType,
    basicSalary,
    livingAllowances,
    overtimePay,
    otherTaxableRegular,
    thirteenthMonthPay,
    unionDues,
    otherNonTaxable,
    riceSubs,
    laundry,
    uniformClothing,
    medicalSemester,
    medicalMonthly,
    actualMedical,
    monetizedLeave,
    govtMonetizedLeave,
    achievementAwards,
    christmasGifts,
    mealAllowances,
    cbaBenefits,
    taxWithheld,
  } = input;

  // Government contributions (annual)
  const monthlyComp =
    (basicSalary + livingAllowances + overtimePay + otherTaxableRegular) / 12;
  const sss =
    employmentType === "private"
      ? Math.min(monthlyComp * 0.05, 1_750) * 12
      : 0;
  const gsis =
    employmentType === "government" ? basicSalary * 0.09 : 0;
  const pagIbig = Math.min((basicSalary / 12) * 0.02, 200) * 12;
  const philHealth = Math.min((basicSalary / 12) * 0.025, 2_500) * 12;
  const totalGovtContribs = sss + gsis + pagIbig + philHealth + unionDues;

  // Total benefits received (unCapped — C37)
  const totalBenefitsReceived =
    riceSubs * 12 +
    laundry * 12 +
    uniformClothing +
    medicalSemester * 2 +
    medicalMonthly * 12 +
    actualMedical +
    monetizedLeave +
    govtMonetizedLeave +
    achievementAwards +
    christmasGifts +
    mealAllowances +
    cbaBenefits;

  // De minimis — capped portion (C24)
  const deMinimis =
    Math.min(riceSubs, 2_500) * 12 +
    Math.min(laundry, 400) * 12 +
    Math.min(uniformClothing, 8_000) +
    Math.min(medicalSemester, 2_000) * 2 +
    Math.min(medicalMonthly, 333) * 12 +
    Math.min(actualMedical, 12_000) +
    monetizedLeave +
    govtMonetizedLeave +
    Math.min(achievementAwards, 12_000) +
    Math.min(christmasGifts, 6_000) +
    mealAllowances +
    Math.min(cbaBenefits, 12_000);

  const excessOverDeMinimis = Math.max(totalBenefitsReceived - deMinimis, 0);

  // 13th month + other benefits split at ₱90,000 ceiling
  const thirteenthPlusExcess = thirteenthMonthPay + excessOverDeMinimis;
  const nonTaxable13thAndBenefits = Math.min(thirteenthPlusExcess, 90_000);
  const taxable13th = Math.max(thirteenthPlusExcess - 90_000, 0);

  // Part IVB — Non-taxable total (Line 36)
  const totalNonTaxable =
    nonTaxable13thAndBenefits + deMinimis + totalGovtContribs + otherNonTaxable;

  // Part IVB — Taxable total (Line 50)
  const totalTaxable =
    basicSalary +
    livingAllowances +
    otherTaxableRegular +
    taxable13th +
    overtimePay;

  // Part IVA
  const grossCompensation = totalNonTaxable + totalTaxable;
  const taxDue = progressiveTax(totalTaxable);
  const difference = taxWithheld - taxDue;

  return {
    sss,
    gsis,
    pagIbig,
    philHealth,
    totalGovtContribs,
    totalBenefitsReceived,
    deMinimis,
    excessOverDeMinimis,
    nonTaxable13thAndBenefits,
    taxable13th,
    totalNonTaxable,
    totalTaxable,
    grossCompensation,
    taxDue,
    taxWithheld,
    difference,
  };
}
