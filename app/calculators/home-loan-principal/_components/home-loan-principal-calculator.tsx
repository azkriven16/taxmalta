"use client";

import { useCallback, useMemo, useState } from "react";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TrendingDown, Clock, AlertCircle } from "lucide-react";
import {
  calcOptionA,
  calcOptionB,
  type HomeLoanBase,
} from "@/lib/calcHomeLoan";

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

function parsePositive(val: string): number {
  return Math.max(parseFloat(val) || 0, 0);
}

function monthsToYearsLabel(months: number): string {
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts: string[] = [];
  if (y > 0) parts.push(`${y} yr${y > 1 ? "s" : ""}`);
  if (m > 0) parts.push(`${m} mo${m > 1 ? "s" : ""}`);
  return parts.join(" ") || "0 months";
}

// ─── Sub-components ───────────────────────────────────────────────────────

function FieldRow({
  label,
  value,
  bold = false,
  highlight = false,
  green = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
  highlight?: boolean;
  green?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <span
        className={`text-sm leading-snug ${bold ? "font-semibold text-foreground" : "text-muted-foreground"}`}
      >
        {label}
      </span>
      <span
        className={`shrink-0 tabular-nums text-sm ${bold ? "font-semibold" : ""} ${highlight ? "text-primary font-bold text-base" : ""} ${green ? "font-bold text-green-600" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

function InputField({
  id,
  label,
  note,
  value,
  onChange,
}: {
  id: string;
  label: string;
  note?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium leading-none">
        {label}
      </label>
      <CurrencyInput
        id={id}
        symbol="₱"
        value={value}
        onValueChange={onChange}
        placeholder="0.00"
      />
      {note && <p className="text-muted-foreground text-xs">{note}</p>}
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="shadow-sm">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="bg-muted mb-4 flex h-14 w-14 items-center justify-center rounded-full">
          <AlertCircle className="text-muted-foreground h-6 w-6" />
        </div>
        <p className="text-muted-foreground text-sm">
          Fill in your loan details to see results.
        </p>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────

interface FormState {
  loanBalance: string;
  monthlyAmortization: string;
  mri: string;
  annualRatePct: string; // entered as percent, e.g. "6" for 6%
  extraPayment: string;
  targetMonths: string;
}

const DEFAULT: FormState = {
  loanBalance: "",
  monthlyAmortization: "",
  mri: "",
  annualRatePct: "",
  extraPayment: "",
  targetMonths: "",
};

const HOW_IT_WORKS_STEPS = [
  {
    step: "1",
    title: "Enter your loan details",
    body: "Input your outstanding balance, current monthly payment, MRI cost, and interest rate.",
  },
  {
    step: "2",
    title: "Choose a scenario",
    body: "Option A: enter how much you can pay monthly. Option B: enter how many months you want to finish in.",
  },
  {
    step: "3",
    title: "See your savings",
    body: "The calculator shows the time saved, final payment amount, and total interest saved vs. your current schedule.",
  },
] as const;

export default function HomeLoanPrincipalCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULT);

  const set = useCallback(
    (field: keyof FormState) => (value: string) =>
      setForm((prev) => ({ ...prev, [field]: value })),
    [],
  );

  const base = useMemo<HomeLoanBase | null>(() => {
    const loanBalance = parsePositive(form.loanBalance);
    const monthlyAmortization = parsePositive(form.monthlyAmortization);
    const mri = parsePositive(form.mri);
    const annualRate = parsePositive(form.annualRatePct) / 100;
    if (!loanBalance || !monthlyAmortization || !annualRate) return null;
    return { loanBalance, monthlyAmortization, mri, annualRate };
  }, [form.loanBalance, form.monthlyAmortization, form.mri, form.annualRatePct]);

  const resultA = useMemo(() => {
    if (!base) return null;
    const extra = parsePositive(form.extraPayment);
    if (!extra) return null;
    return calcOptionA(base, extra);
  }, [base, form.extraPayment]);

  const resultB = useMemo(() => {
    if (!base) return null;
    const months = Math.round(parsePositive(form.targetMonths));
    if (!months) return null;
    return calcOptionB(base, months);
  }, [base, form.targetMonths]);

  const hasAnyResult = resultA !== null || resultB !== null;

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <Badge variant="secondary">Philippines</Badge>
          <h1 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">
            Home Loan — Applied to Principal Calculator
          </h1>
          <p className="text-muted-foreground leading-relaxed text-pretty">
            See how paying extra towards your principal reduces your loan term
            and total interest. Enter your loan details then choose a scenario
            to explore.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* ── Left: Inputs ── */}
          <div className="space-y-5 lg:col-span-2">
            {/* Loan Details */}
            <Card className="shadow-sm">
              <CardHeader className="border-b">
                <CardTitle className="text-lg font-semibold">
                  Your Home Loan Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                <InputField
                  id="loanBalance"
                  label="Current Loan Balance"
                  value={form.loanBalance}
                  onChange={set("loanBalance")}
                />
                <InputField
                  id="monthlyAmortization"
                  label="Monthly Amortisation"
                  note="Your full monthly payment (principal + interest + MRI)"
                  value={form.monthlyAmortization}
                  onChange={set("monthlyAmortization")}
                />
                <InputField
                  id="mri"
                  label="Monthly MRI & Fire Insurance"
                  note="Mortgage Redemption Insurance + Fire Insurance combined"
                  value={form.mri}
                  onChange={set("mri")}
                />

                <div className="space-y-1.5">
                  <label
                    htmlFor="annualRatePct"
                    className="text-sm font-medium leading-none"
                  >
                    Annual Interest Rate (%)
                  </label>
                  <div className="relative">
                    <input
                      id="annualRatePct"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="e.g. 6.5"
                      value={form.annualRatePct}
                      onChange={(e) => set("annualRatePct")(e.target.value)}
                      className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring h-11 w-full rounded-md border px-3 pr-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    />
                    <span className="text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 select-none text-sm">
                      %
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Question A */}
            <Card className="shadow-sm">
              <CardHeader className="border-b">
                <div className="space-y-0.5">
                  <CardTitle className="text-base font-semibold">
                    Option A — How long will it take?
                  </CardTitle>
                  <p className="text-muted-foreground text-xs">
                    Enter the higher monthly amount you want to pay
                  </p>
                </div>
              </CardHeader>
              <CardContent className="pt-5">
                <InputField
                  id="extraPayment"
                  label="New Monthly Payment (including excess to principal)"
                  note="Must be greater than your current amortisation for savings to show"
                  value={form.extraPayment}
                  onChange={set("extraPayment")}
                />
              </CardContent>
            </Card>

            {/* Question B */}
            <Card className="shadow-sm">
              <CardHeader className="border-b">
                <div className="space-y-0.5">
                  <CardTitle className="text-base font-semibold">
                    Option B — How much do I need to pay?
                  </CardTitle>
                  <p className="text-muted-foreground text-xs">
                    Enter your target number of months to pay off the loan
                  </p>
                </div>
              </CardHeader>
              <CardContent className="pt-5">
                <div className="space-y-1.5">
                  <label
                    htmlFor="targetMonths"
                    className="text-sm font-medium leading-none"
                  >
                    Target Months to Pay Off
                  </label>
                  <div className="relative">
                    <input
                      id="targetMonths"
                      type="number"
                      inputMode="numeric"
                      min="1"
                      step="1"
                      placeholder="e.g. 120"
                      value={form.targetMonths}
                      onChange={(e) => set("targetMonths")(e.target.value)}
                      className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring h-11 w-full rounded-md border px-3 pr-16 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    />
                    <span className="text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 select-none text-sm">
                      months
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {form.targetMonths && parsePositive(form.targetMonths) > 0
                      ? `= ${monthsToYearsLabel(Math.round(parsePositive(form.targetMonths)))}`
                      : "e.g. 120 = 10 years"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Right: Results ── */}
          <div className="space-y-5 lg:col-span-3">
            {!base && <EmptyState />}

            {/* Option A Results */}
            {base && form.extraPayment && (
              <>
                {resultA ? (
                  <Card className="shadow-sm">
                    <CardHeader className="border-b">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold">
                          Option A — Results
                        </CardTitle>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Pay {php(parsePositive(form.extraPayment))}/mo
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="divide-y pt-2">
                      <FieldRow
                        label="Months to pay off loan"
                        value={`${resultA.months} months`}
                        bold
                        highlight
                      />
                      <FieldRow
                        label="Equivalent duration"
                        value={monthsToYearsLabel(resultA.months)}
                      />
                      <FieldRow
                        label="Current schedule (no extra)"
                        value={`${resultA.originalMonths} months (${monthsToYearsLabel(resultA.originalMonths)})`}
                      />
                      <FieldRow
                        label="Time saved"
                        value={monthsToYearsLabel(
                          resultA.originalMonths - resultA.months,
                        )}
                        bold
                        green
                      />
                      <FieldRow
                        label="Final payment (last month)"
                        value={php(resultA.finalPayment)}
                        bold
                      />

                      <Separator className="my-1" />

                      <FieldRow
                        label="Total interest (current schedule)"
                        value={php(resultA.originalTotalInterest)}
                      />
                      <FieldRow
                        label="Total interest (with extra payment)"
                        value={php(resultA.newTotalInterest)}
                      />
                      <FieldRow
                        label="Interest saved"
                        value={php(resultA.interestSaved)}
                        bold
                        green
                      />
                    </CardContent>
                  </Card>
                ) : (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      The payment amount entered for Option A is too low to
                      cover the monthly interest. Please enter a higher amount.
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}

            {/* Option B Results */}
            {base && form.targetMonths && (
              <>
                {resultB ? (
                  <Card className="shadow-sm">
                    <CardHeader className="border-b">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold">
                          Option B — Results
                        </CardTitle>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {Math.round(parsePositive(form.targetMonths))} months target
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="divide-y pt-2">
                      <FieldRow
                        label="Required monthly payment"
                        value={php(resultB.requiredMonthlyPayment)}
                        bold
                        highlight
                      />
                      <FieldRow
                        label="Current monthly amortisation"
                        value={php(parsePositive(form.monthlyAmortization))}
                      />
                      <FieldRow
                        label="Additional amount needed per month"
                        value={php(
                          Math.max(
                            resultB.requiredMonthlyPayment -
                              parsePositive(form.monthlyAmortization),
                            0,
                          ),
                        )}
                        bold
                      />
                      <FieldRow
                        label="Current schedule (no change)"
                        value={`${resultB.originalMonths} months (${monthsToYearsLabel(resultB.originalMonths)})`}
                      />
                      <FieldRow
                        label="Time saved"
                        value={monthsToYearsLabel(
                          Math.max(
                            resultB.originalMonths -
                              Math.round(parsePositive(form.targetMonths)),
                            0,
                          ),
                        )}
                        bold
                        green
                      />

                      <Separator className="my-1" />

                      <FieldRow
                        label="Total interest (current schedule)"
                        value={php(resultB.originalTotalInterest)}
                      />
                      <FieldRow
                        label="Total interest (target schedule)"
                        value={php(resultB.newTotalInterest)}
                      />
                      <FieldRow
                        label="Interest saved"
                        value={php(resultB.interestSaved)}
                        bold
                        green
                      />
                    </CardContent>
                  </Card>
                ) : (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Target months must be greater than zero.
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}

            {/* Show empty state if base is filled but no question answered */}
            {base && !form.extraPayment && !form.targetMonths && (
              <Card className="shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="bg-muted mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                    <TrendingDown className="text-muted-foreground h-6 w-6" />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Loan details saved. Now fill in Option A or Option B
                    <br />
                    to see your savings.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Savings summary alert when both options are filled */}
            {resultA && resultB && (
              <Alert className="border-green-500/30 bg-green-500/10">
                <TrendingDown className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-sm">
                  <strong>Option A</strong> saves{" "}
                  <strong>{php(resultA.interestSaved)}</strong> in interest
                  over {monthsToYearsLabel(resultA.originalMonths - resultA.months)}.{" "}
                  <strong>Option B</strong> saves{" "}
                  <strong>{php(resultB.interestSaved)}</strong> in interest by
                  paying{" "}
                  <strong>{php(resultB.requiredMonthlyPayment)}/month</strong>.
                </AlertDescription>
              </Alert>
            )}

            {/* Disclaimer */}
            {hasAnyResult && (
              <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <AlertCircle className="h-3 w-3 shrink-0" />
                For indicative purposes only. Results assume a fixed interest
                rate and that excess payments are applied directly to principal
                each month. Consult your bank for exact figures.
              </p>
            )}
          </div>
        </div>

        {/* How it works */}
        <div>
          <h2 className="mb-4 text-2xl font-bold lg:text-3xl">
            How It Works
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {HOW_IT_WORKS_STEPS.map(({ step, title, body }) => (
              <Card key={step} className="shadow-sm">
                <CardContent className="pt-5">
                  <div className="bg-primary/10 text-primary mb-3 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold">
                    {step}
                  </div>
                  <p className="mb-1 text-sm font-semibold">{title}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {body}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
