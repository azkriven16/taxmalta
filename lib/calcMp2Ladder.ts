// MP2 Ladder Investment Calculator — Philippines
// Multiple MP2 accounts (1–5), each starting one year after the previous.
// Compounded mode only (dividends reinvested).

import { calcMp2, MONTH_NAMES, type Mp2YearResult } from "./calcMp2";

export interface Mp2LadderAccountInput {
  startMonth: number;          // 1–12
  monthlyContributions: number[][];  // [yearIdx 0-5][monthIdx 0-11]
}

export interface Mp2LadderInput {
  accountCount: number;                 // 1–5
  baseYear: number;                     // Account 1 start year; Account N starts at baseYear + (N-1)
  accounts: Mp2LadderAccountInput[];    // length must equal accountCount
  futureRate: number;                   // assumed rate for years without historical data (e.g. 0.0712)
}

export interface Mp2LadderAccountResult {
  accountIndex: number;    // 1-based
  startMonth: number;
  startYear: number;
  maturityMonth: string;
  maturityYear: number;
  years: Mp2YearResult[];
  totalDeposited: number;
  totalDividends: number;
  finalBalance: number;
}

export interface LadderYearRow {
  year: number;
  dividendsByAccount: (number | null)[]; // null = account not active this year
  totalDividends: number;
}

export interface Mp2LadderResult {
  accounts: Mp2LadderAccountResult[];
  yearRows: LadderYearRow[];
  grandTotalDeposited: number;
  grandTotalDividends: number;
  grandTotalBalance: number;
}

export { MONTH_NAMES };

export function calcMp2Ladder(input: Mp2LadderInput): Mp2LadderResult {
  const { accountCount, baseYear, accounts, futureRate } = input;

  const accountResults: Mp2LadderAccountResult[] = [];

  for (let i = 0; i < accountCount; i++) {
    const { startMonth, monthlyContributions } = accounts[i];
    const startYear = baseYear + i;

    const mp2 = calcMp2({ startMonth, startYear, monthlyContributions, mode: "compounded", futureRate });

    accountResults.push({
      accountIndex: i + 1,
      startMonth,
      startYear,
      maturityMonth: mp2.maturityMonth,
      maturityYear: mp2.maturityYear,
      years: mp2.years,
      totalDeposited: mp2.grandTotalDeposited,
      totalDividends: mp2.grandTotalDividends,
      finalBalance: mp2.totalReceived,
    });
  }

  // Build year-by-year dividend breakdown across all accounts
  const minYear = Math.min(...accountResults.map((a) => a.startYear));
  const maxYear = Math.max(...accountResults.map((a) => a.maturityYear));

  const yearRows: LadderYearRow[] = [];
  for (let year = minYear; year <= maxYear; year++) {
    const dividendsByAccount = accountResults.map((acc) => {
      const row = acc.years.find((y) => y.year === year);
      return row !== undefined ? row.dividends : null;
    });
    const totalDividends = dividendsByAccount.reduce<number>((s, d) => s + (d ?? 0), 0);
    yearRows.push({ year, dividendsByAccount, totalDividends });
  }

  const grandTotalDeposited = accountResults.reduce((s, a) => s + a.totalDeposited, 0);
  const grandTotalDividends = accountResults.reduce((s, a) => s + a.totalDividends, 0);
  const grandTotalBalance = accountResults.reduce((s, a) => s + a.finalBalance, 0);

  return { accounts: accountResults, yearRows, grandTotalDeposited, grandTotalDividends, grandTotalBalance };
}
