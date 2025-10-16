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
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { CurrencyInput } from "@/components/ui/currency-input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

const DatePicker = ({
  value,
  onChange,
  placeholder = "Select date",
  className,
  hasError = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  hasError?: boolean;
}) => {
  const [date, setDate] = useState<Date | undefined>(
    value ? new Date(value) : undefined,
  );

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      onChange(formattedDate);
    } else {
      onChange("");
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-11 w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            hasError &&
              "border-destructive focus:border-destructive focus:ring-destructive",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            date.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};

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

  const corporatePenaltySchedule: PenaltyScheduleItem[] = [
    { months: 6, penalty: 50, label: "Within 6 months" },
    { months: 12, penalty: 200, label: "Later than 6 but within 12 months" },
    { months: 18, penalty: 400, label: "Later than 12 but within 18 months" },
    { months: 24, penalty: 600, label: "Later than 18 but within 24 months" },
    { months: 36, penalty: 800, label: "Later than 24 but within 36 months" },
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
      startDate: new Date(1900, 0, 1),
      endDate: new Date(2008, 11, 31),
      rate: 0.01,
      label: "Up to Dec 2008 (1% monthly)",
    },
    {
      startDate: new Date(2009, 0, 1),
      endDate: new Date(2013, 11, 31),
      rate: 0.0075,
      label: "Jan 2009 - Dec 2013 (0.75% monthly)",
    },
    {
      startDate: new Date(2014, 0, 1),
      endDate: new Date(2019, 11, 31),
      rate: 0.0054,
      label: "Jan 2014 - Dec 2019 (0.54% monthly)",
    },
    {
      startDate: new Date(2020, 0, 1),
      endDate: new Date(2022, 4, 31),
      rate: 0.0033,
      label: "Jan 2020 - May 2022 (0.33% monthly)",
    },
    {
      startDate: new Date(2022, 5, 1),
      endDate: new Date(2099, 11, 31),
      rate: 0.006,
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
    return yearNum >= 1999 && yearNum <= currentYear;
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
            "Please enter a valid tax year (1999-" +
            new Date().getFullYear() +
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
    if (f.taxpayerType === "Individual") f.yearEnd = "December";
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
      s = 6;
    }
    return 7;
  };

  const step = computeStep(form);

  const handleChange = (field: keyof FormState, value: string): void => {
    const newForm = { ...form, [field]: value };

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
      setErrors({});
    }

    if (field === "yearEnd" || field === "taxYear") {
      newForm.dueDate = "";
    }

    if (
      field === "taxYear" &&
      newForm.taxpayerType === "Individual" &&
      newForm.taxYear
    ) {
      const taxYearNum = Number.parseInt(newForm.taxYear);
      const paymentDeadline = new Date(taxYearNum + 1, 5, 30);
      newForm.dueDate = paymentDeadline.toISOString().split("T")[0];
    }

    if (
      (field === "ddtExemption" ||
        field === "taxYear" ||
        field === "yearEnd") &&
      newForm.taxYear &&
      newForm.yearEnd &&
      newForm.taxpayerType === "Corporate" &&
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
      return new Date(taxYearNum + 1, 5, 30);
    } else {
      const yearEndMonth = MONTHS.indexOf(formData.yearEnd);
      if (yearEndMonth === -1) return null;

      let yearEndDate: Date;
      if (yearEndMonth >= 0 && yearEndMonth <= 11) {
        yearEndDate = getLastDayOfMonth(taxYearNum + 1, yearEndMonth);
      }

      if (!yearEndDate!) return null;

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
      return new Date(taxYearNum + 1, 8, 30);
    } else {
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
    if (form.outstandingTax !== "Yes" || !form.taxAmount || !form.dueDate) {
      return { total: 0, breakdown: [] };
    }

    const taxAmount = Number.parseFloat(form.taxAmount);
    if (isNaN(taxAmount) || taxAmount <= 0) return { total: 0, breakdown: [] };

    const dueDate = new Date(form.dueDate);
    const computeDate = form.computeInterestAsOf
      ? new Date(form.computeInterestAsOf)
      : new Date();

    if (computeDate <= dueDate) return { total: 0, breakdown: [] };

    let totalInterest = 0;
    const breakdown: Array<{
      period: string;
      days: number;
      rate: number;
      amount: number;
    }> = [];
    let currentDate = new Date(dueDate);

    for (const period of interestPeriods) {
      if (currentDate >= computeDate) break;

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

        const monthsInPeriod = Math.ceil(daysInPeriod / 30.44);
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
              Malta Income Tax Penalty and Interest Calculator
            </h1>
            <p className="text-muted-foreground mt-2 text-xl">
              Quickly calculate penalties and interest charges for late income
              tax filings and payments in Malta
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
                      <SelectItem value="Corporate">Corporation</SelectItem>
                      <SelectItem value="Individual">Individual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
                      <DatePicker
                        value={form.submittedDate}
                        onChange={(value) =>
                          handleChange("submittedDate", value)
                        }
                        placeholder="Select submission date"
                        hasError={!!errors.submittedDate}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

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
                          <CurrencyInput
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
                    </>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {step >= 6 && form.outstandingTax === "Yes" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-3"
                    >
                      <Label className="text-card-foreground text-sm font-medium">
                        When do you plan to settle? (optional)
                      </Label>
                      <DatePicker
                        value={form.computeInterestAsOf}
                        onChange={(value) =>
                          handleChange("computeInterestAsOf", value)
                        }
                        placeholder="Select date (defaults to today)"
                        hasError={!!errors.computeInterestAsOf}
                      />
                      <p className="text-muted-foreground text-xs">
                        Leave blank to calculate interest up to today&apos;s
                        date.
                      </p>
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
                    Your Tax Obligation
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Approximate amounts using Malta tax rules <br />
                    Figures may change upon filing and MTCA assessment.
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
                      €{formatCurrency(outstanding)}
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
                        €{formatCurrency(total)}
                      </span>
                    </div>
                  </div>
                </div>

                {step >= 5 && penalty > 0 && (
                  <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-950">
                    <p className="text-sm text-orange-900 dark:text-orange-100">
                      <span className="font-semibold">Penalty Applied:</span>{" "}
                      Based on the penalty schedule for{" "}
                      {form.taxpayerType.toLowerCase()} taxpayers.
                    </p>
                  </div>
                )}

                {step >= 5 && form.ddtExemption === "Yes" && (
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

                {step >= 5 &&
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
                              {Math.round(item.days / 30.44)} months
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

        <div className="mt-8">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="penalty-schedule">
              <AccordionTrigger className="text-lg font-semibold">
                Basis of Late Return Filing Penalty
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    Number of months from the date on which a tax return is
                    required to be submitted in terms of the Income Tax
                    Management Act
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="p-3 text-left font-semibold">
                            Time Period
                          </th>
                          <th className="p-3 text-right font-semibold">
                            Corporate
                          </th>
                          <th className="p-3 text-right font-semibold">
                            Individual
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="p-3">Within 6 months</td>
                          <td className="p-3 text-right">€50</td>
                          <td className="p-3 text-right">€10</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-3">
                            Later than 6 but within 12 months
                          </td>
                          <td className="p-3 text-right">€200</td>
                          <td className="p-3 text-right">€50</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-3">
                            Later than 12 but within 18 months
                          </td>
                          <td className="p-3 text-right">€400</td>
                          <td className="p-3 text-right">€100</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-3">
                            Later than 18 but within 24 months
                          </td>
                          <td className="p-3 text-right">€600</td>
                          <td className="p-3 text-right">€150</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-3">
                            Later than 24 but within 36 months
                          </td>
                          <td className="p-3 text-right">€800</td>
                          <td className="p-3 text-right">€200</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-3">
                            Later than 36 but within 48 months
                          </td>
                          <td className="p-3 text-right">€1,000</td>
                          <td className="p-3 text-right">€300</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-3">
                            Later than 48 but within 60 months
                          </td>
                          <td className="p-3 text-right">€1,200</td>
                          <td className="p-3 text-right">€400</td>
                        </tr>
                        <tr>
                          <td className="p-3">Later than 60 months</td>
                          <td className="p-3 text-right">€1,500</td>
                          <td className="p-3 text-right">€500</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="interest-rates">
              <AccordionTrigger className="text-lg font-semibold">
                Basis of Interest on Late Payment
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    The applicable interest per month (or part thereof) on
                    unpaid tax liabilities, as per the Interest and Additional
                    Tax (Adjustment) Rules are as follows:
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="p-3 text-left font-semibold">
                            Period
                          </th>
                          <th className="p-3 text-right font-semibold">
                            Monthly Rate
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="p-3">Prior to December 2008</td>
                          <td className="p-3 text-right">1%</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-3">
                            From January 2009 to December 2013
                          </td>
                          <td className="p-3 text-right">0.75%</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-3">
                            From January 2014 to December 2019
                          </td>
                          <td className="p-3 text-right">0.54%</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-3">From January 2020 to May 2022</td>
                          <td className="p-3 text-right">0.33%</td>
                        </tr>
                        <tr>
                          <td className="p-3">From June 2022 onwards</td>
                          <td className="p-3 text-right">0.60%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="next-steps">
              <AccordionTrigger className="text-lg font-semibold">
                What can you do next?
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <p className="text-muted-foreground text-sm">
                    If you have outstanding tax obligations, here are your next
                    steps:
                  </p>
                  <ul className="text-muted-foreground ml-4 list-disc space-y-2 text-sm">
                    <li>
                      <strong>File your return immediately</strong> if you
                      haven&apos;t already - penalties increase the longer you
                      wait
                    </li>
                    <li>
                      <strong>Contact the Commissioner for Revenue</strong> to
                      arrange payment or discuss payment plans
                    </li>
                    <li>
                      <strong>Gather supporting documentation</strong> for your
                      tax return and any claims for deductions
                    </li>
                    <li>
                      <strong>Consider professional advice</strong> from a tax
                      advisor or accountant for complex situations
                    </li>
                    <li>
                      <strong>Set up reminders</strong> for future filing and
                      payment deadlines to avoid penalties
                    </li>
                  </ul>
                  <p className="text-muted-foreground mt-4 text-xs italic">
                    Note: This calculator provides estimates based on Malta tax
                    law. Actual amounts may vary based on your specific
                    circumstances and official assessment by the Commissioner
                    for Revenue.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
