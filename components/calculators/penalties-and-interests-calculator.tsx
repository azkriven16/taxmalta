"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

interface FormState {
  taxpayerType: string;
  yearEnd: string;
  taxYear: string;
  selfAssessment: string;
  submittedDate: string;
  outstandingTax: string;
  taxAmount: string;
  ddtExemption: string;
  dueDate: string;
  computeInterestAsOf: string;
}

interface ErrorState {
  [key: string]: string;
}

interface PenaltyScheduleItem {
  months: number;
  penalty: number;
  label: string;
}

interface InterestPeriod {
  startDate: Date;
  endDate: Date;
  rate: number;
  label: string;
}

export default function LateTaxPenaltyCalc() {
  const [form, setForm] = useState<FormState>({
    taxpayerType: "",
    yearEnd: "",
    taxYear: "",
    selfAssessment: "",
    submittedDate: "",
    outstandingTax: "",
    taxAmount: "",
    ddtExemption: "",
    dueDate: "",
    computeInterestAsOf: "",
  });

  const [errors, setErrors] = useState<ErrorState>({});

  // Penalty schedules
  const corporatePenaltySchedule: PenaltyScheduleItem[] = [
    { months: 6, penalty: 50, label: "Within 6 months" },
    { months: 12, penalty: 200, label: "Later than 6 but within 12 months" },
    { months: 18, penalty: 400, label: "Later than 12 but within 18 months" },
    { months: 24, penalty: 650, label: "Later than 18 but within 24 months" },
    { months: 36, penalty: 900, label: "Later than 24 but within 36 months" },
    { months: 48, penalty: 1000, label: "Later than 36 but within 48 months" },
    { months: 60, penalty: 1200, label: "Later than 48 but within 60 months" },
    {
      months: Number.POSITIVE_INFINITY,
      penalty: 1500,
      label: "Later than 60 months",
    },
  ];

  const individualPenaltySchedule: PenaltyScheduleItem[] = [
    { months: 6, penalty: 10, label: "Within 6 months" },
    { months: 12, penalty: 50, label: "Later than 6 but within 12 months" },
    { months: 18, penalty: 100, label: "Later than 12 but within 18 months" },
    { months: 24, penalty: 150, label: "Later than 18 but within 24 months" },
    { months: 36, penalty: 200, label: "Later than 24 but within 36 months" },
    { months: 48, penalty: 300, label: "Later than 36 but within 48 months" },
    { months: 60, penalty: 400, label: "Later than 48 but within 60 months" },
    {
      months: Number.POSITIVE_INFINITY,
      penalty: 500,
      label: "Later than 60 months",
    },
  ];

  const interestPeriods: InterestPeriod[] = [
    {
      startDate: new Date(1900, 0, 1), // Very early date for anything before 2009
      endDate: new Date(2008, 11, 31), // Dec 31, 2008
      rate: 0.01, // 1% monthly rate (12% annual)
      label: "Up to Dec 2008 (1% monthly)",
    },
    {
      startDate: new Date(2009, 0, 1), // Jan 1, 2009
      endDate: new Date(2013, 11, 31), // Dec 31, 2013
      rate: 0.0075, // 0.75% monthly rate (9% annual)
      label: "Jan 2009 - Dec 2013 (0.75% monthly)",
    },
    {
      startDate: new Date(2014, 0, 1), // Jan 1, 2014
      endDate: new Date(2019, 11, 31), // Dec 31, 2019
      rate: 0.0054, // 0.54% monthly rate (6.48% annual)
      label: "Jan 2014 - Dec 2019 (0.54% monthly)",
    },
    {
      startDate: new Date(2020, 0, 1), // Jan 1, 2020
      endDate: new Date(2022, 4, 31), // May 31, 2022
      rate: 0.0033, // 0.33% monthly rate (3.96% annual)
      label: "Jan 2020 - May 2022 (0.33% monthly)",
    },
    {
      startDate: new Date(2022, 5, 1), // Jun 1, 2022
      endDate: new Date(2099, 11, 31), // Far future date
      rate: 0.006, // 0.6% monthly rate (7.2% annual)
      label: "Jun 2022 onwards (0.6% monthly)",
    },
  ];

  const MONTHS = [
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

  const isValidDate = (dateString: string): boolean => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return (
      !isNaN(date.getTime()) && dateString === date.toISOString().split("T")[0]
    );
  };

  const isValidTaxYear = (year: string): boolean => {
    const yearNum = Number.parseInt(year);
    const currentYear = new Date().getFullYear();
    return yearNum >= 2000 && yearNum <= currentYear + 1;
  };

  const isValidAmount = (amount: string): boolean => {
    const num = Number.parseFloat(amount);
    return !isNaN(num) && num >= 0;
  };

  const validateField = (field: string, value: string): void => {
    const newErrors = { ...errors };

    switch (field) {
      case "taxYear":
        if (value && !isValidTaxYear(value)) {
          newErrors[field] =
            "Please enter a valid tax year (2000-" +
            (new Date().getFullYear() + 1) +
            ")";
        } else {
          delete newErrors[field];
        }
        break;
      case "submittedDate":
        if (value && !isValidDate(value)) {
          newErrors[field] = "Please enter a valid date";
        } else if (value && new Date(value) > new Date()) {
          newErrors[field] = "Submission date cannot be in the future";
        } else {
          delete newErrors[field];
        }
        break;
      case "taxAmount":
        if (value && !isValidAmount(value)) {
          newErrors[field] = "Please enter a valid amount";
        } else {
          delete newErrors[field];
        }
        break;
      case "dueDate":
        if (value && !isValidDate(value)) {
          newErrors[field] = "Please enter a valid date";
        } else {
          delete newErrors[field];
        }
        break;
      case "computeInterestAsOf":
        if (value && !isValidDate(value)) {
          newErrors[field] = "Please enter a valid date";
        } else if (
          value &&
          form.dueDate &&
          new Date(value) < new Date(form.dueDate)
        ) {
          newErrors[field] =
            "Interest computation date should be after the due date";
        } else {
          delete newErrors[field];
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
  };

  const getLastDayOfMonth = (year: number, month: number): Date => {
    return new Date(year, month + 1, 0);
  };

  const getMonthsDifference = (
    startDate: string | Date,
    endDate: string | Date,
  ): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) return 0;

    let months = (end.getFullYear() - start.getFullYear()) * 12;
    months += end.getMonth() - start.getMonth();

    // If the end date's day is before the start date's day, subtract one month
    if (end.getDate() < start.getDate()) {
      months--;
    }

    return Math.max(0, months);
  };

  const computeStep = (f: FormState): number => {
    let s = 1;
    if (!f.taxpayerType) return s;
    s = 2;
    if (f.taxpayerType === "Corporate" && !f.yearEnd) return s;
    if (f.taxpayerType === "Individual") f.yearEnd = "December"; // Auto-set for individuals
    s = 3;
    if (!f.taxYear) return s;
    s = 4;
    if (!f.selfAssessment) return s;
    if (f.selfAssessment === "Yes" && !f.submittedDate) return s;
    s = 5;
    if (!f.outstandingTax) return s;
    if (f.outstandingTax === "Yes") {
      if (!f.taxAmount) return s;
      if (f.taxpayerType === "Corporate" && !f.ddtExemption) return s;
      if (!f.dueDate) return s;
    }
    s = 6;
    if (!f.computeInterestAsOf) return s;
    return 7;
  };

  const step = computeStep(form);

  const handleChange = (field: keyof FormState, value: string): void => {
    const newForm = { ...form, [field]: value };

    // Reset dependent fields when taxpayer type changes
    if (field === "taxpayerType") {
      newForm.yearEnd = value === "Individual" ? "December" : "";
      newForm.taxYear = "";
      newForm.selfAssessment = "";
      newForm.submittedDate = "";
      newForm.outstandingTax = "";
      newForm.taxAmount = "";
      newForm.ddtExemption = "";
      newForm.dueDate = "";
      newForm.computeInterestAsOf = "";
      setErrors({}); // Clear all errors
    }

    // Reset dependent fields when year end changes
    if (field === "yearEnd" || field === "taxYear") {
      newForm.dueDate = "";
    }

    // Auto-calculate due date when we have enough information
    if (
      (field === "ddtExemption" ||
        field === "taxYear" ||
        field === "yearEnd") &&
      newForm.taxYear &&
      newForm.yearEnd &&
      newForm.outstandingTax === "Yes"
    ) {
      const calculatedDueDate = calculateTaxPaymentDeadline(newForm);
      if (calculatedDueDate) {
        newForm.dueDate = calculatedDueDate.toISOString().split("T")[0];
      }
    }

    setForm(newForm);
    validateField(field, value);
  };

  const calculateTaxPaymentDeadline = (
    formData: FormState = form,
  ): Date | null => {
    if (!formData.taxYear || !formData.yearEnd) return null;

    const taxYearNum = Number.parseInt(formData.taxYear);

    if (formData.taxpayerType === "Individual") {
      // Individual: Tax year ends December 31st, payment due by June 30th following year
      return new Date(taxYearNum + 1, 5, 30); // June 30th following year
    } else {
      // Corporate: Based on financial year end
      const yearEndMonth = MONTHS.indexOf(formData.yearEnd);
      if (yearEndMonth === -1) return null;

      // Get the actual year-end date (in the following calendar year if necessary)
      let yearEndDate: Date;
      if (yearEndMonth >= 0 && yearEndMonth <= 11) {
        // Year end is in the tax year + 1 (since financial years span calendar years)
        yearEndDate = getLastDayOfMonth(taxYearNum + 1, yearEndMonth);
      }

      if (!yearEndDate!) return null;

      // Calculate payment deadline: 9 months after year end (or 18 with DDT10 exemption)
      const monthsToAdd = formData.ddtExemption === "Yes" ? 18 : 9;
      const paymentDeadline = new Date(yearEndDate);
      paymentDeadline.setMonth(paymentDeadline.getMonth() + monthsToAdd);

      return paymentDeadline;
    }
  };

  const calculateFilingDeadline = (): Date | null => {
    if (!form.taxYear) return null;

    const taxYearNum = Number.parseInt(form.taxYear);

    if (form.taxpayerType === "Individual") {
      // Individual: September 30th following the tax year
      return new Date(taxYearNum + 1, 8, 30); // September is month 8 (0-indexed)
    } else {
      // Corporate: 9 months after financial year end
      const yearEndMonth = MONTHS.indexOf(form.yearEnd);
      if (yearEndMonth === -1) return null;

      const yearEndDate = getLastDayOfMonth(taxYearNum + 1, yearEndMonth);
      const filingDeadline = new Date(yearEndDate);
      filingDeadline.setMonth(filingDeadline.getMonth() + 9);

      return filingDeadline;
    }
  };

  const calculatePenalty = (): number => {
    const schedule =
      form.taxpayerType === "Corporate"
        ? corporatePenaltySchedule
        : individualPenaltySchedule;

    if (form.selfAssessment === "No") {
      // If no return submitted, calculate penalty based on how late it would be now
      const filingDeadline = calculateFilingDeadline();
      if (!filingDeadline) return schedule[schedule.length - 1].penalty;

      const now = new Date();
      const monthsLate = getMonthsDifference(filingDeadline, now);

      for (const tier of schedule) {
        if (monthsLate <= tier.months) {
          return tier.penalty;
        }
      }
      return schedule[schedule.length - 1].penalty;
    }

    if (!form.submittedDate) return 0;

    const filingDeadline = calculateFilingDeadline();
    if (!filingDeadline) return 0;

    const submissionDate = new Date(form.submittedDate);
    const monthsLate = getMonthsDifference(filingDeadline, submissionDate);

    if (monthsLate <= 0) return 0;

    for (const tier of schedule) {
      if (monthsLate <= tier.months) {
        return tier.penalty;
      }
    }

    return schedule[schedule.length - 1].penalty;
  };

  const calculateInterest = (): {
    total: number;
    breakdown: Array<{
      period: string;
      days: number;
      rate: number;
      amount: number;
    }>;
  } => {
    if (
      form.outstandingTax !== "Yes" ||
      !form.taxAmount ||
      !form.dueDate ||
      !form.computeInterestAsOf
    ) {
      return { total: 0, breakdown: [] };
    }

    const taxAmount = Number.parseFloat(form.taxAmount);
    if (isNaN(taxAmount) || taxAmount <= 0) return { total: 0, breakdown: [] };

    const dueDate = new Date(form.dueDate);
    const computeDate = new Date(form.computeInterestAsOf);

    if (computeDate <= dueDate) return { total: 0, breakdown: [] };

    let totalInterest = 0;
    const breakdown: Array<{
      period: string;
      days: number;
      rate: number;
      amount: number;
    }> = [];
    let currentDate = new Date(dueDate);

    // Calculate interest for each applicable period using Malta's monthly interest system
    for (const period of interestPeriods) {
      if (currentDate >= computeDate) break;

      // Find the overlap between the current period and our interest calculation period
      const periodStart = new Date(
        Math.max(currentDate.getTime(), period.startDate.getTime()),
      );
      const periodEnd = new Date(
        Math.min(computeDate.getTime(), period.endDate.getTime()),
      );

      if (periodStart < periodEnd) {
        const daysInPeriod = Math.ceil(
          (periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24),
        );

        // Malta uses monthly interest rates - calculate months or part thereof
        const monthsInPeriod = Math.ceil(daysInPeriod / 30.44); // Average days per month
        const periodInterest = taxAmount * period.rate * monthsInPeriod;

        totalInterest += periodInterest;
        breakdown.push({
          period: period.label,
          days: daysInPeriod,
          rate: period.rate,
          amount: periodInterest,
        });

        currentDate = new Date(periodEnd);
      }
    }

    return { total: totalInterest, breakdown };
  };

  const calc = () => {
    const outstanding = form.taxAmount
      ? Number.parseFloat(form.taxAmount) || 0
      : 0;
    const penalty = calculatePenalty();
    const interestResult = calculateInterest();
    const interest = interestResult.total;
    const total = outstanding + penalty + interest;
    return {
      outstanding,
      penalty,
      interest,
      total,
      interestBreakdown: interestResult.breakdown,
    };
  };

  const { outstanding, penalty, interest, total, interestBreakdown } = calc();

  return (
    <div>
      <div className="mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold lg:text-5xl">
              Malta Tax Penalty Calculator
            </h1>
            <p className="text-muted-foreground mt-2 text-xl">
              Calculate penalties and interest for late tax submissions and
              payments
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="flex-1">
            <div className="bg-card rounded-2xl border p-6 shadow-lg md:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold">
                  {step}
                </div>
                <h2 className="text-card-foreground text-xl font-semibold">
                  Tax Information
                </h2>
              </div>

              <div className="space-y-6">
                {/* Step 1: Taxpayer type */}
                <div className="space-y-3">
                  <Label className="text-card-foreground text-sm font-medium">
                    What type of taxpayer are you?
                  </Label>
                  <Select
                    value={form.taxpayerType}
                    onValueChange={(v) => handleChange("taxpayerType", v)}
                  >
                    <SelectTrigger className="h-11 w-full">
                      <SelectValue placeholder="Select taxpayer type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Corporate">Corporate</SelectItem>
                      <SelectItem value="Individual">Individual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Step 2: Year end */}
                <AnimatePresence>
                  {step >= 2 && form.taxpayerType === "Corporate" && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-3"
                    >
                      <Label className="text-card-foreground text-sm font-medium">
                        What month does your financial year end?
                      </Label>
                      <Select
                        value={form.yearEnd}
                        onValueChange={(v) => handleChange("yearEnd", v)}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                        <SelectContent>
                          {MONTHS.map((m) => (
                            <SelectItem key={m} value={m}>
                              {m}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </motion.div>
                  )}
                  {step >= 2 && form.taxpayerType === "Individual" && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-3"
                    >
                      <Label className="text-card-foreground text-sm font-medium">
                        Financial year end
                      </Label>
                      <Input
                        value="December"
                        disabled
                        className="bg-muted text-muted-foreground h-11"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Step 3: Tax year */}
                <AnimatePresence>
                  {step >= 3 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-3"
                    >
                      <Label className="text-card-foreground text-sm font-medium">
                        Which tax year does this information relate to?
                      </Label>
                      <Input
                        type="number"
                        placeholder="e.g. 2023"
                        value={form.taxYear}
                        onChange={(e) =>
                          handleChange("taxYear", e.target.value)
                        }
                        className={`h-11 ${
                          errors.taxYear
                            ? "border-destructive focus:border-destructive focus:ring-destructive"
                            : ""
                        }`}
                      />
                      {errors.taxYear && (
                        <div className="bg-destructive/10 border-destructive/20 flex items-center gap-2 rounded-md border p-3">
                          <div className="bg-destructive text-destructive-foreground flex h-4 w-4 items-center justify-center rounded-full text-xs">
                            !
                          </div>
                          <p className="text-destructive text-sm">
                            {errors.taxYear}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Step 4: Self Assessment */}
                <AnimatePresence>
                  {step >= 4 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-3"
                    >
                      <Label className="text-card-foreground text-sm font-medium">
                        Have you completed and submitted your Self Assessment
                        tax return?
                      </Label>
                      <RadioGroup
                        value={form.selfAssessment}
                        onValueChange={(v) => handleChange("selfAssessment", v)}
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Yes" id="saYes" />
                          <Label
                            htmlFor="saYes"
                            className="text-card-foreground text-sm font-medium"
                          >
                            Yes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="No" id="saNo" />
                          <Label
                            htmlFor="saNo"
                            className="text-card-foreground text-sm font-medium"
                          >
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Step 4b: Submission date if Yes */}
                <AnimatePresence>
                  {form.selfAssessment === "Yes" && step >= 4 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-3"
                    >
                      <Label className="text-card-foreground text-sm font-medium">
                        If yes, when did you submit it?
                      </Label>
                      <Input
                        type="date"
                        value={form.submittedDate}
                        onChange={(e) =>
                          handleChange("submittedDate", e.target.value)
                        }
                        className={`h-11 ${
                          errors.submittedDate
                            ? "border-destructive focus:border-destructive focus:ring-destructive"
                            : ""
                        }`}
                      />
                      {errors.submittedDate && (
                        <div className="bg-destructive/10 border-destructive/20 flex items-center gap-2 rounded-md border p-3">
                          <div className="bg-destructive text-destructive-foreground flex h-4 w-4 items-center justify-center rounded-full text-xs">
                            !
                          </div>
                          <p className="text-destructive text-sm">
                            {errors.submittedDate}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Step 5: Outstanding tax */}
                <AnimatePresence>
                  {step >= 5 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-3"
                    >
                      <Label className="text-card-foreground text-sm font-medium">
                        Did you have any outstanding tax to pay?
                      </Label>
                      <RadioGroup
                        value={form.outstandingTax}
                        onValueChange={(v) => handleChange("outstandingTax", v)}
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Yes" id="taxYes" />
                          <Label
                            htmlFor="taxYes"
                            className="text-card-foreground text-sm font-medium"
                          >
                            Yes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="No" id="taxNo" />
                          <Label
                            htmlFor="taxNo"
                            className="text-card-foreground text-sm font-medium"
                          >
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Step 5b: If outstanding tax = Yes */}
                <AnimatePresence>
                  {form.outstandingTax === "Yes" && step >= 5 && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-3"
                      >
                        <Label className="text-card-foreground text-sm font-medium">
                          What was the total amount of tax due?
                        </Label>
                        <div className="relative">
                          <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2">
                            €
                          </span>
                          <Input
                            type="number"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            value={form.taxAmount}
                            onChange={(e) =>
                              handleChange("taxAmount", e.target.value)
                            }
                            className={`h-11 pl-8 ${
                              errors.taxAmount
                                ? "border-destructive focus:border-destructive focus:ring-destructive"
                                : ""
                            }`}
                          />
                        </div>
                        {errors.taxAmount && (
                          <div className="bg-destructive/10 border-destructive/20 flex items-center gap-2 rounded-md border p-3">
                            <div className="bg-destructive text-destructive-foreground flex h-4 w-4 items-center justify-center rounded-full text-xs">
                              !
                            </div>
                            <p className="text-destructive text-sm">
                              {errors.taxAmount}
                            </p>
                          </div>
                        )}
                      </motion.div>

                      {form.taxpayerType === "Corporate" && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="space-y-3"
                        >
                          <Label className="text-card-foreground text-sm font-medium">
                            Do you have a valid DDT10 exemption certificate
                            under Article 47(3)(e) of the DDTA on the financial
                            year in question?
                          </Label>
                          <RadioGroup
                            value={form.ddtExemption}
                            onValueChange={(v) =>
                              handleChange("ddtExemption", v)
                            }
                            className="flex gap-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Yes" id="ddtYes" />
                              <Label
                                htmlFor="ddtYes"
                                className="text-card-foreground text-sm font-medium"
                              >
                                Yes
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="No" id="ddtNo" />
                              <Label
                                htmlFor="ddtNo"
                                className="text-card-foreground text-sm font-medium"
                              >
                                No
                              </Label>
                            </div>
                          </RadioGroup>
                        </motion.div>
                      )}

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-3"
                      >
                        <Label className="text-card-foreground text-sm font-medium">
                          The tax should have been paid on or before
                        </Label>
                        <Input
                          type="date"
                          value={form.dueDate}
                          onChange={(e) =>
                            handleChange("dueDate", e.target.value)
                          }
                          className={`h-11 ${
                            errors.dueDate
                              ? "border-destructive focus:border-destructive focus:ring-destructive"
                              : ""
                          }`}
                        />
                        {errors.dueDate && (
                          <div className="bg-destructive/10 border-destructive/20 flex items-center gap-2 rounded-md border p-3">
                            <div className="bg-destructive text-destructive-foreground flex h-4 w-4 items-center justify-center rounded-full text-xs">
                              !
                            </div>
                            <p className="text-destructive text-sm">
                              {errors.dueDate}
                            </p>
                          </div>
                        )}
                        {(() => {
                          const calculatedDeadline =
                            calculateTaxPaymentDeadline();
                          return (
                            calculatedDeadline && (
                              <div className="bg-primary/10 border-primary/20 rounded-md border p-3">
                                <p className="text-primary text-sm">
                                  <span className="font-medium">
                                    Suggested:
                                  </span>{" "}
                                  {calculatedDeadline.toLocaleDateString(
                                    "en-GB",
                                    {
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                    },
                                  )}
                                </p>
                              </div>
                            )
                          );
                        })()}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>

                {/* Step 6: Compute interest as of */}
                <AnimatePresence>
                  {step >= 6 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-3"
                    >
                      <Label className="text-card-foreground text-sm font-medium">
                        Please compute the interest as of
                      </Label>
                      <Input
                        type="date"
                        value={form.computeInterestAsOf}
                        onChange={(e) =>
                          handleChange("computeInterestAsOf", e.target.value)
                        }
                        className={`h-11 ${
                          errors.computeInterestAsOf
                            ? "border-destructive focus:border-destructive focus:ring-destructive"
                            : ""
                        }`}
                      />
                      {errors.computeInterestAsOf && (
                        <div className="bg-destructive/10 border-destructive/20 flex items-center gap-2 rounded-md border p-3">
                          <div className="bg-destructive text-destructive-foreground flex h-4 w-4 items-center justify-center rounded-full text-xs">
                            !
                          </div>
                          <p className="text-destructive text-sm">
                            {errors.computeInterestAsOf}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="sticky top-24">
              <div className="bg-card rounded-2xl border p-6 shadow-lg md:p-8">
                <div className="mb-6">
                  <h2 className="text-card-foreground text-xl font-semibold">
                    Calculation Summary
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Based on Malta tax regulations
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-muted/50 flex items-center justify-between rounded-xl border p-4">
                    <div>
                      <span className="text-card-foreground text-sm font-medium">
                        Outstanding Tax
                      </span>
                      <p className="text-muted-foreground text-xs">
                        Amount due
                      </p>
                    </div>
                    <span className="text-card-foreground text-lg font-semibold">
                      €{outstanding.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-950">
                    <div>
                      <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                        Late Submission Penalty
                      </span>
                      <p className="text-xs text-orange-700 dark:text-orange-300">
                        Fixed penalty
                      </p>
                    </div>
                    <span className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                      €{penalty.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
                    <div>
                      <span className="text-sm font-medium text-red-900 dark:text-red-100">
                        Interest on Late Payment
                      </span>
                      <p className="text-xs text-red-700 dark:text-red-300">
                        Accrued interest
                      </p>
                    </div>
                    <span className="text-lg font-semibold text-red-900 dark:text-red-100">
                      €{interest.toFixed(2)}
                    </span>
                  </div>

                  <div className="bg-border h-px" />

                  <div className="bg-primary text-primary-foreground rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-semibold">
                          Total Payable
                        </span>
                        <p className="text-primary-foreground/80 text-sm">
                          All amounts included
                        </p>
                      </div>
                      <span className="text-2xl font-bold">
                        €{total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {step === 7 && interestBreakdown.length > 0 && (
                  <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
                    <h3 className="mb-3 text-sm font-semibold text-blue-900 dark:text-blue-100">
                      Interest Calculation Breakdown
                    </h3>
                    <div className="space-y-2">
                      {interestBreakdown.map((item, index) => (
                        <div
                          key={index}
                          className="bg-card flex justify-between rounded-lg border p-3 text-sm"
                        >
                          <div>
                            <span className="text-card-foreground font-medium">
                              {item.period}
                            </span>
                            <p className="text-muted-foreground text-xs">
                              {item.days} days
                            </p>
                          </div>
                          <span className="text-card-foreground font-semibold">
                            €{item.amount.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 text-xs text-blue-700 dark:text-blue-300">
                      Based on Malta Income Tax Management Act - Article 44
                    </p>
                  </div>
                )}

                {step === 7 && penalty > 0 && (
                  <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-950">
                    <p className="text-sm text-orange-900 dark:text-orange-100">
                      <span className="font-semibold">Penalty Applied:</span>{" "}
                      Based on the penalty schedule for{" "}
                      {form.taxpayerType.toLowerCase()} taxpayers.
                    </p>
                  </div>
                )}

                {step === 7 && form.ddtExemption === "Yes" && (
                  <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
                    <p className="text-sm text-green-900 dark:text-green-100">
                      <span className="font-semibold">
                        DDT10 Exemption Applied:
                      </span>{" "}
                      Tax payment deadline extended from 9 to 18 months after
                      financial year-end.
                    </p>
                  </div>
                )}

                {step === 7 &&
                  (() => {
                    const deadline = calculateTaxPaymentDeadline();
                    const filingDeadline = calculateFilingDeadline();
                    return (
                      <div className="mt-4 space-y-3">
                        {filingDeadline && (
                          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
                            <p className="text-sm text-emerald-900 dark:text-emerald-100">
                              <span className="font-semibold">
                                Filing Deadline:
                              </span>{" "}
                              {filingDeadline.toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        )}
                        {deadline && (
                          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
                            <p className="text-sm text-emerald-900 dark:text-emerald-100">
                              <span className="font-semibold">
                                Payment Deadline:
                              </span>{" "}
                              {deadline.toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                {Object.keys(errors).length > 0 && (
                  <div className="border-destructive/20 bg-destructive/10 mt-4 rounded-xl border p-4">
                    <div className="flex items-center gap-2">
                      <div className="bg-destructive text-destructive-foreground flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold">
                        !
                      </div>
                      <p className="text-destructive text-sm font-semibold">
                        Please fix the errors above to get accurate
                        calculations.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// "use client";

// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { AnimatePresence, motion } from "framer-motion";
// import { useState } from "react";

// interface FormState {
//   taxpayerType: string;
//   yearEnd: string;
//   taxYear: string;
//   selfAssessment: string;
//   submittedDate: string;
//   outstandingTax: string;
//   taxAmount: string;
//   ddtExemption: string;
//   dueDate: string;
//   computeInterestAsOf: string;
// }

// interface ErrorState {
//   [key: string]: string;
// }

// interface PenaltyScheduleItem {
//   months: number;
//   penalty: number;
//   label: string;
// }

// interface InterestPeriod {
//   startDate: Date;
//   endDate: Date;
//   rate: number;
//   label: string;
// }

// export default function LateTaxPenaltyCalc() {
//   const [form, setForm] = useState<FormState>({
//     taxpayerType: "",
//     yearEnd: "",
//     taxYear: "",
//     selfAssessment: "",
//     submittedDate: "",
//     outstandingTax: "",
//     taxAmount: "",
//     ddtExemption: "",
//     dueDate: "",
//     computeInterestAsOf: "",
//   });

//   const [errors, setErrors] = useState<ErrorState>({});

//   // Penalty schedules
//   const corporatePenaltySchedule: PenaltyScheduleItem[] = [
//     { months: 6, penalty: 50, label: "Within 6 months" },
//     { months: 12, penalty: 200, label: "Later than 6 but within 12 months" },
//     { months: 18, penalty: 400, label: "Later than 12 but within 18 months" },
//     { months: 24, penalty: 650, label: "Later than 18 but within 24 months" },
//     { months: 36, penalty: 900, label: "Later than 24 but within 36 months" },
//     { months: 48, penalty: 1000, label: "Later than 36 but within 48 months" },
//     { months: 60, penalty: 1200, label: "Later than 48 but within 60 months" },
//     {
//       months: Number.POSITIVE_INFINITY,
//       penalty: 1500,
//       label: "Later than 60 months",
//     },
//   ];

//   const individualPenaltySchedule: PenaltyScheduleItem[] = [
//     { months: 6, penalty: 10, label: "Within 6 months" },
//     { months: 12, penalty: 50, label: "Later than 6 but within 12 months" },
//     { months: 18, penalty: 100, label: "Later than 12 but within 18 months" },
//     { months: 24, penalty: 150, label: "Later than 18 but within 24 months" },
//     { months: 36, penalty: 200, label: "Later than 24 but within 36 months" },
//     { months: 48, penalty: 300, label: "Later than 36 but within 48 months" },
//     { months: 60, penalty: 400, label: "Later than 48 but within 60 months" },
//     {
//       months: Number.POSITIVE_INFINITY,
//       penalty: 500,
//       label: "Later than 60 months",
//     },
//   ];

//   const interestPeriods: InterestPeriod[] = [
//     {
//       startDate: new Date(1900, 0, 1), // Very early date for anything before 2009
//       endDate: new Date(2008, 11, 31), // Dec 31, 2008
//       rate: 0.01, // 1% monthly rate (12% annual)
//       label: "Up to Dec 2008 (1% monthly)",
//     },
//     {
//       startDate: new Date(2009, 0, 1), // Jan 1, 2009
//       endDate: new Date(2013, 11, 31), // Dec 31, 2013
//       rate: 0.0075, // 0.75% monthly rate (9% annual)
//       label: "Jan 2009 - Dec 2013 (0.75% monthly)",
//     },
//     {
//       startDate: new Date(2014, 0, 1), // Jan 1, 2014
//       endDate: new Date(2019, 11, 31), // Dec 31, 2019
//       rate: 0.0054, // 0.54% monthly rate (6.48% annual)
//       label: "Jan 2014 - Dec 2019 (0.54% monthly)",
//     },
//     {
//       startDate: new Date(2020, 0, 1), // Jan 1, 2020
//       endDate: new Date(2022, 4, 31), // May 31, 2022
//       rate: 0.0033, // 0.33% monthly rate (3.96% annual)
//       label: "Jan 2020 - May 2022 (0.33% monthly)",
//     },
//     {
//       startDate: new Date(2022, 5, 1), // Jun 1, 2022
//       endDate: new Date(2099, 11, 31), // Far future date
//       rate: 0.006, // 0.6% monthly rate (7.2% annual)
//       label: "Jun 2022 onwards (0.6% monthly)",
//     },
//   ];

//   const MONTHS = [
//     "January",
//     "February",
//     "March",
//     "April",
//     "May",
//     "June",
//     "July",
//     "August",
//     "September",
//     "October",
//     "November",
//     "December",
//   ];

//   const isValidDate = (dateString: string): boolean => {
//     if (!dateString) return false;
//     const date = new Date(dateString);
//     return (
//       !isNaN(date.getTime()) && dateString === date.toISOString().split("T")[0]
//     );
//   };

//   const isValidTaxYear = (year: string): boolean => {
//     const yearNum = Number.parseInt(year);
//     const currentYear = new Date().getFullYear();
//     return yearNum >= 2000 && yearNum <= currentYear + 1;
//   };

//   const isValidAmount = (amount: string): boolean => {
//     const num = Number.parseFloat(amount);
//     return !isNaN(num) && num >= 0;
//   };

//   const validateField = (field: string, value: string): void => {
//     const newErrors = { ...errors };

//     switch (field) {
//       case "taxYear":
//         if (value && !isValidTaxYear(value)) {
//           newErrors[field] =
//             "Please enter a valid tax year (2000-" +
//             (new Date().getFullYear() + 1) +
//             ")";
//         } else {
//           delete newErrors[field];
//         }
//         break;
//       case "submittedDate":
//         if (value && !isValidDate(value)) {
//           newErrors[field] = "Please enter a valid date";
//         } else if (value && new Date(value) > new Date()) {
//           newErrors[field] = "Submission date cannot be in the future";
//         } else {
//           delete newErrors[field];
//         }
//         break;
//       case "taxAmount":
//         if (value && !isValidAmount(value)) {
//           newErrors[field] = "Please enter a valid amount";
//         } else {
//           delete newErrors[field];
//         }
//         break;
//       case "dueDate":
//         if (value && !isValidDate(value)) {
//           newErrors[field] = "Please enter a valid date";
//         } else {
//           delete newErrors[field];
//         }
//         break;
//       case "computeInterestAsOf":
//         if (value && !isValidDate(value)) {
//           newErrors[field] = "Please enter a valid date";
//         } else if (
//           value &&
//           form.dueDate &&
//           new Date(value) < new Date(form.dueDate)
//         ) {
//           newErrors[field] =
//             "Interest computation date should be after the due date";
//         } else {
//           delete newErrors[field];
//         }
//         break;
//       default:
//         break;
//     }

//     setErrors(newErrors);
//   };

//   const getLastDayOfMonth = (year: number, month: number): Date => {
//     return new Date(year, month + 1, 0);
//   };

//   const getMonthsDifference = (
//     startDate: string | Date,
//     endDate: string | Date,
//   ): number => {
//     const start = new Date(startDate);
//     const end = new Date(endDate);

//     if (end <= start) return 0;

//     let months = (end.getFullYear() - start.getFullYear()) * 12;
//     months += end.getMonth() - start.getMonth();

//     // If the end date's day is before the start date's day, subtract one month
//     if (end.getDate() < start.getDate()) {
//       months--;
//     }

//     return Math.max(0, months);
//   };

//   const computeStep = (f: FormState): number => {
//     let s = 1;
//     if (!f.taxpayerType) return s;
//     s = 2;
//     if (f.taxpayerType === "Corporate" && !f.yearEnd) return s;
//     if (f.taxpayerType === "Individual") f.yearEnd = "December"; // Auto-set for individuals
//     s = 3;
//     if (!f.taxYear) return s;
//     s = 4;
//     if (!f.selfAssessment) return s;
//     if (f.selfAssessment === "Yes" && !f.submittedDate) return s;
//     s = 5;
//     if (!f.outstandingTax) return s;
//     if (f.outstandingTax === "Yes") {
//       if (!f.taxAmount) return s;
//       if (f.taxpayerType === "Corporate" && !f.ddtExemption) return s;
//       if (!f.dueDate) return s;
//     }
//     s = 6;
//     if (!f.computeInterestAsOf) return s;
//     return 7;
//   };

//   const step = computeStep(form);

//   const handleChange = (field: keyof FormState, value: string): void => {
//     const newForm = { ...form, [field]: value };

//     // Reset dependent fields when taxpayer type changes
//     if (field === "taxpayerType") {
//       newForm.yearEnd = value === "Individual" ? "December" : "";
//       newForm.taxYear = "";
//       newForm.selfAssessment = "";
//       newForm.submittedDate = "";
//       newForm.outstandingTax = "";
//       newForm.taxAmount = "";
//       newForm.ddtExemption = "";
//       newForm.dueDate = "";
//       newForm.computeInterestAsOf = "";
//       setErrors({}); // Clear all errors
//     }

//     // Reset dependent fields when year end changes
//     if (field === "yearEnd" || field === "taxYear") {
//       newForm.dueDate = "";
//     }

//     // Auto-calculate due date when we have enough information
//     if (
//       (field === "ddtExemption" ||
//         field === "taxYear" ||
//         field === "yearEnd") &&
//       newForm.taxYear &&
//       newForm.yearEnd &&
//       newForm.outstandingTax === "Yes"
//     ) {
//       const calculatedDueDate = calculateTaxPaymentDeadline(newForm);
//       if (calculatedDueDate) {
//         newForm.dueDate = calculatedDueDate.toISOString().split("T")[0];
//       }
//     }

//     setForm(newForm);
//     validateField(field, value);
//   };

//   const calculateTaxPaymentDeadline = (
//     formData: FormState = form,
//   ): Date | null => {
//     if (!formData.taxYear || !formData.yearEnd) return null;

//     const taxYearNum = Number.parseInt(formData.taxYear);

//     if (formData.taxpayerType === "Individual") {
//       // Individual: Tax year ends December 31st, payment due by June 30th following year
//       return new Date(taxYearNum + 1, 5, 30); // June 30th following year
//     } else {
//       // Corporate: Based on financial year end
//       const yearEndMonth = MONTHS.indexOf(formData.yearEnd);
//       if (yearEndMonth === -1) return null;

//       // Get the actual year-end date (in the following calendar year if necessary)
//       let yearEndDate: Date;
//       if (yearEndMonth >= 0 && yearEndMonth <= 11) {
//         // Year end is in the tax year + 1 (since financial years span calendar years)
//         yearEndDate = getLastDayOfMonth(taxYearNum + 1, yearEndMonth);
//       }

//       if (!yearEndDate!) return null;

//       // Calculate payment deadline: 9 months after year end (or 18 with DDT10 exemption)
//       const monthsToAdd = formData.ddtExemption === "Yes" ? 18 : 9;
//       const paymentDeadline = new Date(yearEndDate);
//       paymentDeadline.setMonth(paymentDeadline.getMonth() + monthsToAdd);

//       return paymentDeadline;
//     }
//   };

//   const calculateFilingDeadline = (): Date | null => {
//     if (!form.taxYear) return null;

//     const taxYearNum = Number.parseInt(form.taxYear);

//     if (form.taxpayerType === "Individual") {
//       // Individual: September 30th following the tax year
//       return new Date(taxYearNum + 1, 8, 30); // September is month 8 (0-indexed)
//     } else {
//       // Corporate: 9 months after financial year end
//       const yearEndMonth = MONTHS.indexOf(form.yearEnd);
//       if (yearEndMonth === -1) return null;

//       const yearEndDate = getLastDayOfMonth(taxYearNum + 1, yearEndMonth);
//       const filingDeadline = new Date(yearEndDate);
//       filingDeadline.setMonth(filingDeadline.getMonth() + 9);

//       return filingDeadline;
//     }
//   };

//   const calculatePenalty = (): number => {
//     const schedule =
//       form.taxpayerType === "Corporate"
//         ? corporatePenaltySchedule
//         : individualPenaltySchedule;

//     if (form.selfAssessment === "No") {
//       // If no return submitted, calculate penalty based on how late it would be now
//       const filingDeadline = calculateFilingDeadline();
//       if (!filingDeadline) return schedule[schedule.length - 1].penalty;

//       const now = new Date();
//       const monthsLate = getMonthsDifference(filingDeadline, now);

//       for (const tier of schedule) {
//         if (monthsLate <= tier.months) {
//           return tier.penalty;
//         }
//       }
//       return schedule[schedule.length - 1].penalty;
//     }

//     if (!form.submittedDate) return 0;

//     const filingDeadline = calculateFilingDeadline();
//     if (!filingDeadline) return 0;

//     const submissionDate = new Date(form.submittedDate);
//     const monthsLate = getMonthsDifference(filingDeadline, submissionDate);

//     if (monthsLate <= 0) return 0;

//     for (const tier of schedule) {
//       if (monthsLate <= tier.months) {
//         return tier.penalty;
//       }
//     }

//     return schedule[schedule.length - 1].penalty;
//   };

//   const calculateInterest = (): {
//     total: number;
//     breakdown: Array<{
//       period: string;
//       days: number;
//       rate: number;
//       amount: number;
//     }>;
//   } => {
//     if (
//       form.outstandingTax !== "Yes" ||
//       !form.taxAmount ||
//       !form.dueDate ||
//       !form.computeInterestAsOf
//     ) {
//       return { total: 0, breakdown: [] };
//     }

//     const taxAmount = Number.parseFloat(form.taxAmount);
//     if (isNaN(taxAmount) || taxAmount <= 0) return { total: 0, breakdown: [] };

//     const dueDate = new Date(form.dueDate);
//     const computeDate = new Date(form.computeInterestAsOf);

//     if (computeDate <= dueDate) return { total: 0, breakdown: [] };

//     let totalInterest = 0;
//     const breakdown: Array<{
//       period: string;
//       days: number;
//       rate: number;
//       amount: number;
//     }> = [];
//     let currentDate = new Date(dueDate);

//     // Calculate interest for each applicable period using Malta's monthly interest system
//     for (const period of interestPeriods) {
//       if (currentDate >= computeDate) break;

//       // Find the overlap between the current period and our interest calculation period
//       const periodStart = new Date(
//         Math.max(currentDate.getTime(), period.startDate.getTime()),
//       );
//       const periodEnd = new Date(
//         Math.min(computeDate.getTime(), period.endDate.getTime()),
//       );

//       if (periodStart < periodEnd) {
//         const daysInPeriod = Math.ceil(
//           (periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24),
//         );

//         // Malta uses monthly interest rates - calculate months or part thereof
//         const monthsInPeriod = Math.ceil(daysInPeriod / 30.44); // Average days per month
//         const periodInterest = taxAmount * period.rate * monthsInPeriod;

//         totalInterest += periodInterest;
//         breakdown.push({
//           period: period.label,
//           days: daysInPeriod,
//           rate: period.rate,
//           amount: periodInterest,
//         });

//         currentDate = new Date(periodEnd);
//       }
//     }

//     return { total: totalInterest, breakdown };
//   };

//   const calc = () => {
//     const outstanding = form.taxAmount
//       ? Number.parseFloat(form.taxAmount) || 0
//       : 0;
//     const penalty = calculatePenalty();
//     const interestResult = calculateInterest();
//     const interest = interestResult.total;
//     const total = outstanding + penalty + interest;
//     return {
//       outstanding,
//       penalty,
//       interest,
//       total,
//       interestBreakdown: interestResult.breakdown,
//     };
//   };

//   const { outstanding, penalty, interest, total, interestBreakdown } = calc();

//   return (
//     <div className="flex flex-col justify-between gap-10 md:flex-row">
//       {/* Left panel form */}
//       <div className="space-y-4">
//         {/* Step 1: Taxpayer type */}
//         <div>
//           <Label className="text-sm font-medium">
//             What type of taxpayer are you?
//           </Label>
//           <Select
//             value={form.taxpayerType}
//             onValueChange={(v) => handleChange("taxpayerType", v)}
//           >
//             <SelectTrigger className="mt-1">
//               <SelectValue placeholder="Select type" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="Corporate">Corporate</SelectItem>
//               <SelectItem value="Individual">Individual</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>

//         {/* Step 2: Year end */}
//         <AnimatePresence>
//           {step >= 2 && form.taxpayerType === "Corporate" && (
//             <motion.div
//               initial={{ opacity: 0, y: -10 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -10 }}
//             >
//               <Label className="text-sm font-medium">
//                 What month does your financial year end?
//               </Label>
//               <Select
//                 value={form.yearEnd}
//                 onValueChange={(v) => handleChange("yearEnd", v)}
//               >
//                 <SelectTrigger className="mt-1">
//                   <SelectValue placeholder="Select month" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {MONTHS.map((m) => (
//                     <SelectItem key={m} value={m}>
//                       {m}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </motion.div>
//           )}
//           {step >= 2 && form.taxpayerType === "Individual" && (
//             <motion.div
//               initial={{ opacity: 0, y: -10 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -10 }}
//             >
//               <Label className="text-sm font-medium">Financial year end</Label>
//               <Input value="December" disabled className="mt-1 bg-gray-100" />
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {/* Step 3: Tax year */}
//         <AnimatePresence>
//           {step >= 3 && (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//             >
//               <Label className="text-sm font-medium">
//                 Which tax year does this information relate to?
//               </Label>
//               <Input
//                 type="number"
//                 placeholder="e.g. 2023"
//                 value={form.taxYear}
//                 onChange={(e) => handleChange("taxYear", e.target.value)}
//                 className={`mt-1 ${errors.taxYear ? "border-red-500" : ""}`}
//               />
//               {errors.taxYear && (
//                 <p className="mt-1 text-xs text-red-500">{errors.taxYear}</p>
//               )}
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {/* Step 4: Self Assessment */}
//         <AnimatePresence>
//           {step >= 4 && (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//             >
//               <Label className="text-sm font-medium">
//                 Have you completed and submitted your Self Assessment tax
//                 return?
//               </Label>
//               <RadioGroup
//                 value={form.selfAssessment}
//                 onValueChange={(v) => handleChange("selfAssessment", v)}
//                 className="mt-2 flex space-x-4"
//               >
//                 <div className="flex items-center space-x-2">
//                   <RadioGroupItem value="Yes" id="saYes" />
//                   <Label htmlFor="saYes">Yes</Label>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <RadioGroupItem value="No" id="saNo" />
//                   <Label htmlFor="saNo">No</Label>
//                 </div>
//               </RadioGroup>
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {/* Step 4b: Submission date if Yes */}
//         <AnimatePresence>
//           {form.selfAssessment === "Yes" && step >= 4 && (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//             >
//               <Label className="text-sm font-medium">
//                 If yes, when did you submit it?
//               </Label>
//               <Input
//                 type="date"
//                 value={form.submittedDate}
//                 onChange={(e) => handleChange("submittedDate", e.target.value)}
//                 className={`mt-1 ${errors.submittedDate ? "border-red-500" : ""}`}
//               />
//               {errors.submittedDate && (
//                 <p className="mt-1 text-xs text-red-500">
//                   {errors.submittedDate}
//                 </p>
//               )}
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {/* Step 5: Outstanding tax */}
//         <AnimatePresence>
//           {step >= 5 && (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//             >
//               <Label className="text-sm font-medium">
//                 Did you have any outstanding tax to pay?
//               </Label>
//               <RadioGroup
//                 value={form.outstandingTax}
//                 onValueChange={(v) => handleChange("outstandingTax", v)}
//                 className="mt-2 flex space-x-4"
//               >
//                 <div className="flex items-center space-x-2">
//                   <RadioGroupItem value="Yes" id="taxYes" />
//                   <Label htmlFor="taxYes">Yes</Label>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <RadioGroupItem value="No" id="taxNo" />
//                   <Label htmlFor="taxNo">No</Label>
//                 </div>
//               </RadioGroup>
//             </motion.div>
//           )}
//         </AnimatePresence>

//         {/* Step 5b: If outstanding tax = Yes */}
//         <AnimatePresence>
//           {form.outstandingTax === "Yes" && step >= 5 && (
//             <>
//               <motion.div
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 exit={{ opacity: 0 }}
//               >
//                 <Label className="text-sm font-medium">
//                   What was the total amount of tax due?
//                 </Label>
//                 <Input
//                   type="number"
//                   placeholder="0.00"
//                   step="0.01"
//                   min="0"
//                   value={form.taxAmount}
//                   onChange={(e) => handleChange("taxAmount", e.target.value)}
//                   className={`mt-1 ${errors.taxAmount ? "border-red-500" : ""}`}
//                 />
//                 {errors.taxAmount && (
//                   <p className="mt-1 text-xs text-red-500">
//                     {errors.taxAmount}
//                   </p>
//                 )}
//               </motion.div>

//               {form.taxpayerType === "Corporate" && (
//                 <motion.div
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   exit={{ opacity: 0 }}
//                 >
//                   <Label className="text-sm font-medium">
//                     Do you have a valid DDT10 exemption certificate under
//                     Article 47(3)(e) of the DDTA on the financial year in
//                     question?
//                   </Label>
//                   <RadioGroup
//                     value={form.ddtExemption}
//                     onValueChange={(v) => handleChange("ddtExemption", v)}
//                     className="mt-2 flex space-x-4"
//                   >
//                     <div className="flex items-center space-x-2">
//                       <RadioGroupItem value="Yes" id="ddtYes" />
//                       <Label htmlFor="ddtYes">Yes</Label>
//                     </div>
//                     <div className="flex items-center space-x-2">
//                       <RadioGroupItem value="No" id="ddtNo" />
//                       <Label htmlFor="ddtNo">No</Label>
//                     </div>
//                   </RadioGroup>
//                 </motion.div>
//               )}

//               <motion.div
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 exit={{ opacity: 0 }}
//               >
//                 <Label className="text-sm font-medium">
//                   The tax should have been paid on or before
//                 </Label>
//                 <Input
//                   type="date"
//                   value={form.dueDate}
//                   onChange={(e) => handleChange("dueDate", e.target.value)}
//                   className={`mt-1 ${errors.dueDate ? "border-red-500" : ""}`}
//                 />
//                 {errors.dueDate && (
//                   <p className="mt-1 text-xs text-red-500">{errors.dueDate}</p>
//                 )}
//                 {(() => {
//                   const calculatedDeadline = calculateTaxPaymentDeadline();
//                   return (
//                     calculatedDeadline && (
//                       <p className="mt-1 text-xs text-gray-600">
//                         Suggested:{" "}
//                         {calculatedDeadline.toLocaleDateString("en-GB", {
//                           day: "numeric",
//                           month: "long",
//                           year: "numeric",
//                         })}
//                       </p>
//                     )
//                   );
//                 })()}
//               </motion.div>
//             </>
//           )}
//         </AnimatePresence>

//         {/* Step 6: Compute interest as of */}
//         <AnimatePresence>
//           {step >= 6 && (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//             >
//               <Label className="text-sm font-medium">
//                 Please compute the interest as of
//               </Label>
//               <Input
//                 type="date"
//                 value={form.computeInterestAsOf}
//                 onChange={(e) =>
//                   handleChange("computeInterestAsOf", e.target.value)
//                 }
//                 className={`mt-1 ${errors.computeInterestAsOf ? "border-red-500" : ""}`}
//               />
//               {errors.computeInterestAsOf && (
//                 <p className="mt-1 text-xs text-red-500">
//                   {errors.computeInterestAsOf}
//                 </p>
//               )}
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>

//       {/* Right panel summary */}
//       <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-lg">
//         <h2 className="mb-6 text-xl font-bold text-gray-800">
//           Malta Tax Penalty Calculator
//         </h2>
//         <div className="space-y-4">
//           <div className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm">
//             <span className="text-sm text-gray-600">
//               Outstanding tax amount due
//             </span>
//             <span className="text-lg font-semibold">
//               €{outstanding.toFixed(2)}
//             </span>
//           </div>
//           <div className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm">
//             <span className="text-sm text-gray-600">
//               Penalty for late submission
//             </span>
//             <span className="text-lg font-semibold text-orange-600">
//               €{penalty.toFixed(2)}
//             </span>
//           </div>
//           <div className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm">
//             <span className="text-sm text-gray-600">
//               Interest accrued due to late payment
//             </span>
//             <span className="text-lg font-semibold text-red-600">
//               €{interest.toFixed(2)}
//             </span>
//           </div>
//           <hr className="border-gray-300" />
//           <div className="flex items-center justify-between rounded-lg bg-blue-700 p-4 text-white shadow-md">
//             <span className="text-lg font-bold">Total tax payable</span>
//             <span className="text-xl font-bold">€{total.toFixed(2)}</span>
//           </div>
//         </div>

//         {step === 7 && interestBreakdown.length > 0 && (
//           <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
//             <p className="mb-2 text-sm font-semibold text-blue-800">
//               Malta Interest Calculation Breakdown:
//             </p>
//             <div className="space-y-1">
//               {interestBreakdown.map((item, index) => (
//                 <div
//                   key={index}
//                   className="flex justify-between text-xs text-blue-700"
//                 >
//                   <span>
//                     {item.period}: {item.days} days
//                   </span>
//                   <span>€{item.amount.toFixed(2)}</span>
//                 </div>
//               ))}
//             </div>
//             <p className="mt-2 text-xs text-blue-600">
//               Based on Malta Income Tax Management Act - Article 44
//             </p>
//           </div>
//         )}

//         {step === 7 && penalty > 0 && (
//           <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
//             <p className="text-xs text-yellow-800">
//               <strong>Penalty Applied:</strong> Based on the penalty schedule
//               for {form.taxpayerType.toLowerCase()} taxpayers.
//             </p>
//           </div>
//         )}

//         {step === 7 && form.ddtExemption === "Yes" && (
//           <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
//             <p className="text-xs text-blue-800">
//               <strong>DDT10 Exemption Applied:</strong> Tax payment deadline
//               extended from 9 to 18 months after financial year-end.
//             </p>
//           </div>
//         )}

//         {step === 7 &&
//           (() => {
//             const deadline = calculateTaxPaymentDeadline();
//             const filingDeadline = calculateFilingDeadline();
//             return (
//               <div className="mt-4 space-y-2">
//                 {filingDeadline && (
//                   <div className="rounded-lg border border-green-200 bg-green-50 p-3">
//                     <p className="text-xs text-green-800">
//                       <strong>Malta Filing Deadline:</strong>{" "}
//                       {filingDeadline.toLocaleDateString("en-GB", {
//                         day: "numeric",
//                         month: "long",
//                         year: "numeric",
//                       })}
//                     </p>
//                   </div>
//                 )}
//                 {deadline && (
//                   <div className="rounded-lg border border-green-200 bg-green-50 p-3">
//                     <p className="text-xs text-green-800">
//                       <strong>Malta Payment Deadline:</strong>{" "}
//                       {deadline.toLocaleDateString("en-GB", {
//                         day: "numeric",
//                         month: "long",
//                         year: "numeric",
//                       })}
//                     </p>
//                   </div>
//                 )}
//               </div>
//             );
//           })()}

//         {Object.keys(errors).length > 0 && (
//           <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
//             <p className="text-xs text-red-800">
//               <strong>
//                 Please fix the errors above to get accurate calculations.
//               </strong>
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
