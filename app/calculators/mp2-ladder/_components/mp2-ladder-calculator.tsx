"use client";

import { useCallback, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, RotateCcw, TrendingUp } from "lucide-react";
import {
  calcMp2Ladder,
  MONTH_NAMES,
} from "@/lib/calcMp2Ladder";

// ─── Helpers ──────────────────────────────────────────────────────────────

function formatPHP(value: number): string {
  return value.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ─── Static data ──────────────────────────────────────────────────────────

const DIVIDEND_RATES: Record<number, number> = {
  2021: 0.06,
  2022: 0.0703,
  2023: 0.0705,
  2024: 0.071,
  2025: 0.0712,
};

const PERIOD_LABELS = [
  "Start Year",
  "Year 1",
  "Year 2",
  "Year 3",
  "Year 4",
  "Maturity Year",
];

const CURRENT_YEAR = new Date().getFullYear();
const BASE_YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - 4 + i);
const MAX_ACCOUNTS = 5;
const DEFAULT_FUTURE_RATE_STR = "7.12";

function makeEmptyGrid(): string[][] {
  return Array.from({ length: 6 }, () => Array(12).fill(""));
}

function getDivRate(
  year: number,
  futureRate: number,
): { rate: number; isEstimated: boolean } {
  const rate = DIVIDEND_RATES[year];
  return rate !== undefined
    ? { rate, isEstimated: false }
    : { rate: futureRate, isEstimated: true };
}

function isActive(
  startMonthIdx: number,
  yearIdx: number,
  monthIdx: number,
): boolean {
  const monthNum = monthIdx + 1;
  if (yearIdx === 0) return monthNum >= startMonthIdx + 1;
  if (yearIdx === 5) return startMonthIdx > 0 && monthNum <= startMonthIdx;
  return true;
}

// ─── Main Component ───────────────────────────────────────────────────────

