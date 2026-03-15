// Home Loan Applied to Principal — Philippines
// Replicates NPER / FV / PMT Excel functions for loan amortisation

// ─── Excel-equivalent financial functions ────────────────────────────────

/** NPER(rate, pmt, pv) — number of periods to repay a loan.
 *  pmt must be negative (outflow), pv positive (loan balance). */
function nper(rate: number, pmt: number, pv: number): number {
  if (rate === 0) return -pv / pmt;
  return -Math.log(1 + (pv * rate) / pmt) / Math.log(1 + rate);
}

/** FV(rate, nper, pmt, pv) — future value (remaining balance) after n payments.
 *  Uses Excel sign convention: positive result = you owe money. */
function fv(rate: number, n: number, pmt: number, pv: number): number {
  if (rate === 0) return -(pv + pmt * n);
  const factor = Math.pow(1 + rate, n);
  return -(pv * factor + pmt * ((factor - 1) / rate));
}

/** PMT(rate, nper, pv) — periodic payment to repay a loan.
 *  Returns the principal + interest portion (positive = payment you make). */
function pmt(rate: number, n: number, pv: number): number {
  if (rate === 0) return pv / n;
  const factor = Math.pow(1 + rate, n);
  return (pv * rate * factor) / (factor - 1);
}

// ─── Types ────────────────────────────────────────────────────────────────

export interface HomeLoanBase {
  loanBalance: number;        // current outstanding balance
  monthlyAmortization: number; // current total monthly payment (P+I+MRI)
  mri: number;                // monthly MRI + fire insurance
  annualRate: number;         // annual interest rate as decimal (e.g. 0.06 = 6%)
}

export interface HomeLoanOptionAResult {
  months: number;             // months to pay off
  finalPayment: number;       // last payment amount
  interestSaved: number;      // vs. current amortisation
  originalMonths: number;     // months at current amortisation (for comparison)
  originalTotalInterest: number;
  newTotalInterest: number;
}

export interface HomeLoanOptionBResult {
  requiredMonthlyPayment: number; // total (P+I+MRI) to finish in target months
  interestSaved: number;          // vs. current amortisation
  originalMonths: number;
  originalTotalInterest: number;
  newTotalInterest: number;
}

// ─── Calculations ─────────────────────────────────────────────────────────

/** Option A: given extra monthly payment, how long and what is saved? */
export function calcOptionA(
  base: HomeLoanBase,
  extraMonthlyPayment: number,
): HomeLoanOptionAResult | null {
  const { loanBalance, monthlyAmortization, mri, annualRate } = base;
  const r = annualRate / 12;

  const origNetPI = monthlyAmortization - mri;
  const newNetPI = extraMonthlyPayment - mri;

  // Payment must exceed interest accruing each period, otherwise loan never pays off
  if (newNetPI <= 0 || newNetPI <= loanBalance * r) return null;
  if (origNetPI <= 0 || origNetPI <= loanBalance * r) return null;

  // =ROUNDUP(NPER(rate, -netPI, balance), 0)
  const rawNper = nper(r, -newNetPI, loanBalance);
  const months = Math.ceil(rawNper);

  // Final payment: remaining balance after (months-1) periods + accrued interest + MRI
  // =-FV(rate, months-1, -netPI, balance) + (-FV(...)*rate) + mri
  const remainingBalance = -fv(r, months - 1, -newNetPI, loanBalance);
  const finalPayment = remainingBalance + remainingBalance * r + mri;

  // Interest saved: original total interest - new total interest
  // Total interest = netPI * NPER - loanBalance
  const origNper = nper(r, -origNetPI, loanBalance);
  const originalTotalInterest = origNetPI * origNper - loanBalance;
  const newTotalInterest = newNetPI * rawNper - loanBalance;
  const interestSaved = originalTotalInterest - newTotalInterest;

  return {
    months,
    finalPayment: Math.max(0, finalPayment),
    interestSaved: Math.max(0, interestSaved),
    originalMonths: Math.ceil(origNper),
    originalTotalInterest,
    newTotalInterest,
  };
}

/** Option B: given target months, what monthly payment is required? */
export function calcOptionB(
  base: HomeLoanBase,
  targetMonths: number,
): HomeLoanOptionBResult | null {
  const { loanBalance, monthlyAmortization, mri, annualRate } = base;
  const r = annualRate / 12;

  const origNetPI = monthlyAmortization - mri;
  if (origNetPI <= 0 || origNetPI <= loanBalance * r) return null;
  if (targetMonths <= 0) return null;

  // =PMT(rate, targetMonths, -balance) + mri
  const requiredPI = pmt(r, targetMonths, loanBalance);
  const requiredMonthlyPayment = requiredPI + mri;

  // Interest saved
  const origNper = nper(r, -origNetPI, loanBalance);
  const originalTotalInterest = origNetPI * origNper - loanBalance;
  const newTotalInterest = requiredPI * targetMonths - loanBalance;
  const interestSaved = originalTotalInterest - newTotalInterest;

  return {
    requiredMonthlyPayment,
    interestSaved: Math.max(0, interestSaved),
    originalMonths: Math.ceil(origNper),
    originalTotalInterest,
    newTotalInterest,
  };
}
