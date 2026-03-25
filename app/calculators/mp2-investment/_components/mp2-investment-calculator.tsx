"use client";

import { useCallback, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, RotateCcw, TrendingUp } from "lucide-react";
import { calcMp2, MONTH_NAMES, type DividendMode } from "@/lib/calcMp2";

// ─── Helpers ──────────────────────────────────────────────────────────────

function formatPHP(value: number): string {
  return value.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function php(value: number) {
  return `₱ ${formatPHP(value)}`;
}

// ─── Static data ──────────────────────────────────────────────────────────

const DIVIDEND_RATES: Record<number, number> = {
  2021: 0.06,
  2022: 0.0703,
  2023: 0.0705,
  2024: 0.071,
  2025: 0.0712,
};
const ASSUMED_RATE = 0.0712;

const HISTORICAL_RATES_DISPLAY = [
  [2021, 0.06],
  [2022, 0.0703],
  [2023, 0.0705],
  [2024, 0.071],
  [2025, 0.0712],
] as const;

const PERIOD_LABELS = [
  "Start Year",
  "Year 1",
  "Year 2",
  "Year 3",
  "Year 4",
  "Maturity Year",
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - 4 + i);

function makeEmptyGrid(): string[][] {
  return Array.from({ length: 6 }, () => Array(12).fill(""));
}

function getDivRate(year: number): { rate: number; isEstimated: boolean } {
  const rate = DIVIDEND_RATES[year];
  return rate !== undefined
    ? { rate, isEstimated: false }
    : { rate: ASSUMED_RATE, isEstimated: true };
}

// ─── Sub-components ───────────────────────────────────────────────────────

function SummaryRow({
  label,
  value,
  bold = false,
  highlight = false,
  green = false,
  muted = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
  highlight?: boolean;
  green?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span
        className={`text-sm ${muted ? "text-muted-foreground" : bold ? "font-semibold text-foreground" : "text-muted-foreground"}`}
      >
        {label}
      </span>
      <span
        className={`tabular-nums text-sm ${bold ? "font-semibold" : ""} ${highlight ? "text-primary text-base font-bold" : ""} ${green ? "font-bold text-green-600" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────

export default function Mp2InvestmentCalculator() {
  const [startMonthIdx, setStartMonthIdx] = useState<number>(0); // 0-based
  const [startYear, setStartYear] = useState<number>(CURRENT_YEAR);
  const [mode, setMode] = useState<DividendMode>("compounded");
  const [grid, setGrid] = useState<string[][]>(makeEmptyGrid());

  // Whether a given cell should be editable
  const isActive = useCallback(
    (yearIdx: number, monthIdx: number): boolean => {
      const monthNum = monthIdx + 1; // 1-indexed
      if (yearIdx === 0) return monthNum >= startMonthIdx + 1;
      if (yearIdx === 5) return startMonthIdx > 0 && monthNum <= startMonthIdx;
      return true;
    },
    [startMonthIdx],
  );

  const updateCell = useCallback(
    (yearIdx: number, monthIdx: number, value: string) => {
      setGrid((prev) => {
        const next = prev.map((row) => [...row]);
        next[yearIdx][monthIdx] = value;
        return next;
      });
    },
    [],
  );

  const resetGrid = useCallback(() => setGrid(makeEmptyGrid()), []);

  // When start month/year changes, reset cells that are no longer active
  const handleStartMonthChange = useCallback(
    (idx: number) => {
      setStartMonthIdx(idx);
      setGrid((prev) => {
        const next = prev.map((row) => [...row]);
        // Clear Start Year cells before new startMonth
        for (let mi = 0; mi < idx; mi++) next[0][mi] = "";
        // Clear Maturity Year cells at or after new startMonth
        for (let mi = idx; mi < 12; mi++) next[5][mi] = "";
        return next;
      });
    },
    [],
  );

  // Numeric grid for calculation
  const numericGrid = useMemo(
    () =>
      grid.map((row, yi) =>
        row.map((cell, mi) =>
          isActive(yi, mi) ? Math.max(parseFloat(cell) || 0, 0) : 0,
        ),
      ),
    [grid, isActive],
  );

  const hasInput = useMemo(
    () => numericGrid.some((row) => row.some((v) => v > 0)),
    [numericGrid],
  );

  const result = useMemo(() => {
    if (!hasInput) return null;
    return calcMp2({
      startMonth: startMonthIdx + 1,
      startYear,
      monthlyContributions: numericGrid,
      mode,
    });
  }, [startMonthIdx, startYear, numericGrid, mode, hasInput]);

  const isCompounded = mode === "compounded";
  const hasEstimated = result?.years.some((r) => r.isEstimated) ?? false;

  const actualYears = useMemo(
    () => Array.from({ length: 6 }, (_, i) => startYear + i),
    [startYear],
  );

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <Badge variant="secondary">Philippines — Pag-IBIG Fund</Badge>
          <h1 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">
            MP2 Investment Calculator
          </h1>
          <p className="text-muted-foreground leading-relaxed text-pretty">
            Project your Modified Pag-IBIG 2 (MP2) savings over the 5-year
            maturity period. Enter your monthly remittances per year, then
            compare Annual Payout vs. Compounded dividend modes.
          </p>
        </div>

        {/* Settings row */}
        <Card className="shadow-sm">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                Your MP2 Contribution Situation
              </CardTitle>
              {hasInput && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetGrid}
                  className="text-muted-foreground h-7 gap-1 px-2 text-xs"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {/* Start Month */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium leading-none">
                  Month of Initial Contribution
                </label>
                <Select
                  value={String(startMonthIdx)}
                  onValueChange={(v) =>
                    handleStartMonthChange(Number(v))
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTH_NAMES.map((name, i) => (
                      <SelectItem key={name} value={String(i)}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Start Year */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium leading-none">
                  Year of Initial Contribution
                </label>
                <Select
                  value={String(startYear)}
                  onValueChange={(v) => setStartYear(Number(v))}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Mode */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium leading-none">
                  Mode of Dividend Distribution
                </label>
                <Select
                  value={mode}
                  onValueChange={(v) => setMode(v as DividendMode)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compounded">Compounded</SelectItem>
                    <SelectItem value="annual">Annual Payout</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Maturity info */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium leading-none">
                  Maturity Date
                </label>
                <div className="bg-muted/50 flex h-10 items-center rounded-md border px-3">
                  <span className="text-sm font-medium">
                    {MONTH_NAMES[startMonthIdx]} {startYear + 5}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contribution Grid */}
        <Card className="shadow-sm">
          <CardHeader className="border-b">
            <CardTitle className="text-lg font-semibold">
              Monthly Remittances (₱)
            </CardTitle>
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
                      const { rate, isEstimated } = getDivRate(yr);
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
                  <tr className="border-b bg-muted/30">
                    <th className="text-muted-foreground py-2 pr-3 text-left text-xs font-semibold uppercase tracking-wide">
                      Year
                    </th>
                    {actualYears.map((yr, yi) => (
                      <th key={yi} className="py-2 text-center text-xs font-semibold">
                        <div className="text-foreground">{PERIOD_LABELS[yi]}</div>
                        <div className="text-muted-foreground font-normal">{yr}</div>
                      </th>
                    ))}
                  </tr>
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
                        const active = isActive(yi, mi);
                        return (
                          <td key={yi} className="py-1 px-1 text-center">
                            {active ? (
                              <input
                                type="number"
                                min="0"
                                step="100"
                                value={grid[yi][mi]}
                                onChange={(e) =>
                                  updateCell(yi, mi, e.target.value)
                                }
                                placeholder="0"
                                className="focus:ring-primary/50 h-8 w-full rounded border px-2 text-right text-sm tabular-nums focus:outline-none focus:ring-2 bg-background"
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
                      const colTotal = numericGrid[yi].reduce((s, v) => s + v, 0);
                      return (
                        <td
                          key={yi}
                          className="py-2 text-right tabular-nums text-sm text-foreground"
                        >
                          {colTotal > 0 ? formatPHP(colTotal) : "—"}
                        </td>
                      );
                    })}
                  </tr>
                </tfoot>
              </table>
            </div>
            {hasEstimated && (
              <p className="text-muted-foreground mt-3 text-xs">
                * Rate assumed at 7.12% (same as 2025 actual). Future MP2
                rates are declared annually by Pag-IBIG Fund and may differ.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {!hasInput ? (
          <Card className="shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="bg-muted mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                <TrendingUp className="text-muted-foreground h-6 w-6" />
              </div>
              <p className="text-muted-foreground text-sm">
                Enter at least one monthly remittance above to see
                <br />
                your MP2 savings projection.
              </p>
            </CardContent>
          </Card>
        ) : result ? (
          <div className="grid gap-6 lg:grid-cols-5">
            {/* Left: Maturity summary */}
            <div className="space-y-5 lg:col-span-2">
              <Card className="shadow-sm">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">
                      Maturity Summary
                    </CardTitle>
                    <Badge variant="outline">
                      {result.maturityMonth} {result.maturityYear}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="divide-y pt-2">
                  <SummaryRow
                    label="Total Deposited (5 years)"
                    value={php(result.grandTotalDeposited)}
                  />
                  <SummaryRow
                    label={
                      isCompounded
                        ? "Total Dividends (compounded)"
                        : "Total Dividends (paid out annually)"
                    }
                    value={php(result.grandTotalDividends)}
                    green
                    bold
                  />
                  <SummaryRow
                    label={
                      isCompounded
                        ? "Final Balance at Maturity"
                        : "Total Received at Maturity"
                    }
                    value={php(result.totalReceived)}
                    highlight
                    bold
                  />
                  <SummaryRow
                    label="Return on Investment"
                    value={`${result.grandTotalDeposited > 0 ? ((result.grandTotalDividends / result.grandTotalDeposited) * 100).toFixed(2) : "0.00"}%`}
                    bold
                  />
                  {!isCompounded && (
                    <SummaryRow
                      label="Principal returned at maturity"
                      value={php(result.grandTotalDeposited)}
                      muted
                    />
                  )}
                </CardContent>
              </Card>

              {/* Historical rates reference */}
              <Card className="shadow-sm">
                <CardHeader className="border-b">
                  <CardTitle className="text-base font-semibold">
                    Historical MP2 Dividend Rates
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wide">
                          Year
                        </th>
                        <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wide">
                          Rate
                        </th>
                        <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wide">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {HISTORICAL_RATES_DISPLAY.map(([year, rate]) => (
                        <tr key={year}>
                          <td className="text-muted-foreground py-2">{year}</td>
                          <td className="py-2 text-right font-semibold">
                            {((rate as number) * 100).toFixed(2)}%
                          </td>
                          <td className="py-2 text-right">
                            <Badge variant="secondary" className="text-xs">
                              Actual
                            </Badge>
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <td className="text-muted-foreground py-2">2026+</td>
                        <td className="py-2 text-right font-semibold">7.12%</td>
                        <td className="py-2 text-right">
                          <Badge variant="outline" className="text-xs">
                            Assumed
                          </Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>

            {/* Right: Year-by-year table */}
            <div className="space-y-5 lg:col-span-3">
              <Card className="shadow-sm">
                <CardHeader className="border-b">
                  <CardTitle className="text-lg font-semibold">
                    Year-by-Year Projection
                  </CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto pt-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        {[
                          "Period",
                          "Year",
                          "Rate",
                          "Deposited",
                          isCompounded ? "Dividends" : "Payout",
                          isCompounded ? "Balance" : "Principal",
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
                      {result.years.map((row) => (
                        <tr key={row.year} className="text-muted-foreground">
                          <td className="text-foreground py-2.5 font-medium">
                            <div className="flex items-center gap-1.5">
                              {row.period}
                              {row.isEstimated && (
                                <span className="text-muted-foreground text-[10px]">
                                  *
                                </span>
                              )}
                            </div>
                            <div className="text-muted-foreground text-xs">
                              {row.months} mo
                            </div>
                          </td>
                          <td className="py-2.5 text-right">{row.year}</td>
                          <td className="py-2.5 text-right">
                            {(row.dividendRate * 100).toFixed(2)}%
                          </td>
                          <td className="py-2.5 text-right tabular-nums">
                            {formatPHP(row.totalDeposited)}
                          </td>
                          <td className="py-2.5 text-right tabular-nums font-medium text-green-600">
                            {formatPHP(row.dividends)}
                          </td>
                          <td className="py-2.5 text-right tabular-nums font-semibold text-foreground">
                            {formatPHP(row.balance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 font-semibold text-foreground">
                        <td className="pt-3" colSpan={3}>
                          Total
                        </td>
                        <td className="pt-3 text-right tabular-nums">
                          {formatPHP(result.grandTotalDeposited)}
                        </td>
                        <td className="pt-3 text-right tabular-nums text-green-600">
                          {formatPHP(result.grandTotalDividends)}
                        </td>
                        <td className="pt-3 text-right tabular-nums text-primary">
                          {formatPHP(result.totalReceived)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </CardContent>
              </Card>

              {/* Annual Payout note */}
              {!isCompounded && (
                <Alert className="border-primary/20 bg-primary/10">
                  <TrendingUp className="text-primary h-4 w-4" />
                  <AlertDescription className="text-sm">
                    In Annual Payout mode, dividends are credited to your
                    Pag-IBIG Regular Savings account each year. Your principal
                    (₱ {formatPHP(result.grandTotalDeposited)}) is returned in
                    full at maturity. Total dividends received over 5 years:{" "}
                    <strong>
                      ₱ {formatPHP(result.grandTotalDividends)}
                    </strong>
                    .
                  </AlertDescription>
                </Alert>
              )}

              <Separator />

              <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <AlertCircle className="h-3 w-3 shrink-0" />
                For illustrative purposes only. Actual dividends depend on
                annual Pag-IBIG Fund earnings declared each year. Past rates do
                not guarantee future rates.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
