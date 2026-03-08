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
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
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
import { ArrowUpIcon } from "lucide-react";

// --- TYPES ---

type TaxStatusType =
  | "Married with One Child"
  | "Married with Two or More Children"
  | "Parent with One Child"
  | "Parent with Two or More Children";

interface FormState {
  grossSalary: string;
  partTimeIncome: string;
  partTimeType: string;
  taxStatus: TaxStatusType;
  sscStatus: string;
}

interface ErrorState {
  [key: string]: string;
}

interface YearCalculation {
  taxableIncome: number;
  mainTax: number;
  partTimeTax: number;
  totalTax: number;
  netIncome: number;
}

interface FullCalculation {
  grossIncome: number;
  ssc: number;
  govBonus: number;
  year2026: YearCalculation;
  year2027: YearCalculation;
  year2028: YearCalculation;
}

interface SSCDetails {
  weeklyGross: number;
  weeklySSC: number;
  annualSSC: number;
  rateDescription: string;
  logicDescription: string;
}

// --- CONSTANTS ---

const GOV_BONUS = 512.72; // 121.36 + 135.1 + 121.16 + 135.1

// --- LOGIC HELPERS ---

const isValidAmount = (amount: string): boolean => {
  const num = Number.parseFloat(amount);
  return !isNaN(num) && num >= 0;
};

// --- COMPONENT ---

