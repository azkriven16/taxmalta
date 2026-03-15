"use client";

import { useCallback, useMemo, useState } from "react";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AlertCircle, TrendingUp } from "lucide-react";
import {
  calcMp2Ladder,
  MONTH_NAMES,
  type Mp2LadderAccountInput,
} from "@/lib/calcMp2Ladder";

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

const HISTORICAL_RATES = [
  [2021, 0.06],
  [2022, 0.0703],
  [2023, 0.0705],
  [2024, 0.071],
  [2025, 0.0712],
] as const;

// ─── Constants ────────────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear();
const BASE_YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - 4 + i);
const MAX_ACCOUNTS = 5;
const DEFAULT_FUTURE_RATE = "7.12";

const EMPTY_ACCOUNT: Mp2LadderAccountInput = { startMonth: 1, monthlyAmount: 0 };

// ─── Main Component ───────────────────────────────────────────────────────

export default function Mp2LadderCalculator() {
  const [accountCount, setAccountCount] = useState<number>(3);
  const [baseYear, setBaseYear] = useState<number>(CURRENT_YEAR);
  const [futureRateStr, setFutureRateStr] = useState<string>(DEFAULT_FUTURE_RATE);
  const [accounts, setAccounts] = useState<Mp2LadderAccountInput[]>(
    Array.from({ length: MAX_ACCOUNTS }, () => ({ ...EMPTY_ACCOUNT })),
  );

  const updateAccount = useCallback((index: number, patch: Partial<Mp2LadderAccountInput>) => {
    setAccounts((prev) => prev.map((a, i) => (i === index ? { ...a, ...patch } : a)));
  }, []);

  const result = useMemo(() => {
    const futureRate = Math.max(parseFloat(futureRateStr) || 0, 0) / 100;
    const activeAccounts = accounts.slice(0, accountCount);
    const hasInput = activeAccounts.some((a) => a.monthlyAmount > 0);
    if (!hasInput || futureRate === 0) return null;
    return calcMp2Ladder({ accountCount, baseYear, accounts: activeAccounts, futureRate });
  }, [accountCount, baseYear, futureRateStr, accounts]);

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

        <div className="grid gap-6 lg:grid-cols-5">
          {/* ── Left: Inputs ── */}
          <div className="space-y-5 lg:col-span-2">
            {/* Global settings */}
            <Card className="shadow-sm">
              <CardHeader className="border-b">
                <CardTitle className="text-lg font-semibold">Ladder Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
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

                <Separator />

                <div className="space-y-1.5">
                  <label className="text-sm font-medium leading-none">
                    Assumed Future Dividend Rate (%)
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
              </CardContent>
            </Card>

            {/* Per-account inputs */}
            {Array.from({ length: accountCount }, (_, i) => (
              <Card key={`account-${i}`} className="shadow-sm">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">
                      Account {i + 1}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      Starts {baseYear + i}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium leading-none">
                      Month of Initial Contribution
                    </label>
                    <Select
                      value={String(accounts[i].startMonth)}
                      onValueChange={(v) =>
                        updateAccount(i, { startMonth: Number(v) })
                      }
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTH_NAMES.map((name, mi) => (
                          <SelectItem key={name} value={String(mi + 1)}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium leading-none">
                      Monthly Contribution
                    </label>
                    <CurrencyInput
                      symbol="₱"
                      value={
                        accounts[i].monthlyAmount > 0
                          ? String(accounts[i].monthlyAmount)
                          : ""
                      }
                      onValueChange={(v) =>
                        updateAccount(i, {
                          monthlyAmount: Math.max(parseFloat(v) || 0, 0),
                        })
                      }
                      placeholder="500.00"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Historical rates card */}
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
                      <td className="py-2 text-right font-semibold">
                        {futureRateStr || DEFAULT_FUTURE_RATE}%
                      </td>
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
            {!result ? (
              <Card className="shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
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
            ) : (
              <>
                {/* Account summary table */}
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
                          {["Account", "Matures", "Deposited", "Dividends", "Balance"].map(
                            (h) => (
                              <th
                                key={h}
                                className="text-muted-foreground pb-3 text-right text-xs font-semibold uppercase tracking-wide first:text-left"
                              >
                                {h}
                              </th>
                            ),
                          )}
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
                            {(
                              (result.grandTotalDividends / result.grandTotalDeposited) *
                              100
                            ).toFixed(2)}
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
                        {result.yearRows.map((row) => {
                          return (
                            <tr key={row.year} className="text-muted-foreground">
                              <td className="text-foreground py-2.5 font-medium">
                                {row.year}
                                {estimatedYears.has(row.year) && (
                                  <span className="text-muted-foreground ml-0.5 text-[10px]">
                                    *
                                  </span>
                                )}
                              </td>
                              {row.dividendsByAccount.map((d, i) => (
                                <td
                                  key={`div-${row.year}-${i}`}
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
                          );
                        })}
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
                        * Rate assumed at {futureRateStr || DEFAULT_FUTURE_RATE}% (user-configured).
                        Future MP2 rates are declared annually by Pag-IBIG Fund and may differ.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Disclaimer */}
                <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  For illustrative purposes only. Actual dividends depend on annual
                  Pag-IBIG Fund earnings declared each year. Past rates do not guarantee
                  future rates.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
