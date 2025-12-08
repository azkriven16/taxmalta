"use client"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AnimatePresence, motion } from "framer-motion"
import { useState } from "react"
import { formatCurrency } from "@/lib/utils"
import { CurrencyInput } from "@/components/ui/currency-input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface FormState {
  grossSalary: string
  bonuses: string
  partTimeIncome: string
  partTimeType: string
  taxStatus: string
  sscStatus: string
  residencyStatus: string
}

interface ErrorState {
  [key: string]: string
}

interface TaxBracket {
  from: number
  to: number
  rate: number
  subtract: number
}

interface TaxCalculation {
  grossIncome: number
  incomeTax: number
  ssc: number
  cola: number
  totalDeductions: number
  netIncome: number
  breakdown: {
    label: string
    amount: number
  }[]
}

const isValidAmount = (amount: string): boolean => {
  const num = Number.parseFloat(amount)
  return !isNaN(num) && num >= 0
}

export default function PersonalTaxCalculator() {
  const [form, setForm] = useState<FormState>({
    grossSalary: "",
    bonuses: "",
    partTimeIncome: "",
    partTimeType: "Employment",
    taxStatus: "Single",
    sscStatus: "Employed (18 years old and over, born on or after 1 Jan 1962)",
    residencyStatus: "Resident",
  })

  const [errors, setErrors] = useState<ErrorState>({})

  // Tax brackets for residents (2025)
  const taxBracketsResident: Record<string, TaxBracket[]> = {
    Single: [
      { from: 0, to: 12000, rate: 0, subtract: 0 },
      { from: 12001, to: 16000, rate: 0.15, subtract: 1800 },
      { from: 16001, to: 60000, rate: 0.25, subtract: 3400 },
      { from: 60001, to: Number.POSITIVE_INFINITY, rate: 0.35, subtract: 9400 },
    ],
    Married: [
      { from: 0, to: 15000, rate: 0, subtract: 0 },
      { from: 15001, to: 23000, rate: 0.15, subtract: 2250 },
      { from: 23001, to: 60000, rate: 0.25, subtract: 4550 },
      { from: 60001, to: Number.POSITIVE_INFINITY, rate: 0.35, subtract: 10550 },
    ],
    Parent: [
      { from: 0, to: 13000, rate: 0, subtract: 0 },
      { from: 13001, to: 17500, rate: 0.15, subtract: 1950 },
      { from: 17501, to: 60000, rate: 0.25, subtract: 3700 },
      { from: 60001, to: Number.POSITIVE_INFINITY, rate: 0.35, subtract: 9700 },
    ],
  }

  // Non-resident tax brackets
  const taxBracketsNonResident: TaxBracket[] = [
    { from: 0, to: 700, rate: 0, subtract: 0 },
    { from: 701, to: 3100, rate: 0.2, subtract: 140 },
    { from: 3101, to: 7800, rate: 0.3, subtract: 450 },
    { from: 7801, to: Number.POSITIVE_INFINITY, rate: 0.35, subtract: 840 },
  ]

  const computeStep = (f: FormState): number => {
    let s = 1
    if (!f.grossSalary) return s
    s = 3
    if (Number.parseFloat(f.partTimeIncome) > 0 && !f.partTimeType) return s
    s = 4
    if (!f.taxStatus) return s
    s = 5
    if (!f.residencyStatus) return s
    s = 6
    if (!f.sscStatus) return s
    return 7
  }

  const step = computeStep(form)

  const validateField = (field: string, value: string): void => {
    const newErrors = { ...errors }
    if (
      (field === "grossSalary" || field === "bonuses" || field === "partTimeIncome") &&
      value &&
      !isValidAmount(value)
    ) {
      newErrors[field] = "Please enter a valid amount"
    } else {
      delete newErrors[field]
    }
    setErrors(newErrors)
  }

  const handleChange = (field: keyof FormState, value: string): void => {
    const newForm = { ...form, [field]: value }
    setForm(newForm)
    validateField(field, value)
  }

  const calculateSSC = (): number => {
    const weeklyGross = (Number.parseFloat(form.grossSalary) || 0) / 52

    if (form.sscStatus === "Exempt from paying NI/SSC") {
      return 0
    }

    if (form.sscStatus === "Student (under 18 years old)") {
      return Math.min(weeklyGross * 0.1, 4.38) * 52
    }

    if (form.sscStatus === "Student (18 years old and over)") {
      return Math.min(weeklyGross * 0.1, 7.94) * 52
    }

    if (form.sscStatus === "Employed (under 18 years old)") {
      let weeklySSC = 0
      if (weeklyGross <= 221.78) {
        weeklySSC = 6.62
      } else if (weeklyGross <= 544.28) {
        weeklySSC = weeklyGross * 0.1
      } else {
        weeklySSC = 54.43
      }
      return weeklySSC * 52
    }

    if (form.sscStatus === "Employed (18 years old and over, born on or before 31 Dec 1961)") {
      let weeklySSC = 0
      if (weeklyGross <= 221.78) {
        weeklySSC = 22.18
      } else if (weeklyGross <= 451.91) {
        weeklySSC = weeklyGross * 0.1
      } else {
        weeklySSC = 45.19
      }
      return weeklySSC * 52
    }

    // Default: Employed (18 years old and over, born on or after 1 Jan 1962)
    let weeklySSC = 0
    if (weeklyGross <= 221.78) {
      weeklySSC = 22.18
    } else if (weeklyGross <= 544.28) {
      weeklySSC = weeklyGross * 0.1
    } else {
      weeklySSC = 54.43
    }
    return weeklySSC * 52
  }

  const calculateIncomeTax = (): number => {
    const salary = Number.parseFloat(form.grossSalary) || 0
    const bonuses = Number.parseFloat(form.bonuses) || 0
    const partTime = Number.parseFloat(form.partTimeIncome) || 0

    const totalIncome = salary + bonuses

    // Part-time income with flat tax rate
    let partTimeTax = 0
    let partTimeChargeableIncome = 0

    if (partTime > 0) {
      const maxFlatRate = form.partTimeType === "Employment" ? 10000 : 12000

      if (partTime <= maxFlatRate) {
        partTimeTax = partTime * 0.1
      } else {
        partTimeTax = maxFlatRate * 0.1
        partTimeChargeableIncome = partTime - maxFlatRate
      }
    }

    const chargeableIncome = salary + bonuses + partTimeChargeableIncome

    const brackets =
      form.residencyStatus === "Resident"
        ? taxBracketsResident[form.taxStatus] || taxBracketsResident["Single"]
        : taxBracketsNonResident

    let progressiveTax = 0
    for (const bracket of brackets) {
      if (chargeableIncome > bracket.from && chargeableIncome <= bracket.to) {
        // Income falls in this bracket
        progressiveTax = chargeableIncome * bracket.rate - bracket.subtract
        console.log("[v0] Tax calculation:", {
          chargeableIncome,
          status: form.taxStatus,
          residency: form.residencyStatus,
          bracket,
          progressiveTax,
        })
        break
      }
    }

    return Math.max(0, partTimeTax + progressiveTax)
  }

  const calculateCOLA = (): number => {
    const salary = Number.parseFloat(form.grossSalary) || 0
    return salary > 0 ? 121.16 + 135.1 + 121.16 + 135.1 : 0
  }

  const calculate = (): TaxCalculation => {
    const grossSalary = Number.parseFloat(form.grossSalary) || 0
    const bonuses = Number.parseFloat(form.bonuses) || 0
    const partTime = Number.parseFloat(form.partTimeIncome) || 0
    const grossIncome = grossSalary + bonuses + partTime

    const incomeTax = calculateIncomeTax()
    const ssc = calculateSSC()
    const cola = calculateCOLA()
    const totalDeductions = incomeTax + ssc - cola
    const netIncome = grossIncome - totalDeductions

    return {
      grossIncome,
      incomeTax,
      ssc,
      cola,
      totalDeductions,
      netIncome,
      breakdown: [
        { label: "Annual Gross Salary", amount: grossSalary },
        { label: "Bonuses & Allowances", amount: bonuses },
        { label: "Part-Time Income", amount: partTime },
      ],
    }
  }

  const calculation = calculate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900 py-12 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Malta Personal Income Tax Calculator
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Calculate your income tax, social security contributions, and estimated net earnings for 2025
          </p>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Input Form - Left Side */}
          <div className="flex-1">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="bg-blue-600 text-white flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold">
                  {step}
                </div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Income Information</h2>
              </div>

              <div className="space-y-6">
                {/* Step 1: Gross Salary */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Annual Gross Salary (€)</Label>
                  <div className="relative">
                    <span className="text-slate-500 absolute top-1/2 left-3 -translate-y-1/2">€</span>
                    <CurrencyInput
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      value={form.grossSalary}
                      onChange={(e) => handleChange("grossSalary", e.target.value)}
                      className={`h-11 pl-8 w-full ${
                        errors.grossSalary ? "border-destructive focus:border-destructive focus:ring-destructive" : ""
                      }`}
                    />
                  </div>
                  {errors.grossSalary && <p className="text-sm text-red-600">{errors.grossSalary}</p>}
                </div>

                {/* Step 3: Part-Time Income */}
                <AnimatePresence>
                  {step >= 3 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-3"
                    >
                      <Label className="text-base font-semibold">Part-Time Income (€) - Optional</Label>
                      <div className="relative">
                        <span className="text-slate-500 absolute top-1/2 left-3 -translate-y-1/2">€</span>
                        <CurrencyInput
                          type="number"
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          value={form.partTimeIncome}
                          onChange={(e) => handleChange("partTimeIncome", e.target.value)}
                          className={`h-11 pl-8 w-full ${
                            errors.partTimeIncome
                              ? "border-destructive focus:border-destructive focus:ring-destructive"
                              : ""
                          }`}
                        />
                      </div>
                      {errors.partTimeIncome && <p className="text-sm text-red-600">{errors.partTimeIncome}</p>}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Step 3b: Part-Time Type */}
                <AnimatePresence>
                  {step >= 3 && Number.parseFloat(form.partTimeIncome) > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-3"
                    >
                      <Label className="text-base font-semibold">Part-Time Income Type</Label>
                      <Select value={form.partTimeType} onValueChange={(v) => handleChange("partTimeType", v)}>
                        <SelectTrigger className="h-11 w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Employment">Employment</SelectItem>
                          <SelectItem value="Self-Employment">Self-Employment</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-slate-500">
                        {form.partTimeType === "Employment"
                          ? "Flat 10% tax on income up to €10,000"
                          : "Flat 10% tax on income up to €12,000"}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-6" />

                {/* Step 4: Tax Status */}
                <AnimatePresence>
                  {step >= 4 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-3"
                    >
                      <Label className="text-base font-semibold">Tax Status</Label>
                      <Select value={form.taxStatus} onValueChange={(v) => handleChange("taxStatus", v)}>
                        <SelectTrigger className="h-11 w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Single">Single</SelectItem>
                          <SelectItem value="Married">Married</SelectItem>
                          <SelectItem value="Parent">Parent</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Step 5: Residency Status */}
                <AnimatePresence>
                  {step >= 5 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-3"
                    >
                      <Label className="text-base font-semibold">Residency Status</Label>
                      <Select value={form.residencyStatus} onValueChange={(v) => handleChange("residencyStatus", v)}>
                        <SelectTrigger className="h-11 w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Resident">Resident</SelectItem>
                          <SelectItem value="Non-Resident">Non-Resident</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Step 6: Social Security Status */}
                <AnimatePresence>
                  {step >= 6 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-3"
                    >
                      <Label className="text-base font-semibold">Social Security Contribution Status</Label>
                      <Select value={form.sscStatus} onValueChange={(v) => handleChange("sscStatus", v)}>
                        <SelectTrigger className="h-11 w-full text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Student (under 18 years old)">Student (under 18)</SelectItem>
                          <SelectItem value="Student (18 years old and over)">Student (18+)</SelectItem>
                          <SelectItem value="Employed (under 18 years old)">Employed (under 18)</SelectItem>
                          <SelectItem value="Employed (18 years old and over, born on or before 31 Dec 1961)">
                            Employed (18+, born ≤ 31 Dec 1961)
                          </SelectItem>
                          <SelectItem value="Employed (18 years old and over, born on or after 1 Jan 1962)">
                            Employed (18+, born ≥ 1 Jan 1962)
                          </SelectItem>
                          <SelectItem value="Exempt from paying NI/SSC">Exempt from NI/SSC</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Results Panel - Right Side */}
          <div className="flex-1">
            <div className="sticky top-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Tax Summary</h2>

              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4">
                  <p className="text-sm text-slate-600 dark:text-slate-300">Gross Income</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    €{formatCurrency(calculation.grossIncome)}
                  </p>
                </div>

                <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-4">
                  <p className="text-sm text-slate-600 dark:text-slate-300">Income Tax</p>
                  <p className="text-xl font-bold text-red-700 dark:text-red-300">
                    -€{formatCurrency(calculation.incomeTax)}
                  </p>
                </div>

                <div className="bg-orange-50 dark:bg-orange-950/30 rounded-lg p-4">
                  <p className="text-sm text-slate-600 dark:text-slate-300">Social Security</p>
                  <p className="text-xl font-bold text-orange-700 dark:text-orange-300">
                    -€{formatCurrency(calculation.ssc)}
                  </p>
                </div>

                <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4">
                  <p className="text-sm text-slate-600 dark:text-slate-300">COLA Bonus</p>
                  <p className="text-xl font-bold text-green-700 dark:text-green-300">
                    +€{formatCurrency(calculation.cola)}
                  </p>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg p-4">
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Net Annual Income</p>
                  <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-300 mt-2">
                    €{formatCurrency(calculation.netIncome)}
                  </p>
                  <div className="mt-4 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                    <p>
                      Monthly: <span className="font-semibold">€{formatCurrency(calculation.netIncome / 12)}</span>
                    </p>
                    <p>
                      Weekly: <span className="font-semibold">€{formatCurrency(calculation.netIncome / 52)}</span>
                    </p>
                  </div>
                </div>

                <div className="bg-slate-100 dark:bg-slate-700/50 rounded-lg p-4 mt-6">
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    ℹ️ Calculations are based on 2025 Malta tax rates and estimates. Actual amounts may vary based on
                    your specific circumstances.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Information Sections */}
        <div className="mt-12">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="tax-rates">
              <AccordionTrigger className="text-lg font-semibold">Income Tax Rates (2025)</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6">
                  {form.residencyStatus === "Resident" ? (
                    <div className="space-y-4">
                      {Object.entries(taxBracketsResident).map(([status, brackets]) => (
                        <div key={status} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                          <h4 className="font-semibold mb-3">{status}</h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b">
                                  <th className="text-left p-2">From (€)</th>
                                  <th className="text-left p-2">To (€)</th>
                                  <th className="text-left p-2">Rate</th>
                                </tr>
                              </thead>
                              <tbody>
                                {brackets.map((bracket, idx) => (
                                  <tr key={idx} className="border-b">
                                    <td className="p-2">{formatCurrency(bracket.from)}</td>
                                    <td className="p-2">
                                      {bracket.to === Number.POSITIVE_INFINITY
                                        ? "and above"
                                        : formatCurrency(bracket.to)}
                                    </td>
                                    <td className="p-2">{(bracket.rate * 100).toFixed(0)}%</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                      <h4 className="font-semibold mb-3">Non-Resident</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">From (€)</th>
                              <th className="text-left p-2">To (€)</th>
                              <th className="text-left p-2">Rate</th>
                            </tr>
                          </thead>
                          <tbody>
                            {taxBracketsNonResident.map((bracket, idx) => (
                              <tr key={idx} className="border-b">
                                <td className="p-2">{formatCurrency(bracket.from)}</td>
                                <td className="p-2">
                                  {bracket.to === Number.POSITIVE_INFINITY ? "and above" : formatCurrency(bracket.to)}
                                </td>
                                <td className="p-2">{(bracket.rate * 100).toFixed(0)}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="ssc-rates">
              <AccordionTrigger className="text-lg font-semibold">Social Security Rates (2025)</AccordionTrigger>
              <AccordionContent>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Status</th>
                          <th className="text-left p-2">Weekly Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="p-2">Student (under 18)</td>
                          <td className="p-2">10% (max €4.38)</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2">Student (18+)</td>
                          <td className="p-2">10% (max €7.94)</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2">Employed (under 18)</td>
                          <td className="p-2">€6.62 - €54.43</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2">Employed (18+, ≤ 31 Dec 1961)</td>
                          <td className="p-2">€22.18 - €45.19</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2">Employed (18+, ≥ 1 Jan 1962)</td>
                          <td className="p-2">€22.18 - €54.43</td>
                        </tr>
                        <tr>
                          <td className="p-2">Exempt from NI/SSC</td>
                          <td className="p-2">€0.00</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="part-time">
              <AccordionTrigger className="text-lg font-semibold">Part-Time Income Information</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
                  <p>
                    <span className="font-semibold">Flat 10% Tax Rate:</span> Part-time income qualifies for a flat 10%
                    tax rate instead of progressive rates.
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-2">
                    <li>
                      <span className="font-semibold">Employment:</span> Up to €10,000 per year at flat 10% rate. Excess
                      is taxed at normal progressive rates.
                    </li>
                    <li>
                      <span className="font-semibold">Self-Employment:</span> Up to €12,000 per year at flat 10% rate.
                      Excess is taxed at normal progressive rates.
                    </li>
                  </ul>
                  <p>
                    <span className="font-semibold">Eligibility:</span> Full-time employees, pensioners, or full-time
                    students only.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="cola">
              <AccordionTrigger className="text-lg font-semibold">
                COLA Bonus (Cost of Living Adjustment)
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 text-sm">
                  <p>
                    The COLA Bonus is paid quarterly to eligible employees, totaling €512.72 annually (€121.16 + €135.10
                    + €121.16 + €135.10).
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">
                    These amounts represent the cost-of-living adjustment and bonus payments distributed every three
                    months to help offset inflation and support household costs.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  )
}
