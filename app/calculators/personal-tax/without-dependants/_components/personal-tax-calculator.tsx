"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useMemo, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { CurrencyInput } from "@/components/ui/currency-input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ─── Types ────────────────────────────────────────────────────────────────

interface FormState {
  grossSalary: string;
  partTimeIncome: string;
  partTimeType: string;
  taxStatus: string;
  sscStatus: string;
}

interface ErrorState {
  [key: string]: string;
}

interface TaxCalculation {
  grossIncome: number;
  mainGross: number;
  partTimeGross: number;
  taxableIncome: number;
  incomeTax: number;
  mainTax: number;
  partTimeTax: number;
  ssc: number;
  govBonus: number;
  netIncome: number;
  sscWeekly: number;
}

// ─── Constants ────────────────────────────────────────────────────────────

const GOV_BONUS = 512.72;

// Tax brackets per image feedback:
// Single:  0–12k (0%), 12,001–16k (15%, −1,800), 16,001–60k (25%, −3,400), 60k+ (35%, −9,400)
// Married: 0–15k (0%), 15,001–23k (15%, −2,250), 23,001–60k (25%, −4,550), 60k+ (35%, −10,550)
const TAX_BRACKETS = {
  Single: [
    { from: 0, to: 12000, rate: 0, subtract: 0 },
    { from: 12001, to: 16000, rate: 0.15, subtract: 1800 },
    { from: 16001, to: 60000, rate: 0.25, subtract: 3400 },
    { from: 60001, to: Infinity, rate: 0.35, subtract: 9400 },
  ],
  Married: [
    { from: 0, to: 15000, rate: 0, subtract: 0 },
    { from: 15001, to: 23000, rate: 0.15, subtract: 2250 },
    { from: 23001, to: 60000, rate: 0.25, subtract: 4550 },
    { from: 60001, to: Infinity, rate: 0.35, subtract: 10550 },
  ],
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────

const isValidAmount = (amount: string): boolean => {
  const num = Number.parseFloat(amount);
  return !isNaN(num) && num >= 0;
};

function applyBracket(income: number, status: "Single" | "Married"): number {
  const brackets = TAX_BRACKETS[status];
  const bracket = brackets.find((b) => income <= b.to);
  if (!bracket || bracket.rate === 0) return 0;
  return Math.max(0, income * bracket.rate - bracket.subtract);
}

function calculateSSC(
  annualGross: number,
  sscStatus: string,
): { weekly: number; total: number } {
  const weeklyGross = annualGross / 52;
  if (sscStatus === "Exempt from paying NI/SSC") return { weekly: 0, total: 0 };
  if (sscStatus === "Student (under 18 years old)") {
    const val = Math.min(weeklyGross * 0.1, 4.38);
    return { weekly: val, total: val * 52 };
  }
  if (sscStatus === "Student (18 years old and over)") {
    const val = Math.min(weeklyGross * 0.1, 7.94);
    return { weekly: val, total: val * 52 };
  }
  let weeklySSC = 0;
  if (sscStatus === "Employed (under 18 years old)") {
    if (weeklyGross <= 221.78) weeklySSC = 6.62;
    else if (weeklyGross <= 544.28) weeklySSC = weeklyGross * 0.1;
    else weeklySSC = 54.43;
  } else if (
    sscStatus ===
    "Employed (18 years old and over, born on or before 31 Dec 1961)"
  ) {
    if (weeklyGross <= 221.78) weeklySSC = 22.18;
    else if (weeklyGross <= 451.91) weeklySSC = weeklyGross * 0.1;
    else weeklySSC = 45.19;
  } else {
    if (weeklyGross <= 221.78) weeklySSC = 22.18;
    else if (weeklyGross <= 544.28) weeklySSC = weeklyGross * 0.1;
    else weeklySSC = 54.43;
  }
  return { weekly: weeklySSC, total: weeklySSC * 52 };
}

function calculateIncomeTax(
  salary: number,
  partTime: number,
  partTimeType: string,
  taxStatus: string,
): { mainTax: number; partTimeTax: number; totalTax: number; chargeableIncome: number } {
  let partTimeTax = 0;
  let excessPartTime = 0;
  if (partTime > 0) {
    const threshold = partTimeType === "Employment" ? 10000 : 12000;
    const taxableAtFlat = Math.min(partTime, threshold);
    partTimeTax = taxableAtFlat * 0.1;
    excessPartTime = Math.max(0, partTime - threshold);
  }
  const chargeableIncome = salary + excessPartTime + GOV_BONUS;
  const status = taxStatus === "Married" ? "Married" : "Single";
  const mainTax = applyBracket(chargeableIncome, status);
  return { mainTax, partTimeTax, totalTax: mainTax + partTimeTax, chargeableIncome };
}

// ─── Constants ────────────────────────────────────────────────────────────

const DEFAULT_FORM: FormState = {
  grossSalary: "",
  partTimeIncome: "",
  partTimeType: "Employment",
  taxStatus: "Single",
  sscStatus: "Employed (18 years old and over, born on or after 1 Jan 1962)",
};

// ─── Component ────────────────────────────────────────────────────────────

export default function PersonalTaxCalculator() {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);

  const [errors, setErrors] = useState<ErrorState>({});

  // Step logic — removed residencyStatus step
  const computeStep = (f: FormState): number => {
    let s = 1;
    if (!f.grossSalary) return s;
    s = 2;
    if (Number.parseFloat(f.partTimeIncome) > 0 && !f.partTimeType) return s;
    s = 3;
    if (!f.taxStatus) return s;
    s = 4;
    if (!f.sscStatus) return s;
    return 5;
  };

  const step = computeStep(form);

  const resetForm = useCallback(() => {
    setForm(DEFAULT_FORM);
    setErrors({});
  }, []);

  const handleChange = useCallback((field: keyof FormState, value: string): void => {
    setForm((prev) => ({ ...prev, [field]: value }));
    const isAmountField = field === "grossSalary" || field === "partTimeIncome";
    setErrors((prev) => {
      if (isAmountField && value && !isValidAmount(value)) {
        return { ...prev, [field]: "Please enter a valid amount" };
      }
      if (prev[field]) {
        const next = { ...prev };
        delete next[field];
        return next;
      }
      return prev;
    });
  }, []);

  const calculation = useMemo((): TaxCalculation => {
    if (!form.grossSalary) {
      return {
        grossIncome: 0, mainGross: 0, partTimeGross: 0, taxableIncome: 0,
        incomeTax: 0, mainTax: 0, partTimeTax: 0, ssc: 0, sscWeekly: 0,
        govBonus: 0, netIncome: 0,
      };
    }
    const grossSalary = Number.parseFloat(form.grossSalary) || 0;
    const partTime = Number.parseFloat(form.partTimeIncome) || 0;
    const { total: ssc, weekly: sscWeekly } = calculateSSC(grossSalary, form.sscStatus);
    const { mainTax, partTimeTax, totalTax, chargeableIncome } =
      calculateIncomeTax(grossSalary, partTime, form.partTimeType, form.taxStatus);
    const totalGross = grossSalary + partTime;
    return {
      grossIncome: totalGross,
      mainGross: grossSalary,
      partTimeGross: partTime,
      taxableIncome: chargeableIncome,
      incomeTax: totalTax,
      mainTax,
      partTimeTax,
      ssc,
      sscWeekly,
      govBonus: GOV_BONUS,
      netIncome: totalGross + GOV_BONUS - totalTax - ssc,
    };
  }, [form]);

  const activeBrackets = TAX_BRACKETS[form.taxStatus === "Married" ? "Married" : "Single"];

  return (
    <div className="bg-background min-h-screen px-4 py-8 lg:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Personal Income Tax Calculator without Children
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            For Individuals Without a Child
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* ── Left: Inputs ── */}
          <div className="space-y-6 lg:col-span-5">
            <Card className="shadow-sm">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="bg-foreground text-background flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">
                      {step}
                    </div>
                    Your Income Situation
                  </CardTitle>
                  {form.grossSalary && (
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
              <CardContent className="space-y-5 pt-5">
                {/* Gross Salary */}
                <div className="space-y-2">
                  <Label>Annual Gross Salary (€)</Label>
                  <CurrencyInput
                    type="number"
                    placeholder="0.00"
                    value={form.grossSalary}
                    onChange={(e) =>
                      handleChange("grossSalary", e.target.value)
                    }
                    className={`h-10 w-full ${errors.grossSalary ? "border-destructive" : ""}`}
                  />
                  {errors.grossSalary && (
                    <p className="text-destructive text-xs">
                      {errors.grossSalary}
                    </p>
                  )}
                </div>

                {/* Part-time Income */}
                <AnimatePresence>
                  {step >= 2 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-2"
                    >
                      <Label>
                        Part-time Income eligible for Fixed Rate (€)
                      </Label>
                      <CurrencyInput
                        type="number"
                        placeholder="0.00"
                        value={form.partTimeIncome}
                        onChange={(e) =>
                          handleChange("partTimeIncome", e.target.value)
                        }
                        className={`h-10 w-full ${errors.partTimeIncome ? "border-destructive" : ""}`}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Part-time Type */}
                <AnimatePresence>
                  {step >= 2 && Number.parseFloat(form.partTimeIncome) > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-2"
                    >
                      <Label>Part-time Type</Label>
                      <Select
                        value={form.partTimeType}
                        onValueChange={(v) => handleChange("partTimeType", v)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Employment">Employment</SelectItem>
                          <SelectItem value="Self-Employment">
                            Self-Employment
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Separator />

                {/* Tax Status */}
                <AnimatePresence>
                  {step >= 3 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-2"
                    >
                      <Label>Tax Status</Label>
                      <Select
                        value={form.taxStatus}
                        onValueChange={(v) => handleChange("taxStatus", v)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Single">Single</SelectItem>
                          <SelectItem value="Married">
                            Married with no Child
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* SSC Status — step 4 (residencyStatus removed) */}
                <AnimatePresence>
                  {step >= 4 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-2"
                    >
                      <Label>Social Security Status</Label>
                      <Select
                        value={form.sscStatus}
                        onValueChange={(v) => handleChange("sscStatus", v)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue className="truncate" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Student (under 18 years old)">
                            Student (under 18)
                          </SelectItem>
                          <SelectItem value="Student (18 years old and over)">
                            Student (18+)
                          </SelectItem>
                          <SelectItem value="Employed (under 18 years old)">
                            Employed (under 18)
                          </SelectItem>
                          <SelectItem value="Employed (18 years old and over, born on or before 31 Dec 1961)">
                            Employed (Born ≤ 1961)
                          </SelectItem>
                          <SelectItem value="Employed (18 years old and over, born on or after 1 Jan 1962)">
                            Employed (Born ≥ 1962)
                          </SelectItem>
                          <SelectItem value="Exempt from paying NI/SSC">
                            Exempt from NI/SSC
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>

          {/* ── Right: Results ── */}
          <div className="space-y-6 lg:col-span-7">
            {/* Net Income Hero Card */}
            <Card className="border-foreground bg-foreground text-background shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription className="text-muted-background opacity-70">
                  Earnings after tax
                </CardDescription>
                <CardTitle className="text-4xl font-bold sm:text-5xl">
                  €{formatCurrency(calculation.netIncome)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-background/20 mt-2 grid grid-cols-2 gap-4 border-t pt-4 text-sm">
                  <div>
                    <p className="opacity-60">Monthly</p>
                    <p className="text-lg font-medium">
                      €{formatCurrency(calculation.netIncome / 12)}
                    </p>
                  </div>
                  <div>
                    <p className="opacity-60">Weekly</p>
                    <p className="text-lg font-medium">
                      €{formatCurrency(calculation.netIncome / 52)}
                    </p>
                  </div>
                </div>
                <div className="border-background/20 mt-1 flex gap-4 border-t pt-3 opacity-60 text-xs">
                  <span>
                    Effective tax rate:{" "}
                    {(calculation.incomeTax / Math.max(calculation.grossIncome + calculation.govBonus, 1) * 100).toFixed(1)}%
                  </span>
                  <span>
                    Take-home:{" "}
                    {(calculation.netIncome / Math.max(calculation.grossIncome + calculation.govBonus, 1) * 100).toFixed(1)}%
                  </span>
                </div>
                {calculation.grossIncome > 0 && (() => {
                  const total = calculation.grossIncome + calculation.govBonus;
                  const netPct = (calculation.netIncome / total * 100).toFixed(1);
                  const taxPct = (calculation.incomeTax / total * 100).toFixed(1);
                  const sscPct = (calculation.ssc / total * 100).toFixed(1);
                  return (
                    <>
                      <div className="mt-3 flex h-2 w-full overflow-hidden rounded-full">
                        <div className="bg-green-400" style={{ width: `${netPct}%` }} />
                        <div className="bg-red-400" style={{ width: `${taxPct}%` }} />
                        <div className="bg-orange-400" style={{ width: `${sscPct}%` }} />
                      </div>
                      <div className="mt-1.5 flex gap-3 opacity-60 text-xs">
                        <span className="flex items-center gap-1">
                          <span className="inline-block h-2 w-2 rounded-full bg-green-400" />
                          Net {netPct}%
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="inline-block h-2 w-2 rounded-full bg-red-400" />
                          Tax {taxPct}%
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="inline-block h-2 w-2 rounded-full bg-orange-400" />
                          SSC {sscPct}%
                        </span>
                      </div>
                    </>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Tax Obligations Table */}
            <Card className="overflow-hidden shadow-sm">
              <CardHeader className="border-b">
                <CardTitle className="text-base font-semibold">
                  Tax Obligations Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table className="min-w-[500px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40%] pl-6">
                          Description
                        </TableHead>
                        <TableHead className="text-right">Yearly</TableHead>
                        <TableHead className="text-right">Monthly</TableHead>
                        <TableHead className="pr-6 text-right">
                          Weekly
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="pl-6 font-medium">
                          Gross Income
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          €{formatCurrency(calculation.grossIncome)}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          €{formatCurrency(calculation.grossIncome / 12)}
                        </TableCell>
                        <TableCell className="pr-6 text-right whitespace-nowrap">
                          €{formatCurrency(calculation.grossIncome / 52)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="pl-6 font-medium text-green-700 dark:text-green-400">
                          Government Bonus
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap text-green-700 dark:text-green-400">
                          +€{formatCurrency(calculation.govBonus)}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap text-green-700 dark:text-green-400">
                          +€{formatCurrency(calculation.govBonus / 12)}
                        </TableCell>
                        <TableCell className="pr-6 text-right whitespace-nowrap text-green-700 dark:text-green-400">
                          +€{formatCurrency(calculation.govBonus / 52)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-destructive pl-6 font-medium">
                          Total Tax
                        </TableCell>
                        <TableCell className="text-destructive text-right whitespace-nowrap">
                          -€{formatCurrency(calculation.incomeTax)}
                        </TableCell>
                        <TableCell className="text-destructive text-right whitespace-nowrap">
                          -€{formatCurrency(calculation.incomeTax / 12)}
                        </TableCell>
                        <TableCell className="text-destructive pr-6 text-right whitespace-nowrap">
                          -€{formatCurrency(calculation.incomeTax / 52)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="text-destructive pl-6 font-medium">
                          Social Security
                        </TableCell>
                        <TableCell className="text-destructive text-right whitespace-nowrap">
                          -€{formatCurrency(calculation.ssc)}
                        </TableCell>
                        <TableCell className="text-destructive text-right whitespace-nowrap">
                          -€{formatCurrency(calculation.ssc / 12)}
                        </TableCell>
                        <TableCell className="text-destructive pr-6 text-right whitespace-nowrap">
                          -€{formatCurrency(calculation.ssc / 52)}
                        </TableCell>
                      </TableRow>
                      <TableRow className="bg-muted border-t-2 font-bold">
                        <TableCell className="pl-6">Net Earnings</TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          €{formatCurrency(calculation.netIncome)}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          €{formatCurrency(calculation.netIncome / 12)}
                        </TableCell>
                        <TableCell className="pr-6 text-right whitespace-nowrap">
                          €{formatCurrency(calculation.netIncome / 52)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── Accordion: Calculation Logic ── */}
        <div className="mt-8">
          <Accordion
            type="single"
            collapsible
            className="bg-card w-full rounded-lg border px-4"
          >
            <AccordionItem value="logic" className="border-b-0">
              <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                View Calculation Logic &amp; Formulas
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-8 border-t pt-4 lg:grid-cols-2">
                  {/* Column 1: Income Tax */}
                  <div className="space-y-4">
                    <h3 className="font-bold underline">1. Income Tax Logic</h3>
                    <div className="text-muted-foreground text-xs">
                      <p>
                        <strong className="text-foreground">Basis:</strong>{" "}
                        {form.taxStatus === "Married" ? "Married" : "Single"}{" "}
                        rates (2026 Tax Rates).
                      </p>

                      <div className="mt-2 space-y-2 rounded-md bg-blue-50 p-3 text-blue-900 dark:bg-blue-950/30 dark:text-blue-100">
                        <p className="font-semibold">
                          Chargeable Income Formula:
                        </p>
                        <p className="font-mono text-[11px]">
                          Gross Salary + (Part-time − Threshold) + Gov Bonus
                        </p>
                        {Number.parseFloat(form.grossSalary) > 0 && (
                          <div className="border-t border-blue-200 pt-2 dark:border-blue-800">
                            <p className="text-[10px] font-bold uppercase opacity-70">
                              Your Calculation:
                            </p>
                            <p className="font-mono text-[11px]">
                              €{formatCurrency(Number(form.grossSalary))} + €
                              {formatCurrency(
                                calculation.taxableIncome -
                                  Number(form.grossSalary) -
                                  GOV_BONUS,
                              )}{" "}
                              + €{formatCurrency(GOV_BONUS)} ={" "}
                              <span className="font-bold">
                                €{formatCurrency(calculation.taxableIncome)}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>

                      <ul className="mt-2 list-disc space-y-1 pl-4">
                        <li>
                          <strong className="text-foreground">
                            Main Tax Amount:
                          </strong>{" "}
                          €{formatCurrency(calculation.mainTax)} (Calculated on
                          Chargeable Income)
                        </li>
                        {calculation.partTimeGross > 0 && (
                          <li className="mt-2">
                            <strong className="text-foreground">
                              Part-Time Flat Tax (10%):
                            </strong>
                            <br />
                            Apply 10% on first €
                            {form.partTimeType === "Employment"
                              ? "10,000"
                              : "12,000"}{" "}
                            of part-time income.
                            <br />
                            Amount: €{formatCurrency(calculation.partTimeTax)}
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Tax Brackets Table */}
                    <Table className="border text-xs">
                      <TableHeader className="bg-muted">
                        <TableRow>
                          <TableHead>Range (€)</TableHead>
                          <TableHead>Rate</TableHead>
                          <TableHead>Subtract (€)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activeBrackets.map((b) => (
                          <TableRow key={b.from}>
                            <TableCell>
                              {b.to === Infinity
                                ? `${b.from.toLocaleString()}+`
                                : `${b.from.toLocaleString()} – ${b.to.toLocaleString()}`}
                            </TableCell>
                            <TableCell>{(b.rate * 100).toFixed(0)}%</TableCell>
                            <TableCell>{b.subtract.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Column 2: SSC & Government Bonus */}
                  <div className="space-y-4">
                    <h3 className="font-bold underline">
                      2. Social Security (SSC)
                    </h3>
                    <div className="text-muted-foreground text-xs">
                      <p>
                        <strong className="text-foreground">Status:</strong>{" "}
                        {form.sscStatus}
                      </p>
                      <ul className="mt-2 list-disc space-y-1 pl-4">
                        <li>
                          <strong className="text-foreground">
                            Weekly Gross (Main):
                          </strong>{" "}
                          €{formatCurrency(calculation.mainGross / 52)}
                        </li>
                        <li>
                          <strong className="text-foreground">
                            Applicable SSC Rate:
                          </strong>{" "}
                          €{formatCurrency(calculation.sscWeekly)} / week
                        </li>
                        <li>
                          <strong className="text-foreground">
                            Annual SSC:
                          </strong>{" "}
                          €{formatCurrency(calculation.sscWeekly)} × 52 weeks =
                          €{formatCurrency(calculation.ssc)}
                        </li>
                      </ul>
                    </div>

                    <Separator />

                    <h3 className="font-bold underline">
                      3. Government Bonus (COLA)
                    </h3>
                    <div className="text-muted-foreground text-xs">
                      <p>Fixed quarterly allowances added to Net Income:</p>
                      <ul className="mt-2 list-disc space-y-1 pl-4">
                        <li>March: €121.36</li>
                        <li>June: €135.10</li>
                        <li>September: €121.16</li>
                        <li>December: €135.10</li>
                        <li className="text-foreground font-bold">
                          Total: €512.72
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