export default function MarriedParentTaxCalculator() {
  const [form, setForm] = useState<FormState>({
    grossSalary: "",
    partTimeIncome: "",
    partTimeType: "Employment",
    taxStatus: "Married with One Child",
    sscStatus: "Employed (18 years old and over, born on or after 1 Jan 1962)",
  });

  const [errors, setErrors] = useState<ErrorState>({});

  // 1. Step Logic for UI Reveal
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

  // 2. Validation
  const validateField = (field: string, value: string): void => {
    const newErrors = { ...errors };
    if (
      (field === "grossSalary" || field === "partTimeIncome") &&
      value &&
      !isValidAmount(value)
    ) {
      newErrors[field] = "Please enter a valid amount";
    } else {
      delete newErrors[field];
    }
    setErrors(newErrors);
  };

  const handleChange = (field: keyof FormState, value: string): void => {
    const newForm = { ...form, [field]: value };
    setForm(newForm);
    validateField(field, value);
  };

  // 3. SSC Calculation Helper (Returns details for UI)
  const getSSCDetails = (annualGross: number, status: string): SSCDetails => {
    const weeklyGross = annualGross / 52;
    let weeklySSC = 0;
    let rateDescription = "";
    let logicDescription = "";

    if (status === "Exempt from paying NI/SSC") {
      return {
        weeklyGross,
        weeklySSC: 0,
        annualSSC: 0,
        rateDescription: "Exempt",
        logicDescription: "User is exempt from SSC.",
      };
    }

    if (status === "Student (under 18 years old)") {
      // Min(10%, 4.38)
      const tenPercent = weeklyGross * 0.1;
      if (tenPercent < 4.38) {
        weeklySSC = tenPercent;
        rateDescription = "10% of Weekly Gross";
        logicDescription = "Student rate (10%) is lower than the €4.38 cap.";
      } else {
        weeklySSC = 4.38;
        rateDescription = "€4.38 / week (Fixed Cap)";
        logicDescription = "Student rate capped at €4.38 maximum.";
      }
    } else if (status === "Student (18 years old and over)") {
      // Min(10%, 7.94)
      const tenPercent = weeklyGross * 0.1;
      if (tenPercent < 7.94) {
        weeklySSC = tenPercent;
        rateDescription = "10% of Weekly Gross";
        logicDescription = "Student rate (10%) is lower than the €7.94 cap.";
      } else {
        weeklySSC = 7.94;
        rateDescription = "€7.94 / week (Fixed Cap)";
        logicDescription = "Student rate capped at €7.94 maximum.";
      }
    } else if (status === "Employed (under 18 years old)") {
      if (weeklyGross <= 221.78) {
        weeklySSC = 6.62;
        rateDescription = "€6.62 / week (Minimum)";
        logicDescription =
          "Weekly income is below or equal to €221.78 (Minimum Rate applies).";
      } else if (weeklyGross <= 544.28) {
        weeklySSC = weeklyGross * 0.1;
        rateDescription = "10% of Weekly Gross";
        logicDescription =
          "Weekly income is between €221.79 and €544.28 (Standard 10% applies).";
      } else {
        weeklySSC = 54.43;
        rateDescription = "€54.43 / week (Maximum)";
        logicDescription =
          "Weekly income exceeds €544.28 (Maximum Cap applies).";
      }
    } else if (
      status ===
      "Employed (18 years old and over, born on or before 31 Dec 1961)"
    ) {
      if (weeklyGross <= 221.78) {
        weeklySSC = 22.18;
        rateDescription = "€22.18 / week (Minimum)";
        logicDescription =
          "Weekly income is below or equal to €221.78 (Minimum Rate applies).";
      } else if (weeklyGross <= 451.91) {
        weeklySSC = weeklyGross * 0.1;
        rateDescription = "10% of Weekly Gross";
        logicDescription =
          "Weekly income is between €221.79 and €451.91 (Standard 10% applies).";
      } else {
        weeklySSC = 45.19;
        rateDescription = "€45.19 / week (Maximum)";
        logicDescription =
          "Weekly income exceeds €451.91 (Maximum Cap applies for born <= 1961).";
      }
    } else {
      // Employed (18+, Born >= 1962) - DEFAULT
      if (weeklyGross <= 221.78) {
        weeklySSC = 22.18;
        rateDescription = "€22.18 / week (Minimum)";
        logicDescription =
          "Weekly income is below or equal to €221.78 (Minimum Rate applies).";
      } else if (weeklyGross <= 544.28) {
        weeklySSC = weeklyGross * 0.1;
        rateDescription = "10% of Weekly Gross";
        logicDescription =
          "Weekly income is between €221.79 and €544.28 (Standard 10% applies).";
      } else {
        weeklySSC = 54.43;
        rateDescription = "€54.43 / week (Maximum)";
        logicDescription =
          "Weekly income exceeds €544.28 (Maximum Cap applies).";
      }
    }

    return {
      weeklyGross,
      weeklySSC,
      annualSSC: weeklySSC * 52,
      rateDescription,
      logicDescription,
    };
  };

  // 4. Tax Logic (Multi-Year)
  const calculateTaxForYear = (
    chargeableIncome: number,
    year: 2026 | 2027 | 2028,
  ): number => {
    let tax = 0;
    const s = form.taxStatus;

    if (year === 2026) {
      if (s === "Married with One Child") {
        if (chargeableIncome <= 17500) tax = 0;
        else if (chargeableIncome <= 26500)
          tax = chargeableIncome * 0.15 - 2625;
        else if (chargeableIncome <= 60000)
          tax = chargeableIncome * 0.25 - 5275;
        else tax = chargeableIncome * 0.35 - 11275;
      } else if (s === "Married with Two or More Children") {
        if (chargeableIncome <= 22500) tax = 0;
        else if (chargeableIncome <= 32000)
          tax = chargeableIncome * 0.15 - 3375;
        else if (chargeableIncome <= 60000)
          tax = chargeableIncome * 0.25 - 6575;
        else tax = chargeableIncome * 0.35 - 12575;
      } else if (s === "Parent with One Child") {
        if (chargeableIncome <= 14500) tax = 0;
        else if (chargeableIncome <= 21000)
          tax = chargeableIncome * 0.15 - 2175;
        else if (chargeableIncome <= 60000)
          tax = chargeableIncome * 0.25 - 4275;
        else tax = chargeableIncome * 0.35 - 10270;
      } else if (s === "Parent with Two or More Children") {
        if (chargeableIncome <= 18500) tax = 0;
        else if (chargeableIncome <= 25500)
          tax = chargeableIncome * 0.15 - 2775;
        else if (chargeableIncome <= 60000)
          tax = chargeableIncome * 0.25 - 5325;
        else tax = chargeableIncome * 0.35 - 11325;
      }
    } else if (year === 2027) {
      if (s === "Married with One Child") {
        if (chargeableIncome <= 20000) tax = 0;
        else if (chargeableIncome <= 30000)
          tax = chargeableIncome * 0.15 - 3000;
        else if (chargeableIncome <= 60000)
          tax = chargeableIncome * 0.25 - 6000;
        else tax = chargeableIncome * 0.35 - 12000;
      } else if (s === "Married with Two or More Children") {
        if (chargeableIncome <= 30000) tax = 0;
        else if (chargeableIncome <= 41000)
          tax = chargeableIncome * 0.15 - 4500;
        else if (chargeableIncome <= 60000)
          tax = chargeableIncome * 0.25 - 8600;
        else tax = chargeableIncome * 0.35 - 14600;
      } else if (s === "Parent with One Child") {
        if (chargeableIncome <= 16000) tax = 0;
        else if (chargeableIncome <= 24500)
          tax = chargeableIncome * 0.15 - 2400;
        else if (chargeableIncome <= 60000)
          tax = chargeableIncome * 0.25 - 4850;
        else tax = chargeableIncome * 0.35 - 10850;
      } else if (s === "Parent with Two or More Children") {
        if (chargeableIncome <= 24000) tax = 0;
        else if (chargeableIncome <= 33500)
          tax = chargeableIncome * 0.15 - 3600;
        else if (chargeableIncome <= 60000)
          tax = chargeableIncome * 0.25 - 6950;
        else tax = chargeableIncome * 0.35 - 12950;
      }
    } else if (year === 2028) {
      if (s === "Married with One Child") {
        if (chargeableIncome <= 22500) tax = 0;
        else if (chargeableIncome <= 33500)
          tax = chargeableIncome * 0.15 - 3375;
        else if (chargeableIncome <= 60000)
          tax = chargeableIncome * 0.25 - 6725;
        else tax = chargeableIncome * 0.35 - 12725;
      } else if (s === "Married with Two or More Children") {
        if (chargeableIncome <= 37000) tax = 0;
        else if (chargeableIncome <= 50000)
          tax = chargeableIncome * 0.15 - 5550;
        else if (chargeableIncome <= 60000)
          tax = chargeableIncome * 0.25 - 10550;
        else tax = chargeableIncome * 0.35 - 16550;
      } else if (s === "Parent with One Child") {
        if (chargeableIncome <= 18000) tax = 0;
        else if (chargeableIncome <= 28000)
          tax = chargeableIncome * 0.15 - 2700;
        else if (chargeableIncome <= 60000)
          tax = chargeableIncome * 0.25 - 5500;
        else tax = chargeableIncome * 0.35 - 11500;
      } else if (s === "Parent with Two or More Children") {
        if (chargeableIncome <= 30000) tax = 0;
        else if (chargeableIncome <= 42000)
          tax = chargeableIncome * 0.15 - 4500;
        else if (chargeableIncome <= 60000)
          tax = chargeableIncome * 0.25 - 8700;
        else tax = chargeableIncome * 0.35 - 14700;
      }
    }

    return Math.max(0, tax);
  };

  const calculateAll = (): FullCalculation & { sscDetails: SSCDetails } => {
    // Return zeroed object if grossSalary is empty
    if (!form.grossSalary) {
      const zeroYear: YearCalculation = {
        taxableIncome: 0,
        mainTax: 0,
        partTimeTax: 0,
        totalTax: 0,
        netIncome: 0,
      };
      return {
        grossIncome: 0,
        ssc: 0,
        govBonus: 0,
        year2026: zeroYear,
        year2027: zeroYear,
        year2028: zeroYear,
        sscDetails: {
          weeklyGross: 0,
          weeklySSC: 0,
          annualSSC: 0,
          rateDescription: "-",
          logicDescription: "-",
        },
      };
    }

    const grossSalary = Number.parseFloat(form.grossSalary) || 0;
    const partTime = Number.parseFloat(form.partTimeIncome) || 0;

    // Get precise SSC details
    const sscDetails = getSSCDetails(grossSalary, form.sscStatus);
    const ssc = sscDetails.annualSSC;
    const totalGross = grossSalary + partTime;

    // Part Time Tax Calculation (Fixed Rate on the threshold amount)
    let partTimeTax = 0;
    let excessPartTime = 0;
    if (partTime > 0) {
      const threshold = form.partTimeType === "Employment" ? 10000 : 12000;
      partTimeTax = Math.min(partTime, threshold) * 0.1;
      excessPartTime = Math.max(0, partTime - threshold);
    }

    // Chargeable Income = Gross + Excess Part Time + Government Bonus
    const chargeableIncome = grossSalary + excessPartTime + GOV_BONUS;

    const buildYearCalc = (year: 2026 | 2027 | 2028): YearCalculation => {
      const mainTax = calculateTaxForYear(chargeableIncome, year);
      const totalTax = mainTax + partTimeTax;
      // Net Income = (Gross + PartTime + Bonus) - TotalTax - SSC
      const netIncome = totalGross + GOV_BONUS - totalTax - ssc;

      return {
        taxableIncome: chargeableIncome,
        mainTax,
        partTimeTax,
        totalTax,
        netIncome,
      };
    };

    return {
      grossIncome: totalGross,
      ssc,
      govBonus: GOV_BONUS,
      year2026: buildYearCalc(2026),
      year2027: buildYearCalc(2027),
      year2028: buildYearCalc(2028),
      sscDetails,
    };
  };

  const results = calculateAll();

  return (
    <div className="min-h-screen bg-white px-4 py-8 font-sans text-black lg:py-12 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Personal Income Tax Calculator with Children
          </h1>
          <p className="text-sm text-gray-500 sm:text-base dark:text-gray-400">
            For Married Individuals & Parents With Dependents (Basis Year 2026 -
            2028)
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* LEFT: INPUTS */}
          <div className="space-y-6 lg:col-span-5">
            <Card className="border-black shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs font-bold text-white dark:bg-white dark:text-black">
                    {step}
                  </div>
                  Your Income Situation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label>Annual Gross Salary (€)</Label>
                  <CurrencyInput
                    type="number"
                    placeholder="0.00"
                    value={form.grossSalary}
                    onChange={(e) =>
                      handleChange("grossSalary", e.target.value)
                    }
                    className={`h-10 w-full dark:bg-zinc-800 dark:text-white ${
                      errors.grossSalary ? "border-red-500" : ""
                    }`}
                  />
                  {errors.grossSalary && (
                    <p className="text-xs text-red-500">{errors.grossSalary}</p>
                  )}
                </div>

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
                        className={`h-10 w-full dark:bg-zinc-800 dark:text-white ${
                          errors.partTimeIncome ? "border-red-500" : ""
                        }`}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

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
                        <SelectTrigger className="dark:bg-zinc-800 dark:text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-zinc-800 dark:text-white">
                          <SelectItem value="Employment">Employment</SelectItem>
                          <SelectItem value="Self-Employment">
                            Self-Employment
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Separator className="dark:bg-zinc-700" />

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
                        onValueChange={(v) =>
                          handleChange("taxStatus", v as TaxStatusType)
                        }
                      >
                        <SelectTrigger className="h-auto w-full py-2 dark:bg-zinc-800 dark:text-white">
                          <SelectValue className="text-left whitespace-normal" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-zinc-800 dark:text-white">
                          <SelectItem value="Married with One Child">
                            Married with One Child
                          </SelectItem>
                          <SelectItem value="Married with Two or More Children">
                            Married with Two or More Children
                          </SelectItem>
                          <SelectItem value="Parent with One Child">
                            Parent with One Child
                          </SelectItem>
                          <SelectItem value="Parent with Two or More Children">
                            Parent with Two or More Children
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>
                  )}
                </AnimatePresence>

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
                        <SelectTrigger className="h-auto w-full py-2 dark:bg-zinc-800 dark:text-white">
                          <SelectValue className="text-left whitespace-normal" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-zinc-800 dark:text-white">
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

          {/* RIGHT: RESULTS */}
          <div className="space-y-6 lg:col-span-7">
            {/* Main Net Income Card (2026) */}
            <Card className="border-black bg-black text-white dark:border-white dark:bg-white dark:text-black">
              <CardHeader className="pb-2">
                <CardDescription className="text-gray-300 dark:text-gray-600">
                  2026 Net Annual Earnings
                </CardDescription>
                <CardTitle className="text-4xl font-bold sm:text-5xl">
                  €{formatCurrency(results.year2026.netIncome)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mt-2 grid grid-cols-2 gap-4 border-t border-gray-700 pt-4 text-sm dark:border-gray-200">
                  <div>
                    <p className="text-gray-400 dark:text-gray-600">Monthly</p>
                    <p className="text-lg font-medium">
                      €{formatCurrency(results.year2026.netIncome / 12)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 dark:text-gray-600">Weekly</p>
                    <p className="text-lg font-medium">
                      €{formatCurrency(results.year2026.netIncome / 52)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Future Projections (2027-2028) */}
            <div className="grid grid-cols-2 gap-4">
              {/* 2027 */}
              <Card className="border-green-600 bg-green-50 dark:border-green-900 dark:bg-green-950/30">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">
                    2027 Projected Net
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-xl font-bold text-green-700 sm:text-2xl dark:text-green-400">
                    €{formatCurrency(results.year2027.netIncome)}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-300">
                    <ArrowUpIcon className="h-3 w-3" />+
                    {formatCurrency(
                      results.year2027.netIncome - results.year2026.netIncome,
                    )}{" "}
                    vs 2026
                  </div>
                </CardContent>
              </Card>

              {/* 2028 */}
              <Card className="border-green-600 bg-green-50 dark:border-green-900 dark:bg-green-950/30">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium text-green-900 dark:text-green-100">
                    2028 Projected Net
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-xl font-bold text-green-700 sm:text-2xl dark:text-green-400">
                    €{formatCurrency(results.year2028.netIncome)}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-300">
                    <ArrowUpIcon className="h-3 w-3" />+
                    {formatCurrency(
                      results.year2028.netIncome - results.year2026.netIncome,
                    )}{" "}
                    vs 2026
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Stats Table - Full Width Bottom Row */}
        <div className="mt-8">
          <Card className="overflow-hidden border-black shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <CardHeader className="border-b bg-gray-50 dark:border-zinc-800 dark:bg-zinc-800/50">
              <CardTitle className="text-base font-semibold">
                2026 Tax Obligations Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="min-w-[600px]">
                  <TableHeader>
                    <TableRow className="dark:border-zinc-800">
                      <TableHead className="w-[40%] pl-6">
                        Description
                      </TableHead>
                      <TableHead className="text-right">Yearly</TableHead>
                      <TableHead className="text-right">Monthly</TableHead>
                      <TableHead className="pr-6 text-right">Weekly</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="dark:border-zinc-800">
                      <TableCell className="pl-6 font-medium">
                        Gross Income
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        €{formatCurrency(results.grossIncome)}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        €{formatCurrency(results.grossIncome / 12)}
                      </TableCell>
                      <TableCell className="pr-6 text-right whitespace-nowrap">
                        €{formatCurrency(results.grossIncome / 52)}
                      </TableCell>
                    </TableRow>
                    <TableRow className="dark:border-zinc-800">
                      <TableCell className="pl-6 font-medium text-green-700 dark:text-green-400">
                        Government Bonus
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap text-green-700 dark:text-green-400">
                        +€{formatCurrency(results.govBonus)}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap text-green-700 dark:text-green-400">
                        +€{formatCurrency(results.govBonus / 12)}
                      </TableCell>
                      <TableCell className="pr-6 text-right whitespace-nowrap text-green-700 dark:text-green-400">
                        +€{formatCurrency(results.govBonus / 52)}
                      </TableCell>
                    </TableRow>
                    <TableRow className="dark:border-zinc-800">
                      <TableCell className="pl-6 font-medium text-red-700 dark:text-red-400">
                        Income Tax (2026)
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap text-red-700 dark:text-red-400">
                        -€{formatCurrency(results.year2026.totalTax)}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap text-red-700 dark:text-red-400">
                        -€{formatCurrency(results.year2026.totalTax / 12)}
                      </TableCell>
                      <TableCell className="pr-6 text-right whitespace-nowrap text-red-700 dark:text-red-400">
                        -€{formatCurrency(results.year2026.totalTax / 52)}
                      </TableCell>
                    </TableRow>
                    <TableRow className="dark:border-zinc-800">
                      <TableCell className="pl-6 font-medium text-red-700 dark:text-red-400">
                        Social Security
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap text-red-700 dark:text-red-400">
                        -€{formatCurrency(results.ssc)}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap text-red-700 dark:text-red-400">
                        -€{formatCurrency(results.ssc / 12)}
                      </TableCell>
                      <TableCell className="pr-6 text-right whitespace-nowrap text-red-700 dark:text-red-400">
                        -€{formatCurrency(results.ssc / 52)}
                      </TableCell>
                    </TableRow>
                    <TableRow className="border-t-2 border-black bg-gray-100 font-bold dark:border-white dark:bg-zinc-800">
                      <TableCell className="pl-6">Net Earnings</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        €{formatCurrency(results.year2026.netIncome)}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        €{formatCurrency(results.year2026.netIncome / 12)}
                      </TableCell>
                      <TableCell className="pr-6 text-right whitespace-nowrap">
                        €{formatCurrency(results.year2026.netIncome / 52)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* LOGIC ACCORDION (STACKED VIEWS) */}
        <div className="mt-8">
          <Accordion
            type="single"
            collapsible
            className="w-full rounded-lg border border-black bg-white px-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <AccordionItem value="logic" className="border-b-0">
              <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                View Calculation Breakdown
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-10 pt-4">
                  {/* SECTION 1: TAX RATES */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold">
                      1. Tax Rates for {form.taxStatus}
                    </h3>
                    <div className="grid gap-6 lg:grid-cols-3">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300">
                          Basis Year 2026
                        </h4>
                        <TaxTable year={2026} status={form.taxStatus} />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-green-700 dark:text-green-400">
                          Basis Year 2027
                        </h4>
                        <TaxTable year={2027} status={form.taxStatus} />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-green-700 dark:text-green-400">
                          Basis Year 2028
                        </h4>
                        <TaxTable year={2028} status={form.taxStatus} />
                      </div>
                    </div>
                  </div>

                  <Separator className="dark:bg-zinc-700" />

                  {/* SECTION 2: SSC */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold">
                      2. Social Security (SSC) Breakdown
                    </h3>
                    <div className="rounded-md border border-gray-100 bg-gray-50 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-800/50">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                            Status
                          </p>
                          <p className="font-semibold">{form.sscStatus}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                            Weekly Gross (Main)
                          </p>
                          <p className="font-semibold">
                            €{formatCurrency(results.sscDetails.weeklyGross)}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                            Applicable SSC Rate
                          </p>
                          <p className="font-semibold text-red-600 dark:text-red-400">
                            {results.sscDetails.rateDescription}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                            Annual SSC Total
                          </p>
                          <p className="font-semibold text-red-600 dark:text-red-400">
                            €{formatCurrency(results.sscDetails.weeklySSC)} × 52
                            weeks = €
                            {formatCurrency(results.sscDetails.annualSSC)}
                          </p>
                        </div>
                      </div>
                      <Separator className="my-4 dark:bg-zinc-700" />
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase dark:text-gray-400">
                          Logic Used
                        </p>
                        <p className="mt-1 text-gray-700 dark:text-gray-300">
                          {results.sscDetails.logicDescription}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator className="dark:bg-zinc-700" />

                  {/* SECTION 3: GOV BONUS */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold">
                      3. Government Bonus (COLA) Breakdown
                    </h3>
                    <div className="max-w-md space-y-4 text-sm">
                      <p className="text-gray-500 dark:text-gray-400">
                        Fixed quarterly allowances added to Net Income:
                      </p>
                      <div className="grid grid-cols-2 gap-y-2 rounded-md border border-gray-100 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
                        <div className="font-medium">March</div>
                        <div className="text-right font-semibold text-green-700 dark:text-green-400">
                          €121.36
                        </div>
                        <div className="font-medium">June</div>
                        <div className="text-right font-semibold text-green-700 dark:text-green-400">
                          €135.10
                        </div>
                        <div className="font-medium">September</div>
                        <div className="text-right font-semibold text-green-700 dark:text-green-400">
                          €121.16
                        </div>
                        <div className="font-medium">December</div>
                        <div className="text-right font-semibold text-green-700 dark:text-green-400">
                          €135.10
                        </div>
                        <Separator className="col-span-2 my-2 dark:bg-zinc-700" />
                        <div className="font-bold">Total Annual</div>
                        <div className="text-right font-bold text-green-700 dark:text-green-400">
                          €512.72
                        </div>
                      </div>
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

// --- SUBCOMPONENT FOR RATE TABLES ---

function TaxTable({
  year,
  status,
}: {
  year: 2026 | 2027 | 2028;
  status: TaxStatusType;
}) {
  const getRows = () => {
    if (year === 2026) {
      if (status === "Married with One Child") {
        return [
          ["0 - 17,500", "0%", "0"],
          ["17,501 - 26,500", "15%", "2,625"],
          ["26,501 - 60,000", "25%", "5,275"],
          ["60,001+", "35%", "11,275"],
        ];
      }
      if (status === "Married with Two or More Children") {
        return [
          ["0 - 22,500", "0%", "0"],
          ["22,501 - 32,000", "15%", "3,375"],
          ["32,001 - 60,000", "25%", "6,575"],
          ["60,001+", "35%", "12,575"],
        ];
      }
      if (status === "Parent with One Child") {
        return [
          ["0 - 14,500", "0%", "0"],
          ["14,501 - 21,000", "15%", "2,175"],
          ["21,001 - 60,000", "25%", "4,275"],
          ["60,001+", "35%", "10,270"],
        ];
      }
      if (status === "Parent with Two or More Children") {
        return [
          ["0 - 18,500", "0%", "0"],
          ["18,501 - 25,500", "15%", "2,775"],
          ["25,501 - 60,000", "25%", "5,325"],
          ["60,001+", "35%", "11,325"],
        ];
      }
    }

    if (year === 2027) {
      if (status === "Married with One Child") {
        return [
          ["0 - 20,000", "0%", "0"],
          ["20,001 - 30,000", "15%", "3,000"],
          ["30,001 - 60,000", "25%", "6,000"],
          ["60,001+", "35%", "12,000"],
        ];
      }
      if (status === "Married with Two or More Children") {
        return [
          ["0 - 30,000", "0%", "0"],
          ["30,001 - 41,000", "15%", "4,500"],
          ["41,001 - 60,000", "25%", "8,600"],
          ["60,001+", "35%", "14,600"],
        ];
      }
      if (status === "Parent with One Child") {
        return [
          ["0 - 16,000", "0%", "0"],
          ["16,001 - 24,500", "15%", "2,400"],
          ["24,501 - 60,000", "25%", "4,850"],
          ["60,001+", "35%", "10,850"],
        ];
      }
      if (status === "Parent with Two or More Children") {
        return [
          ["0 - 24,000", "0%", "0"],
          ["24,001 - 33,500", "15%", "3,600"],
          ["33,501 - 60,000", "25%", "6,950"],
          ["60,001+", "35%", "12,950"],
        ];
      }
    }

    if (year === 2028) {
      if (status === "Married with One Child") {
        return [
          ["0 - 22,500", "0%", "0"],
          ["22,501 - 33,500", "15%", "3,375"],
          ["33,501 - 60,000", "25%", "6,725"],
          ["60,001+", "35%", "12,725"],
        ];
      }
      if (status === "Married with Two or More Children") {
        return [
          ["0 - 37,000", "0%", "0"],
          ["37,001 - 50,000", "15%", "5,550"],
          ["50,001 - 60,000", "25%", "10,550"],
          ["60,001+", "35%", "16,550"],
        ];
      }
      if (status === "Parent with One Child") {
        return [
          ["0 - 18,000", "0%", "0"],
          ["18,001 - 28,000", "15%", "2,700"],
          ["28,001 - 60,000", "25%", "5,500"],
          ["60,001+", "35%", "11,500"],
        ];
      }
      if (status === "Parent with Two or More Children") {
        return [
          ["0 - 30,000", "0%", "0"],
          ["30,001 - 42,000", "15%", "4,500"],
          ["42,001 - 60,000", "25%", "8,700"],
          ["60,001+", "35%", "14,700"],
        ];
      }
    }
    return [];
  };

  const rows = getRows();

  return (
    <Table className="border text-xs dark:border-zinc-800">
      <TableHeader className="bg-gray-100 dark:bg-zinc-800">
        <TableRow className="dark:border-zinc-800">
          <TableHead className="p-2">Range (€)</TableHead>
          <TableHead className="p-2">Rate</TableHead>
          <TableHead className="p-2">Subtract (€)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r, i) => (
          <TableRow key={i} className="dark:border-zinc-800">
            <TableCell className="p-2">{r[0]}</TableCell>
            <TableCell className="p-2">{r[1]}</TableCell>
            <TableCell className="p-2">{r[2]}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
