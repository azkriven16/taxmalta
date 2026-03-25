// MP2 (Modified Pag-IBIG 2) Investment Calculator — Philippines
// Supports per-month contribution amounts via a 6×12 grid (yearIdx × monthIdx)

export type DividendMode = "compounded" | "annual";

export interface Mp2Input {
  startMonth: number;           // 1–12
  startYear: number;            // e.g. 2026
  monthlyContributions: number[][];  // [yearIdx 0-5][monthIdx 0-11]
  mode: DividendMode;
  futureRate?: number;          // override assumed future rate (default 0.0712)
}

export interface Mp2YearResult {
  period: string;       // "Start Year" | "Year 1" … "Maturity Year"
  year: number;
  months: number;       // how many contribution months in this year
  totalDeposited: number;
  dividends: number;
  balance: number;      // compounded: running total; annual: deposits only
  dividendRate: number;
  isEstimated: boolean;
}

export interface Mp2Result {
  years: Mp2YearResult[];
  grandTotalDeposited: number;
  grandTotalDividends: number;
  finalBalance: number;
  totalReceived: number;  // compounded: finalBalance; annual: deposits + all dividends
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

function getDividendRate(
  year: number,
  futureRate: number,
): { rate: number; isEstimated: boolean } {
  const rate = HISTORICAL_RATES[year];
  if (rate !== undefined) return { rate, isEstimated: false };
  return { rate: futureRate, isEstimated: true };
}

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// ─── Core calculation ─────────────────────────────────────────────────────

export function calcMp2(input: Mp2Input): Mp2Result {
  const {
    startMonth,
    startYear,
    monthlyContributions,
    mode,
    futureRate = ASSUMED_FUTURE_RATE,
  } = input;

  const maturityYear = startYear + 5;
  const maturityMonth = MONTH_NAMES[startMonth - 1];

  const PERIOD_LABELS = [
    "Start Year", "Year 1", "Year 2", "Year 3", "Year 4", "Maturity Year",
  ];

  const results: Mp2YearResult[] = [];
  let prevCompoundedBalance = 0;
  let prevPrincipal = 0;

  for (let y = 0; y < 6; y++) {
    const year = startYear + y;
    const { rate, isEstimated } = getDividendRate(year, futureRate);
    const amounts = monthlyContributions[y] ?? new Array(12).fill(0);

    // Active contribution months for this year slot
    let contribMonths: number[];
    if (y === 0) {
      contribMonths = Array.from({ length: 13 - startMonth }, (_, i) => startMonth + i);
    } else if (y === 5) {
      contribMonths = startMonth > 1
        ? Array.from({ length: startMonth - 1 }, (_, i) => i + 1)
        : [];
    } else {
      contribMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    }

    // Sum deposits and weighted contribution for this year
    const totalDeposited = contribMonths.reduce(
      (sum, m) => sum + (amounts[m - 1] || 0),
      0,
    );
    // Weighted: each month's amount × (13 − monthNumber) / 12
    const weighted = contribMonths.reduce(
      (sum, m) => sum + (amounts[m - 1] || 0) * ((13 - m) / 12),
      0,
    );

    // Dividend calculation
    let dividends: number;
    if (y === 5) {
      // Maturity year: prorate previous balance by (startMonth − 1) / 12
      const proration = (startMonth - 1) / 12;
      const prevBase = mode === "compounded" ? prevCompoundedBalance : prevPrincipal;
      dividends = (weighted + prevBase) * rate * proration;
    } else if (y === 0) {
      dividends = weighted * rate;
    } else {
      const prevBase = mode === "compounded" ? prevCompoundedBalance : prevPrincipal;
      dividends = weighted * rate + prevBase * rate;
    }

    const balance =
      mode === "compounded"
        ? prevCompoundedBalance + totalDeposited + dividends
        : prevPrincipal + totalDeposited;

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
  const totalReceived =
    mode === "compounded"
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
