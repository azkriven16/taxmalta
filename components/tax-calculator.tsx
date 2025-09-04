"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Calculator,
  Calendar,
  Euro,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

/**
 * Interfaces
 */
interface FormData {
  taxpayerType: "Individual" | "Company" | string;
  fyMonth: string;
  taxYear: number;
  filingDate: string; // ISO date string
  dueDate: string; // ISO date string
  paymentDate: string; // ISO date string
  outstanding: number;
}

interface CalculationResult {
  fyEndDate: Date;
  penalty: number;
  interest: number;
  total: number;
  monthsLate: number;
}

interface PenaltyTiers {
  thresholds: number[]; // months thresholds ascending e.g. [1,7,13,...]
  individual: number[]; // penalty amounts corresponding to thresholds
  company: number[]; // same length as individual
}

interface InterestPeriod {
  // Use ISO date strings or Date objects
  start: string | Date;
  end: string | Date;
  rate: number; // monthly rate as decimal, e.g. 0.006 for 0.6%
}

type CustomPenaltyFn = (args: {
  taxpayerType: string;
  fyEndDate: Date;
  filedDate: Date;
  formData: FormData;
}) => number;

type CustomValidateFn = (data: FormData) => Record<string, string>;

/** The rules structure users can pass in */
export interface TaxRules {
  // Either provide tiers or a custom function
  penaltyTiers?: PenaltyTiers;
  customPenalty?: CustomPenaltyFn;

  // Interest schedule
  interestPeriods?: InterestPeriod[];

  // Optional custom validation
  validate?: CustomValidateFn;

  // Formatting & constraints
  currencySymbol?: string;
  locale?: string;
  minTaxYear?: number;
  maxFutureYears?: number; // e.g. 5 -> taxYear cannot be more than currentYear+5
}

/** Props for the component */
export interface TaxCalculatorProps {
  rules?: TaxRules;
  defaultValues?: Partial<FormData>;
  currency?: string; // overrides rules.currencySymbol
  locale?: string; // overrides rules.locale
  onCalculate?: (results: CalculationResult | null) => void;
}

/**
 * Defaults: replicates original behavior so migrating is frictionless
 */

const defaultPenaltyTiers: PenaltyTiers = {
  thresholds: [1, 7, 13, 19, 25, 37, 49, 61],
  individual: [10, 50, 100, 150, 200, 300, 400, 500],
  company: [50, 200, 400, 600, 800, 1000, 1200, 1500],
};

const defaultInterestPeriods: InterestPeriod[] = [
  { start: "1900-01-01", end: "2008-12-31", rate: 0.01 },
  { start: "2009-01-01", end: "2013-12-31", rate: 0.0075 },
  { start: "2014-01-01", end: "2019-12-31", rate: 0.0054 },
  { start: "2020-01-01", end: "2022-05-31", rate: 0.0033 },
  { start: "2022-06-01", end: "9999-12-31", rate: 0.006 },
];

const defaultRules: TaxRules = {
  penaltyTiers: defaultPenaltyTiers,
  interestPeriods: defaultInterestPeriods,
  currencySymbol: "€",
  locale: "en-GB",
  minTaxYear: 2000,
  maxFutureYears: 5,
};

/**
 * Utility helpers
 */
const monthMap: Record<string, number> = {
  JANUARY: 1,
  JAN: 1,
  FEBRUARY: 2,
  FEB: 2,
  MARCH: 3,
  MAR: 3,
  APRIL: 4,
  APR: 4,
  MAY: 5,
  JUNE: 6,
  JUN: 6,
  JULY: 7,
  JUL: 7,
  AUGUST: 8,
  AUG: 8,
  SEPTEMBER: 9,
  SEP: 9,
  OCTOBER: 10,
  OCT: 10,
  NOVEMBER: 11,
  NOV: 11,
  DECEMBER: 12,
  DEC: 12,
};

function monthDiff(fromDate: Date, toDate: Date): number {
  const from = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1);
  const to = new Date(toDate.getFullYear(), toDate.getMonth(), 1);
  return (
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth())
  );
}

function toDate(d: string | Date): Date {
  return d instanceof Date ? d : new Date(d);
}

function getFinancialYearEnd(monthStr: string, year: number): Date {
  const monthName = monthStr.toUpperCase().trim();
  const month = isNaN(Number(monthStr))
    ? monthMap[monthName] || monthMap[monthName.slice(0, 3)] || 3
    : parseInt(monthStr);

  if (month < 1 || month > 12) {
    return new Date(year, 2, 31);
  }

  return new Date(year, month - 1, new Date(year, month, 0).getDate());
}

/**
 * Calculation functions that use the provided rules
 */
