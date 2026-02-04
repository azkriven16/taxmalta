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

interface FormState {
  grossSalary: string;
  partTimeIncome: string;
  partTimeType: string;
  taxStatus: string;
  sscStatus: string;
  residencyStatus: string;
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

const isValidAmount = (amount: string): boolean => {
  const num = Number.parseFloat(amount);
  return !isNaN(num) && num >= 0;
};

export default function PersonalTaxCalculator() {
  const [form, setForm] = useState<FormState>({
    grossSalary: "",
    partTimeIncome: "",
    partTimeType: "Employment",
    taxStatus: "Single",
    sscStatus: "Employed (18 years old and over, born on or after 1 Jan 1962)",
    residencyStatus: "Resident",
  });

  const [errors, setErrors] = useState<ErrorState>({});

  // Constants from spreadsheet logic
  // 121.36 + 135.1 + 121.16 + 135.1 = 512.72
  const GOV_BONUS = 512.72;

  const computeStep = (f: FormState): number => {
    let s = 1;
    if (!f.grossSalary) return s;
    s = 2;
    if (Number.parseFloat(f.partTimeIncome) > 0 && !f.partTimeType) return s;
    s = 3;
    if (!f.taxStatus) return s;
    s = 4;
    if (!f.residencyStatus) return s;
    s = 5;
    if (!f.sscStatus) return s;
    return 6;
  };

  const step = computeStep(form);

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

  // Exact SSC Formula from Spreadsheet Logic
  const calculateSSC = (annualGross: number) => {
    const weeklyGross = annualGross / 52;

    if (form.sscStatus === "Exempt from paying NI/SSC")
      return { weekly: 0, total: 0 };

    // Student logic
    if (form.sscStatus === "Student (under 18 years old)") {
      // 10% max 4.38
      const val = Math.min(weeklyGross * 0.1, 4.38);
      return { weekly: val, total: val * 52 };
    }
    if (form.sscStatus === "Student (18 years old and over)") {
      // 10% max 7.94
      const val = Math.min(weeklyGross * 0.1, 7.94);
      return { weekly: val, total: val * 52 };
    }

    // Employed logic
    let weeklySSC = 0;
    if (form.sscStatus === "Employed (under 18 years old)") {
      // IF(H6<=221.78, 6.62, IF(H6<=544.28, H6*0.1, 54.43))
      if (weeklyGross <= 221.78) weeklySSC = 6.62;
      else if (weeklyGross <= 544.28) weeklySSC = weeklyGross * 0.1;
      else weeklySSC = 54.43;
    } else if (
      form.sscStatus ===
      "Employed (18 years old and over, born on or before 31 Dec 1961)"
    ) {
      // IF(H6<=221.78, 22.18, IF(H6<=451.91, H6*0.1, 45.19))
      if (weeklyGross <= 221.78) weeklySSC = 22.18;
      else if (weeklyGross <= 451.91) weeklySSC = weeklyGross * 0.1;
      else weeklySSC = 45.19;
    } else {
      // Employed (18 year old and over, born on or after 1 Jan 1962)
      // IF(H6<=221.78, 22.18, IF(H6<=544.28, H6*0.1, 54.43))
      if (weeklyGross <= 221.78) weeklySSC = 22.18;
      else if (weeklyGross <= 544.28) weeklySSC = weeklyGross * 0.1;
      else weeklySSC = 54.43;
    }

    return { weekly: weeklySSC, total: weeklySSC * 52 };
  };

  const calculateIncomeTax = (salary: number, partTime: number) => {
    // 1. Calculate Part-Time Tax (Flat Rate 10%)
    // IF(C13="Employment", MIN(N(C7),10000)*0.1, IF(C13="Self Employment", MIN(N(C7),12000)*0.1, 0))
    let partTimeTax = 0;
    let excessPartTime = 0;

    if (partTime > 0) {
      const threshold = form.partTimeType === "Employment" ? 10000 : 12000;
      const taxableAtFlat = Math.min(partTime, threshold);
      partTimeTax = taxableAtFlat * 0.1;
      excessPartTime = Math.max(0, partTime - threshold);
    }

    // 2. Calculate Chargeable Income for Progressive Tax
    // Logic: Gross Salary + Excess Part Time
    // Note: Gov Bonus is technically taxable but usually handled in final Net calc in these sheets.
    // Based on the prompt's massive Excel formula:
    // (N(F8) + MAX(N(C7) - Threshold, 0)) where F8 is Gross.
    const chargeableIncome = salary + excessPartTime;

    let progressiveTax = 0;

    if (form.residencyStatus === "Non-Resident") {
      // Non-Resident Rates (2008 onwards)
      // 0-700: 0%
      // 701-3100: 20% - 140
      // 3101-7800: 30% - 450
      // 7801+: 35% - 840
      if (chargeableIncome <= 700) progressiveTax = 0;
      else if (chargeableIncome <= 3100)
        progressiveTax = chargeableIncome * 0.2 - 140;
      else if (chargeableIncome <= 7800)
        progressiveTax = chargeableIncome * 0.3 - 450;
      else progressiveTax = chargeableIncome * 0.35 - 840;
    } else {
      // Resident Rates (New 2025 Formulas from logic dump)
      if (form.taxStatus === "Married") {
        // "Married with no Child"
        // <= 22500: 0
        // <= 32000: 15% - 3375
        // <= 60000: 25% - 6575
        // > 60000: 35% - 12575
        if (chargeableIncome <= 22500) progressiveTax = 0;
        else if (chargeableIncome <= 32000)
          progressiveTax = chargeableIncome * 0.15 - 3375;
        else if (chargeableIncome <= 60000)
          progressiveTax = chargeableIncome * 0.25 - 6575;
        else progressiveTax = chargeableIncome * 0.35 - 12575;
      } else {
        // Single (Default)
        // <= 17500: 0
        // <= 26500: 15% - 2625
        // <= 60000: 25% - 5275
        // > 60000: 35% - 11275
        if (chargeableIncome <= 17500) progressiveTax = 0;
        else if (chargeableIncome <= 26500)
          progressiveTax = chargeableIncome * 0.15 - 2625;
        else if (chargeableIncome <= 60000)
          progressiveTax = chargeableIncome * 0.25 - 5275;
        else progressiveTax = chargeableIncome * 0.35 - 11275;
      }
    }

    const mainTax = Math.max(0, progressiveTax);

    return {
      mainTax,
      partTimeTax,
      totalTax: mainTax + partTimeTax,
      chargeableIncome,
    };
  };

  const calculate = (): TaxCalculation => {
    const grossSalary = Number.parseFloat(form.grossSalary) || 0;
    const partTime = Number.parseFloat(form.partTimeIncome) || 0;

    // Calculate SSC on Gross Salary (Standard for Malta)
    const { total: ssc, weekly: sscWeekly } = calculateSSC(grossSalary);

    // Calculate Tax
    const { mainTax, partTimeTax, totalTax, chargeableIncome } =
      calculateIncomeTax(grossSalary, partTime);

    const totalGross = grossSalary + partTime;

    // Net Formula from Spreadsheet: Gross - Tax - SSC + Gov Bonus
    const netIncome = totalGross - totalTax - ssc + GOV_BONUS;

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
      netIncome,
    };
  };