export default function Mp2LadderCalculator() {
  const [accountCount, setAccountCount] = useState<number>(3);
  const [baseYear, setBaseYear] = useState<number>(CURRENT_YEAR);
  const [futureRateStr, setFutureRateStr] = useState<string>(DEFAULT_FUTURE_RATE_STR);

  // Per-account: start month (0-based) and contribution grids
  const [startMonthIdxs, setStartMonthIdxs] = useState<number[]>(
    Array(MAX_ACCOUNTS).fill(0),
  );
  const [grids, setGrids] = useState<string[][][]>(
    Array.from({ length: MAX_ACCOUNTS }, makeEmptyGrid),
  );

  const futureRate = useMemo(
    () => Math.max(parseFloat(futureRateStr) || 0, 0) / 100,
    [futureRateStr],
  );

  const updateCell = useCallback(
    (accountIdx: number, yearIdx: number, monthIdx: number, value: string) => {
      setGrids((prev) => {
        const next = prev.map((g) => g.map((row) => [...row]));
        next[accountIdx][yearIdx][monthIdx] = value;
        return next;
      });
    },
    [],
  );

  const handleStartMonthChange = useCallback(
    (accountIdx: number, idx: number) => {
      setStartMonthIdxs((prev) => {
        const next = [...prev];
        next[accountIdx] = idx;
        return next;
      });
      setGrids((prev) => {
        const next = prev.map((g) => g.map((row) => [...row]));
        // Clear Start Year cells before new startMonth
        for (let mi = 0; mi < idx; mi++) next[accountIdx][0][mi] = "";
        // Clear Maturity Year cells at or after new startMonth
        for (let mi = idx; mi < 12; mi++) next[accountIdx][5][mi] = "";
        return next;
      });
    },
    [],
  );

  const resetGrid = useCallback((accountIdx: number) => {
    setGrids((prev) => {
      const next = prev.map((g) => g.map((row) => [...row]));
      next[accountIdx] = makeEmptyGrid();
      return next;
    });
  }, []);

  // Numeric grids for calculation
  const numericGrids = useMemo(
    () =>
      grids.map((grid, ai) =>
        grid.map((row, yi) =>
          row.map((cell, mi) =>
            isActive(startMonthIdxs[ai], yi, mi)
              ? Math.max(parseFloat(cell) || 0, 0)
              : 0,
          ),
        ),
      ),
    [grids, startMonthIdxs],
  );

  const hasInputPerAccount = useMemo(
    () =>
      numericGrids.map((grid) => grid.some((row) => row.some((v) => v > 0))),
    [numericGrids],
  );

  const hasAnyInput = useMemo(
    () => hasInputPerAccount.slice(0, accountCount).some(Boolean),
    [hasInputPerAccount, accountCount],
  );

  const result = useMemo(() => {
    if (!hasAnyInput || futureRate === 0) return null;
    const accounts = Array.from({ length: accountCount }, (_, i) => ({
      startMonth: startMonthIdxs[i] + 1,
      monthlyContributions: numericGrids[i],
    }));
    return calcMp2Ladder({ accountCount, baseYear, accounts, futureRate });
  }, [accountCount, baseYear, futureRate, startMonthIdxs, numericGrids, hasAnyInput]);

  const estimatedYears = useMemo(() => {
    if (!result) return new Set<number>();
    const s = new Set<number>();
    for (const acc of result.accounts) {
      for (const yr of acc.years) {
        if (yr.isEstimated) s.add(yr.year);
      }
    }
    return s;
  }, [result]);

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <Badge variant="secondary">Philippines — Pag-IBIG Fund</Badge>
          <h1 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">
            MP2 Ladder Investment Calculator
          </h1>
          <p className="text-muted-foreground leading-relaxed text-pretty">
            Open up to 5 MP2 accounts, each starting one year apart. All accounts
            use Compounded mode — dividends are reinvested annually. See your
            combined projection and per-account maturity breakdown.
          </p>
        </div>

        {/* Ladder Settings */}
        <Card className="shadow-sm">
          <CardHeader className="border-b">
            <CardTitle className="text-lg font-semibold">Ladder Settings</CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {/* Account count */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium leading-none">
                  Number of Accounts
                </label>
                <Select
                  value={String(accountCount)}
                  onValueChange={(v) => setAccountCount(Number(v))}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} {n === 1 ? "Account" : "Accounts"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Base year */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium leading-none">
                  Account 1 Start Year
                </label>
                <Select
                  value={String(baseYear)}
                  onValueChange={(v) => setBaseYear(Number(v))}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BASE_YEARS.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {accountCount > 1 && (
                  <p className="text-muted-foreground text-xs">
                    Account {accountCount} starts in {baseYear + accountCount - 1}
                  </p>
                )}
              </div>

              {/* Future rate */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium leading-none">
                  Assumed Future Dividend Rate
                </label>
                <div className="relative">
                  <Input
                    value={futureRateStr}
                    onChange={(e) => setFutureRateStr(e.target.value)}
                    className="pr-6"
                    placeholder="7.12"
                  />
                  <span className="text-muted-foreground absolute top-1/2 right-2.5 -translate-y-1/2 text-sm">
                    %
                  </span>
                </div>
                <p className="text-muted-foreground text-xs">
                  Applied to years without a declared rate (2026+).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Per-account contribution grids */}
        {Array.from({ length: accountCount }, (_, i) => {
          const accountStartYear = baseYear + i;
          const actualYears = Array.from(
            { length: 6 },
            (_, yi) => accountStartYear + yi,
          );
          const startMIdx = startMonthIdxs[i];
          const hasInput = hasInputPerAccount[i];

          return (
            <Card key={`account-${i}`} className="shadow-sm">
              <CardHeader className="border-b">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg font-semibold">
                      Account {i + 1}
                    </CardTitle>
                    <Badge variant="outline">Starts {accountStartYear}</Badge>
                    <Badge variant="outline">
                      Matures {accountStartYear + 5}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <label className="text-muted-foreground whitespace-nowrap text-xs font-medium">
                        First contribution:
                      </label>
                      <Select
                        value={String(startMIdx)}
                        onValueChange={(v) =>
                          handleStartMonthChange(i, Number(v))
                        }
                      >
                        <SelectTrigger className="h-8 w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MONTH_NAMES.map((name, mi) => (
                            <SelectItem key={name} value={String(mi)}>
                              {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {hasInput && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => resetGrid(i)}
                        className="text-muted-foreground h-8 gap-1 px-2 text-xs"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Reset
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      {/* Dividend rate row */}
                      <tr className="border-b">
                        <th className="text-muted-foreground w-28 py-2 pr-3 text-left text-xs font-semibold uppercase tracking-wide">
                          Dividend Rate
                        </th>
                        {actualYears.map((yr, yi) => {
                          const { rate, isEstimated } = getDivRate(yr, futureRate);
                          return (
                            <th
                              key={yi}
                              className="min-w-[110px] py-2 text-center text-xs font-bold"
                            >
                              <span
                                className={
                                  isEstimated
                                    ? "text-muted-foreground"
                                    : "text-primary"
                                }
                              >
                                {(rate * 100).toFixed(2)}%
                              </span>
                              {isEstimated && (
                                <span className="text-muted-foreground ml-0.5 text-[10px]">
                                  *
                                </span>
                              )}
                            </th>
                          );
                        })}
                      </tr>
                      {/* Year / period row */}
                      <tr className="bg-muted/30 border-b">
                        <th className="text-muted-foreground py-2 pr-3 text-left text-xs font-semibold uppercase tracking-wide">
                          Year
                        </th>
                        {actualYears.map((yr, yi) => (
                          <th
                            key={yi}
                            className="py-2 text-center text-xs font-semibold"
                          >
                            <div className="text-foreground">
                              {PERIOD_LABELS[yi]}
                            </div>
                            <div className="text-muted-foreground font-normal">
                              {yr}
                            </div>
                          </th>
                        ))}
                      </tr>
                      {/* Remittance header */}
                      <tr className="border-b">
                        <th className="text-muted-foreground py-1.5 pr-3 text-left text-xs font-semibold uppercase tracking-wide">
                          Month
                        </th>
                        {actualYears.map((_, yi) => (
                          <th
                            key={yi}
                            className="text-muted-foreground py-1.5 text-center text-[11px] font-semibold uppercase tracking-wide"
                          >
                            Remittance
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {MONTH_NAMES.map((month, mi) => (
                        <tr key={month} className="hover:bg-muted/20">
                          <td className="text-foreground py-1.5 pr-3 text-sm font-medium">
                            {month}
                          </td>
                          {[0, 1, 2, 3, 4, 5].map((yi) => {
                            const active = isActive(startMIdx, yi, mi);
                            return (
                              <td key={yi} className="px-1 py-1 text-center">
                                {active ? (
                                  <input
                                    type="number"
                                    min="0"
                                    step="100"
                                    value={grids[i][yi][mi]}
                                    onChange={(e) =>
                                      updateCell(i, yi, mi, e.target.value)
                                    }
                                    placeholder="0"
                                    className="focus:ring-primary/50 bg-background h-8 w-full rounded border px-2 text-right text-sm tabular-nums focus:outline-none focus:ring-2"
                                  />
                                ) : (
                                  <span className="text-muted-foreground/40 text-xs">
                                    —
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                    {/* Column totals */}
                    <tfoot>
                      <tr className="border-t-2 font-semibold">
                        <td className="text-muted-foreground py-2 pr-3 text-xs uppercase tracking-wide">
                          Total
                        </td>
                        {[0, 1, 2, 3, 4, 5].map((yi) => {
                          const colTotal = numericGrids[i][yi].reduce(
                            (s, v) => s + v,
                            0,
                          );
                          return (
                            <td
                              key={yi}
                              className="text-foreground py-2 text-right tabular-nums text-sm"
                            >
                              {colTotal > 0 ? formatPHP(colTotal) : "—"}
                            </td>
                          );
                        })}
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Results */}
        {!hasAnyInput ? (
          <Card className="shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="bg-muted mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                <TrendingUp className="text-muted-foreground h-6 w-6" />
              </div>
              <p className="text-muted-foreground text-sm">
                Enter monthly contributions for at least one account
                <br />
                to see your MP2 ladder projection.
              </p>
            </CardContent>
          </Card>
        ) : result ? (
          <>
            {/* Account maturity summary */}
            <Card className="shadow-sm">
              <CardHeader className="border-b">
                <CardTitle className="text-lg font-semibold">
                  Account Maturity Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto pt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      {[
                        "Account",
                        "Matures",
                        "Deposited",
                        "Dividends",
                        "Balance",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-muted-foreground pb-3 text-right text-xs font-semibold uppercase tracking-wide first:text-left"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {result.accounts.map((acc) => (
                      <tr key={acc.accountIndex}>
                        <td className="py-2.5 font-medium">
                          <div>Account {acc.accountIndex}</div>
                          <div className="text-muted-foreground text-xs">
                            {MONTH_NAMES[acc.startMonth - 1]} {acc.startYear}
                          </div>
                        </td>
                        <td className="text-muted-foreground py-2.5 text-right">
                          {acc.maturityMonth} {acc.maturityYear}
                        </td>
                        <td className="py-2.5 text-right tabular-nums">
                          {formatPHP(acc.totalDeposited)}
                        </td>
                        <td className="py-2.5 text-right tabular-nums font-medium text-green-600">
                          {formatPHP(acc.totalDividends)}
                        </td>
                        <td className="py-2.5 text-right tabular-nums font-semibold">
                          {formatPHP(acc.finalBalance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 font-semibold">
                      <td className="pt-3" colSpan={2}>
                        Grand Total
                      </td>
                      <td className="pt-3 text-right tabular-nums">
                        {formatPHP(result.grandTotalDeposited)}
                      </td>
                      <td className="pt-3 text-right tabular-nums text-green-600">
                        {formatPHP(result.grandTotalDividends)}
                      </td>
                      <td className="text-primary pt-3 text-right tabular-nums">
                        {formatPHP(result.grandTotalBalance)}
                      </td>
                    </tr>
                    <tr className="text-muted-foreground text-xs">
                      <td colSpan={2} className="pt-1">
                        Combined ROI
                      </td>
                      <td colSpan={3} className="pt-1 text-right">
                        {result.grandTotalDeposited > 0
                          ? (
                              (result.grandTotalDividends /
                                result.grandTotalDeposited) *
                              100
                            ).toFixed(2)
                          : "0.00"}
                        %
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </CardContent>
            </Card>

            {/* Year-by-year dividend breakdown */}
            <Card className="shadow-sm">
              <CardHeader className="border-b">
                <CardTitle className="text-lg font-semibold">
                  Year-by-Year Dividend Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto pt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-muted-foreground pb-3 text-left text-xs font-semibold uppercase tracking-wide">
                        Year
                      </th>
                      {result.accounts.map((acc) => (
                        <th
                          key={acc.accountIndex}
                          className="text-muted-foreground pb-3 text-right text-xs font-semibold uppercase tracking-wide"
                        >
                          Acct {acc.accountIndex}
                        </th>
                      ))}
                      <th className="text-muted-foreground pb-3 text-right text-xs font-semibold uppercase tracking-wide">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {result.yearRows.map((row) => (
                      <tr key={row.year} className="text-muted-foreground">
                        <td className="text-foreground py-2.5 font-medium">
                          {row.year}
                          {estimatedYears.has(row.year) && (
                            <span className="text-muted-foreground ml-0.5 text-[10px]">
                              *
                            </span>
                          )}
                        </td>
                        {row.dividendsByAccount.map((d, di) => (
                          <td
                            key={`div-${row.year}-${di}`}
                            className="py-2.5 text-right tabular-nums"
                          >
                            {d !== null ? (
                              <span className="text-green-600">
                                {formatPHP(d)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground/40">—</span>
                            )}
                          </td>
                        ))}
                        <td className="py-2.5 text-right tabular-nums font-semibold text-green-600">
                          {formatPHP(row.totalDividends)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 font-semibold">
                      <td className="pt-3">Total</td>
                      {result.accounts.map((acc) => (
                        <td
                          key={acc.accountIndex}
                          className="pt-3 text-right tabular-nums text-green-600"
                        >
                          {formatPHP(acc.totalDividends)}
                        </td>
                      ))}
                      <td className="text-primary pt-3 text-right tabular-nums">
                        {formatPHP(result.grandTotalDividends)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
                {estimatedYears.size > 0 && (
                  <p className="text-muted-foreground mt-3 text-xs">
                    * Rate assumed at {futureRateStr || DEFAULT_FUTURE_RATE_STR}%
                    (user-configured). Future MP2 rates are declared annually by
                    Pag-IBIG Fund and may differ.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Disclaimer */}
            <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <AlertCircle className="h-3 w-3 shrink-0" />
              For illustrative purposes only. Actual dividends depend on annual
              Pag-IBIG Fund earnings declared each year. Past rates do not
              guarantee future rates.
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}
