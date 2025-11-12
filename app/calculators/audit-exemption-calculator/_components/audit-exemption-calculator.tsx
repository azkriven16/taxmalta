"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FormState {
  incorporationYear: string;
  firstQuestion: string; // varies by year
  isMerchantShipping: string;
  secondQuestion: string; // may be parent entity for pre-2024
  isArticle174Exempt: string;
  qualifyPath: string; // Rule 3
  rule3FinancialYearEnd: string;
  rule3Qualifications: string;
  rule3WithinThreeYears: string;
  rule3Turnover: string;
  // Rule 6
  rule6BalanceSheet: string;
  rule6Turnover: string;
  rule6Employees: string;
  // Small Group
  smallGroupBalanceSheet: string;
  smallGroupTurnover: string;
  smallGroupEmployees: string;
  // Rule 6 Second Check
  rule6SecondBalanceSheet: string;
  rule6SecondTurnover: string;
  rule6SecondEmployees: string;
}

type ConclusionType =
  | "MERCHANT_EXEMPT"
  | "STARTUP_EXEMPT"
  | "SMALL_EXEMPT"
  | "REVIEW_REQUIRED"
  | "AUDIT_REQUIRED"
  | null;

interface ConclusionState {
  type: ConclusionType;
  message: string;
  details: string;
}