  const calculation = calculate();

  return (
    <div className="min-h-screen bg-white px-4 py-8 font-sans text-black lg:py-12 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Personal Income Tax Calculator without Children
          </h1>
          <p className="text-sm text-gray-500 sm:text-base dark:text-gray-400">
            For Individuals Without a Child (Basis Year 2025)
          </p>
        </div>

        {/* Top Section: Inputs and Net Income */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Input Form - Left Column */}
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
                      <Label>Part-time Income (€)</Label>
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
                          <SelectItem value="Employment">
                            Employment (Max €10k)
                          </SelectItem>
                          <SelectItem value="Self-Employment">
                            Self-Employment (Max €12k)
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
                        onValueChange={(v) => handleChange("taxStatus", v)}
                      >
                        <SelectTrigger className="dark:bg-zinc-800 dark:text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-zinc-800 dark:text-white">
                          <SelectItem value="Single">Single</SelectItem>
                          <SelectItem value="Married">
                            Married with no Child
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
                      <Label>Residency Status</Label>
                      <Select
                        value={form.residencyStatus}
                        onValueChange={(v) =>
                          handleChange("residencyStatus", v)
                        }
                      >
                        <SelectTrigger className="dark:bg-zinc-800 dark:text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-zinc-800 dark:text-white">
                          <SelectItem value="Resident">Resident</SelectItem>
                          <SelectItem value="Non-Resident">
                            Non-Resident
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {step >= 5 && (
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
                        <SelectTrigger className="dark:bg-zinc-800 dark:text-white">
                          <SelectValue className="truncate" />
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

          {/* Results Panel - Right Column (Just Net Income now) */}
          <div className="space-y-6 lg:col-span-7">
            {/* Main Net Income Card */}
            <Card className="h-full border-black bg-black text-white dark:border-white dark:bg-white dark:text-black">
              <CardHeader className="pb-2">
                <CardDescription className="text-gray-300 dark:text-gray-600">
                  Earnings after tax
                </CardDescription>
                <CardTitle className="text-4xl font-bold sm:text-5xl">
                  €{formatCurrency(calculation.netIncome)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mt-2 grid grid-cols-2 gap-4 border-t border-gray-700 pt-4 text-sm dark:border-gray-200">
                  <div>
                    <p className="text-gray-400 dark:text-gray-600">Monthly</p>
                    <p className="text-lg font-medium">
                      €{formatCurrency(calculation.netIncome / 12)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 dark:text-gray-600">Weekly</p>
                    <p className="text-lg font-medium">
                      €{formatCurrency(calculation.netIncome / 52)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats Table - Full Width Row */}
        <div className="mt-8">
          <Card className="overflow-hidden border-black shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <CardHeader className="border-b bg-gray-50 dark:border-zinc-800 dark:bg-zinc-800/50">
              <CardTitle className="text-base font-semibold">
                Tax Obligations Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Added overflow-x-auto for mobile scrolling */}
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
                        Gross Income (Salary + Part-time)
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
                    <TableRow className="dark:border-zinc-800">
                      <TableCell className="pl-6 font-medium text-green-700 dark:text-green-400">
                        Government Bonus (COLA)
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
                    <TableRow className="dark:border-zinc-800">
                      <TableCell className="pl-6 font-medium text-red-700 dark:text-red-400">
                        Total Tax (Main + Flat)
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap text-red-700 dark:text-red-400">
                        -€{formatCurrency(calculation.incomeTax)}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap text-red-700 dark:text-red-400">
                        -€{formatCurrency(calculation.incomeTax / 12)}
                      </TableCell>
                      <TableCell className="pr-6 text-right whitespace-nowrap text-red-700 dark:text-red-400">
                        -€{formatCurrency(calculation.incomeTax / 52)}
                      </TableCell>
                    </TableRow>
                    <TableRow className="dark:border-zinc-800">
                      <TableCell className="pl-6 font-medium text-red-700 dark:text-red-400">
                        Social Security (SSC)
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap text-red-700 dark:text-red-400">
                        -€{formatCurrency(calculation.ssc)}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap text-red-700 dark:text-red-400">
                        -€{formatCurrency(calculation.ssc / 12)}
                      </TableCell>
                      <TableCell className="pr-6 text-right whitespace-nowrap text-red-700 dark:text-red-400">
                        -€{formatCurrency(calculation.ssc / 52)}
                      </TableCell>
                    </TableRow>
                    <TableRow className="border-t-2 border-black bg-gray-100 font-bold dark:border-white dark:bg-zinc-800">
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

        {/* Logic Accordion - Full Width Bottom */}
        <div className="mt-8">
          <Accordion
            type="single"
            collapsible
            className="w-full rounded-lg border border-black bg-white px-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <AccordionItem value="logic" className="border-b-0">
              <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                View Calculation Logic & Formulas (2025)
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-8 border-t pt-4 lg:grid-cols-2 dark:border-zinc-800">
                  {/* Logic Column 1: Tax */}
                  <div className="space-y-4">
                    <h3 className="font-bold underline">1. Income Tax Logic</h3>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      <p>
                        <strong>Basis:</strong>{" "}
                        {form.residencyStatus === "Resident"
                          ? `Resident (${form.taxStatus})`
                          : "Non-Resident"}{" "}
                        rates (2025 Budget).
                      </p>
                      <ul className="mt-2 list-disc space-y-1 pl-4">
                        <li>
                          <strong>Main Taxable Income:</strong> €
                          {formatCurrency(calculation.taxableIncome)}
                          <br />
                          <span className="text-[10px] text-gray-400">
                            (Gross Salary + Excess Part-time over threshold)
                          </span>
                        </li>
                        <li>
                          <strong>Main Tax Amount:</strong> €
                          {formatCurrency(calculation.mainTax)}
                        </li>
                        {calculation.partTimeGross > 0 && (
                          <>
                            <li className="mt-2">
                              <strong>Part-Time Flat Tax (10%):</strong>
                              <br />
                              Apply 10% on first €
                              {form.partTimeType === "Employment"
                                ? "10,000"
                                : "12,000"}{" "}
                              of part-time income.
                              <br />
                              Amount: €{formatCurrency(calculation.partTimeTax)}
                            </li>
                          </>
                        )}
                      </ul>
                    </div>

                    {form.residencyStatus === "Resident" && (
                      <Table className="border text-xs dark:border-zinc-700">
                        <TableHeader className="bg-gray-100 dark:bg-zinc-800">
                          <TableRow className="dark:border-zinc-700">
                            <TableHead>Range (€)</TableHead>
                            <TableHead>Rate</TableHead>
                            <TableHead>Subtract (€)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {form.taxStatus === "Married" ? (
                            <>
                              <TableRow className="dark:border-zinc-700">
                                <TableCell>0 - 22,500</TableCell>
                                <TableCell>0%</TableCell>
                                <TableCell>0</TableCell>
                              </TableRow>
                              <TableRow className="dark:border-zinc-700">
                                <TableCell>22,501 - 32,000</TableCell>
                                <TableCell>15%</TableCell>
                                <TableCell>3,375</TableCell>
                              </TableRow>
                              <TableRow className="dark:border-zinc-700">
                                <TableCell>32,001 - 60,000</TableCell>
                                <TableCell>25%</TableCell>
                                <TableCell>6,575</TableCell>
                              </TableRow>
                              <TableRow className="dark:border-zinc-700">
                                <TableCell>60,001+</TableCell>
                                <TableCell>35%</TableCell>
                                <TableCell>12,575</TableCell>
                              </TableRow>
                            </>
                          ) : (
                            <>
                              <TableRow className="dark:border-zinc-700">
                                <TableCell>0 - 17,500</TableCell>
                                <TableCell>0%</TableCell>
                                <TableCell>0</TableCell>
                              </TableRow>
                              <TableRow className="dark:border-zinc-700">
                                <TableCell>17,501 - 26,500</TableCell>
                                <TableCell>15%</TableCell>
                                <TableCell>2,625</TableCell>
                              </TableRow>
                              <TableRow className="dark:border-zinc-700">
                                <TableCell>26,501 - 60,000</TableCell>
                                <TableCell>25%</TableCell>
                                <TableCell>5,275</TableCell>
                              </TableRow>
                              <TableRow className="dark:border-zinc-700">
                                <TableCell>60,001+</TableCell>
                                <TableCell>35%</TableCell>
                                <TableCell>11,275</TableCell>
                              </TableRow>
                            </>
                          )}
                        </TableBody>
                      </Table>
                    )}
                  </div>

                  {/* Logic Column 2: SSC & Bonuses */}
                  <div className="space-y-4">
                    <h3 className="font-bold underline">
                      2. Social Security (SSC)
                    </h3>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      <p>
                        <strong>Status:</strong> {form.sscStatus}
                      </p>
                      <ul className="mt-2 list-disc space-y-1 pl-4">
                        <li>
                          <strong>Weekly Gross (Main):</strong> €
                          {formatCurrency(calculation.mainGross / 52)}
                        </li>
                        <li>
                          <strong>Applicable SSC Rate:</strong> €
                          {formatCurrency(calculation.sscWeekly)} / week
                        </li>
                        <li>
                          <strong>Annual SSC:</strong> €
                          {formatCurrency(calculation.sscWeekly)} × 52 weeks = €
                          {formatCurrency(calculation.ssc)}
                        </li>
                      </ul>
                      <div className="mt-4 rounded bg-gray-100 p-2 dark:bg-zinc-800">
                        <p className="font-semibold">Logic Used:</p>
                        {form.sscStatus.includes("Born on or after") && (
                          <p className="mt-1 font-mono text-[10px]">
                            IF(Weekly &le; 221.78, 22.18,
                            <br />
                            IF(Weekly &le; 544.28, 10%, 54.43))
                          </p>
                        )}
                        {form.sscStatus.includes("Student") && (
                          <p className="mt-1 font-mono text-[10px]">
                            10% capped at €
                            {form.sscStatus.includes("under") ? "4.38" : "7.94"}
                          </p>
                        )}
                      </div>
                    </div>

                    <Separator className="dark:bg-zinc-700" />

                    <h3 className="font-bold underline">
                      3. Government Bonus (COLA)
                    </h3>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      <p>Fixed quarterly allowances added to Net Income:</p>
                      <ul className="mt-2 list-disc space-y-1 pl-4">
                        <li>March: €121.36</li>
                        <li>June: €135.10</li>
                        <li>September: €121.16</li>
                        <li>December: €135.10</li>
                        <li className="font-bold">Total: €512.72</li>
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