function calculateLateFilingPenaltyWithRules(
  rules: TaxRules,
  taxpayerType: string,
  fyEndDate: Date,
  actualFiledDate: Date,
  formData: FormData
): number {
  // If custom function provided, use it
  if (rules.customPenalty) {
    try {
      return Math.max(
        0,
        Math.round(
          rules.customPenalty({
            taxpayerType,
            fyEndDate,
            filedDate: actualFiledDate,
            formData,
          }) * 100
        ) / 100
      );
    } catch (e) {
      console.error("customPenalty threw:", e);
      // fall through to tiers
    }
  }

  // default / tier-based
  const tiers = rules.penaltyTiers || defaultRules.penaltyTiers!;
  if (actualFiledDate <= fyEndDate) return 0;
  const monthsLate = Math.max(1, monthDiff(fyEndDate, actualFiledDate));

  // find highest threshold <= monthsLate
  const { thresholds, individual, company } = tiers;
  const penalties = taxpayerType === "Individual" ? individual : company;

  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (monthsLate >= thresholds[i]) {
      return penalties[i] ?? 0;
    }
  }

  return 0;
}

function calculateInterestWithRules(
  rules: TaxRules,
  outstandingAmount: number,
  dueDate: Date,
  paymentDate: Date
): number {
  if (
    !outstandingAmount ||
    !dueDate ||
    !paymentDate ||
    paymentDate <= dueDate
  ) {
    return 0;
  }

  const periods = rules.interestPeriods || defaultRules.interestPeriods!;
  let totalInterest = 0;
  let currentDate = new Date(dueDate);

  for (const p of periods) {
    if (currentDate >= paymentDate) break;
    const start = toDate(p.start);
    const end = toDate(p.end);

    const periodStart = new Date(
      Math.max(currentDate.getTime(), start.getTime())
    );
    const periodEnd = new Date(Math.min(paymentDate.getTime(), end.getTime()));

    if (periodStart < periodEnd) {
      const months = monthDiff(periodStart, periodEnd);
      if (months > 0) {
        totalInterest += outstandingAmount * months * p.rate;
        currentDate = periodEnd;
      }
    }
  }

  return Math.round(totalInterest * 100) / 100;
}

function defaultValidate(
  data: FormData,
  rules: TaxRules
): Record<string, string> {
  const errors: Record<string, string> = {};
  const currentYear = new Date().getFullYear();
  const minTaxYear = rules.minTaxYear ?? defaultRules.minTaxYear!;
  const maxFuture = rules.maxFutureYears ?? defaultRules.maxFutureYears!;

  if (!data.taxpayerType) {
    errors.taxpayerType = "Please select a taxpayer type.";
  }

  if (!data.fyMonth) {
    errors.fyMonth = "Please select a financial year-end month.";
  }

  if (!data.taxYear || data.taxYear < minTaxYear) {
    errors.taxYear = `Tax year must be ${minTaxYear} or later.`;
  } else if (data.taxYear > 2099) {
    errors.taxYear = "Tax year must be 2099 or earlier.";
  } else if (data.taxYear > currentYear + maxFuture) {
    errors.taxYear = `Tax year cannot be more than ${maxFuture} years in the future.`;
  }

  if (!data.filingDate) {
    errors.filingDate = "Filing date is required.";
  } else {
    const filingDate = new Date(data.filingDate);
    const fyEndDate = getFinancialYearEnd(data.fyMonth, data.taxYear);
    const earliestDate = new Date(
      fyEndDate.getFullYear() - 2,
      fyEndDate.getMonth(),
      fyEndDate.getDate()
    );
    if (filingDate < earliestDate) {
      errors.filingDate =
        "Filing date seems unreasonably early for this tax year.";
    }
  }

  if (!data.dueDate) {
    errors.dueDate = "Tax due date is required.";
  }

  if (!data.paymentDate) {
    errors.paymentDate = "Payment date is required.";
  } else if (data.dueDate && data.paymentDate) {
    const dueDate = new Date(data.dueDate);
    const paymentDate = new Date(data.paymentDate);
    if (paymentDate < dueDate) {
      errors.paymentDate = "Payment date must be on or after the due date.";
    }
  }

  if (data.outstanding < 0) {
    errors.outstanding = "Outstanding amount cannot be negative.";
  } else if (data.outstanding > 999999999) {
    errors.outstanding = "Outstanding amount is too large.";
  }

  return errors;
}

/**
 * Component
 */
