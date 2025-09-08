import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function TaxCalculator() {
  const [form, setForm] = useState({
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

  // Penalty schedules from the image
  const corporatePenaltySchedule = [
    { months: 6, penalty: 50, label: "Within 6 months" },
    { months: 12, penalty: 200, label: "Later than 6 but within 12 months" },
    { months: 18, penalty: 400, label: "Later than 12 but within 18 months" },
    { months: 24, penalty: 650, label: "Later than 18 but within 24 months" },
    { months: 36, penalty: 900, label: "Later than 24 but within 36 months" },
    { months: 48, penalty: 1000, label: "Later than 36 but within 48 months" },
    { months: 60, penalty: 1200, label: "Later than 48 but within 60 months" },
    { months: Infinity, penalty: 1500, label: "Later than 60 months" },
  ];

  const individualPenaltySchedule = [
    { months: 6, penalty: 10, label: "Within 6 months" },
    { months: 12, penalty: 50, label: "Later than 6 but within 12 months" },
    { months: 18, penalty: 100, label: "Later than 12 but within 18 months" },
    { months: 24, penalty: 150, label: "Later than 18 but within 24 months" },
    { months: 36, penalty: 200, label: "Later than 24 but within 36 months" },
    { months: 48, penalty: 300, label: "Later than 36 but within 48 months" },
    { months: 60, penalty: 400, label: "Later than 48 but within 60 months" },
    { months: Infinity, penalty: 500, label: "Later than 60 months" },
  ];

  const computeStep = (f: typeof form) => {
    let s = 1;
    if (!f.taxpayerType) return s;
    s = 2;
    if (!f.yearEnd) return s;
    s = 3;
    if (!f.taxYear) return s;
    s = 4;
    if (!f.selfAssessment) return s;
    if (f.selfAssessment === "Yes" && !f.submittedDate) return s;
    s = 5;
    if (!f.outstandingTax) return s;
    if (f.outstandingTax === "Yes") {
      if (!f.taxAmount) return s;
      if (!f.ddtExemption) return s;
      if (!f.dueDate) return s;
    }
    s = 6;
    if (!f.computeInterestAsOf) return s;
    return 7;
  };
  const step = computeStep(form);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Calculate the correct tax payment deadline based on DDT10 exemption
  const calculateTaxPaymentDeadline = () => {
    if (!form.taxYear || !form.yearEnd) return null;

    const taxYearNum = parseInt(form.taxYear);
    let yearEndDate: Date;

    if (form.taxpayerType === "Individual") {
      // Individual: December year end, payment due by 30 June following year
      yearEndDate = new Date(taxYearNum, 11, 31); // December 31st
      const paymentDeadline = new Date(taxYearNum + 1, 5, 30); // June 30th following year
      return paymentDeadline;
    } else {
      // Corporate: Based on financial year end
      const yearEndMonth = [
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
      ].indexOf(form.yearEnd);

      if (yearEndMonth === -1) return null;

      yearEndDate = new Date(taxYearNum, yearEndMonth, 1);
      yearEndDate.setMonth(yearEndDate.getMonth() + 1);
      yearEndDate.setDate(0); // Last day of the month

      // Standard: 9 months after year end
      // With DDT10 exemption: 18 months after year end
      const monthsToAdd = form.ddtExemption === "Yes" ? 18 : 9;
      const paymentDeadline = new Date(yearEndDate);
      paymentDeadline.setMonth(paymentDeadline.getMonth() + monthsToAdd);

      return paymentDeadline;
    }
  };

  // Calculate penalty based on submission delay
  const calculatePenalty = () => {
    if (form.selfAssessment === "No") {
      // If no return submitted, use the highest penalty
      const schedule =
        form.taxpayerType === "Corporate"
          ? corporatePenaltySchedule
          : individualPenaltySchedule;
      return schedule[schedule.length - 1].penalty;
    }

    if (!form.submittedDate || !form.taxYear) return 0;

    // Calculate the expected filing deadline
    const taxYearNum = parseInt(form.taxYear);
    let filingDeadline: Date;

    if (form.taxpayerType === "Individual") {
      // Individual: 30 September following the tax year
      filingDeadline = new Date(taxYearNum + 1, 8, 30); // September is month 8 (0-indexed)
    } else {
      // Corporate: 9 months after year end
      const yearEndMonth = [
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
      ].indexOf(form.yearEnd);

      if (yearEndMonth === -1) return 0;

      const yearEndDate = new Date(taxYearNum, yearEndMonth, 1);
      yearEndDate.setMonth(yearEndDate.getMonth() + 9);
      filingDeadline = yearEndDate;
    }

    const submissionDate = new Date(form.submittedDate);
    const monthsLate = Math.max(
      0,
      Math.ceil(
        (submissionDate.getTime() - filingDeadline.getTime()) /
          (1000 * 60 * 60 * 24 * 30.44)
      )
    );

    if (monthsLate <= 0) return 0;

    const schedule =
      form.taxpayerType === "Corporate"
        ? corporatePenaltySchedule
        : individualPenaltySchedule;

    for (const tier of schedule) {
      if (monthsLate <= tier.months) {
        return tier.penalty;
      }
    }

    return schedule[schedule.length - 1].penalty;
  };

  // Calculate interest (simplified - 8% per annum)
  const calculateInterest = () => {
    if (
      form.outstandingTax !== "Yes" ||
      !form.taxAmount ||
      !form.dueDate ||
      !form.computeInterestAsOf
    ) {
      return 0;
    }

    const taxAmount = parseFloat(form.taxAmount);
    const dueDate = new Date(form.dueDate);
    const computeDate = new Date(form.computeInterestAsOf);

    const daysBetween = Math.max(
      0,
      Math.ceil(
        (computeDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
      )
    );

    // 8% annual interest rate
    const annualRate = 0.08;
    const dailyRate = annualRate / 365;

    return taxAmount * dailyRate * daysBetween;
  };

  const calc = () => {
    let outstanding = form.taxAmount ? parseFloat(form.taxAmount) : 0;
    let penalty = calculatePenalty();
    let interest = calculateInterest();
    let total = outstanding + penalty + interest;
    return { outstanding, penalty, interest, total };
  };

  const { outstanding, penalty, interest, total } = calc();

  return (
    <div className="grid grid-cols-2 gap-6 p-6">
      {/* Left panel form */}
      <div className="space-y-4">
        {/* Step 1: Taxpayer type */}
        <div>
          <Label className="text-sm font-medium">
            What type of taxpayer are you?
          </Label>
          <Select
            value={form.taxpayerType}
            onValueChange={(v) => {
              handleChange("taxpayerType", v);
              if (v === "Individual") handleChange("yearEnd", "December");
              else handleChange("yearEnd", "");
            }}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select type" />
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
            >
              <Label className="text-sm font-medium">
                What month does your financial year end?
              </Label>
              <Select
                value={form.yearEnd}
                onValueChange={(v) => handleChange("yearEnd", v)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {[
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
                  ].map((m) => (
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
            >
              <Label className="text-sm font-medium">Financial year end</Label>
              <Input value="December" disabled className="mt-1 bg-gray-100" />
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
            >
              <Label className="text-sm font-medium">
                Which tax year does this information relate to?
              </Label>
              <Input
                type="number"
                placeholder="e.g. 2023"
                value={form.taxYear}
                onChange={(e) => handleChange("taxYear", e.target.value)}
                className="mt-1"
              />
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
            >
              <Label className="text-sm font-medium">
                Have you completed and submitted your Self Assessment tax
                return?
              </Label>
              <RadioGroup
                value={form.selfAssessment}
                onValueChange={(v) => handleChange("selfAssessment", v)}
                className="flex space-x-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Yes" id="saYes" />
                  <Label htmlFor="saYes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No" id="saNo" />
                  <Label htmlFor="saNo">No</Label>
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
            >
              <Label className="text-sm font-medium">
                If yes, when did you submit it?
              </Label>
              <Input
                type="date"
                value={form.submittedDate}
                onChange={(e) => handleChange("submittedDate", e.target.value)}
                className="mt-1"
              />
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
            >
              <Label className="text-sm font-medium">
                Did you have any outstanding tax to pay?
              </Label>
              <RadioGroup
                value={form.outstandingTax}
                onValueChange={(v) => handleChange("outstandingTax", v)}
                className="flex space-x-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Yes" id="taxYes" />
                  <Label htmlFor="taxYes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="No" id="taxNo" />
                  <Label htmlFor="taxNo">No</Label>
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
              >
                <Label className="text-sm font-medium">
                  What was the total amount of tax due?
                </Label>
                <Input
                  type="number"
                  placeholder="€0.00"
                  value={form.taxAmount}
                  onChange={(e) => handleChange("taxAmount", e.target.value)}
                  className="mt-1"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Label className="text-sm font-medium">
                  Do you have a valid DDT10 exemption certificate under Article
                  47(3)(e) of the DDTA on the financial year in question?
                </Label>
                <RadioGroup
                  value={form.ddtExemption}
                  onValueChange={(v) => handleChange("ddtExemption", v)}
                  className="flex space-x-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Yes" id="ddtYes" />
                    <Label htmlFor="ddtYes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="No" id="ddtNo" />
                    <Label htmlFor="ddtNo">No</Label>
                  </div>
                </RadioGroup>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Label className="text-sm font-medium">
                  The tax should have been paid on or before
                </Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => handleChange("dueDate", e.target.value)}
                  className="mt-1"
                />
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
            >
              <Label className="text-sm font-medium">
                Please compute the interest as of
              </Label>
              <Input
                type="date"
                value={form.computeInterestAsOf}
                onChange={(e) =>
                  handleChange("computeInterestAsOf", e.target.value)
                }
                className="mt-1"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right panel summary */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl shadow-lg border border-blue-100">
        <h2 className="text-xl font-bold mb-6 text-gray-800">
          Your Tax Obligation
        </h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
            <span className="text-sm text-gray-600">
              Outstanding tax amount due
            </span>
            <span className="font-semibold text-lg">
              €{outstanding.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
            <span className="text-sm text-gray-600">
              Penalty for late submission
            </span>
            <span className="font-semibold text-lg text-orange-600">
              €{penalty.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
            <span className="text-sm text-gray-600">
              Interest accrued due to late payment
            </span>
            <span className="font-semibold text-lg text-red-600">
              €{interest.toFixed(2)}
            </span>
          </div>
          <hr className="border-gray-300" />
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg text-white shadow-md">
            <span className="font-bold text-lg">Total tax payable</span>
            <span className="font-bold text-xl">€{total.toFixed(2)}</span>
          </div>
        </div>

        {step === 7 && penalty > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>Penalty Applied:</strong> Based on the penalty schedule
              for {form.taxpayerType.toLowerCase()} taxpayers.
            </p>
          </div>
        )}

        {step === 7 && form.ddtExemption === "Yes" && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>DDT10 Exemption Applied:</strong> Tax payment deadline
              extended from 9 to 18 months after financial year-end.
            </p>
          </div>
        )}

        {step === 7 &&
          (() => {
            const deadline = calculateTaxPaymentDeadline();
            return deadline ? (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-800">
                  <strong>Payment Deadline:</strong>{" "}
                  {deadline.toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            ) : null;
          })()}
      </div>
    </div>
  );
}
