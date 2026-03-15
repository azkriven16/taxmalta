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
import { AlertCircle, TrendingUp, TrendingDown, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  calcYearEndTax,
  type EmployerInput,
} from "@/lib/calcYearEndTax";

// ─── Helpers ──────────────────────────────────────────────────────────────

function formatPHP(v: number): string {
  return v.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function php(v: number) {
  return `₱ ${formatPHP(v)}`;
}

const EMPLOYER_LABELS = [
  "Present Employer",
  "Previous Employer 1",
  "Previous Employer 2",
  "Previous Employer 3",
];

const ANNUAL_BRACKETS = [
  { from: 0, to: 250000, rate: 0, base: 0 },
  { from: 250001, to: 400000, rate: 15, base: 0 },
  { from: 400001, to: 800000, rate: 20, base: 22500 },
  { from: 800001, to: 2000000, rate: 25, base: 102500 },
  { from: 2000001, to: 8000000, rate: 30, base: 402500 },
  { from: 8000001, to: null, rate: 35, base: 2202500 },
];

function emptyEmployer(): EmployerInput {
  return {
    grossCompensation: 0,
    thirteenthMonthPay: 0,
    governmentContributions: 0,
    taxWithheld: 0,
  };
}

// ─── EmployerField (extracted — stable identity across renders) ───────────

interface EmployerFieldProps {
  value: number;
  label: string;
  note?: string;
  placeholder?: string;
  onChange: (v: number) => void;
}

function EmployerField({ value, label, note, placeholder, onChange }: EmployerFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium leading-none">{label}</label>
      <CurrencyInput
        symbol="₱"
        value={value > 0 ? String(value) : ""}
        onValueChange={(v) => onChange(Math.max(parseFloat(v) || 0, 0))}
        placeholder={placeholder ?? "0.00"}
      />
      {note && <p className="text-muted-foreground text-xs">{note}</p>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────

export default function PhYearEndTaxCalculator() {
  const [employerCount, setEmployerCount] = useState<number>(1);
  const [employers, setEmployers] = useState<EmployerInput[]>(
    Array.from({ length: 4 }, emptyEmployer),
  );

  const updateEmployer = useCallback((index: number, patch: Partial<EmployerInput>) => {
    setEmployers((prev) =>
      prev.map((e, i) => (i === index ? { ...e, ...patch } : e)),
    );
  }, []);

  const resetForm = useCallback(() => {
    setEmployerCount(1);
    setEmployers(Array.from({ length: 4 }, emptyEmployer));
  }, []);

  const result = useMemo(() => {
    const active = employers.slice(0, employerCount);
    const hasInput = active.some((e) => e.grossCompensation > 0);
    if (!hasInput) return null;
    return calcYearEndTax({ employers: active });
  }, [employerCount, employers]);

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <Badge variant="secondary">Philippines — BIR 2026</Badge>
          <h1 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">
            Year-End Tax Adjustment Calculator
          </h1>
          <p className="text-muted-foreground leading-relaxed text-pretty">
            Consolidate compensation income from all employers during the year.
            Compute your total annual income tax and determine whether you were
            over-withheld (refund) or under-withheld (pay the difference).
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-5">
          {/* ── Left: Inputs ── */}
          <div className="space-y-5 xl:col-span-2">
            {/* Employer count */}
            <Card className="shadow-sm">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                    Your Tax Profile
                  </CardTitle>
                  {employers.some((e) => e.grossCompensation > 0) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetForm}
                      className="h-7 gap-1 px-2 text-xs text-muted-foreground"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Reset
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium leading-none">
                    How many employers did you have during the year?
                  </label>
                  <Select
                    value={String(employerCount)}
                    onValueChange={(v) => setEmployerCount(Number(v))}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 — Present employer only</SelectItem>
                      <SelectItem value="2">2 — Present + 1 previous</SelectItem>
                      <SelectItem value="3">3 — Present + 2 previous</SelectItem>
                      <SelectItem value="4">4 — Present + 3 previous</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Per-employer cards */}
            {Array.from({ length: employerCount }, (_, i) => (
              <Card key={i} className="shadow-sm">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">
                      {EMPLOYER_LABELS[i]}
                    </CardTitle>
                    {i === 0 && (
                      <Badge variant="secondary" className="text-xs">
                        Current
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-5">
                  <EmployerField
                    value={employers[i].grossCompensation}
                    label="Gross Compensation (Annual)"
                    note="Include regular salary, OT, allowances, and all taxable income."
                    onChange={(v) => updateEmployer(i, { grossCompensation: v })}
                  />
                  <Separator />
                  <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
                    Less: Non-Taxable / Exempt Income
                  </p>
                  <EmployerField
                    value={employers[i].thirteenthMonthPay}
                    label="13th Month Pay & Other Benefits"
                    note="Annual total. Combined across all employers, ₱90,000 is exempt."
                    onChange={(v) => updateEmployer(i, { thirteenthMonthPay: v })}
                  />
                  <EmployerField
                    value={employers[i].governmentContributions}
                    label="SSS / GSIS / PhilHealth / Pag-IBIG (Employee Share)"
                    note="Total mandatory government contributions paid this year."
                    onChange={(v) => updateEmployer(i, { governmentContributions: v })}
                  />
                  <Separator />
                  <EmployerField
                    value={employers[i].taxWithheld}
                    label="Tax Withheld by This Employer"
                    note="Cumulative WHT deducted by this employer for the year."
                    onChange={(v) => updateEmployer(i, { taxWithheld: v })}
                  />
                </CardContent>
              </Card>
            ))}

            {/* Annual tax table reference */}
            <Card className="shadow-sm">
              <CardHeader className="border-b">
                <CardTitle className="text-base font-semibold">
                  Annual Income Tax Table (2026+)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-muted-foreground pb-2 text-left text-xs font-semibold uppercase tracking-wide">
                        From
                      </th>
                      <th className="text-muted-foreground pb-2 text-right text-xs font-semibold uppercase tracking-wide">
                        To
                      </th>
                      <th className="text-muted-foreground pb-2 text-right text-xs font-semibold uppercase tracking-wide">
                        Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {ANNUAL_BRACKETS.map((b) => (
                      <tr
                        key={b.from}
                        className={
                          result &&
                          result.totalTaxableCompensation > b.from &&
                          (b.to === null || result.totalTaxableCompensation <= b.to)
                            ? "bg-primary/5"
                            : ""
                        }
                      >
                        <td className="text-muted-foreground py-1.5 text-xs">
                          {formatPHP(b.from)}
                        </td>
                        <td className="text-muted-foreground py-1.5 text-right text-xs">
                          {b.to !== null ? formatPHP(b.to) : "and over"}
                        </td>
                        <td className="py-1.5 text-right text-xs font-semibold">
                          {b.rate === 0 ? "—" : `${b.rate}%`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          {/* ── Right: Results ── */}
          <div className="space-y-5 xl:col-span-3">
            {!result ? (
              <Card className="shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="bg-muted mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                    <TrendingUp className="text-muted-foreground h-6 w-6" />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Enter your gross compensation to compute
                    <br />
                    your year-end tax adjustment.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Consolidated Income Summary */}
                <Card className="shadow-sm">
                  <CardHeader className="border-b">
                    <CardTitle className="text-lg font-semibold">
                      Consolidated Income Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-x-auto pt-4">
                    {/* Multi-employer table (only when > 1) */}
                    {employerCount > 1 && (
                      <>
                        <table className="mb-4 w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-muted-foreground pb-3 text-left text-xs font-semibold uppercase tracking-wide">
                                Employer
                              </th>
                              <th className="text-muted-foreground pb-3 text-right text-xs font-semibold uppercase tracking-wide">
                                Gross
                              </th>
                              <th className="text-muted-foreground pb-3 text-right text-xs font-semibold uppercase tracking-wide">
                                Non-Taxable
                              </th>
                              <th className="text-muted-foreground pb-3 text-right text-xs font-semibold uppercase tracking-wide">
                                Taxable
                              </th>
                              <th className="text-muted-foreground pb-3 text-right text-xs font-semibold uppercase tracking-wide">
                                WHT
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {result.employers.map((e, i) => (
                              <tr key={i} className="text-muted-foreground text-sm">
                                <td className="text-foreground py-2.5 font-medium text-xs">
                                  {EMPLOYER_LABELS[i]}
                                </td>
                                <td className="py-2.5 text-right tabular-nums">
                                  {formatPHP(e.grossCompensation)}
                                </td>
                                <td className="py-2.5 text-right tabular-nums">
                                  {formatPHP(e.totalNonTaxable)}
                                </td>
                                <td className="py-2.5 text-right tabular-nums font-medium text-foreground">
                                  {formatPHP(e.taxableCompensation)}
                                </td>
                                <td className="py-2.5 text-right tabular-nums">
                                  {formatPHP(e.taxWithheld)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="border-t-2 font-semibold">
                              <td className="pt-3">Total</td>
                              <td className="pt-3 text-right tabular-nums">
                                {formatPHP(result.totalGrossCompensation)}
                              </td>
                              <td className="pt-3 text-right tabular-nums">
                                {formatPHP(result.totalNonTaxable)}
                              </td>
                              <td className="text-primary pt-3 text-right tabular-nums">
                                {formatPHP(result.totalTaxableCompensation)}
                              </td>
                              <td className="pt-3 text-right tabular-nums">
                                {formatPHP(result.totalTaxWithheld)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                        <Separator className="mb-4" />
                      </>
                    )}

                    {/* Non-taxable breakdown */}
                    <div className="space-y-0 divide-y">
                      <div className="flex items-center justify-between py-2.5">
                        <span className="text-sm font-semibold">
                          Total Gross Compensation
                        </span>
                        <span className="tabular-nums text-sm font-semibold">
                          {php(result.totalGrossCompensation)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2.5">
                        <span className="text-muted-foreground pl-4 text-sm">
                          13th Month Pay & Benefits (total)
                        </span>
                        <span className="tabular-nums text-sm">
                          {php(result.total13thMonth)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2.5">
                        <span className="text-muted-foreground pl-4 text-sm">
                          Exempt portion (≤ ₱90,000)
                        </span>
                        <span className="tabular-nums text-sm text-green-600">
                          ({php(result.total13thMonthExempt)})
                        </span>
                      </div>
                      {result.total13thMonthTaxable > 0 && (
                        <div className="flex items-center justify-between py-2.5">
                          <span className="text-muted-foreground pl-4 text-sm">
                            Taxable excess over ₱90,000
                          </span>
                          <span className="tabular-nums text-sm text-red-600">
                            +{php(result.total13thMonthTaxable)}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between py-2.5">
                        <span className="text-muted-foreground pl-4 text-sm">
                          SSS / GSIS / PhilHealth / Pag-IBIG
                        </span>
                        <span className="tabular-nums text-sm text-green-600">
                          ({php(result.totalGovtContributions)})
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2.5">
                        <span className="text-sm font-semibold">
                          Total Non-Taxable Deductions
                        </span>
                        <span className="tabular-nums text-sm font-semibold text-green-600">
                          ({php(result.totalNonTaxable)})
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2.5">
                        <span className="text-primary text-sm font-bold">
                          Total Taxable Compensation
                        </span>
                        <span className="text-primary tabular-nums text-base font-bold">
                          {php(result.totalTaxableCompensation)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tax Obligations — 3 columns */}
                <Card className="shadow-sm">
                  <CardHeader className="border-b">
                    <CardTitle className="text-lg font-semibold">
                      Tax Obligations Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-x-auto pt-4">
                    {(() => {
                      const totals = [result.totalTaxItemised, result.totalTaxOSD, result.totalTaxEightPct];
                      const minTax = Math.min(...totals);
                      const isLowest = totals.map((t) => t === minTax);
                      const gross = result.totalGrossCompensation;
                      return (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-muted-foreground pb-3 text-left text-xs font-semibold uppercase tracking-wide">
                            Item
                          </th>
                          {["Itemised", "40% OSD", "8% Rate"].map((col, i) => (
                            <th key={col} className="pb-3 text-right text-xs font-semibold uppercase tracking-wide">
                              <div className="flex flex-col items-end gap-0.5">
                                <span className={isLowest[i] ? "text-green-600" : "text-muted-foreground"}>{col}</span>
                                {isLowest[i] && (
                                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 h-4 px-1 text-[10px]">
                                    ★ Lowest
                                  </Badge>
                                )}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        <tr>
                          <td className="text-muted-foreground py-2.5 text-sm">
                            Taxable Income
                          </td>
                          <td className="py-2.5 text-right tabular-nums font-medium">
                            {formatPHP(result.totalTaxableCompensation)}
                          </td>
                          <td className="py-2.5 text-right tabular-nums font-medium">
                            {formatPHP(result.totalTaxableCompensation)}
                          </td>
                          <td className="py-2.5 text-right tabular-nums font-medium">
                            {formatPHP(result.totalGrossCompensation)}
                            <span className="text-muted-foreground ml-0.5 text-[10px]">
                              *
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="text-muted-foreground py-2.5 text-sm">
                            Income Tax Payable
                          </td>
                          <td className="py-2.5 text-right tabular-nums font-semibold">
                            {formatPHP(result.incomeTaxItemised)}
                          </td>
                          <td className="py-2.5 text-right tabular-nums font-semibold">
                            {formatPHP(result.incomeTaxOSD)}
                          </td>
                          <td className="py-2.5 text-right tabular-nums font-semibold">
                            {formatPHP(result.incomeTaxEightPct)}
                          </td>
                        </tr>
                        <tr>
                          <td className="text-muted-foreground py-2.5 text-sm">
                            Other Percentage Tax
                          </td>
                          <td className="text-muted-foreground py-2.5 text-right tabular-nums">
                            —
                          </td>
                          <td className="text-muted-foreground py-2.5 text-right tabular-nums">
                            —
                          </td>
                          <td className="text-muted-foreground py-2.5 text-right tabular-nums">
                            —
                          </td>
                        </tr>
                        <tr className="border-t-2 font-bold">
                          <td className="py-3">Total Tax Payable</td>
                          <td className={`py-3 text-right tabular-nums text-base ${isLowest[0] ? "text-green-600" : ""}`}>
                            {php(result.totalTaxItemised)}
                          </td>
                          <td className={`py-3 text-right tabular-nums text-base ${isLowest[1] ? "text-green-600" : ""}`}>
                            {php(result.totalTaxOSD)}
                          </td>
                          <td className={`py-3 text-right tabular-nums text-base ${isLowest[2] ? "text-green-600" : ""}`}>
                            {php(result.totalTaxEightPct)}
                          </td>
                        </tr>
                        {gross > 0 && (
                          <tr>
                            <td className="text-muted-foreground py-2 text-xs">
                              Effective rate
                            </td>
                            <td className="text-muted-foreground py-2 text-right tabular-nums text-xs">
                              {((result.totalTaxItemised / gross) * 100).toFixed(1)}%
                            </td>
                            <td className="text-muted-foreground py-2 text-right tabular-nums text-xs">
                              {((result.totalTaxOSD / gross) * 100).toFixed(1)}%
                            </td>
                            <td className="text-muted-foreground py-2 text-right tabular-nums text-xs">
                              {((result.totalTaxEightPct / gross) * 100).toFixed(1)}%
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                      );
                    })()}
                    <p className="text-muted-foreground mt-2 text-xs">
                      * Under the 8% rate, gross compensation (less ₱250,000) is the base.
                      The 40% OSD and 8% methods are generally for self-employed / mixed-income
                      earners and are shown for comparison only.
                    </p>
                  </CardContent>
                </Card>

                {/* Year-end adjustment result */}
                <Card className="shadow-sm">
                  <CardHeader className="border-b">
                    <CardTitle className="text-lg font-semibold">
                      Year-End Tax Adjustment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-0 divide-y">
                      <div className="flex items-center justify-between py-2.5">
                        <span className="text-muted-foreground text-sm">
                          Total Tax Withheld (all employers)
                        </span>
                        <span className="tabular-nums text-sm font-semibold">
                          {php(result.totalTaxWithheld)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2.5">
                        <span className="text-muted-foreground text-sm">
                          Annual Tax Due (Itemised)
                        </span>
                        <span className="tabular-nums text-sm font-semibold">
                          {php(result.totalTaxItemised)}
                        </span>
                      </div>
                    </div>

                    {/* Verdict */}
                    <div className="mt-4">
                      {result.overUnderItemised >= 0 ? (
                        <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/30">
                          <TrendingDown className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                          <div>
                            <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                              Over-Withheld — Refund Due
                            </p>
                            <p className="mt-0.5 text-sm text-green-700 dark:text-green-400">
                              Your employer refunds you{" "}
                              <strong>{php(result.overUnderItemised)}</strong> on or
                              before the last payroll period of the year.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-950/30">
                          <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />
                          <div>
                            <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">
                              Under-Withheld — Additional Tax Due
                            </p>
                            <p className="mt-0.5 text-sm text-orange-700 dark:text-orange-400">
                              You owe an additional{" "}
                              <strong>{php(Math.abs(result.overUnderItemised))}</strong>{" "}
                              to be collected on the last payroll period of the year.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Multiple employer note */}
                    {employerCount > 1 && (
                      <p className="text-muted-foreground mt-4 text-xs">
                        With multiple employers, the year-end adjustment must be processed
                        by your present (current) employer who consolidates all income.
                        The present employer collects or refunds the difference.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Disclaimer */}
                <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  For illustrative purposes only. Based on BIR TRAIN Law annual income
                  tax table for 2026. Consult your employer&apos;s payroll officer or a tax
                  professional for the official year-end adjustment computation.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
