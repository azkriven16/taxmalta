// MP2 (Modified Pag-IBIG 2) Investment Calculator — Philippines
// Replicates the weighted-contribution dividend formula from the official spreadsheet

export type DividendMode = "compounded" | "annual";

export interface Mp2Input {
  startMonth: number;    // 1–12
  startYear: number;     // e.g. 2022
  monthlyAmount: number; // fixed monthly contribution in PHP
  mode: DividendMode;
  futureRate?: number;   // override ASSUMED_FUTURE_RATE (e.g. 0.0712)
}

export interface Mp2YearResult {
  period: string;            // "Start Year" | "Year 1" … "Maturity Year"
  year: number;
  months: number;            // how many contribution months in this year
  totalDeposited: number;    // new deposits this year
  dividends: number;         // dividends earned/paid this year
  balance: number;           // running balance (compounded: all; annual: deposits only)
  dividendRate: number;
  isEstimated: boolean;      // true when rate is assumed (2026+)
}

export interface Mp2Result {
  years: Mp2YearResult[];
  grandTotalDeposited: number;
  grandTotalDividends: number;
  finalBalance: number;       // compounded: deposits+dividends; annual: deposits only
  totalReceived: number;      // for annual payout: deposits + all dividends paid out
  maturityMonth: string;
  maturityYear: number;
}

// ─── Historical dividend rates ────────────────────────────────────────────

const HISTORICAL_RATES: Record<number, number> = {
  2021: 0.06,
  2022: 0.0703,
  2023: 0.0705,
  2024: 0.071,
  2025: 0.0712,
};

const ASSUMED_FUTURE_RATE = 0.0712;

function getDividendRate(year: number, futureRate: number): { rate: number; isEstimated: boolean } {
  const rate = HISTORICAL_RATES[year];
  if (rate !== undefined) return { rate, isEstimated: false };
  return { rate: futureRate, isEstimated: true };
}

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// ─── Weighted contribution sum ────────────────────────────────────────────
// Formula: Σ monthly × (13 − monthIndex) / 12
// Jan (1) → weight 12/12, Feb (2) → 11/12, … Dec (12) → 1/12

function weightedSum(monthly: number, months: number[]): number {
  return months.reduce((sum, m) => sum + monthly * ((13 - m) / 12), 0);
}

// ─── Core calculation ─────────────────────────────────────────────────────

export function calcMp2(input: Mp2Input): Mp2Result {
  const { startMonth, startYear, monthlyAmount, mode, futureRate = ASSUMED_FUTURE_RATE } = input;

  const maturityYear = startYear + 5;
  const maturityMonth = MONTH_NAMES[startMonth - 1];

  const PERIOD_LABELS = [
    "Start Year", "Year 1", "Year 2", "Year 3", "Year 4", "Maturity Year",
  ];

  const results: Mp2YearResult[] = [];
  let prevCompoundedBalance = 0; // compounded: deposits + accumulated dividends
  let prevPrincipal = 0;         // annual payout: deposits only

  for (let y = 0; y < 6; y++) {
    const year = startYear + y;
    const { rate, isEstimated } = getDividendRate(year, futureRate);

    // Months with contributions this year
    let contribMonths: number[];
    if (y === 0) {
      // Start Year: startMonth → December
      contribMonths = Array.from({ length: 13 - startMonth }, (_, i) => startMonth + i);
    } else if (y === 5) {
      // Maturity Year: January → (startMonth − 1)
      contribMonths = startMonth > 1
        ? Array.from({ length: startMonth - 1 }, (_, i) => i + 1)
        : [];
    } else {
      contribMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    }

    const totalDeposited = contribMonths.length * monthlyAmount;
    const weighted = weightedSum(monthlyAmount, contribMonths);

    // Dividend calculation
    let dividends: number;

    if (y === 5) {
      // Maturity year: prorate by (startMonth − 1) / 12
      const proration = (startMonth - 1) / 12;
      const prevBase = mode === "compounded" ? prevCompoundedBalance : prevPrincipal;
      dividends = (weighted * rate + prevBase * rate) * proration;
    } else if (y === 0) {
      // Start Year: no previous balance
      dividends = weighted * rate;
    } else {
      const prevBase = mode === "compounded" ? prevCompoundedBalance : prevPrincipal;
      dividends = weighted * rate + prevBase * rate;
    }

    // Balance
    const balance = mode === "compounded"
      ? prevCompoundedBalance + totalDeposited + dividends
      : prevPrincipal + totalDeposited; // annual: dividends paid out, not accumulated

    results.push({
      period: PERIOD_LABELS[y],
      year,
      months: contribMonths.length,
      totalDeposited,
      dividends,
      balance,
      dividendRate: rate,
      isEstimated,
    });

    if (mode === "compounded") {
      prevCompoundedBalance = balance;
    } else {
      prevPrincipal += totalDeposited;
    }
  }

  const grandTotalDeposited = results.reduce((s, r) => s + r.totalDeposited, 0);
  const grandTotalDividends = results.reduce((s, r) => s + r.dividends, 0);
  const finalBalance = results[results.length - 1].balance;
  const totalReceived = mode === "compounded"
    ? finalBalance
    : grandTotalDeposited + grandTotalDividends;

  return {
    years: results,
    grandTotalDeposited,
    grandTotalDividends,
    finalBalance,
    totalReceived,
    maturityMonth,
    maturityYear,
  };
}
