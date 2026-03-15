"use client";

import { useMemo, useState } from "react";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, TrendingUp } from "lucide-react";
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

// ─── Static data ──────────────────────────────────────────────────────────

const HISTORICAL_RATES = [
  [2021, 0.06],
  [2022, 0.0703],
  [2023, 0.0705],
  [2024, 0.071],
  [2025, 0.0712],
] as const;

// ─── Main Component ───────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - 4 + i);

export default function Mp2InvestmentCalculator() {
  const [startMonthIdx, setStartMonthIdx] = useState<number>(0); // 0-based index
  const [startYear, setStartYear] = useState<number>(CURRENT_YEAR);
  const [monthlyAmount, setMonthlyAmount] = useState<string>("");
  const [mode, setMode] = useState<DividendMode>("compounded");

  const monthly = Math.max(parseFloat(monthlyAmount) || 0, 0);
  const hasInput = monthly > 0;

  const result = useMemo(() => {
    if (!hasInput) return null;
    return calcMp2({
      startMonth: startMonthIdx + 1,
      startYear,
      monthlyAmount: monthly,
      mode,
    });
  }, [startMonthIdx, startYear, monthly, mode, hasInput]);

  const isCompounded = mode === "compounded";

  const hasEstimated = useMemo(
    () => result?.years.some((r) => r.isEstimated) ?? false,
    [result],
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
            maturity period. Compare Annual Payout vs. Compounded dividend
            modes using actual historical dividend rates.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* ── Left: Inputs ── */}
          <div className="space-y-5 lg:col-span-2">
            <Card className="shadow-sm">
              <CardHeader className="border-b">
                <CardTitle className="text-lg font-semibold">
                  Your MP2 Contribution Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                {/* Month */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium leading-none">
                    Month of Initial Contribution
                  </label>
                  <Select
                    value={String(startMonthIdx)}
                    onValueChange={(v) => setStartMonthIdx(Number(v))}
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

                {/* Year */}
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

                <Separator />

                {/* Monthly contribution */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="monthlyAmount"
                    className="text-sm font-medium leading-none"
                  >
                    Monthly Contribution Amount
                  </label>
                  <CurrencyInput
                    id="monthlyAmount"
                    symbol="₱"
                    value={monthlyAmount}
                    onValueChange={setMonthlyAmount}
                    placeholder="500.00"
                  />
                  <p className="text-muted-foreground text-xs">
                    Minimum: ₱500/month. Assumed constant for all 5 years.
                  </p>
                </div>

                <Separator />

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
                  <p className="text-muted-foreground text-xs">
                    {isCompounded
                      ? "Dividends are reinvested and earn dividends in subsequent years."
                      : "Dividends are paid out to your Pag-IBIG savings account each year."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Dividend rate legend */}
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
                    {HISTORICAL_RATES.map(([year, rate]) => (
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

          {/* ── Right: Results ── */}
          <div className="space-y-5 lg:col-span-3">
            {!hasInput ? (
              <Card className="shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="bg-muted mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                    <TrendingUp className="text-muted-foreground h-6 w-6" />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Enter your monthly contribution to see
                    <br />
                    your MP2 savings projection.
                  </p>
                </CardContent>
              </Card>
            ) : result ? (
              <>
                {/* Maturity summary */}
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
                      value={`${((result.grandTotalDividends / result.grandTotalDeposited) * 100).toFixed(2)}%`}
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

                {/* Year-by-year table */}
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
                            <td className="py-2.5 text-foreground font-medium">
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
                    {hasEstimated && (
                      <p className="text-muted-foreground mt-3 text-xs">
                        * Rate assumed at 7.12% (same as 2025 actual). Future
                        MP2 rates are declared annually by Pag-IBIG Fund and
                        may differ.
                      </p>
                    )}
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

                {/* Disclaimer */}
                <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  For illustrative purposes only. Actual dividends depend on
                  annual Pag-IBIG Fund earnings declared each year. Past rates
                  do not guarantee future rates.
                </p>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
