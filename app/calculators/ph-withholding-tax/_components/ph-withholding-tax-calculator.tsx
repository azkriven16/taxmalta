"use client";

import { useCallback, useMemo, useState } from "react";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Calculator, RotateCcw } from "lucide-react";
import {
  calcPhWithholding,
  type EmploymentType,
  type PayrollPeriod,
} from "@/lib/calcPhWithholding";

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

function ResultRow({
  label,
  value,
  indent = false,
  bold = false,
  highlight = false,
  muted = false,
  negative = false,
}: {
  label: string;
  value: string;
  indent?: boolean;
  bold?: boolean;
  highlight?: boolean;
  muted?: boolean;
  negative?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span
        className={`text-sm ${indent ? "pl-4" : ""} ${
          muted ? "text-muted-foreground" : bold ? "font-semibold text-foreground" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
      <span
        className={`tabular-nums text-sm ${bold ? "font-semibold" : ""} ${
          highlight ? "text-primary text-base font-bold" : ""
        } ${negative ? "text-red-600" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Tax bracket reference data ───────────────────────────────────────────

const TAX_BRACKETS = {
  weekly: [
    { from: 0, to: 4807, base: 0, rate: 0 },
    { from: 4808, to: 7691, base: 0, rate: 15 },
    { from: 7692, to: 15384, base: 432.6, rate: 20 },
    { from: 15385, to: 38461, base: 1971.2, rate: 25 },
    { from: 38462, to: 153845, base: 7740.45, rate: 30 },
    { from: 153846, to: null, base: 42355.65, rate: 35 },
  ],
  "semi-monthly": [
    { from: 0, to: 10416, base: 0, rate: 0 },
    { from: 10417, to: 16666, base: 0, rate: 15 },
    { from: 16667, to: 33332, base: 937.5, rate: 20 },
    { from: 33333, to: 83332, base: 4270.7, rate: 25 },
    { from: 83333, to: 333332, base: 16770.7, rate: 30 },
    { from: 333333, to: null, base: 91770.7, rate: 35 },
  ],
  monthly: [
    { from: 0, to: 20832, base: 0, rate: 0 },
    { from: 20833, to: 33332, base: 0, rate: 15 },
    { from: 33333, to: 66666, base: 1875, rate: 20 },
    { from: 66667, to: 166666, base: 8541.8, rate: 25 },
    { from: 166667, to: 666666, base: 33541.8, rate: 30 },
    { from: 666667, to: null, base: 183541.8, rate: 35 },
  ],
};

const PERIOD_LABEL: Record<PayrollPeriod, string> = {
  weekly: "Weekly",
  "semi-monthly": "Semi-Monthly",
  monthly: "Monthly",
};

// ─── Main Component ───────────────────────────────────────────────────────

export default function PhWithholdingTaxCalculator() {
  const [employmentType, setEmploymentType] = useState<EmploymentType>("private");
  const [payrollPeriod, setPayrollPeriod] = useState<PayrollPeriod>("monthly");
  const [grossSalary, setGrossSalary] = useState("");
  const [overtimePay, setOvertimePay] = useState("");
  const [otherAllowances, setOtherAllowances] = useState("");
  const [otherBenefits, setOtherBenefits] = useState("");

  const resetForm = useCallback(() => {
    setGrossSalary("");
    setOvertimePay("");
    setOtherAllowances("");
    setOtherBenefits("");
  }, []);

  const result = useMemo(() => {
    const parse = (v: string) => Math.max(parseFloat(v) || 0, 0);
    const salary = parse(grossSalary);
    if (!salary) return null;
    return calcPhWithholding({
      employmentType,
      civilStatus: "single",
      payrollPeriod,
      grossSalary: salary,
      overtimePay: parse(overtimePay),
      otherTaxableAllowances: parse(otherAllowances),
      otherTaxableBenefits: parse(otherBenefits),
    });
  }, [
    employmentType,
    payrollPeriod,
    grossSalary,
    overtimePay,
    otherAllowances,
    otherBenefits,
  ]);

  const brackets = TAX_BRACKETS[payrollPeriod];

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <Badge variant="secondary">Philippines — BIR 2025/2026</Badge>
          <h1 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">
            Withholding Tax Validation Calculator
          </h1>
          <p className="text-muted-foreground leading-relaxed text-pretty">
            Compute your correct per-payslip withholding tax based on the BIR Revised
            Withholding Tax Table. Supports Private and Government employees on
            Weekly, Semi-Monthly, or Monthly payroll.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* ── Left: Inputs ── */}
          <div className="space-y-5 lg:col-span-2">
            <Card className="shadow-sm">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                    Your Income Situation
                  </CardTitle>
                  {grossSalary && (
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
              <CardContent className="space-y-5 pt-6">
                {/* Employment Type */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium leading-none">
                    Employment Type
                  </label>
                  <Select
                    value={employmentType}
                    onValueChange={(v) => setEmploymentType(v as EmploymentType)}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Private Employee</SelectItem>
                      <SelectItem value="government">Government Employee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Payroll Period */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium leading-none">
                    Payroll Period
                  </label>
                  <Select
                    value={payrollPeriod}
                    onValueChange={(v) => setPayrollPeriod(v as PayrollPeriod)}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="semi-monthly">Semi-Monthly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Gross Salary */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium leading-none">
                    Gross Salary per Payslip
                  </label>
                  <CurrencyInput
                    symbol="₱"
                    value={grossSalary}
                    onValueChange={setGrossSalary}
                    placeholder="0.00"
                  />
                </div>

                {/* Overtime */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium leading-none">
                    Overtime Pay per Payslip
                  </label>
                  <CurrencyInput
                    symbol="₱"
                    value={overtimePay}
                    onValueChange={setOvertimePay}
                    placeholder="0.00"
                  />
                </div>

                {/* Other Allowances */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium leading-none">
                    Other Taxable Allowances per Payslip
                  </label>
                  <CurrencyInput
                    symbol="₱"
                    value={otherAllowances}
                    onValueChange={setOtherAllowances}
                    placeholder="0.00"
                  />
                  <p className="text-muted-foreground text-xs">
                    Included in SSS base for contribution computation.
                  </p>
                </div>

                {/* Other Benefits */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium leading-none">
                    Other Taxable Benefits per Payslip
                  </label>
                  <CurrencyInput
                    symbol="₱"
                    value={otherBenefits}
                    onValueChange={setOtherBenefits}
                    placeholder="0.00"
                  />
                  <p className="text-muted-foreground text-xs">
                    Taxable portion of 13th month pay, bonuses, etc.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Tax bracket reference */}
            <Card className="shadow-sm">
              <CardHeader className="border-b">
                <CardTitle className="text-base font-semibold">
                  {PERIOD_LABEL[payrollPeriod]} Tax Brackets
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
                    {brackets.map((b) => (
                      <tr
                        key={b.from}
                        className={
                          result &&
                          result.taxableIncome >= b.from &&
                          (b.to === null || result.taxableIncome <= b.to)
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
          <div className="space-y-5 lg:col-span-3">
            {!result ? (
              <Card className="shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="bg-muted mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                    <Calculator className="text-muted-foreground h-6 w-6" />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Enter your gross salary to compute
                    <br />
                    your withholding tax.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Tax Obligations Summary */}
                <Card className="shadow-sm">
                  <CardHeader className="border-b">
                    <CardTitle className="text-lg font-semibold">
                      Tax Obligations Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="divide-y pt-2">
                    <ResultRow
                      label="Gross Income for the Period"
                      value={php(result.grossIncome)}
                      bold
                    />

                    <div className="py-1">
                      <p className="text-muted-foreground py-1 text-xs font-semibold uppercase tracking-wide">
                        Less: Mandatory Employee Contributions
                      </p>
                      {result.sss > 0 && (
                        <ResultRow
                          label="SSS Employee Share"
                          value={`(${php(result.sss)})`}
                          indent
                          muted
                          negative
                        />
                      )}
                      {result.gsis > 0 && (
                        <ResultRow
                          label="GSIS Employee Share"
                          value={`(${php(result.gsis)})`}
                          indent
                          muted
                          negative
                        />
                      )}
                      <ResultRow
                        label="Pag-IBIG (HDMF)"
                        value={`(${php(result.pagibig)})`}
                        indent
                        muted
                        negative
                      />
                      <ResultRow
                        label="PhilHealth Employee Share"
                        value={`(${php(result.philhealth)})`}
                        indent
                        muted
                        negative
                      />
                    </div>

                    <ResultRow
                      label="Total Contributions Deducted"
                      value={`(${php(result.totalContributions)})`}
                      bold
                      negative
                    />
                    <ResultRow
                      label="Net Salary Subject to Withholding Tax"
                      value={php(result.taxableIncome)}
                      bold
                    />
                    <ResultRow
                      label={`Withholding Tax Liability (${PERIOD_LABEL[payrollPeriod]})`}
                      value={php(result.withholdingTax)}
                      highlight
                      bold
                    />
                    {result.taxableIncome > 0 && (
                      <div className="flex items-center justify-between py-2.5">
                        <span className="text-muted-foreground text-xs">
                          Effective WHT rate
                        </span>
                        <span className="text-muted-foreground tabular-nums text-xs">
                          {((result.withholdingTax / result.taxableIncome) * 100).toFixed(1)}% of taxable income
                        </span>
                      </div>
                    )}
                    {result.withholdingTax > 0 && (
                      <div className="flex items-center justify-between py-2.5 border-t">
                        <span className="text-muted-foreground text-xs">
                          Annualised WHT (×{payrollPeriod === "weekly" ? 52 : payrollPeriod === "semi-monthly" ? 24 : 12})
                        </span>
                        <span className="tabular-nums text-xs font-medium">
                          {php(result.withholdingTax * (payrollPeriod === "weekly" ? 52 : payrollPeriod === "semi-monthly" ? 24 : 12))}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Contributions breakdown */}
                <Card className="shadow-sm">
                  <CardHeader className="border-b">
                    <CardTitle className="text-base font-semibold">
                      Mandatory Contributions Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-x-auto pt-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          {["Contribution", "Basis", "Rate", "Amount"].map((h) => (
                            <th
                              key={h}
                              className="text-muted-foreground pb-3 text-right text-xs font-semibold uppercase tracking-wide first:text-left"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y text-sm">
                        {result.sss > 0 && (
                          <tr className="text-muted-foreground">
                            <td className="text-foreground py-2.5 font-medium">SSS</td>
                            <td className="py-2.5 text-right tabular-nums">
                              {formatPHP(
                                Math.max(
                                  parseFloat(grossSalary) || 0,
                                  0,
                                ) + Math.max(parseFloat(otherAllowances) || 0, 0),
                              )}
                            </td>
                            <td className="py-2.5 text-right">5% / {periodDivisorLabel(payrollPeriod)}</td>
                            <td className="py-2.5 text-right tabular-nums font-medium">
                              {formatPHP(result.sss)}
                            </td>
                          </tr>
                        )}
                        {result.gsis > 0 && (
                          <tr className="text-muted-foreground">
                            <td className="text-foreground py-2.5 font-medium">GSIS</td>
                            <td className="py-2.5 text-right tabular-nums">
                              {formatPHP(Math.max(parseFloat(grossSalary) || 0, 0))}
                            </td>
                            <td className="py-2.5 text-right">9%</td>
                            <td className="py-2.5 text-right tabular-nums font-medium">
                              {formatPHP(result.gsis)}
                            </td>
                          </tr>
                        )}
                        <tr className="text-muted-foreground">
                          <td className="text-foreground py-2.5 font-medium">PhilHealth</td>
                          <td className="py-2.5 text-right tabular-nums">
                            {formatPHP(
                              Math.min(Math.max(parseFloat(grossSalary) || 0, 0), 100000),
                            )}
                          </td>
                          <td className="py-2.5 text-right">2.5%</td>
                          <td className="py-2.5 text-right tabular-nums font-medium">
                            {formatPHP(result.philhealth)}
                          </td>
                        </tr>
                        <tr className="text-muted-foreground">
                          <td className="text-foreground py-2.5 font-medium">Pag-IBIG</td>
                          <td className="py-2.5 text-right tabular-nums">
                            {formatPHP(Math.max(parseFloat(grossSalary) || 0, 0))}
                          </td>
                          <td className="py-2.5 text-right">2% / {periodDivisorLabel(payrollPeriod)}</td>
                          <td className="py-2.5 text-right tabular-nums font-medium">
                            {formatPHP(result.pagibig)}
                          </td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 font-semibold">
                          <td className="pt-3" colSpan={3}>
                            Total Deductions
                          </td>
                          <td className="pt-3 text-right tabular-nums">
                            {formatPHP(result.totalContributions)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </CardContent>
                </Card>

                {/* De minimis info */}
                <Card className="shadow-sm">
                  <CardHeader className="border-b">
                    <CardTitle className="text-base font-semibold">
                      De Minimis Benefits Reference
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-muted-foreground pb-2 text-left text-xs font-semibold uppercase tracking-wide">
                            Benefit
                          </th>
                          <th className="text-muted-foreground pb-2 text-right text-xs font-semibold uppercase tracking-wide">
                            Exempt Limit
                          </th>
                        </tr>
                      </thead>
                      <tbody className="text-muted-foreground divide-y text-xs">
                        {[
                          ["Rice Subsidy", "₱2,500/month or 1 sack (50 kg)"],
                          ["Medical Cash Allowance (dependents)", "₱333/month (₱2,000/semester)"],
                          ["Laundry Allowance", "₱400/month"],
                          ["Uniform & Clothing Allowance", "₱8,000/year"],
                          ["Employee Achievement Awards", "₱12,000/year"],
                          ["Christmas / Anniversary Gifts", "₱6,000/year"],
                          ["CBA & Productivity Incentives", "₱12,000/year"],
                          ["13th Month Pay & Other Benefits", "₱90,000/year"],
                        ].map(([benefit, limit]) => (
                          <tr key={benefit}>
                            <td className="py-2">{benefit}</td>
                            <td className="py-2 text-right font-medium text-foreground">
                              {limit}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="text-muted-foreground mt-3 text-xs">
                      Amounts within the limits above are exempt from income tax and
                      should not be included in taxable income. The excess is taxable.
                    </p>
                  </CardContent>
                </Card>

                {/* Disclaimer */}
                <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  For illustrative purposes only. Based on BIR Revised Withholding Tax
                  Table 2025/2026. Consult a tax professional for filing obligations.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function periodDivisorLabel(period: PayrollPeriod): string {
  if (period === "weekly") return "÷4";
  if (period === "semi-monthly") return "÷2";
  return "monthly";
}
