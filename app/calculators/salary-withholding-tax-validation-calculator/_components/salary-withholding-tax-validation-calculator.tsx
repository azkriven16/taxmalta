"use client";

import { useMemo, useState, useRef, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, ChevronRight, AlertCircle } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────

type PayrollPeriod = "Weekly" | "Semi-Monthly" | "Monthly";

type TaxStatus =
  | "single"
  | "married-no-child"
  | "married-one-child"
  | "married-two-plus"
  | "parent-one-child"
  | "parent-two-plus";

interface TaxBracket {
  from: number;
  to: number;
  rate: number;
  subtract: number;
}

interface TaxResult {
  annualIncome: number;
  annualTax: number;
  periodTax: number;
  effectiveRate: number;
  bracket: TaxBracket | null;
  multiplier: number;
  grossSalary: number;
}

interface FormState {
  grossSalary: string;
  period: PayrollPeriod;
  taxStatus: TaxStatus;
}

// ─── Constants ────────────────────────────────────────────────────────────

const PERIOD_MULTIPLIERS: Record<PayrollPeriod, number> = {
  Weekly: 52,
  "Semi-Monthly": 24,
  Monthly: 12,
};

const TAX_TABLES: Record<TaxStatus, TaxBracket[]> = {
  single: [
    { from: 0, to: 12000, rate: 0, subtract: 0 },
    { from: 12001, to: 16000, rate: 0.15, subtract: 1800 },
    { from: 16001, to: 60000, rate: 0.25, subtract: 3400 },
    { from: 60001, to: Infinity, rate: 0.35, subtract: 9400 },
  ],
  "married-no-child": [
    { from: 0, to: 15000, rate: 0, subtract: 0 },
    { from: 15001, to: 23000, rate: 0.15, subtract: 2250 },
    { from: 23001, to: 60000, rate: 0.25, subtract: 4550 },
    { from: 60001, to: Infinity, rate: 0.35, subtract: 10550 },
  ],
  "married-one-child": [
    { from: 0, to: 17500, rate: 0, subtract: 0 },
    { from: 17501, to: 26500, rate: 0.15, subtract: 2625 },
    { from: 26501, to: 60000, rate: 0.25, subtract: 5275 },
    { from: 60001, to: Infinity, rate: 0.35, subtract: 11275 },
  ],
  "married-two-plus": [
    { from: 0, to: 22500, rate: 0, subtract: 0 },
    { from: 22501, to: 32000, rate: 0.15, subtract: 3375 },
    { from: 32001, to: 60000, rate: 0.25, subtract: 6575 },
    { from: 60001, to: Infinity, rate: 0.35, subtract: 12575 },
  ],
  "parent-one-child": [
    { from: 0, to: 14500, rate: 0, subtract: 0 },
    { from: 14501, to: 21000, rate: 0.15, subtract: 2175 },
    { from: 21001, to: 60000, rate: 0.25, subtract: 4275 },
    { from: 60001, to: Infinity, rate: 0.35, subtract: 10270 },
  ],
  "parent-two-plus": [
    { from: 0, to: 18500, rate: 0, subtract: 0 },
    { from: 18501, to: 25500, rate: 0.15, subtract: 2775 },
    { from: 25501, to: 60000, rate: 0.25, subtract: 5325 },
    { from: 60001, to: Infinity, rate: 0.35, subtract: 11325 },
  ],
};

const TAX_STATUS_OPTIONS: { value: TaxStatus; label: string }[] = [
  { value: "single", label: "Single" },
  { value: "married-no-child", label: "Married with No Child" },
  { value: "married-one-child", label: "Married with One Child" },
  { value: "married-two-plus", label: "Married with Two or More Children" },
  { value: "parent-one-child", label: "Parent with One Child" },
  { value: "parent-two-plus", label: "Parent with Two or More Children" },
];

const PAYROLL_PERIOD_OPTIONS: PayrollPeriod[] = [
  "Weekly",
  "Semi-Monthly",
  "Monthly",
];

// ─── Helpers ──────────────────────────────────────────────────────────────

function getAppliedBracket(
  annualIncome: number,
  status: TaxStatus,
): TaxBracket | null {
  return TAX_TABLES[status].find((b) => annualIncome <= b.to) ?? null;
}