export default function TaxCalculator({
  rules = defaultRules,
  defaultValues = {},
  currency,
  locale,
  onCalculate,
}: TaxCalculatorProps) {
  const mergedLocale = locale || rules.locale || defaultRules.locale;
  const symbol =
    currency || rules.currencySymbol || defaultRules.currencySymbol;

  const [formData, setFormData] = useState<FormData>({
    taxpayerType: (defaultValues.taxpayerType as any) || "Individual",
    fyMonth: defaultValues.fyMonth || "March",
    taxYear: defaultValues.taxYear || new Date().getFullYear(),
    filingDate: defaultValues.filingDate || "",
    dueDate: defaultValues.dueDate || "",
    paymentDate: defaultValues.paymentDate || "",
    outstanding: defaultValues.outstanding ?? 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [results, setResults] = useState<CalculationResult | null>(null);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleSubmit = () => {
    // validation
    const validationErrors = rules.validate
      ? rules.validate(formData)
      : defaultValidate(formData, rules);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setResults(null);
      onCalculate?.(null);
      return;
    }

    setErrors({});

    const fyEndDate = getFinancialYearEnd(formData.fyMonth, formData.taxYear);
    const filedDate = new Date(formData.filingDate);
    const payDate = new Date(formData.paymentDate);
    const due = new Date(formData.dueDate);

    const penalty = calculateLateFilingPenaltyWithRules(
      rules,
      formData.taxpayerType,
      fyEndDate,
      filedDate,
      formData
    );
    const interest = calculateInterestWithRules(
      rules,
      formData.outstanding,
      due,
      payDate
    );
    const total =
      Math.round((formData.outstanding + penalty + interest) * 100) / 100;
    const monthsLate =
      filedDate > fyEndDate ? monthDiff(fyEndDate, filedDate) : 0;

    const res: CalculationResult = {
      fyEndDate,
      penalty,
      interest,
      total,
      monthsLate,
    };

    setResults(res);
    onCalculate?.(res);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Calculator className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Late Tax Penalty Calculator
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Calculate late filing penalties and interest charges on outstanding
            tax amounts.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="h-5 w-5" />
                Tax Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2 flex justify-around">
                  <Label htmlFor="taxpayerType">Taxpayer Type</Label>
                  <Select
                    value={formData.taxpayerType}
                    onValueChange={(value) =>
                      handleInputChange("taxpayerType", value)
                    }
                  >
                    <SelectTrigger
                      className={
                        errors.taxpayerType ? "border-red-500" : "w-52"
                      }
                    >
                      <SelectValue placeholder="Select taxpayer type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Individual">Individual</SelectItem>
                      <SelectItem value="Company">Company</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.taxpayerType && (
                    <p className="text-sm text-red-600">
                      {errors.taxpayerType}
                    </p>
                  )}

                  <Label htmlFor="fyMonth">Financial Year-End Month</Label>
                  <Select
                    value={formData.fyMonth}
                    onValueChange={(value) =>
                      handleInputChange("fyMonth", value)
                    }
                  >
                    <SelectTrigger
                      className={errors.fyMonth ? "border-red-500" : "w-52"}
                    >
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.fyMonth && (
                    <p className="text-sm text-red-600">{errors.fyMonth}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxYear">Tax Year</Label>
                  <Input
                    id="taxYear"
                    type="number"
                    placeholder="e.g. 2024"
                    value={formData.taxYear}
                    onChange={(e) =>
                      handleInputChange("taxYear", Number(e.target.value))
                    }
                    className={errors.taxYear ? "border-red-500" : ""}
                  />
                  {errors.taxYear && (
                    <p className="text-sm text-red-600">{errors.taxYear}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="filingDate"
                    className="flex items-center gap-1"
                  >
                    <Calendar className="h-4 w-4" />
                    Filing Date
                  </Label>
                  <Input
                    id="filingDate"
                    type="date"
                    value={formData.filingDate}
                    onChange={(e) =>
                      handleInputChange("filingDate", e.target.value)
                    }
                    className={errors.filingDate ? "border-red-500" : ""}
                  />
                  {errors.filingDate && (
                    <p className="text-sm text-red-600">{errors.filingDate}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate" className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Tax Due Date
                  </Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      handleInputChange("dueDate", e.target.value)
                    }
                    className={errors.dueDate ? "border-red-500" : ""}
                  />
                  {errors.dueDate && (
                    <p className="text-sm text-red-600">{errors.dueDate}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="paymentDate"
                    className="flex items-center gap-1"
                  >
                    <Calendar className="h-4 w-4" />
                    Payment Date
                  </Label>
                  <Input
                    id="paymentDate"
                    type="date"
                    value={formData.paymentDate}
                    onChange={(e) =>
                      handleInputChange("paymentDate", e.target.value)
                    }
                    className={errors.paymentDate ? "border-red-500" : ""}
                  />
                  {errors.paymentDate && (
                    <p className="text-sm text-red-600">{errors.paymentDate}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="outstanding"
                    className="flex items-center gap-1"
                  >
                    <Euro className="h-4 w-4" />
                    Outstanding Tax Amount ({symbol})
                  </Label>
                  <Input
                    id="outstanding"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.outstanding}
                    onChange={(e) =>
                      handleInputChange("outstanding", Number(e.target.value))
                    }
                    className={errors.outstanding ? "border-red-500" : ""}
                  />
                  {errors.outstanding && (
                    <p className="text-sm text-red-600">{errors.outstanding}</p>
                  )}
                </div>

                <Button onClick={handleSubmit} className="w-full" size="lg">
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Penalties
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Calculation Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {results ? (
                <div className="space-y-4">
                  {results.penalty > 0 || results.interest > 0 ? (
                    <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-amber-800 dark:text-amber-200">
                        {results.monthsLate > 0 &&
                          `Filing was ${results.monthsLate} month${
                            results.monthsLate > 1 ? "s" : ""
                          } late. `}{" "}
                        Additional charges apply.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800 dark:text-green-200">
                        No additional penalties or interest charges.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        Financial Year Ends
                      </span>
                      <Badge variant="secondary">
                        {results.fyEndDate.toLocaleDateString(mergedLocale)}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        Late Filing Penalty
                      </span>
                      <Badge
                        variant={
                          results.penalty > 0 ? "destructive" : "secondary"
                        }
                      >
                        {symbol}
                        {results.penalty.toFixed(2)}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="flex items-center gap-2">
                        <Euro className="h-4 w-4 text-blue-500" />
                        Interest on Late Payment
                      </span>
                      <Badge
                        variant={
                          results.interest > 0 ? "destructive" : "secondary"
                        }
                      >
                        {symbol}
                        {results.interest.toFixed(2)}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-700">
                      <span className="font-semibold text-lg flex items-center gap-2">
                        <Euro className="h-5 w-5 text-blue-600" />
                        Total Payable
                      </span>
                      <Badge className="text-lg px-4 py-2 bg-blue-600 hover:bg-blue-700">
                        {symbol}
                        {results.total.toFixed(2)}
                      </Badge>
                    </div>
                  </div>

                  {results.monthsLate > 0 && (
                    <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                      <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                        Filing Delay Information
                      </h4>
                      <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                        <li>
                          • Filing was {results.monthsLate} month
                          {results.monthsLate > 1 ? "s" : ""} late
                        </li>
                        <li>• {formData.taxpayerType} penalty tier applies</li>
                        <li>
                          • Interest calculated from due date to payment date
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>
                    Fill out the form and click "Calculate Penalties" to see
                    your results.
                  </p>
                  <p className="text-sm mt-2">
                    All fields are required for accurate calculations.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        {/* 

*/}

        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Late Filing Penalties
                </h3>
                <div className="text-sm space-y-2 text-gray-600 dark:text-gray-300">
                  <div className="grid grid-cols-3 gap-2 font-medium">
                    <span>Months Late</span>
                    <span>Individual</span>
                    <span>Company</span>
                  </div>
                  {/* Render tiers if available */}
                  {(rules.penaltyTiers ?? defaultPenaltyTiers).thresholds.map(
                    (t, idx) => {
                      const next = (rules.penaltyTiers ?? defaultPenaltyTiers)
                        .thresholds[idx + 1]
                        ? (rules.penaltyTiers ?? defaultPenaltyTiers)
                            .thresholds[idx + 1] - 1
                        : "∞";
                      const range = `${t}${next === "∞" ? "+" : `-${next}`}`;
                      const ind =
                        (rules.penaltyTiers ?? defaultPenaltyTiers).individual[
                          idx
                        ] ?? "-";
                      const comp =
                        (rules.penaltyTiers ?? defaultPenaltyTiers).company[
                          idx
                        ] ?? "-";
                      return (
                        <div className="grid grid-cols-3 gap-2" key={t}>
                          <span>{range}</span>
                          <span>
                            {symbol}
                            {ind}
                          </span>
                          <span>
                            {symbol}
                            {comp}
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Euro className="h-4 w-4 text-blue-500" />
                  Interest Rates
                </h3>
                <div className="text-sm space-y-2 text-gray-600 dark:text-gray-300">
                  {(rules.interestPeriods ?? defaultInterestPeriods).map(
                    (p, i) => {
                      const s = new Date(p.start).toISOString().slice(0, 10);
                      const e = new Date(p.end).toISOString().slice(0, 10);
                      return (
                        <div key={i}>
                          • {s} to {e}: {(p.rate * 100).toFixed(2)}% per month
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t text-xs text-gray-500 dark:text-gray-400 text-center">
              This calculator provides estimates based on configured rules.
              Consult a tax professional for official advice.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
