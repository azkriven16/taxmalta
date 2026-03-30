"use client";

import { useCallback, useMemo, useState } from "react";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import { CheckCircle2, AlertCircle, AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calcBir2316, type Bir2316Input, type EmploymentType } from "@/lib/calcBir2316";

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

function FieldRow({
  label,
  value,
  bold = false,
  highlight = false,
  indent = false,
  subIndent = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
  highlight?: boolean;
  indent?: boolean;
  subIndent?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between py-2.5 ${subIndent ? "pl-8" : indent ? "pl-4" : ""}`}
    >
      <span
        className={`text-sm ${bold ? "font-semibold text-foreground" : "text-muted-foreground"}`}
      >
        {label}
      </span>
      <span
        className={`tabular-nums text-sm ${bold ? "font-semibold" : ""} ${highlight ? "text-primary font-bold text-base" : ""}`}
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

// ─── Static data ──────────────────────────────────────────────────────────

const TAX_TABLE_ROWS = [
  {
    range: "Up to ₱250,000",
    base: "—",
    rate: "0%",
    excess: "—",
  },
  {
    range: "₱250,001 – ₱400,000",
    base: "—",
    rate: "15%",
    excess: "₱250,000",
  },
  {
    range: "₱400,001 – ₱800,000",
    base: "₱22,500",
    rate: "20%",
    excess: "₱400,000",
  },
  {
    range: "₱800,001 – ₱2,000,000",
    base: "₱102,500",
    rate: "25%",
    excess: "₱800,000",
  },
  {
    range: "₱2,000,001 – ₱8,000,000",
    base: "₱402,500",
    rate: "30%",
    excess: "₱2,000,000",
  },
  {
    range: "Over ₱8,000,000",
    base: "₱2,202,500",
    rate: "35%",
    excess: "₱8,000,000",
  },
] as const;

const DE_MINIMIS_ROWS = [
  ["Rice Subsidy", "₱2,500/month or 1 sack"],
  ["Laundry Allowance", "₱400/month"],
  ["Uniform & Clothing", "₱8,000/year"],
  ["Medical Cash (dependents)", "₱2,000/semester"],
  ["Medical Cash (monthly)", "₱333/month"],
  ["Actual Medical Assistance", "₱12,000/year"],
  ["Monetized Leave (private)", "Up to 12 days/year"],
  ["Govt Monetized Leave", "Fully exempt"],
  ["Employee Achievement Awards", "₱12,000/year"],
  ["Christmas / Anniversary Gifts", "₱6,000/year"],
  [
    "Meal Allowances (OT/night shift)",
    "Up to 30% of basic min. wage",
  ],
  ["CBA & Productivity Incentives", "₱12,000/year"],
] as const;

// ─── Main Component ───────────────────────────────────────────────────────

type FormState = {
  [K in keyof Bir2316Input]: K extends "employmentType" ? EmploymentType : string;
};

const DEFAULT_FORM: FormState = {
  employmentType: "private",
  basicSalary: "",
  livingAllowances: "",
  overtimePay: "",
  otherTaxableRegular: "",
  thirteenthMonthPay: "",
  unionDues: "",
  otherNonTaxable: "",
  riceSubs: "",
  laundry: "",
  uniformClothing: "",
  medicalSemester: "",
  medicalMonthly: "",
  actualMedical: "",
  monetizedLeave: "",
  govtMonetizedLeave: "",
  achievementAwards: "",
  christmasGifts: "",
  mealAllowances: "",
  cbaBenefits: "",
  taxWithheld: "",
};

export default function Bir2316ValidationCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);

  const set = useCallback(
    (field: keyof FormState) => (value: string) =>
      setForm((prev) => ({ ...prev, [field]: value })),
    [],
  );

  const resetForm = useCallback(() => setForm(DEFAULT_FORM), []);

  const parse = (key: keyof Omit<Bir2316Input, "employmentType">) =>
    Math.max(parseFloat(form[key] as string) || 0, 0);

  const result = useMemo(() => {
    // Parser defined inside memo — no external dependency, no lint suppression needed
    const parse = (key: keyof Omit<Bir2316Input, "employmentType">) =>
      Math.max(parseFloat(form[key] as string) || 0, 0); // clamp negatives to 0

    const basicSalary = parse("basicSalary");
    if (!basicSalary) return null;

    return calcBir2316({
      employmentType: form.employmentType,
      basicSalary,
      livingAllowances: parse("livingAllowances"),
      overtimePay: parse("overtimePay"),
      otherTaxableRegular: parse("otherTaxableRegular"),
      thirteenthMonthPay: parse("thirteenthMonthPay"),
      unionDues: parse("unionDues"),
      otherNonTaxable: parse("otherNonTaxable"),
      riceSubs: parse("riceSubs"),
      laundry: parse("laundry"),
      uniformClothing: parse("uniformClothing"),
      medicalSemester: parse("medicalSemester"),
      medicalMonthly: parse("medicalMonthly"),
      actualMedical: parse("actualMedical"),
      monetizedLeave: parse("monetizedLeave"),
      govtMonetizedLeave: parse("govtMonetizedLeave"),
      achievementAwards: parse("achievementAwards"),
      christmasGifts: parse("christmasGifts"),
      mealAllowances: parse("mealAllowances"),
      cbaBenefits: parse("cbaBenefits"),
      taxWithheld: parse("taxWithheld"),
    });
  }, [form]);

  const hasTaxWithheld = !!form.taxWithheld && parse("taxWithheld") > 0;
  const isPrivate = form.employmentType === "private";

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <Badge variant="secondary">Year 2026</Badge>
          <h1 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">
            BIR Form 2316 Validation Calculator
          </h1>
          <p className="text-muted-foreground leading-relaxed text-pretty">
            Validate the tax withheld on your Certificate of Compensation Payment
            / Tax Withheld. Enter your compensation details to compute your
            correct tax due based on the 2025 Revised Withholding Tax Table and
            compare it against what was withheld by your employer.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* ── Left: Inputs ── */}
          <div className="space-y-5 lg:col-span-2">
            {/* Card 1: Employment & Income */}
            <Card className="shadow-sm">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                    Your Income Situation
                  </CardTitle>
                  {form.basicSalary && (
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
                    value={form.employmentType}
                    onValueChange={(v) =>
                      setForm((prev) => ({
                        ...prev,
                        employmentType: v as EmploymentType,
                      }))
                    }
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Private Employee</SelectItem>
                      <SelectItem value="government">
                        Government Employee
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <InputField
                  id="basicSalary"
                  label="Basic Salary (Annual)"
                  value={form.basicSalary}
                  onChange={set("basicSalary")}
                />
                <InputField
                  id="livingAllowances"
                  label="Living Allowances (Annual)"
                  note="Representation, Transportation, Cost of Living, Fixed Housing"
                  value={form.livingAllowances}
                  onChange={set("livingAllowances")}
                />
                <InputField
                  id="overtimePay"
                  label="Overtime Pay & Hazard Pay (Annual)"
                  value={form.overtimePay}
                  onChange={set("overtimePay")}
                />
                <InputField
                  id="otherTaxableRegular"
                  label="Other Taxable Regular Compensation (Annual)"
                  value={form.otherTaxableRegular}
                  onChange={set("otherTaxableRegular")}
                />
              </CardContent>
            </Card>

            {/* Card 2: Benefits */}
            <Card className="shadow-sm">
              <CardHeader className="border-b">
                <CardTitle className="text-lg font-semibold">
                  13th Month Pay & Benefits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                <InputField
                  id="thirteenthMonthPay"
                  label="13th Month Pay Received (Annual)"
                  note="Actual amount received, before the ₱90,000 ceiling is applied"
                  value={form.thirteenthMonthPay}
                  onChange={set("thirteenthMonthPay")}
                />

                <Accordion type="single" collapsible>
                  <AccordionItem value="deminimis" className="border-none">
                    <AccordionTrigger className="py-0 text-sm font-medium hover:no-underline">
                      De Minimis Benefits (expand to enter)
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <InputField
                        id="riceSubs"
                        label="Rice Subsidy (per month, ≤ ₱2,500)"
                        value={form.riceSubs}
                        onChange={set("riceSubs")}
                      />
                      <InputField
                        id="laundry"
                        label="Laundry Allowance (per month, ≤ ₱400)"
                        value={form.laundry}
                        onChange={set("laundry")}
                      />
                      <InputField
                        id="uniformClothing"
                        label="Uniform & Clothing Allowance (per year, ≤ ₱8,000)"
                        value={form.uniformClothing}
                        onChange={set("uniformClothing")}
                      />
                      <InputField
                        id="medicalSemester"
                        label="Medical Cash Allowance — per semester (≤ ₱2,000)"
                        note="Every 6 months. Enter the per-semester amount."
                        value={form.medicalSemester}
                        onChange={set("medicalSemester")}
                      />
                      <InputField
                        id="medicalMonthly"
                        label="Medical Cash Allowance — per month (≤ ₱333)"
                        value={form.medicalMonthly}
                        onChange={set("medicalMonthly")}
                      />
                      <InputField
                        id="actualMedical"
                        label="Actual Medical Assistance (per year, ≤ ₱12,000)"
                        note="Check-ups, consultations, maternity, etc."
                        value={form.actualMedical}
                        onChange={set("actualMedical")}
                      />
                      {isPrivate && (
                        <InputField
                          id="monetizedLeave"
                          label="Monetized Unused Vacation Leave (annual, ≤ 12 days)"
                          value={form.monetizedLeave}
                          onChange={set("monetizedLeave")}
                        />
                      )}
                      {!isPrivate && (
                        <InputField
                          id="govtMonetizedLeave"
                          label="Monetized Vacation & Sick Leave — Govt (annual, fully exempt)"
                          value={form.govtMonetizedLeave}
                          onChange={set("govtMonetizedLeave")}
                        />
                      )}
                      <InputField
                        id="achievementAwards"
                        label="Employee Achievement Awards (per year, ≤ ₱12,000)"
                        value={form.achievementAwards}
                        onChange={set("achievementAwards")}
                      />
                      <InputField
                        id="christmasGifts"
                        label="Christmas / Anniversary Gifts (per year, ≤ ₱6,000)"
                        value={form.christmasGifts}
                        onChange={set("christmasGifts")}
                      />
                      <InputField
                        id="mealAllowances"
                        label="Meal Allowances — de minimis portion (annual)"
                        note="Overtime/night shift — up to 30% of basic minimum wage per region"
                        value={form.mealAllowances}
                        onChange={set("mealAllowances")}
                      />
                      <InputField
                        id="cbaBenefits"
                        label="CBA & Productivity Incentives (per year, ≤ ₱12,000)"
                        value={form.cbaBenefits}
                        onChange={set("cbaBenefits")}
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* Card 3: Other Non-Taxable & Tax Withheld */}
            <Card className="shadow-sm">
              <CardHeader className="border-b">
                <CardTitle className="text-lg font-semibold">
                  Deductions & BIR Form 2316 Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                <InputField
                  id="unionDues"
                  label="Union Dues (Annual)"
                  value={form.unionDues}
                  onChange={set("unionDues")}
                />
                <InputField
                  id="otherNonTaxable"
                  label="Other Non-Taxable / Exempt Compensation (Annual)"
                  note="Damages, life insurance, treaty-exempt income, etc."
                  value={form.otherNonTaxable}
                  onChange={set("otherNonTaxable")}
                />

                <Separator />

                <InputField
                  id="taxWithheld"
                  label="Amount of Taxes Withheld (from BIR Form 2316, Line 25)"
                  note="Enter the total annual withholding tax per your certificate"
                  value={form.taxWithheld}
                  onChange={set("taxWithheld")}
                />
              </CardContent>
            </Card>
          </div>

          {/* ── Right: Results ── */}
          <div className="space-y-5 lg:col-span-3">
            {result ? (
              <>
                {/* Part IVA Summary */}
                <Card className="shadow-sm">
                  <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold">
                        Part IVA — Summary
                      </CardTitle>
                      <Badge variant="outline">Line 19–25</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="divide-y pt-2">
                    <FieldRow
                      label="Gross Compensation Income (Line 19)"
                      value={php(result.grossCompensation)}
                    />
                    <FieldRow
                      label="Total Non-Taxable / Exempt (Line 20)"
                      value={php(result.totalNonTaxable)}
                    />
                    <FieldRow
                      label="Taxable Compensation Income (Line 21)"
                      value={php(result.totalTaxable)}
                      bold
                    />
                    <FieldRow
                      label="Tax Due (Line 24)"
                      value={php(result.taxDue)}
                      bold
                      highlight
                    />
                    {hasTaxWithheld && (
                      <>
                        <FieldRow
                          label="Amount Withheld (Line 25)"
                          value={php(result.taxWithheld)}
                          bold
                        />
                        <div className="pt-2">
                          <FieldRow
                            label={
                              result.difference >= 0
                                ? "Overwithheld Tax"
                                : "Underwithheld Tax"
                            }
                            value={php(Math.abs(result.difference))}
                            bold
                            highlight
                          />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Status Alert */}
                {hasTaxWithheld && (
                  <Alert
                    className={
                      result.difference > 0
                        ? "border-green-500/30 bg-green-500/10"
                        : result.difference < 0
                          ? "border-destructive/30 bg-destructive/10"
                          : "border-primary/20 bg-primary/10"
                    }
                  >
                    {result.difference > 0 ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : result.difference < 0 ? (
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    ) : (
                      <CheckCircle2 className="text-primary h-4 w-4" />
                    )}
                    <AlertDescription className="text-sm">
                      {result.difference > 0 ? (
                        <>
                          Your employer <strong>overwithheld</strong>{" "}
                          <strong>₱ {formatPHP(result.difference)}</strong>.
                          You are entitled to a refund from your employer or may
                          claim this as a tax credit.
                        </>
                      ) : result.difference < 0 ? (
                        <>
                          Your employer <strong>underwithheld</strong>{" "}
                          <strong>
                            ₱ {formatPHP(Math.abs(result.difference))}
                          </strong>
                          . You may owe additional tax. Verify your Form 2316
                          with your employer.
                        </>
                      ) : (
                        <>
                          Withholding tax is <strong>exactly correct</strong>.
                          No additional tax is due.
                        </>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Part IVB — Breakdown */}
                <Card className="shadow-sm">
                  <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold">
                        Part IVB — Detailed Breakdown
                      </CardTitle>
                      <Badge variant="outline">Lines 32–50</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <Accordion type="multiple" defaultValue={["nontaxable", "taxable"]}>
                      {/* Non-taxable section */}
                      <AccordionItem value="nontaxable">
                        <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                          A. Non-Taxable / Exempt Compensation
                        </AccordionTrigger>
                        <AccordionContent className="divide-y pb-0">
                          <FieldRow
                            label="13th Month Pay & Other Benefits (Line 34)"
                            value={php(result.nonTaxable13thAndBenefits)}
                            indent
                          />
                          <FieldRow
                            label="De Minimis Benefits (Line 35)"
                            value={php(result.deMinimis)}
                            indent
                          />
                          <FieldRow
                            label={`${isPrivate ? "SSS" : "GSIS"}, PhilHealth, Pag-IBIG & Union Dues (Line 36)`}
                            value={php(result.totalGovtContribs)}
                            indent
                          />
                          {isPrivate ? (
                            <FieldRow
                              label="SSS Employee Share"
                              value={php(result.sss)}
                              subIndent
                            />
                          ) : (
                            <FieldRow
                              label="GSIS Employee Share (9%)"
                              value={php(result.gsis)}
                              subIndent
                            />
                          )}
                          <FieldRow
                            label="PhilHealth Employee Share (2.5%, max ₱2,500/mo)"
                            value={php(result.philHealth)}
                            subIndent
                          />
                          <FieldRow
                            label="Pag-IBIG Employee Share (2%, max ₱200/mo)"
                            value={php(result.pagIbig)}
                            subIndent
                          />
                          <FieldRow
                            label="Other Non-Taxable / Exempt (Line 37)"
                            value={php(parse("otherNonTaxable"))}
                            indent
                          />
                          <FieldRow
                            label="Total Non-Taxable (Line 38)"
                            value={php(result.totalNonTaxable)}
                            bold
                          />
                        </AccordionContent>
                      </AccordionItem>

                      {/* Taxable section */}
                      <AccordionItem value="taxable" className="border-b-0">
                        <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                          B. Taxable Compensation Income
                        </AccordionTrigger>
                        <AccordionContent className="divide-y pb-0">
                          <FieldRow
                            label="Basic Salary (Line 39)"
                            value={php(parse("basicSalary"))}
                            indent
                          />
                          <FieldRow
                            label="Living Allowances (Total of Lines 40–43)"
                            value={php(parse("livingAllowances"))}
                            indent
                          />
                          <FieldRow
                            label="Other Taxable Regular Compensation (Total of Lines 44–47)"
                            value={php(parse("otherTaxableRegular"))}
                            indent
                          />
                          <FieldRow
                            label="Taxable 13th Month Pay & Benefits (Line 48)"
                            value={php(result.taxable13th)}
                            indent
                          />
                          <FieldRow
                            label="Overtime / Hazard Pay (Total of Lines 49–50)"
                            value={php(parse("overtimePay"))}
                            indent
                          />
                          <FieldRow
                            label="Total Taxable Compensation (Line 52)"
                            value={php(result.totalTaxable)}
                            bold
                            highlight
                          />
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    {/* Government contributions detail */}
                    {result.totalBenefitsReceived > 0 && (
                      <div className="mt-4 rounded-md border p-3">
                        <p className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-wide">
                          13th Month & Benefits Summary
                        </p>
                        <div className="divide-y">
                          <FieldRow
                            label="Total Benefits Received"
                            value={php(result.totalBenefitsReceived)}
                          />
                          <FieldRow
                            label="De Minimis (non-taxable portion)"
                            value={php(result.deMinimis)}
                          />
                          <FieldRow
                            label="Excess over De Minimis"
                            value={php(result.excessOverDeMinimis)}
                          />
                          <FieldRow
                            label="13th Month + Excess (combined)"
                            value={php(
                              parse("thirteenthMonthPay") + result.excessOverDeMinimis,
                            )}
                          />
                          <FieldRow
                            label="Non-taxable (≤ ₱90,000 ceiling)"
                            value={php(result.nonTaxable13thAndBenefits)}
                          />
                          <FieldRow
                            label="Taxable (excess over ₱90,000)"
                            value={php(result.taxable13th)}
                            bold={result.taxable13th > 0}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="bg-muted mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                    <AlertCircle className="text-muted-foreground h-6 w-6" />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Enter your basic salary to see your
                    <br />
                    BIR Form 2316 tax validation.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Disclaimer */}
            <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <AlertCircle className="h-3 w-3 shrink-0" />
              For validation purposes only. Based on the 2025 Revised
              Withholding Tax Table and BIR Form 2316 (Annual). Consult a
              licensed tax professional for definitive advice.
            </p>
          </div>
        </div>

        {/* Tax Table */}
        <div>
          <h2 className="mb-4 text-2xl font-bold lg:text-3xl">
            2025 Revised Withholding Tax Table — Annual
          </h2>
          <Card>
            <CardContent className="overflow-x-auto pt-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    {["Income Range", "Base Tax", "Rate", "On Excess Over"].map(
                      (h) => (
                        <th
                          key={h}
                          className="pb-3 text-left text-xs font-semibold uppercase tracking-wide"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {TAX_TABLE_ROWS.map((row) => (
                    <tr key={row.range} className="text-muted-foreground">
                      <td className="py-2">{row.range}</td>
                      <td className="py-2">{row.base}</td>
                      <td className="py-2 font-semibold text-foreground">
                        {row.rate}
                      </td>
                      <td className="py-2">{row.excess}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Notes */}
        <div>
          <h2 className="mb-4 text-2xl font-bold lg:text-3xl">
            Important Notes
          </h2>
          <div className="space-y-3">
            <Accordion type="single" collapsible>
              <AccordionItem value="contribs">
                <AccordionTrigger className="text-base font-semibold hover:no-underline">
                  Mandatory Contributions — Maximum Employee Share
                </AccordionTrigger>
                <AccordionContent>
                  <div className="text-muted-foreground space-y-3 text-sm leading-relaxed">
                    <p>
                      <strong className="text-foreground">SSS (Private):</strong>{" "}
                      5% of Monthly Salary Credit, capped at ₱35,000 MSC →
                      maximum ₱1,750/month (₱21,000/year).
                    </p>
                    <p>
                      <strong className="text-foreground">GSIS (Government):</strong>{" "}
                      9% of actual monthly salary — no salary ceiling, so no
                      fixed maximum.
                    </p>
                    <p>
                      <strong className="text-foreground">PhilHealth:</strong>{" "}
                      2.5% of monthly salary, salary ceiling ₱100,000 →
                      maximum ₱2,500/month (₱30,000/year).
                    </p>
                    <p>
                      <strong className="text-foreground">Pag-IBIG:</strong>{" "}
                      2% of monthly fund salary base, capped at ₱10,000 →
                      maximum ₱200/month (₱2,400/year).
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Accordion type="single" collapsible>
              <AccordionItem value="ceiling">
                <AccordionTrigger className="text-base font-semibold hover:no-underline">
                  ₱90,000 Ceiling on 13th Month Pay & Other Benefits
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    The combined 13th month pay and other benefits (in excess of
                    de minimis amounts) are non-taxable up to ₱90,000 per year.
                    Any amount above ₱90,000 is added to taxable compensation
                    income and subjected to the regular income tax rates.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Accordion type="single" collapsible>
              <AccordionItem value="deminimis-notes">
                <AccordionTrigger className="text-base font-semibold hover:no-underline">
                  De Minimis Benefits — Limits at a Glance
                </AccordionTrigger>
                <AccordionContent>
                  <table className="text-muted-foreground w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="pb-2 text-left text-xs font-semibold uppercase">
                          Benefit
                        </th>
                        <th className="pb-2 text-right text-xs font-semibold uppercase">
                          Exempt Limit
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {DE_MINIMIS_ROWS.map(([b, l]) => (
                        <tr key={b}>
                          <td className="py-2">{b}</td>
                          <td className="py-2 text-right">{l}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
}