export default function AuditExemptionCalculator() {
  const [form, setForm] = useState<FormState>({
    incorporationYear: "",
    firstQuestion: "",
    isMerchantShipping: "",
    secondQuestion: "",
    isArticle174Exempt: "",
    qualifyPath: "",
    rule3FinancialYearEnd: "",
    rule3Qualifications: "",
    rule3WithinThreeYears: "",
    rule3Turnover: "",
    rule6BalanceSheet: "",
    rule6Turnover: "",
    rule6Employees: "",
    smallGroupBalanceSheet: "",
    smallGroupTurnover: "",
    smallGroupEmployees: "",
    rule6SecondBalanceSheet: "",
    rule6SecondTurnover: "",
    rule6SecondEmployees: "",
  });

  const incorporationYr = form.incorporationYear
    ? Number(form.incorporationYear)
    : 0;
  const isPost2024 = incorporationYr >= 2024 && incorporationYr <= 2026;

  const determineQualifyPath = (): string => {
    if (form.isMerchantShipping === "Yes") return "";

    if (isPost2024) {
      if (form.firstQuestion === "Yes") return "RULE_3";

      if (
        form.firstQuestion === "No" &&
        form.isMerchantShipping === "No" &&
        form.secondQuestion === "No"
      )
        return "RULE_6";

      if (
        form.firstQuestion === "No" &&
        form.isMerchantShipping === "No" &&
        form.secondQuestion === "Yes" &&
        form.isArticle174Exempt === "No"
      )
        return "SMALL_GROUP";

      if (
        form.firstQuestion === "No" &&
        form.isMerchantShipping === "No" &&
        form.secondQuestion === "Yes" &&
        form.isArticle174Exempt === "Yes"
      )
        return "RULE_6";
    }

    if (!isPost2024) {
      if (form.firstQuestion === "Yes") {
        if (form.secondQuestion === "No" && form.isArticle174Exempt === "")
          return "SMALL_GROUP";
        if (form.secondQuestion === "Yes" && form.isArticle174Exempt === "No")
          return "SMALL_GROUP";
        if (form.secondQuestion === "Yes" && form.isArticle174Exempt === "Yes")
          return "RULE_6";
      }
      if (form.firstQuestion === "No") return "RULE_6";
    }

    return "";
  };

  const qualifyPath = determineQualifyPath();

  const countCriteria = (values: string[]): number => {
    return values.filter((v) => v === "Yes").length;
  };

  const getConclusion = (): ConclusionState => {
    if (form.isMerchantShipping === "Yes") {
      return {
        type: "MERCHANT_EXEMPT",
        message:
          "Your company is exempt from preparing either an audit or a review report.",
        details:
          "Companies registered under the Merchant Shipping Act and exempt under regulation 64 of the Merchant Shipping Act (Cap. 234) are considered to meet audit requirements under tax law.",
      };
    }

    if (
      qualifyPath === "RULE_3" &&
      form.rule3Qualifications &&
      form.rule3WithinThreeYears &&
      form.rule3Turnover
    ) {
      const count = countCriteria([
        form.rule3Qualifications,
        form.rule3WithinThreeYears,
        form.rule3Turnover,
      ]);
      if (count === 3) {
        return {
          type: "STARTUP_EXEMPT",
          message:
            "The company satisfies all the criteria; therefore it is exempt from having to produce an auditor&apos;s report for its first two years.",
          details: "",
        };
      }
    }

    if (
      qualifyPath === "RULE_6" &&
      form.rule6BalanceSheet &&
      form.rule6Turnover &&
      form.rule6Employees
    ) {
      const count = countCriteria([
        form.rule6BalanceSheet,
        form.rule6Turnover,
        form.rule6Employees,
      ]);

      if (count === 3) {
        return {
          type: "SMALL_EXEMPT",
          message:
            "The company meets all three criteria; therefore, neither an audit nor a review report is required as a tax requirement for the latest financial period.",
          details: "",
        };
      }
      if (count === 2) {
        return {
          type: "REVIEW_REQUIRED",
          message:
            "The company meets two out of the three criteria; therefore, a review report (a lighter form of assurance than an audit) will suffice for the latest financial accounting period.",
          details: "",
        };
      }
      if (count <= 1) {
        return {
          type: "AUDIT_REQUIRED",
          message:
            "The company did not meet criteria for audit report exemption and a review report - an audit is required for the latest financial period.",
          details: "",
        };
      }
    }

    if (qualifyPath === "SMALL_GROUP") {
      const smallGroupCount = countCriteria([
        form.smallGroupBalanceSheet,
        form.smallGroupTurnover,
        form.smallGroupEmployees,
      ]);

      if (smallGroupCount >= 2) {
        if (
          form.rule6SecondBalanceSheet &&
          form.rule6SecondTurnover &&
          form.rule6SecondEmployees
        ) {
          const rule6Count = countCriteria([
            form.rule6SecondBalanceSheet,
            form.rule6SecondTurnover,
            form.rule6SecondEmployees,
          ]);

          if (rule6Count === 3) {
            return {
              type: "SMALL_EXEMPT",
              message:
                "The company meets all three criteria; therefore, neither an audit nor a review report is required as a tax requirement for the latest financial accounting period.",
              details: "",
            };
          }
          if (rule6Count === 2) {
            return {
              type: "REVIEW_REQUIRED",
              message:
                "The company meets two out of the three criteria; therefore, a review report (a lighter form of assurance than an audit) will suffice for the latest financial accounting period.",
              details: "",
            };
          }
          if (rule6Count <= 1) {
            return {
              type: "AUDIT_REQUIRED",
              message:
                "The company did not meet criteria for audit report exemption and a review report - an audit is required for the latest financial period.",
              details: "",
            };
          }
        }
      } else {
        return {
          type: "AUDIT_REQUIRED",
          message:
            "The group did not meet small group criteria - an audit is required for the latest financial period.",
          details: "",
        };
      }
    }

    return {
      type: null,
      message: "Please complete all questions to see your audit obligations.",
      details: "",
    };
  };

  const handleChange = (field: keyof FormState, value: string): void => {
    const newForm = { ...form, [field]: value };

    if (field === "incorporationYear") {
      newForm.firstQuestion = "";
      newForm.isMerchantShipping = "";
      newForm.secondQuestion = "";
      newForm.isArticle174Exempt = "";
      newForm.qualifyPath = "";
      newForm.rule3FinancialYearEnd = "";
      newForm.rule3Qualifications = "";
      newForm.rule3WithinThreeYears = "";
      newForm.rule3Turnover = "";
      newForm.rule6BalanceSheet = "";
      newForm.rule6Turnover = "";
      newForm.rule6Employees = "";
      newForm.smallGroupBalanceSheet = "";
      newForm.smallGroupTurnover = "";
      newForm.smallGroupEmployees = "";
      newForm.rule6SecondBalanceSheet = "";
      newForm.rule6SecondTurnover = "";
      newForm.rule6SecondEmployees = "";
    }

    if (
      [
        "firstQuestion",
        "isMerchantShipping",
        "secondQuestion",
        "isArticle174Exempt",
      ].includes(field)
    ) {
      newForm.rule3FinancialYearEnd = "";
      newForm.rule3Qualifications = "";
      newForm.rule3WithinThreeYears = "";
      newForm.rule3Turnover = "";
      newForm.rule6BalanceSheet = "";
      newForm.rule6Turnover = "";
      newForm.rule6Employees = "";
      newForm.smallGroupBalanceSheet = "";
      newForm.smallGroupTurnover = "";
      newForm.smallGroupEmployees = "";
      newForm.rule6SecondBalanceSheet = "";
      newForm.rule6SecondTurnover = "";
      newForm.rule6SecondEmployees = "";
    }

    setForm(newForm);
  };

  const conclusion = getConclusion();

  const smallGroupCount = countCriteria([
    form.smallGroupBalanceSheet,
    form.smallGroupTurnover,
    form.smallGroupEmployees,
  ]);
  const shouldShowSmallGroupSecond =
    qualifyPath === "SMALL_GROUP" && smallGroupCount >= 2;

  return (
    <div className="mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
          Audit Exemption Calculator
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Determine your company&apos;s audit and review report obligations
          under Malta tax law
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-2xl border p-6 shadow-lg md:p-8">
            <h2 className="text-card-foreground mb-6 text-xl font-semibold">
              Your Tax Situation
            </h2>

            <div className="space-y-6">
              {/* 1. Incorporation Year */}
              <div className="space-y-3">
                <Label className="text-card-foreground text-sm font-medium">
                  1. When was your company incorporated? (Year, e.g., 2023)
                </Label>
                <Input
                  type="text"
                  placeholder="e.g. 2023"
                  value={form.incorporationYear}
                  onChange={(e) =>
                    handleChange("incorporationYear", e.target.value)
                  }
                  className="h-11"
                />
              </div>

              <AnimatePresence>
                {form.incorporationYear && (
                  <>
                    {/* 2. First question – varies by year */}
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-3"
                    >
                      <Label className="text-card-foreground text-sm font-medium">
                        2.{" "}
                        {isPost2024
                          ? "Is your company exclusively owned by individuals?"
                          : "Is your company considered a Parent Entity or owns more than 50% of another company/ies?"}
                      </Label>
                      <RadioGroup
                        value={form.firstQuestion}
                        onValueChange={(v) => handleChange("firstQuestion", v)}
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Yes" id="q2Yes" />
                          <Label htmlFor="q2Yes" className="cursor-pointer">
                            Yes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="No" id="q2No" />
                          <Label htmlFor="q2No" className="cursor-pointer">
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                    </motion.div>

                    {/* 3. Merchant Shipping */}
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-3"
                    >
                      <Label className="text-card-foreground text-sm font-medium">
                        3. Is your company registered under the Merchant
                        Shipping Act?
                      </Label>
                      <RadioGroup
                        value={form.isMerchantShipping}
                        onValueChange={(v) =>
                          handleChange("isMerchantShipping", v)
                        }
                        className="flex gap-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Yes" id="merchYes" />
                          <Label htmlFor="merchYes" className="cursor-pointer">
                            Yes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="No" id="merchNo" />
                          <Label htmlFor="merchNo" className="cursor-pointer">
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                    </motion.div>

                    {/* Post-2024 extra questions */}
                    {isPost2024 &&
                      form.firstQuestion === "No" &&
                      form.isMerchantShipping === "No" && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-3"
                        >
                          <Label className="text-card-foreground text-sm font-medium">
                            4. Is your company considered a Parent Entity or
                            owns more than 50% of another company/ies?
                          </Label>
                          <RadioGroup
                            value={form.secondQuestion}
                            onValueChange={(v) =>
                              handleChange("secondQuestion", v)
                            }
                            className="flex gap-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Yes" id="q4Yes" />
                              <Label htmlFor="q4Yes" className="cursor-pointer">
                                Yes
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="No" id="q4No" />
                              <Label htmlFor="q4No" className="cursor-pointer">
                                No
                              </Label>
                            </div>
                          </RadioGroup>
                        </motion.div>
                      )}

                    {isPost2024 &&
                      form.firstQuestion === "No" &&
                      form.secondQuestion === "Yes" &&
                      form.isMerchantShipping === "No" && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-3"
                        >
                          <Label className="text-card-foreground text-sm font-medium">
                            5. Is your company exempt from preparing
                            consolidated accounts under Article 174 of the
                            Companies Act?
                          </Label>
                          <RadioGroup
                            value={form.isArticle174Exempt}
                            onValueChange={(v) =>
                              handleChange("isArticle174Exempt", v)
                            }
                            className="flex gap-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Yes" id="art174Yes" />
                              <Label
                                htmlFor="art174Yes"
                                className="cursor-pointer"
                              >
                                Yes
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="No" id="art174No" />
                              <Label
                                htmlFor="art174No"
                                className="cursor-pointer"
                              >
                                No
                              </Label>
                            </div>
                          </RadioGroup>
                        </motion.div>
                      )}

                    {/* Pre-2024 Article 174 */}
                    {!isPost2024 &&
                      form.firstQuestion === "Yes" &&
                      form.isMerchantShipping === "No" && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-3"
                        >
                          <Label className="text-card-foreground text-sm font-medium">
                            5. Is your company exempt from preparing
                            consolidated accounts under Article 174 of the
                            Companies Act?
                          </Label>
                          <RadioGroup
                            value={form.isArticle174Exempt}
                            onValueChange={(v) =>
                              handleChange("isArticle174Exempt", v)
                            }
                            className="flex gap-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Yes" id="art174YesPre" />
                              <Label
                                htmlFor="art174YesPre"
                                className="cursor-pointer"
                              >
                                Yes
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="No" id="art174NoPre" />
                              <Label
                                htmlFor="art174NoPre"
                                className="cursor-pointer"
                              >
                                No
                              </Label>
                            </div>
                          </RadioGroup>
                        </motion.div>
                      )}

                    {/* ==== RULE 3 ==== */}
                    {qualifyPath === "RULE_3" && (
                      <>
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950"
                        >
                          <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                            6. Let&apos;s check whether you will qualify under
                            Rule 3 – Startups led by qualified individuals
                          </p>
                        </motion.div>

                        {/* Financial year end */}
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-3"
                        >
                          <Label className="text-card-foreground text-sm font-medium">
                            7. When is your first financial year-end? (Month and
                            Year, e.g., December 2024)
                          </Label>
                          <Input
                            type="text"
                            placeholder="e.g. December 2024"
                            value={form.rule3FinancialYearEnd}
                            onChange={(e) =>
                              handleChange(
                                "rule3FinancialYearEnd",
                                e.target.value,
                              )
                            }
                            className="h-11"
                          />
                        </motion.div>

                        {/* Qualifications */}
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-3"
                        >
                          <Label className="text-card-foreground text-sm font-medium">
                            8. Do all shareholders hold educational
                            qualifications at MQF Level 3 or higher?
                          </Label>
                          <RadioGroup
                            value={form.rule3Qualifications}
                            onValueChange={(v) =>
                              handleChange("rule3Qualifications", v)
                            }
                            className="flex gap-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Yes" id="qualYes" />
                              <Label
                                htmlFor="qualYes"
                                className="cursor-pointer"
                              >
                                Yes
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="No" id="qualNo" />
                              <Label
                                htmlFor="qualNo"
                                className="cursor-pointer"
                              >
                                No
                              </Label>
                            </div>
                          </RadioGroup>
                        </motion.div>

                        {/* Within 3 years */}
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-3"
                        >
                          <Label className="text-card-foreground text-sm font-medium">
                            9. Was your company established within three years
                            of shareholders obtaining their qualifications?
                          </Label>
                          <RadioGroup
                            value={form.rule3WithinThreeYears}
                            onValueChange={(v) =>
                              handleChange("rule3WithinThreeYears", v)
                            }
                            className="flex gap-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Yes" id="threeYes" />
                              <Label
                                htmlFor="threeYes"
                                className="cursor-pointer"
                              >
                                Yes
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="No" id="threeNo" />
                              <Label
                                htmlFor="threeNo"
                                className="cursor-pointer"
                              >
                                No
                              </Label>
                            </div>
                          </RadioGroup>
                        </motion.div>

                        {/* Turnover */}
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-3"
                        >
                          <Label className="text-card-foreground text-sm font-medium">
                            10. Did your company&apos;s annual turnover not
                            exceed €80,000 (or proportionate if less than 12
                            months)?
                          </Label>
                          <RadioGroup
                            value={form.rule3Turnover}
                            onValueChange={(v) =>
                              handleChange("rule3Turnover", v)
                            }
                            className="flex gap-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Yes" id="turnR3Yes" />
                              <Label
                                htmlFor="turnR3Yes"
                                className="cursor-pointer"
                              >
                                Yes
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="No" id="turnR3No" />
                              <Label
                                htmlFor="turnR3No"
                                className="cursor-pointer"
                              >
                                No
                              </Label>
                            </div>
                          </RadioGroup>
                        </motion.div>
                      </>
                    )}

                    {/* ==== RULE 6 (first check) ==== */}
                    {qualifyPath === "RULE_6" &&
                      !shouldShowSmallGroupSecond && (
                        <>
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950"
                          >
                            <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                              6. Let&apos;s check whether you will qualify under
                              Rule 6 – Small companies
                            </p>
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-3"
                          >
                            <Label className="text-card-foreground text-sm font-medium">
                              7. Does your company meet the following thresholds
                              under Article 185(2) of the Companies Act for two
                              consecutive years:
                            </Label>
                          </motion.div>

                          {/* Balance sheet */}
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-3"
                          >
                            <Label className="text-card-foreground text-sm font-medium">
                              8. Was your company&apos;s balance sheet total
                              equal or less than €46,600?
                            </Label>
                            <RadioGroup
                              value={form.rule6BalanceSheet}
                              onValueChange={(v) =>
                                handleChange("rule6BalanceSheet", v)
                              }
                              className="flex gap-6"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Yes" id="balYes" />
                                <Label
                                  htmlFor="balYes"
                                  className="cursor-pointer"
                                >
                                  Yes
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="No" id="balNo" />
                                <Label
                                  htmlFor="balNo"
                                  className="cursor-pointer"
                                >
                                  No
                                </Label>
                              </div>
                            </RadioGroup>
                          </motion.div>

                          {/* Turnover */}
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-3"
                          >
                            <Label className="text-card-foreground text-sm font-medium">
                              9. Was your company&apos;s annual turnover equal
                              or less than €93,000?
                            </Label>
                            <RadioGroup
                              value={form.rule6Turnover}
                              onValueChange={(v) =>
                                handleChange("rule6Turnover", v)
                              }
                              className="flex gap-6"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Yes" id="turnR6Yes" />
                                <Label
                                  htmlFor="turnR6Yes"
                                  className="cursor-pointer"
                                >
                                  Yes
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="No" id="turnR6No" />
                                <Label
                                  htmlFor="turnR6No"
                                  className="cursor-pointer"
                                >
                                  No
                                </Label>
                              </div>
                            </RadioGroup>
                          </motion.div>

                          {/* Employees */}
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-3"
                          >
                            <Label className="text-card-foreground text-sm font-medium">
                              10. Was the average number of employees equal or
                              less than two (2)?
                            </Label>
                            <RadioGroup
                              value={form.rule6Employees}
                              onValueChange={(v) =>
                                handleChange("rule6Employees", v)
                              }
                              className="flex gap-6"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Yes" id="empYes" />
                                <Label
                                  htmlFor="empYes"
                                  className="cursor-pointer"
                                >
                                  Yes
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="No" id="empNo" />
                                <Label
                                  htmlFor="empNo"
                                  className="cursor-pointer"
                                >
                                  No
                                </Label>
                              </div>
                            </RadioGroup>
                          </motion.div>
                        </>
                      )}

                    {/* ==== SMALL GROUP ==== */}
                    {qualifyPath === "SMALL_GROUP" && (
                      <>
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-950"
                        >
                          <p className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                            6. Let&apos;s check whether your Group qualifies as
                            a Small Group
                          </p>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-3"
                        >
                          <Label className="text-card-foreground text-sm font-medium">
                            7. Does your company form part of a group (parent
                            and subsidiaries) that meets two or more of the
                            following criteria on a consolidated basis as of the
                            balance sheet date?
                          </Label>
                        </motion.div>

                        {/* Balance sheet */}
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-3"
                        >
                          <Label className="text-card-foreground text-sm font-medium">
                            8. Was your Group&apos;s aggregate balance sheet
                            total does not exceed €4,000,000 net or €4,800,000
                            gross?
                          </Label>
                          <RadioGroup
                            value={form.smallGroupBalanceSheet}
                            onValueChange={(v) =>
                              handleChange("smallGroupBalanceSheet", v)
                            }
                            className="flex gap-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Yes" id="sgBalYes" />
                              <Label
                                htmlFor="sgBalYes"
                                className="cursor-pointer"
                              >
                                Yes
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="No" id="sgBalNo" />
                              <Label
                                htmlFor="sgBalNo"
                                className="cursor-pointer"
                              >
                                No
                              </Label>
                            </div>
                          </RadioGroup>
                        </motion.div>

                        {/* Turnover */}
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-3"
                        >
                          <Label className="text-card-foreground text-sm font-medium">
                            9. Was your Group&apos;s aggregate turnover does not
                            exceed €8,000,000 net or €9,600,000 gross?
                          </Label>
                          <RadioGroup
                            value={form.smallGroupTurnover}
                            onValueChange={(v) =>
                              handleChange("smallGroupTurnover", v)
                            }
                            className="flex gap-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Yes" id="sgTurnYes" />
                              <Label
                                htmlFor="sgTurnYes"
                                className="cursor-pointer"
                              >
                                Yes
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="No" id="sgTurnNo" />
                              <Label
                                htmlFor="sgTurnNo"
                                className="cursor-pointer"
                              >
                                No
                              </Label>
                            </div>
                          </RadioGroup>
                        </motion.div>

                        {/* Employees */}
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-3"
                        >
                          <Label className="text-card-foreground text-sm font-medium">
                            10. Was your group&apos;s aggregate number of
                            employees does not exceed 50?
                          </Label>
                          <RadioGroup
                            value={form.smallGroupEmployees}
                            onValueChange={(v) =>
                              handleChange("smallGroupEmployees", v)
                            }
                            className="flex gap-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Yes" id="sgEmpYes" />
                              <Label
                                htmlFor="sgEmpYes"
                                className="cursor-pointer"
                              >
                                Yes
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="No" id="sgEmpNo" />
                              <Label
                                htmlFor="sgEmpNo"
                                className="cursor-pointer"
                              >
                                No
                              </Label>
                            </div>
                          </RadioGroup>
                        </motion.div>

                        {/* ==== RULE 6 SECOND CHECK ==== */}
                        {shouldShowSmallGroupSecond && (
                          <>
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950"
                            >
                              <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                                11. Now, let&apos;s check whether you will
                                qualify under Rule 6 – Small companies
                              </p>
                            </motion.div>

                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="space-y-3"
                            >
                              <Label className="text-card-foreground text-sm font-medium">
                                12. Does your company meet the following
                                thresholds under Article 185(2) of the Companies
                                Act for two consecutive years:
                              </Label>
                            </motion.div>

                            {/* Balance sheet */}
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="space-y-3"
                            >
                              <Label className="text-card-foreground text-sm font-medium">
                                13. Was your company&apos;s balance sheet total
                                equal or less than €46,600?
                              </Label>
                              <RadioGroup
                                value={form.rule6SecondBalanceSheet}
                                onValueChange={(v) =>
                                  handleChange("rule6SecondBalanceSheet", v)
                                }
                                className="flex gap-6"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="Yes" id="rule6b1Yes" />
                                  <Label
                                    htmlFor="rule6b1Yes"
                                    className="cursor-pointer"
                                  >
                                    Yes
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="No" id="rule6b1No" />
                                  <Label
                                    htmlFor="rule6b1No"
                                    className="cursor-pointer"
                                  >
                                    No
                                  </Label>
                                </div>
                              </RadioGroup>
                            </motion.div>

                            {/* Turnover */}
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="space-y-3"
                            >
                              <Label className="text-card-foreground text-sm font-medium">
                                14. Was your company&apos;s annual turnover
                                equal or less than €93,000?
                              </Label>
                              <RadioGroup
                                value={form.rule6SecondTurnover}
                                onValueChange={(v) =>
                                  handleChange("rule6SecondTurnover", v)
                                }
                                className="flex gap-6"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="Yes" id="rule6b2Yes" />
                                  <Label
                                    htmlFor="rule6b2Yes"
                                    className="cursor-pointer"
                                  >
                                    Yes
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="No" id="rule6b2No" />
                                  <Label
                                    htmlFor="rule6b2No"
                                    className="cursor-pointer"
                                  >
                                    No
                                  </Label>
                                </div>
                              </RadioGroup>
                            </motion.div>

                            {/* Employees */}
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="space-y-3"
                            >
                              <Label className="text-card-foreground text-sm font-medium">
                                15. Was the average number of employees equal or
                                less than two (2)?
                              </Label>
                              <RadioGroup
                                value={form.rule6SecondEmployees}
                                onValueChange={(v) =>
                                  handleChange("rule6SecondEmployees", v)
                                }
                                className="flex gap-6"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="Yes" id="rule6b3Yes" />
                                  <Label
                                    htmlFor="rule6b3Yes"
                                    className="cursor-pointer"
                                  >
                                    Yes
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="No" id="rule6b3No" />
                                  <Label
                                    htmlFor="rule6b3No"
                                    className="cursor-pointer"
                                  >
                                    No
                                  </Label>
                                </div>
                              </RadioGroup>
                            </motion.div>
                          </>
                        )}
                      </>
                    )}
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <div className="bg-card rounded-2xl border p-6 shadow-lg md:p-8">
              <h2 className="text-card-foreground mb-4 text-xl font-semibold">
                Audit Obligations
              </h2>

              <div className="space-y-4">
                {conclusion.type === "MERCHANT_EXEMPT" && (
                  <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
                    <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                      {conclusion.message}
                    </p>
                    {conclusion.details && (
                      <p className="mt-2 text-xs text-green-700 dark:text-green-300">
                        {conclusion.details}
                      </p>
                    )}
                  </div>
                )}

                {conclusion.type === "STARTUP_EXEMPT" && (
                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                      {conclusion.message}
                    </p>
                  </div>
                )}

                {conclusion.type === "SMALL_EXEMPT" && (
                  <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
                    <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                      {conclusion.message}
                    </p>
                  </div>
                )}

                {conclusion.type === "REVIEW_REQUIRED" && (
                  <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950">
                    <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
                      {conclusion.message}
                    </p>
                  </div>
                )}

                {conclusion.type === "AUDIT_REQUIRED" && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
                    <p className="text-sm font-semibold text-red-900 dark:text-red-100">
                      {conclusion.message}
                    </p>
                  </div>
                )}

                {!conclusion.type && (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {conclusion.message}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Information Section */}
      <div className="mt-12">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="merchant">
            <AccordionTrigger className="text-lg font-semibold">
              Merchant Shipping Act Exemption
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Companies registered under the Merchant Shipping Act and exempt
                under regulation 64 of the Merchant Shipping Act (Cap. 234) are
                considered to meet audit requirements under tax law.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="article174">
            <AccordionTrigger className="text-lg font-semibold">
              Article 174 - Consolidated Accounts Exemption
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Under Article 174 of the Companies Act, a parent company may
                  be exempt from preparing consolidated accounts if certain
                  conditions are met, including being a wholly-owned subsidiary
                  of an immediate parent company formed under a Member State or
                  EEA State law.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="rule3">
            <AccordionTrigger className="text-lg font-semibold">
              Rule 3 - Startups led by Qualified Individuals
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  A startup company may be exempt from audit requirements for
                  its first two years if all three criteria are met:
                </p>
                <ul className="ml-4 list-disc space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>
                    All shareholders hold MQF Level 3 or higher qualifications
                  </li>
                  <li>
                    Company established within 3 years of obtaining
                    qualifications
                  </li>
                  <li>
                    Annual turnover not exceeding €80,000 (proportionate if less
                    than 12 months)
                  </li>
                </ul>
                <p className="mt-2 text-xs text-gray-500">
                  Companies that meet all criteria are exempt for their first
                  two accounting periods.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="rule6">
            <AccordionTrigger className="text-lg font-semibold">
              Rule 6 - Small Companies
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Small companies may be exempt from audit or only require a
                  review report based on meeting financial thresholds for two
                  consecutive years. All three criteria must be met for full
                  exemption; if only two are met, a review report is sufficient.
                </p>
                <ul className="ml-4 list-disc space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>Balance sheet ≤ €46,600</li>
                  <li>Annual turnover ≤ €93,000</li>
                  <li>Average employees ≤ 2</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="smallgroup">
            <AccordionTrigger className="text-lg font-semibold">
              Small Groups
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Groups meeting two or more of the following criteria on a
                  consolidated basis qualify. If a small group qualifies, the
                  parent company must then be assessed under Rule 6 thresholds.
                </p>
                <ul className="ml-4 list-disc space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>
                    Aggregate balance sheet ≤ €4,000,000 net / €4,800,000 gross
                  </li>
                  <li>
                    Aggregate turnover ≤ €8,000,000 net / €9,600,000 gross
                  </li>
                  <li>Aggregate employees ≤ 50</li>
                </ul>
                <p className="mt-2 text-xs text-gray-500 italic">
                  Net figures exclude consolidation adjustments; gross includes
                  them. Must meet 2+ criteria for small group status.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
