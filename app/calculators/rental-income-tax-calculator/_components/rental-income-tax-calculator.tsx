"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { InfoIcon } from "lucide-react";

interface FormState {
  rentalIncome: string;
  optedFor15Percent: string;
  interestPaid: string;
  rentGroundRent: string;
  licenseFees: string;
}

export default function RentalIncomeCalculator() {
  const [form, setForm] = useState<FormState>({
    rentalIncome: "",
    optedFor15Percent: "",
    interestPaid: "",
    rentGroundRent: "",
    licenseFees: "",
  });

  const handleChange = (field: keyof FormState, value: string) => {
    setForm({ ...form, [field]: value });
  };

  // Parse currency values
  const rentalIncome = Number.parseFloat(form.rentalIncome) || 0;
  const interestPaid = Number.parseFloat(form.interestPaid) || 0;
  const rentGroundRent = Number.parseFloat(form.rentGroundRent) || 0;
  const licenseFees = Number.parseFloat(form.licenseFees) || 0;

  // Formula: =MAX(0,MIN(0.2*(C8-C12-C13),C8-C11-C12-C13))
  // 20% Maintenance Allowance = MAX(0, MIN(0.2*(rentalIncome-rentGroundRent-licenseFees), rentalIncome-interestPaid-rentGroundRent-licenseFees))
  const maintenanceAllowance = Math.max(
    0,
    Math.min(
      0.2 * (rentalIncome - rentGroundRent - licenseFees),
      rentalIncome - interestPaid - rentGroundRent - licenseFees,
    ),
  );

  // Regular Tax Rate Calculations
  // Formula: =MAX(0,(C8-C11-C13-C12-C14))
  // Taxable Income = rentalIncome - interestPaid - licenseFees - rentGroundRent - maintenanceAllowance
  const regularTaxableIncome = Math.max(
    0,
    rentalIncome -
      interestPaid -
      licenseFees -
      rentGroundRent -
      maintenanceAllowance,
  );

  // Formula: =ROUND(F9*IF(C9="Yes",0.15,0.35),0)
  // Tax rate is 35% for individual taxpayer (maximum tax rate)
  const regularTaxPayable = Math.round(regularTaxableIncome * 0.35);

  // 15% Final Tax Rate Calculations
  // Formula: =ROUND(F13*0.15,0)
  // Taxable Income = full rental income (no deductions)
  const finalTaxableIncome = rentalIncome;
  const finalTaxPayable = Math.round(finalTaxableIncome * 0.15);

  // Determine recommendation
  const getRecommendation = () => {
    if (!rentalIncome || form.optedFor15Percent === "Not Applicable") {
      return null;
    }

    if (form.optedFor15Percent === "Yes") {
      return "You have opted for the 15% final tax rate. This will apply to your total rental income.";
    }

    if (regularTaxPayable < finalTaxPayable) {
      return "Based on the above calculation, the most tax-efficient option for your passive rental income is to stick with the regular corporate tax.";
    } else if (finalTaxPayable < regularTaxPayable) {
      return "Based on the above calculation, the most tax-efficient option for your passive rental income is to opt for the 15% final tax rate.";
    } else {
      return "Both tax options result in the same tax liability.";
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">
            Rental Income Tax Calculator
          </h1>
          <p className="text-muted-foreground leading-relaxed text-pretty">
            The calculation below is for passive rental income. If renting is
            done as a business, it&apos;s taxed differently, and business
            expenses can be deducted. To know which applies, we look at how the
            rental is run. Usually, short-term rentals like hotel stays are
            treated as business income, while long-term rentals are considered
            passive.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column - Your Tax Profile */}
          <Card className="shadow-sm">
            <CardHeader className="bg-muted/50 border-b">
              <CardTitle className="text-lg font-semibold">
                Your Tax Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Rental Income */}
              <div className="space-y-2">
                <Label htmlFor="rentalIncome" className="text-sm font-medium">
                  Rental Income/Received (€)
                </Label>
                <CurrencyInput
                  id="rentalIncome"
                  value={form.rentalIncome}
                  onValueChange={(val) => handleChange("rentalIncome", val)}
                  placeholder="0.00"
                />
              </div>

              {/* Corporation 15% Option */}
              <div className="space-y-2">
                <Label
                  htmlFor="optedFor15Percent"
                  className="text-sm font-medium"
                >
                  If a corporation, did you opt for the 15% final tax rate?
                </Label>
                <Select
                  value={form.optedFor15Percent}
                  onValueChange={(val) =>
                    handleChange("optedFor15Percent", val)
                  }
                >
                  <SelectTrigger id="optedFor15Percent" className="h-11">
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                    <SelectItem value="Not Applicable">
                      Not Applicable
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Deductible Expenses */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold">Deductible Expenses</h3>

                <div className="space-y-2">
                  <Label htmlFor="interestPaid" className="text-sm">
                    Interest paid related to the asset which produces the rental
                    income
                  </Label>
                  <CurrencyInput
                    id="interestPaid"
                    value={form.interestPaid}
                    onValueChange={(val) => handleChange("interestPaid", val)}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rentGroundRent" className="text-sm">
                    Rent, ground rent or similar burden
                  </Label>
                  <CurrencyInput
                    id="rentGroundRent"
                    value={form.rentGroundRent}
                    onValueChange={(val) => handleChange("rentGroundRent", val)}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseFees" className="text-sm">
                    License fees paid for the purposes of Guest Houses and
                    Holiday Furnished Premises Act
                  </Label>
                  <CurrencyInput
                    id="licenseFees"
                    value={form.licenseFees}
                    onValueChange={(val) => handleChange("licenseFees", val)}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">20% Maintenance Allowance</Label>
                  <div className="bg-muted/50 flex h-11 items-center rounded-md border px-3">
                    <span className="text-muted-foreground mr-2">€</span>
                    <span>{formatCurrency(maintenanceAllowance)}</span>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Automatically calculated based on your rental income and
                    expenses
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Tax Obligations Summary */}
          <div className="space-y-6">
            {/* Regular Tax Rate */}
            <Card className="shadow-sm">
              <CardHeader className="bg-muted/50 border-b">
                <CardTitle className="text-lg font-semibold">
                  Regular Tax Rate
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Taxable Income</span>
                  <span className="text-lg font-semibold">
                    € {formatCurrency(regularTaxableIncome)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t pt-4">
                  <span className="text-sm font-medium">Tax Payable</span>
                  <span className="text-lg font-semibold">
                    € {formatCurrency(regularTaxPayable)}
                  </span>
                </div>
                <p className="text-muted-foreground pt-2 text-xs italic">
                  *Computed based on the maximum tax rate of 35% income tax for
                  individual taxpayer
                </p>
              </CardContent>
            </Card>

            {/* 15% Final Tax Rate */}
            <Card className="shadow-sm">
              <CardHeader className="bg-primary/10 border-primary/20 border-b">
                <CardTitle className="text-primary text-lg font-semibold">
                  15% Final Tax Rate
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Taxable Income</span>
                  <span className="text-lg font-semibold">
                    € {formatCurrency(finalTaxableIncome)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t pt-4">
                  <span className="text-sm font-medium">Tax Payable*</span>
                  <span className="text-primary text-lg font-semibold">
                    € {formatCurrency(finalTaxPayable)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Recommendation */}
            {getRecommendation() && (
              <Alert className="border-primary/20 bg-primary/10">
                <InfoIcon className="text-primary h-4 w-4" />
                <AlertDescription className="text-sm">
                  {getRecommendation()}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        {/* Important Notes */}
        <div className="mt-8">
          <h2 className="mb-6 text-2xl font-bold lg:text-3xl">
            Important Notes for availing the 15% Final Tax on Rental
          </h2>

          <div className="space-y-3">
            <Accordion type="single" collapsible>
              <AccordionItem value="eligibility">
                <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                  Eligibility for 15% Final Tax
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-base leading-relaxed">
                    <p>
                      You can choose to pay a flat 15% tax on your total rental
                      income if the property qualifies as a &quot;tenement.
                      &quot; This includes:
                    </p>
                    <ol className="ml-6 list-decimal space-y-2">
                      <li>
                        Homes or garages (used as someone&apos;s residence).
                      </li>
                      <li>
                        Commercial properties, as long as they&apos;re not
                        rented to or from a related company or person (related
                        means owning or controlling more than 25%).
                      </li>
                    </ol>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Accordion type="single" collapsible>
              <AccordionItem value="application">
                <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                  Application of 15% Rate
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-base leading-relaxed">
                    You can choose the 15% flat tax option even if your rental
                    income is from regular letting or from a business activity.
                    However, if you pick this option and you rent out more than
                    one property, the 15% rate will apply to the total rental
                    income from all those properties for the whole year.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Accordion type="single" collapsible>
              <AccordionItem value="deadline">
                <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                  Payment Deadline
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-base leading-relaxed">
                    If you choose the 15% flat tax option, you need to pay this
                    tax and submit Form TA 24 to the tax authorities by{" "}
                    <strong>30 April of the following calendar year</strong>{" "}
                    (January to December). For corporation, this deadline
                    applies no matter what your financial year-end is.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
}