function computeAnnualTax(
  annualIncome: number,
  status: TaxStatus,
): number | null {
  const bracket = getAppliedBracket(annualIncome, status);
  if (!bracket) return null;
  if (bracket.rate === 0) return 0;
  return annualIncome * bracket.rate - bracket.subtract;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("en-MT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Adds thousand comma separators while preserving ongoing decimal input */
function formatWithCommas(raw: string): string {
  if (!raw) return "";
  const [intPart, decPart] = raw.split(".");
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
}

function stripCommas(value: string): string {
  return value.replace(/,/g, "");
}

// ─── CurrencyInput ────────────────────────────────────────────────────────

interface CurrencyInputProps {
  id?: string;
  value: string;
  onValueChange: (raw: string) => void;
  placeholder?: string;
}

function CurrencyInput({
  id,
  value,
  onValueChange,
  placeholder = "0.00",
}: CurrencyInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Show raw value while typing (so cursor doesn't jump),
  // show comma-formatted when blurred for readability.
  const displayValue = isFocused ? value : formatWithCommas(value);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = stripCommas(e.target.value);
      // Only allow digits + one decimal point with up to 2 decimal places
      if (/^\d*\.?\d{0,2}$/.test(raw)) {
        onValueChange(raw);
      }
    },
    [onValueChange],
  );

  return (
    <div
      className={`bg-background flex items-center overflow-hidden rounded-md border transition-all ${
        isFocused ? "ring-ring ring-2 ring-offset-2" : ""
      }`}
    >
      <span className="bg-muted text-muted-foreground flex h-10 items-center border-r px-3 text-sm font-medium select-none">
        €
      </span>
      <input
        ref={inputRef}
        id={id}
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="text-foreground placeholder:text-muted-foreground h-10 w-full bg-transparent px-3 text-sm tabular-nums outline-none"
      />
    </div>
  );
}

// ─── ResultRow ────────────────────────────────────────────────────────────

function ResultRow({
  label,
  value,
  highlighted = false,
}: {
  label: string;
  value: string;
  highlighted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span
        className={`font-semibold tabular-nums ${
          highlighted ? "text-primary text-lg" : "text-foreground text-sm"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

// ─── BracketTable ─────────────────────────────────────────────────────────

function BracketTable({ brackets }: { brackets: TaxBracket[] }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b">
          {["From", "To", "Rate", "Subtract"].map((h) => (
            <th
              key={h}
              className="text-muted-foreground pb-2 text-left text-xs font-medium tracking-wider uppercase"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y">
        {brackets.map((b, i) => (
          <tr key={i}>
            <td className="text-muted-foreground py-2.5 tabular-nums">
              €{b.from.toLocaleString()}
            </td>
            <td className="text-muted-foreground py-2.5 tabular-nums">
              {b.to === Infinity ? "and over" : `€${b.to.toLocaleString()}`}
            </td>
            <td
              className={`py-2.5 font-semibold tabular-nums ${
                b.rate > 0 ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {(b.rate * 100).toFixed(0)}%
            </td>
            <td className="text-muted-foreground py-2.5 tabular-nums">
              €{b.subtract.toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── BreakdownStep ────────────────────────────────────────────────────────

function BreakdownStep({
  expression,
  result,
  isLast = false,
}: {
  expression: string;
  result: string;
  isLast?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between py-2 text-xs tabular-nums ${
        !isLast ? "border-b" : ""
      }`}
    >
      <span className="text-muted-foreground">{expression}</span>
      <span className="text-foreground font-semibold">= {result}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────

export default function WithholdingTaxCalculator() {
  const [form, setForm] = useState<FormState>({
    grossSalary: "",
    period: "Monthly",
    taxStatus: "single",
  });

  const handleSalaryChange = useCallback((raw: string) => {
    setForm((prev) => ({ ...prev, grossSalary: raw }));
  }, []);

  const handleChange = useCallback(
    <K extends keyof FormState>(field: K, value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const results = useMemo<TaxResult | null>(() => {
    const salary = parseFloat(form.grossSalary);
    if (!salary || salary <= 0) return null;

    const multiplier = PERIOD_MULTIPLIERS[form.period];
    const annualIncome = salary * multiplier;
    const annualTax = computeAnnualTax(annualIncome, form.taxStatus);
    if (annualTax === null) return null;

    const periodTax = Math.round((annualTax / multiplier) * 100) / 100;
    const effectiveRate =
      annualIncome > 0 ? (annualTax / annualIncome) * 100 : 0;
    const bracket = getAppliedBracket(annualIncome, form.taxStatus);

    return {
      annualIncome,
      annualTax,
      periodTax,
      effectiveRate,
      bracket,
      multiplier,
      grossSalary: salary,
    };
  }, [form.grossSalary, form.period, form.taxStatus]);

  const statusLabel =
    TAX_STATUS_OPTIONS.find((s) => s.value === form.taxStatus)?.label ?? "";
  const isZeroTax = results !== null && results.periodTax === 0;
  const hasResults = results !== null;

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto space-y-6">
        {/* ── Header ── */}
        <div className="space-y-2">
          <Badge variant="secondary">Basis Year 2026</Badge>
          <h1 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">
            Withholding Tax Validation Calculator
          </h1>
          <p className="text-muted-foreground leading-relaxed text-pretty">
            For Malta resident individuals. Gross salary is annualised per
            payroll period, taxed at the applicable bracket, then converted back
            to your per-period withholding amount.
          </p>
        </div>

        {/* ── Two-column grid ── */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* ── Left: Inputs ── */}
          <Card className="shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="text-lg font-semibold">
                Your Income Situation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Gross Salary */}
              <div className="space-y-2">
                <label
                  htmlFor="grossSalary"
                  className="text-sm leading-none font-medium"
                >
                  Gross Salary &amp; Bonus for the Period
                </label>
                <CurrencyInput
                  id="grossSalary"
                  value={form.grossSalary}
                  onValueChange={handleSalaryChange}
                  placeholder="0.00"
                />
              </div>

              <Separator />

              {/* Payroll Period */}
              <div className="space-y-2">
                <label className="text-sm leading-none font-medium">
                  Payroll Period
                </label>
                <Select
                  value={form.period}
                  onValueChange={(val) =>
                    handleChange("period", val as PayrollPeriod)
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYROLL_PERIOD_OPTIONS.map((p) => (
                      <SelectItem key={p} value={p}>
                        <span>{p}</span>
                        <span className="text-muted-foreground ml-2 text-xs">
                          ×{PERIOD_MULTIPLIERS[p]} periods/yr
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-muted-foreground text-xs">
                  *Calculated using a {PERIOD_MULTIPLIERS[form.period]}-period
                  annual work year
                </p>
              </div>

              <Separator />

              {/* Tax Status */}
              <div className="space-y-2">
                <label className="text-sm leading-none font-medium">
                  Tax Status
                </label>
                <Select
                  value={form.taxStatus}
                  onValueChange={(val) =>
                    handleChange("taxStatus", val as TaxStatus)
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TAX_STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* ── Right: Results ── */}
          <div className="space-y-4">
            <Card className="shadow-sm">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                    Tax Obligations Summary
                  </CardTitle>
                  {hasResults && (
                    <span className="text-muted-foreground text-xs">
                      {statusLabel}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {hasResults && results ? (
                  <div className="space-y-0 divide-y">
                    <ResultRow
                      label="Gross Salary (Period)"
                      value={`€ ${formatCurrency(results.grossSalary)}`}
                    />
                    <ResultRow
                      label={`Annualised Income (×${results.multiplier})`}
                      value={`€ ${formatCurrency(results.annualIncome)}`}
                    />
                    <ResultRow
                      label="Annual Tax Liability"
                      value={`€ ${formatCurrency(results.annualTax)}`}
                    />
                    <ResultRow
                      label="Effective Rate"
                      value={`${results.effectiveRate.toFixed(2)}%`}
                    />

                    {/* Hero result */}
                    <div className="border-t pt-4">
                      <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase">
                        Withholding Tax · {form.period}
                      </p>
                      <p className="text-foreground text-4xl font-bold tabular-nums">
                        € {formatCurrency(results.periodTax)}
                      </p>
                      {results.bracket && (
                        <p className="text-muted-foreground mt-1.5 text-xs">
                          {(results.bracket.rate * 100).toFixed(0)}% bracket
                          {results.bracket.subtract > 0
                            ? ` · less €${results.bracket.subtract.toLocaleString()}`
                            : ""}
                          {" · "}÷ {results.multiplier}
                        </p>
                      )}
                    </div>

                    {/* Step-by-step breakdown */}
                    {!isZeroTax && results.bracket && (
                      <div className="mt-4 rounded-md border p-4">
                        <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
                          Step-by-step
                        </p>
                        <BreakdownStep
                          expression={`€${formatCurrency(results.grossSalary)} × ${results.multiplier}`}
                          result={`€${formatCurrency(results.annualIncome)}`}
                        />
                        <BreakdownStep
                          expression={`€${formatCurrency(results.annualIncome)} × ${(results.bracket.rate * 100).toFixed(0)}%${results.bracket.subtract > 0 ? ` − €${results.bracket.subtract.toLocaleString()}` : ""}`}
                          result={`€${formatCurrency(results.annualTax)}`}
                        />
                        <BreakdownStep
                          expression={`€${formatCurrency(results.annualTax)} ÷ ${results.multiplier}`}
                          result={`€${formatCurrency(results.periodTax)}`}
                          isLast
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="bg-muted mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                      <ChevronRight className="text-muted-foreground h-5 w-5" />
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Enter your gross salary to calculate
                      <br />
                      your withholding tax liability.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Zero-tax notice */}
            {isZeroTax && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  <strong>No withholding tax applies.</strong> Your annualised
                  income falls within the tax-free threshold for{" "}
                  <strong>{statusLabel}</strong> filers.
                </AlertDescription>
              </Alert>
            )}

            {/* Disclaimer */}
            <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <AlertCircle className="h-3 w-3 shrink-0" />
              For indicative purposes only. Consult a licensed tax advisor for
              definitive guidance.
            </p>
          </div>
        </div>

        {/* ── Tax Tables & Notes ── */}
        <div className="space-y-4 pt-2">
          <h2 className="text-2xl font-bold lg:text-3xl">
            Resident Individual Tax Rates · Basis Year 2026
          </h2>

          <div className="space-y-3">
            {TAX_STATUS_OPTIONS.map((opt) => (
              <Accordion key={opt.value} type="single" collapsible>
                <AccordionItem value={opt.value}>
                  <AccordionTrigger className="text-base font-semibold hover:no-underline">
                    <span className="flex items-center gap-2">
                      {form.taxStatus === opt.value && (
                        <span className="bg-primary inline-block h-1.5 w-1.5 rounded-full" />
                      )}
                      {opt.label}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <BracketTable brackets={TAX_TABLES[opt.value]} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ))}

            <Accordion type="single" collapsible>
              <AccordionItem value="how-it-works">
                <AccordionTrigger className="text-base font-semibold hover:no-underline">
                  How the Calculation Works
                </AccordionTrigger>
                <AccordionContent>
                  <ol className="text-muted-foreground space-y-3 text-sm">
                    {[
                      [
                        "Annualise",
                        `Multiply gross salary by the period factor — ×52 for Weekly, ×24 for Semi-Monthly, ×12 for Monthly.`,
                      ],
                      [
                        "Apply the bracket",
                        "Match annualised income to the tax status table. Annual Tax = (Annual Income × Rate) − Subtract.",
                      ],
                      [
                        "De-annualise",
                        "Divide the annual tax by the same period factor, then round to 2 decimal places.",
                      ],
                    ].map(([step, desc], i) => (
                      <li key={i} className="flex gap-3">
                        <span className="bg-muted text-foreground flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-bold">
                          {i + 1}
                        </span>
                        <span>
                          <strong className="text-foreground">{step}:</strong>{" "}
                          {desc}
                        </span>
                      </li>
                    ))}
                  </ol>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Accordion type="single" collapsible>
              <AccordionItem value="important-notes">
                <AccordionTrigger className="text-base font-semibold hover:no-underline">
                  Important Notes
                </AccordionTrigger>
                <AccordionContent>
                  <div className="text-muted-foreground space-y-3 text-sm leading-relaxed">
                    {[
                      [
                        "Scope",
                        "Covers resident individuals only. Non-residents and companies are taxed differently.",
                      ],
                      [
                        "Bonuses & Allowances",
                        "Include all taxable cash payments in the gross salary figure for the period.",
                      ],
                      [
                        "Status Accuracy",
                        "Ensure your tax status correctly reflects your situation to avoid under- or over-withholding.",
                      ],
                      [
                        "Disclaimer",
                        "For indicative purposes only. Consult a licensed tax advisor for definitive guidance.",
                      ],
                    ].map(([title, body]) => (
                      <p key={title as string}>
                        <strong className="text-foreground">{title}:</strong>{" "}
                        {body}
                      </p>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
}
