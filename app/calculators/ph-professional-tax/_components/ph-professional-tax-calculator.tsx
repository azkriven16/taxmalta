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
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { InfoIcon } from "lucide-react";

// Progressive income tax rates — Philippines 2026 onwards
function progressiveTax(income: number): number {
  if (income <= 250_000) return 0;
  if (income <= 400_000) return (income - 250_000) * 0.15;
  if (income <= 800_000) return 22_500 + (income - 400_000) * 0.2;
  if (income <= 2_000_000) return 102_500 + (income - 800_000) * 0.25;
  if (income <= 8_000_000) return 402_500 + (income - 2_000_000) * 0.3;
  return 2_202_500 + (income - 8_000_000) * 0.35;
}

function computeOPT(grossRevenue: number): number {
  return grossRevenue > 3_000_000 ? 0 : grossRevenue * 0.03;
}

function formatPHP(value: number): string {
  return value.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

interface FormState {
  grossRevenue: string;
  expenses: string;
  showOPC: string;
  directCost: string;
  assetsExceed100M: string;
}

export default function PhProfessionalTaxCalculator() {
  const [form, setForm] = useState<FormState>({
    grossRevenue: "",
    expenses: "",
    showOPC: "no",
    directCost: "",
    assetsExceed100M: "no",
  });

  const handleChange = (field: keyof FormState, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const grossRevenue = parseFloat(form.grossRevenue) || 0;
  const expenses = parseFloat(form.expenses) || 0;
  const netIncome = grossRevenue - expenses;
  const directCost = parseFloat(form.directCost) || 0;
  const assetsExceed100M = form.assetsExceed100M === "yes";
  const showOPC = form.showOPC === "yes";

  // --- Individual Taxpayer ---

  // Itemised Deduction
  const ind_ID_taxable = Math.max(0, netIncome);
  const ind_ID_incomeTax = progressiveTax(ind_ID_taxable);
  const ind_ID_opt = computeOPT(grossRevenue);
  const ind_ID_total = ind_ID_incomeTax + ind_ID_opt;

  // 40% Optional Standard Deduction
  const ind_OSD_taxable = Math.max(0, grossRevenue * 0.6);
  const ind_OSD_incomeTax = progressiveTax(ind_OSD_taxable);
  const ind_OSD_opt = computeOPT(grossRevenue);
  const ind_OSD_total = ind_OSD_incomeTax + ind_OSD_opt;

  // 8% Flat Rate (in lieu of income tax + OPT)
  const is8Available = grossRevenue > 0 && grossRevenue <= 3_000_000;
  const ind_8_taxable = grossRevenue;
  const ind_8_incomeTax = is8Available
    ? Math.max(0, (grossRevenue - 250_000) * 0.08)
    : 0;
  const ind_8_total = ind_8_incomeTax;

  // Best individual option
  const getBestOption = () => {
    if (!grossRevenue) return null;
    const options = [
      { name: "Itemised Deduction", total: ind_ID_total },
      { name: "40% OSD", total: ind_OSD_total },
      ...(is8Available ? [{ name: "8% Flat Rate", total: ind_8_total }] : []),
    ];
    return options.reduce((a, b) => (a.total <= b.total ? a : b));
  };
  const bestOption = getBestOption();

  // --- One Person Corporation ---

  // OPC Itemised
  const opc_ID_taxable = Math.max(0, netIncome);
  const isOPCSmall_ID = !assetsExceed100M && opc_ID_taxable <= 5_000_000;
  const opc_ID_incomeTax = opc_ID_taxable * (isOPCSmall_ID ? 0.2 : 0.25);
  const opc_ID_opt = computeOPT(grossRevenue);
  const opc_ID_total = opc_ID_incomeTax + opc_ID_opt;

  // OPC 40% OSD — direct costs excluded first, then 40% deduction applied
  const opc_OSD_taxable = Math.max(0, (grossRevenue - directCost) * 0.6);
  const isOPCSmall_OSD = !assetsExceed100M && opc_OSD_taxable <= 5_000_000;
  const opc_OSD_incomeTax = opc_OSD_taxable * (isOPCSmall_OSD ? 0.2 : 0.25);
  const opc_OSD_opt = computeOPT(grossRevenue);
  const opc_OSD_total = opc_OSD_incomeTax + opc_OSD_opt;

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">
            Professional / Single Proprietor Tax Calculator
          </h1>
          <p className="text-muted-foreground leading-relaxed text-pretty">
            Compare your tax obligations under the three computation methods
            available for self-employed individuals and professionals in the
            Philippines. Based on the 2026 income tax table. Optionally check
            how your tax changes under a One Person Corporation (OPC).
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Left — Tax Profile */}
          <Card className="shadow-sm lg:col-span-2">
            <CardHeader className="bg-muted/50 border-b">
              <CardTitle className="text-lg font-semibold">
                Your Tax Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="space-y-2">
                <Label htmlFor="grossRevenue" className="text-sm font-medium">
                  Net Revenue (Sales less discounts & VAT if applicable) (₱)
                </Label>
                <CurrencyInput
                  id="grossRevenue"
                  symbol="₱"
                  value={form.grossRevenue}
                  onValueChange={(val) => handleChange("grossRevenue", val)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expenses" className="text-sm font-medium">
                  Tax Deductible Operating Expenses (₱)
                </Label>
                <CurrencyInput
                  id="expenses"
                  symbol="₱"
                  value={form.expenses}
                  onValueChange={(val) => handleChange("expenses", val)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Net Income</Label>
                <div className="bg-muted/50 flex h-11 items-center rounded-md border px-3">
                  <span className="text-muted-foreground mr-2 text-sm">₱</span>
                  <span className={netIncome < 0 ? "text-destructive" : ""}>
                    {formatPHP(netIncome)}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="showOPC" className="text-sm font-medium">
                  Also check tax under a One Person Corporation?
                </Label>
                <Select
                  value={form.showOPC}
                  onValueChange={(val) => handleChange("showOPC", val)}
                >
                  <SelectTrigger id="showOPC" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {showOPC && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="directCost" className="text-sm font-medium">
                      Direct Cost portion of Operating Expenses (₱)
                    </Label>
                    <CurrencyInput
                      id="directCost"
                      symbol="₱"
                      value={form.directCost}
                      onValueChange={(val) => handleChange("directCost", val)}
                      placeholder="0.00"
                    />
                    <p className="text-muted-foreground text-xs">
                      Used for OPC OSD: (Revenue − Direct Cost) × 60%
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="assetsExceed100M"
                      className="text-sm font-medium"
                    >
                      Do total assets exceed ₱100 million (excluding land)?
                    </Label>
                    <Select
                      value={form.assetsExceed100M}
                      onValueChange={(val) =>
                        handleChange("assetsExceed100M", val)
                      }
                    >
                      <SelectTrigger id="assetsExceed100M" className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Right — Results */}
          <div className="space-y-5 lg:col-span-3">
            {/* Individual Taxpayer */}
            <Card className="shadow-sm">
              <CardHeader className="bg-muted/50 border-b">
                <CardTitle className="text-lg font-semibold">
                  Tax Obligations — Individual Taxpayer
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                <div className="grid grid-cols-3 gap-4">
                  {/* Itemised */}
                  <ResultColumn
                    label="Itemised Deduction"
                    rows={[
                      {
                        name: "Taxable Income",
                        value: `₱${formatPHP(ind_ID_taxable)}`,
                      },
                      {
                        name: "Income Tax",
                        value: `₱${formatPHP(ind_ID_incomeTax)}`,
                      },
                      {
                        name: "% Tax (3%)",
                        value: `₱${formatPHP(ind_ID_opt)}`,
                        note:
                          grossRevenue > 3_000_000 ? "Exempt (>₱3M)" : undefined,
                      },
                    ]}
                    total={`₱${formatPHP(ind_ID_total)}`}
                  />

                  {/* 40% OSD */}
                  <ResultColumn
                    label="40% OSD"
                    rows={[
                      {
                        name: "Taxable Income",
                        value: `₱${formatPHP(ind_OSD_taxable)}`,
                      },
                      {
                        name: "Income Tax",
                        value: `₱${formatPHP(ind_OSD_incomeTax)}`,
                      },
                      {
                        name: "% Tax (3%)",
                        value: `₱${formatPHP(ind_OSD_opt)}`,
                        note:
                          grossRevenue > 3_000_000 ? "Exempt (>₱3M)" : undefined,
                      },
                    ]}
                    total={`₱${formatPHP(ind_OSD_total)}`}
                  />

                  {/* 8% Rate */}
                  <ResultColumn
                    label="8% Flat Rate"
                    unavailable={
                      grossRevenue > 3_000_000
                        ? "Not available — revenue exceeds ₱3M"
                        : !grossRevenue
                          ? "Enter revenue to check eligibility"
                          : undefined
                    }
                    rows={[
                      {
                        name: "Taxable Income",
                        value: `₱${formatPHP(ind_8_taxable)}`,
                      },
                      {
                        name: "Flat Tax (8%)",
                        value: `₱${formatPHP(ind_8_incomeTax)}`,
                      },
                      {
                        name: "% Tax",
                        value: "Waived",
                        muted: true,
                      },
                    ]}
                    total={`₱${formatPHP(ind_8_total)}`}
                    note="8% is in lieu of income tax and percentage tax"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Best option alert */}
            {bestOption && grossRevenue > 0 && (
              <Alert className="border-primary/20 bg-primary/10">
                <InfoIcon className="text-primary h-4 w-4" />
                <AlertDescription className="text-sm">
                  The most tax-efficient option as an individual is the{" "}
                  <strong>{bestOption.name}</strong> method — total tax payable
                  of <strong>₱{formatPHP(bestOption.total)}</strong>.
                </AlertDescription>
              </Alert>
            )}

            {/* OPC Section */}
            {showOPC && (
              <Card className="shadow-sm">
                <CardHeader className="bg-muted/50 border-b">
                  <CardTitle className="text-lg font-semibold">
                    Tax Obligations — One Person Corporation (OPC)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5">
                  <div className="grid grid-cols-2 gap-6">
                    <ResultColumn
                      label="Itemised Deduction"
                      rows={[
                        {
                          name: "Taxable Income",
                          value: `₱${formatPHP(opc_ID_taxable)}`,
                        },
                        {
                          name: `Income Tax (${isOPCSmall_ID ? "20%" : "25%"})`,
                          value: `₱${formatPHP(opc_ID_incomeTax)}`,
                        },
                        {
                          name: "% Tax (3%)",
                          value: `₱${formatPHP(opc_ID_opt)}`,
                          note:
                            grossRevenue > 3_000_000
                              ? "Exempt (>₱3M)"
                              : undefined,
                        },
                      ]}
                      total={`₱${formatPHP(opc_ID_total)}`}
                    />

                    <ResultColumn
                      label="40% OSD"
                      rows={[
                        {
                          name: "Taxable Income",
                          value: `₱${formatPHP(opc_OSD_taxable)}`,
                        },
                        {
                          name: `Income Tax (${isOPCSmall_OSD ? "20%" : "25%"})`,
                          value: `₱${formatPHP(opc_OSD_incomeTax)}`,
                        },
                        {
                          name: "% Tax (3%)",
                          value: `₱${formatPHP(opc_OSD_opt)}`,
                          note:
                            grossRevenue > 3_000_000
                              ? "Exempt (>₱3M)"
                              : undefined,
                        },
                      ]}
                      total={`₱${formatPHP(opc_OSD_total)}`}
                    />
                  </div>
                  <p className="text-muted-foreground mt-4 text-xs italic">
                    *MCIT of 2% of gross income not included. MCIT applies from
                    the 4th taxable year of operations.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Tax Table */}
        <div>
          <h2 className="mb-4 text-2xl font-bold lg:text-3xl">
            2026 Individual Income Tax Table
          </h2>
          <Card>
            <CardContent className="pt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-3 text-left font-semibold">
                        Income Range
                      </th>
                      <th className="pb-3 text-right font-semibold">
                        Base Tax
                      </th>
                      <th className="pb-3 text-right font-semibold">Rate</th>
                      <th className="pb-3 text-right font-semibold">
                        On excess over
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {[
                      {
                        range: "Up to ₱250,000",
                        base: "—",
                        rate: "0%",
                        excess: "—",
                      },
                      {
                        range: "₱250,001 – ₱400,000",
                        base: "—",
                        rate: "15%",
                        excess: "₱250,000",
                      },
                      {
                        range: "₱400,001 – ₱800,000",
                        base: "₱22,500",
                        rate: "20%",
                        excess: "₱400,000",
                      },
                      {
                        range: "₱800,001 – ₱2,000,000",
                        base: "₱102,500",
                        rate: "25%",
                        excess: "₱800,000",
                      },
                      {
                        range: "₱2,000,001 – ₱8,000,000",
                        base: "₱402,500",
                        rate: "30%",
                        excess: "₱2,000,000",
                      },
                      {
                        range: "Over ₱8,000,000",
                        base: "₱2,202,500",
                        rate: "35%",
                        excess: "₱8,000,000",
                      },
                    ].map((row, i) => (
                      <tr key={i} className="text-muted-foreground">
                        <td className="py-2">{row.range}</td>
                        <td className="py-2 text-right">{row.base}</td>
                        <td className="py-2 text-right font-medium text-foreground">
                          {row.rate}
                        </td>
                        <td className="py-2 text-right">{row.excess}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notes */}
        <div>
          <h2 className="mb-4 text-2xl font-bold lg:text-3xl">
            Important Notes
          </h2>
          <div className="space-y-3">
            <Accordion type="single" collapsible>
              <AccordionItem value="8pct">
                <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                  8% Flat Rate — Who qualifies?
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-base leading-relaxed">
                    <p>
                      The 8% flat rate is available to self-employed individuals
                      and professionals whose gross sales or receipts{" "}
                      <strong>do not exceed ₱3,000,000</strong> for the taxable
                      year and who are not VAT-registered. It is computed on
                      gross receipts in excess of ₱250,000 and is paid{" "}
                      <strong>in lieu</strong> of both income tax and the 3%
                      percentage tax.
                    </p>
                    <p>
                      Mixed-income earners (with compensation income from
                      employment) may still avail of the 8% rate on their
                      self-employment or professional income.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Accordion type="single" collapsible>
              <AccordionItem value="osd">
                <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                  40% Optional Standard Deduction (OSD)
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-base leading-relaxed">
                    Under OSD, an individual taxpayer may deduct 40% of gross
                    sales or receipts in lieu of itemising actual expenses. No
                    supporting receipts are required for the deduction itself,
                    though gross income records must still be maintained. Once
                    elected for a taxable year, OSD cannot be revoked for that
                    same year.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Accordion type="single" collapsible>
              <AccordionItem value="opc">
                <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                  One Person Corporation (OPC) — Tax Rates
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-base leading-relaxed">
                    <p>
                      Under the CREATE Act, a domestic corporation (including an
                      OPC) is taxed at:
                    </p>
                    <ul className="ml-6 list-disc space-y-1">
                      <li>
                        <strong>20%</strong> — net taxable income does not
                        exceed ₱5,000,000 <em>and</em> total assets (excluding
                        land) do not exceed ₱100,000,000.
                      </li>
                      <li>
                        <strong>25%</strong> — all other corporations.
                      </li>
                    </ul>
                    <p>
                      The Minimum Corporate Income Tax (MCIT) of 2% of gross
                      income applies beginning the 4th taxable year and is not
                      reflected in this calculator.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Accordion type="single" collapsible>
              <AccordionItem value="opt">
                <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                  3% Other Percentage Tax (OPT)
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-base leading-relaxed">
                    Non-VAT registered taxpayers with annual gross receipts not
                    exceeding ₱3,000,000 are subject to a 3% percentage tax on
                    gross receipts. Taxpayers who choose the 8% flat rate are
                    exempt from OPT. Taxpayers who exceed the ₱3M threshold
                    should register for VAT instead.
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

// Shared result column sub-component
interface ResultRow {
  name: string;
  value: string;
  note?: string;
  muted?: boolean;
}

function ResultColumn({
  label,
  rows,
  total,
  note,
  unavailable,
}: {
  label: string;
  rows: ResultRow[];
  total: string;
  note?: string;
  unavailable?: string;
}) {
  return (
    <div className="space-y-3">
      <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">
        {label}
      </p>
      {unavailable ? (
        <p className="text-muted-foreground py-2 text-sm italic">
          {unavailable}
        </p>
      ) : (
        <>
          {rows.map((row) => (
            <div key={row.name}>
              <p className="text-muted-foreground text-[11px]">{row.name}</p>
              <p
                className={`text-sm font-semibold ${row.muted ? "text-muted-foreground" : ""}`}
              >
                {row.note ?? row.value}
              </p>
            </div>
          ))}
          <div className="border-t pt-2">
            <p className="text-muted-foreground text-[11px]">Total Tax</p>
            <p className="text-primary font-bold">{total}</p>
          </div>
          {note && (
            <p className="text-muted-foreground text-[10px] italic">{note}</p>
          )}
        </>
      )}
    </div>
  );
}
