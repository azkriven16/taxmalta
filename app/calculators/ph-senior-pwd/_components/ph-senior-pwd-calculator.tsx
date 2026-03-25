"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Info } from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────

function formatPHP(value: number): string {
  return value.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function peso(value: number) {
  return `₱ ${formatPHP(value)}`;
}

// ─── Types ────────────────────────────────────────────────────────────────

type TabMode = "scpwd" | "bnpc";
type VatStatus = "vat" | "nonvat";
type GroupMode = "individual" | "group";

// ─── Sub-components ───────────────────────────────────────────────────────

function ResultRow({
  label,
  value,
  bold = false,
  highlight = false,
  green = false,
  muted = false,
  indent = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
  highlight?: boolean;
  green?: boolean;
  muted?: boolean;
  indent?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between py-2.5 ${indent ? "pl-4" : ""}`}
    >
      <span
        className={`text-sm ${
          muted
            ? "text-muted-foreground"
            : bold
              ? "font-semibold text-foreground"
              : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
      <span
        className={`tabular-nums text-sm ${bold ? "font-semibold" : ""} ${
          highlight ? "text-primary text-base font-bold" : ""
        } ${green ? "font-bold text-green-600" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────

export default function PhSeniorPwdCalculator() {
  const [activeTab, setActiveTab] = useState<TabMode>("scpwd");

  // SC/PWD inputs
  const [gross, setGross] = useState<string>("");
  const [vatStatus, setVatStatus] = useState<VatStatus>("vat");
  const [groupMode, setGroupMode] = useState<GroupMode>("individual");
  const [totalPax, setTotalPax] = useState<string>("5");
  const [scPwdCount, setScPwdCount] = useState<string>("1");
  const [promoPct, setPromoPct] = useState<string>("");
  const [eligible20, setEligible20] = useState<"yes" | "no">("yes");

  // BNPC inputs
  const [bnpcAmount, setBnpcAmount] = useState<string>("");
  const [bnpcCap, setBnpcCap] = useState<string>("2500");

  // ── SC/PWD Calculation ──────────────────────────────────────────────────

  const scPwdResult = useMemo(() => {
    const grossVal = parseFloat(gross) || 0;
    if (grossVal <= 0) return null;

    const vatRegistered = vatStatus === "vat";
    const isGroup = groupMode === "group";
    const pax = parseInt(totalPax) || 0;
    const benefCount = parseInt(scPwdCount) || 0;
    const promo = parseFloat(promoPct) || 0;
    const isEligible = eligible20 === "yes";

    if (isGroup && (pax < 1 || benefCount < 0 || benefCount > pax)) {
      return { error: "SC/PWD count cannot exceed total people in group." };
    }

    // Step 1: Remove VAT
    const base = vatRegistered ? grossVal / 1.12 : grossVal;
    const vatAmount = grossVal - base;

    // Step 2: Proportional share (group mode)
    const scShareBase =
      isGroup && pax > 0 && benefCount > 0 ? base * (benefCount / pax) : base;

    // Step 3: 20% SC/PWD discount
    const scDiscount = isEligible ? scShareBase * 0.2 : 0;

    // Step 4: Promo comparison — use whichever is higher, not both
    const promoBase = vatRegistered ? grossVal / 1.12 : grossVal;
    const promoComparable =
      isGroup && pax > 0
        ? promoBase * (promo / 100) * (benefCount / pax)
        : promoBase * (promo / 100);

    const usePromo = promo > 0 && promoComparable > scDiscount;
    const discountApplied = usePromo ? promoComparable : scDiscount;
    const discountLabel = usePromo
      ? `Promo (${promo.toFixed(2)}%)`
      : "SC/PWD (20%)";

    // Step 5: Final amount
    const scNet = Math.max(scShareBase - discountApplied, 0);
    const effectiveSavingsPct =
      grossVal > 0 ? ((grossVal - scNet) / grossVal) * 100 : 0;

    return {
      grossVal,
      vatRegistered,
      isGroup,
      pax,
      benefCount,
      base,
      vatAmount,
      scShareBase,
      scDiscount,
      promo,
      promoComparable,
      usePromo,
      discountApplied,
      discountLabel,
      isEligible,
      scNet,
      effectiveSavingsPct,
      error: null,
    };
  }, [gross, vatStatus, groupMode, totalPax, scPwdCount, promoPct, eligible20]);

  // ── BNPC Calculation ────────────────────────────────────────────────────

  const bnpcResult = useMemo(() => {
    const amt = parseFloat(bnpcAmount) || 0;
    const cap = parseFloat(bnpcCap) || 0;
    if (amt <= 0) return null;

    const eligible = Math.min(amt, Math.max(cap, 0));
    const discount = eligible * 0.05;
    const net = amt - discount;
    const newCap = Math.max(cap - eligible, 0);

    return { amt, cap, eligible, discount, net, newCap };
  }, [bnpcAmount, bnpcCap]);

  const hasScPwdInput = (parseFloat(gross) || 0) > 0;
  const hasError =
    scPwdResult && "error" in scPwdResult && scPwdResult.error != null;
  const validScPwdResult =
    scPwdResult && !hasError && scPwdResult.error === null ? scPwdResult : null;

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <Badge variant="secondary">Philippines — Senior Citizen / PWD</Badge>
          <h1 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">
            SENIOR/PWD Discount Calculator
          </h1>
          <p className="text-muted-foreground leading-relaxed text-pretty">
            Check if you&apos;re getting the right Senior Citizen or PWD discount.
            Automatically computes discounts, VAT exemptions, and total payable
            based on Philippine rules.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeTab === "scpwd" ? "default" : "outline"}
            onClick={() => setActiveTab("scpwd")}
          >
            20% + VAT-Exempt (SC/PWD)
          </Button>
          <Button
            variant={activeTab === "bnpc" ? "default" : "outline"}
            onClick={() => setActiveTab("bnpc")}
          >
            5% BNPC Special Discount
          </Button>
        </div>

        {/* ── SC/PWD Tab ─────────────────────────────────────────────────── */}
        {activeTab === "scpwd" && (
          <>
            <Card className="shadow-sm">
              <CardHeader className="border-b">
                <CardTitle className="text-lg font-semibold">
                  SC / PWD Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-5">
                {/* Row 1: Amount + VAT status */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium leading-none">
                      Total amount on receipt (₱)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="e.g. 1,000.00"
                      value={gross}
                      onChange={(e) => setGross(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium leading-none">
                      Establishment VAT status
                    </label>
                    <Select
                      value={vatStatus}
                      onValueChange={(v) => setVatStatus(v as VatStatus)}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vat">
                          VAT-registered (12%)
                        </SelectItem>
                        <SelectItem value="nonvat">Non-VAT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Row 2: Mode + optional group fields */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium leading-none">
                      Mode
                    </label>
                    <Select
                      value={groupMode}
                      onValueChange={(v) => setGroupMode(v as GroupMode)}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="group">
                          Group (proportional)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {groupMode === "group" && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium leading-none">
                          Total people in group
                        </label>
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          placeholder="e.g. 5"
                          value={totalPax}
                          onChange={(e) => setTotalPax(e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium leading-none">
                          # of SC/PWD in group
                        </label>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          placeholder="e.g. 1"
                          value={scPwdCount}
                          onChange={(e) => setScPwdCount(e.target.value)}
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Row 3: Promo + Eligible */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium leading-none">
                      Establishment promo discount (% if any)
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="0"
                        value={promoPct}
                        onChange={(e) => setPromoPct(e.target.value)}
                        className="pr-6"
                      />
                      <span className="text-muted-foreground absolute top-1/2 right-2.5 -translate-y-1/2 text-sm">
                        %
                      </span>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      The higher of promo vs. SC/PWD discount is applied — not
                      both.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium leading-none">
                      Items eligible for 20% SC/PWD discount?
                    </label>
                    <Select
                      value={eligible20}
                      onValueChange={(v) =>
                        setEligible20(v as "yes" | "no")
                      }
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">
                          Yes — covered goods/services
                        </SelectItem>
                        <SelectItem value="no">
                          No — 20% does not apply
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Validation error */}
            {hasScPwdInput && hasError && (
              <Card className="border-destructive/20 shadow-sm">
                <CardContent className="flex items-center gap-3 py-4">
                  <AlertCircle className="text-destructive h-4 w-4 shrink-0" />
                  <p className="text-destructive text-sm">
                    {(scPwdResult as { error: string }).error}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* SC/PWD Results */}
            {validScPwdResult && (
              <div className="grid gap-6 lg:grid-cols-5">
                {/* Left: Summary card */}
                <div className="space-y-5 lg:col-span-2">
                  <Card className="shadow-sm">
                    <CardHeader className="border-b">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold">
                          Amount Due
                        </CardTitle>
                        <Badge
                          variant={
                            validScPwdResult.vatRegistered
                              ? "default"
                              : "outline"
                          }
                        >
                          {validScPwdResult.vatRegistered
                            ? "VAT-registered"
                            : "Non-VAT"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="divide-y pt-2">
                      <ResultRow
                        label="Original receipt amount"
                        value={peso(validScPwdResult.grossVal)}
                      />
                      {validScPwdResult.vatRegistered && (
                        <ResultRow
                          label="VAT removed (÷ 1.12)"
                          value={`− ${peso(validScPwdResult.vatAmount)}`}
                          muted
                        />
                      )}
                      <ResultRow
                        label="VAT-exclusive base"
                        value={peso(validScPwdResult.base)}
                        bold
                      />
                      {validScPwdResult.isGroup && (
                        <ResultRow
                          label={`SC/PWD share (${validScPwdResult.benefCount}/${validScPwdResult.pax})`}
                          value={peso(validScPwdResult.scShareBase)}
                          indent
                          muted
                        />
                      )}
                      {!validScPwdResult.isEligible ? (
                        <ResultRow
                          label="20% SC/PWD discount"
                          value="Not applicable"
                          muted
                        />
                      ) : (
                        <ResultRow
                          label="20% SC/PWD discount"
                          value={peso(validScPwdResult.scDiscount)}
                          muted
                        />
                      )}
                      {validScPwdResult.promo > 0 && (
                        <ResultRow
                          label={`Promo (${validScPwdResult.promo.toFixed(2)}%) — comparable`}
                          value={peso(validScPwdResult.promoComparable)}
                          muted
                        />
                      )}
                      <ResultRow
                        label={`Applied (${validScPwdResult.discountLabel})`}
                        value={`− ${peso(validScPwdResult.discountApplied)}`}
                        green
                        bold
                      />
                      <ResultRow
                        label="Amount due for SC/PWD"
                        value={peso(validScPwdResult.scNet)}
                        highlight
                        bold
                      />
                      <ResultRow
                        label="Effective savings vs receipt"
                        value={`${validScPwdResult.effectiveSavingsPct.toFixed(2)}%`}
                        bold
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Right: Step-by-step breakdown */}
                <div className="space-y-5 lg:col-span-3">
                  <Card className="shadow-sm">
                    <CardHeader className="border-b">
                      <CardTitle className="text-lg font-semibold">
                        Computation Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <table className="w-full text-sm">
                        <tbody className="divide-y">
                          <tr>
                            <td className="text-muted-foreground py-2.5 pr-4">
                              Gross amount on receipt
                            </td>
                            <td className="py-2.5 text-right tabular-nums font-medium">
                              {peso(validScPwdResult.grossVal)}
                            </td>
                          </tr>
                          {validScPwdResult.vatRegistered && (
                            <>
                              <tr>
                                <td className="text-muted-foreground py-2.5 pr-4">
                                  ÷ 1.12 — remove 12% VAT
                                </td>
                                <td className="py-2.5 text-right tabular-nums">
                                  {peso(validScPwdResult.base)}
                                </td>
                              </tr>
                              <tr>
                                <td className="text-muted-foreground py-2.5 pr-4">
                                  VAT component (gross − base)
                                </td>
                                <td className="py-2.5 text-right tabular-nums text-red-500">
                                  − {peso(validScPwdResult.vatAmount)}
                                </td>
                              </tr>
                            </>
                          )}
                          {validScPwdResult.isGroup && (
                            <tr>
                              <td className="text-muted-foreground py-2.5 pr-4">
                                SC/PWD share ({validScPwdResult.benefCount}/
                                {validScPwdResult.pax} × base)
                              </td>
                              <td className="py-2.5 text-right tabular-nums">
                                {peso(validScPwdResult.scShareBase)}
                              </td>
                            </tr>
                          )}
                          <tr>
                            <td className="text-muted-foreground py-2.5 pr-4">
                              × 20% SC/PWD discount
                            </td>
                            <td className="py-2.5 text-right tabular-nums">
                              {validScPwdResult.isEligible
                                ? `− ${peso(validScPwdResult.scDiscount)}`
                                : "N/A"}
                            </td>
                          </tr>
                          {validScPwdResult.promo > 0 && (
                            <tr>
                              <td className="text-muted-foreground py-2.5 pr-4">
                                Promo ({validScPwdResult.promo.toFixed(2)}%)
                                — comparable
                              </td>
                              <td className="py-2.5 text-right tabular-nums">
                                − {peso(validScPwdResult.promoComparable)}
                              </td>
                            </tr>
                          )}
                          <tr className="border-t-2">
                            <td className="text-foreground py-2.5 pr-4 font-semibold">
                              Discount applied ({validScPwdResult.discountLabel})
                            </td>
                            <td className="py-2.5 text-right tabular-nums font-semibold text-green-600">
                              − {peso(validScPwdResult.discountApplied)}
                            </td>
                          </tr>
                          <tr className="bg-muted/30">
                            <td className="text-foreground py-2.5 pr-4 font-semibold">
                              Amount due for SC/PWD
                            </td>
                            <td className="text-primary py-2.5 text-right tabular-nums font-bold">
                              {peso(validScPwdResult.scNet)}
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {validScPwdResult.isGroup && (
                        <p className="text-muted-foreground mt-3 text-xs">
                          Group mode: The VAT-exclusive base is allocated
                          proportionally to the SC/PWD share before applying
                          the discount. Other members settle the remaining
                          balance at the standard rate. (Ref: RMC 38-2012)
                        </p>
                      )}
                      {validScPwdResult.promo > 0 &&
                        validScPwdResult.usePromo && (
                          <p className="mt-2 text-xs text-amber-600 dark:text-amber-500">
                            ⚠ The promo discount is higher than the 20% SC/PWD
                            discount. Only the more favourable discount applies
                            — not both.
                          </p>
                        )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── BNPC Tab ────────────────────────────────────────────────────── */}
        {activeTab === "bnpc" && (
          <>
            <Card className="shadow-sm">
              <CardHeader className="border-b">
                <CardTitle className="text-lg font-semibold">
                  BNPC Purchase Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium leading-none">
                      BNPC purchase amount (₱)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="e.g. 2,000.00"
                      value={bnpcAmount}
                      onChange={(e) => setBnpcAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium leading-none">
                      Remaining weekly cap (₱)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={bnpcCap}
                      onChange={(e) => setBnpcCap(e.target.value)}
                    />
                    <p className="text-muted-foreground text-xs">
                      Weekly cap is ₱ 2,500 per SC/PWD. Adjust if you&apos;ve
                      already made BNPC purchases this week.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {bnpcResult && (
              <div className="grid gap-6 lg:grid-cols-5">
                {/* Left: Summary */}
                <div className="space-y-5 lg:col-span-2">
                  <Card className="shadow-sm">
                    <CardHeader className="border-b">
                      <CardTitle className="text-lg font-semibold">
                        Amount Due
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="divide-y pt-2">
                      <ResultRow
                        label="BNPC purchase amount"
                        value={peso(bnpcResult.amt)}
                      />
                      <ResultRow
                        label="Eligible for 5% (cap-limited)"
                        value={peso(bnpcResult.eligible)}
                        muted
                      />
                      <ResultRow
                        label="5% special discount"
                        value={`− ${peso(bnpcResult.discount)}`}
                        green
                        bold
                      />
                      <ResultRow
                        label="Amount due"
                        value={peso(bnpcResult.net)}
                        highlight
                        bold
                      />
                      <ResultRow
                        label="Cap remaining after purchase"
                        value={peso(bnpcResult.newCap)}
                        muted
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Right: Breakdown */}
                <div className="space-y-5 lg:col-span-3">
                  <Card className="shadow-sm">
                    <CardHeader className="border-b">
                      <CardTitle className="text-lg font-semibold">
                        Computation Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <table className="w-full text-sm">
                        <tbody className="divide-y">
                          <tr>
                            <td className="text-muted-foreground py-2.5 pr-4">
                              Purchase amount
                            </td>
                            <td className="py-2.5 text-right tabular-nums font-medium">
                              {peso(bnpcResult.amt)}
                            </td>
                          </tr>
                          <tr>
                            <td className="text-muted-foreground py-2.5 pr-4">
                              Remaining weekly cap
                            </td>
                            <td className="py-2.5 text-right tabular-nums">
                              {peso(bnpcResult.cap)}
                            </td>
                          </tr>
                          <tr>
                            <td className="text-muted-foreground py-2.5 pr-4">
                              Eligible amount (min of above)
                            </td>
                            <td className="py-2.5 text-right tabular-nums">
                              {peso(bnpcResult.eligible)}
                            </td>
                          </tr>
                          <tr>
                            <td className="text-muted-foreground py-2.5 pr-4">
                              × 5% discount
                            </td>
                            <td className="py-2.5 text-right tabular-nums text-green-600">
                              − {peso(bnpcResult.discount)}
                            </td>
                          </tr>
                          <tr className="border-t-2">
                            <td className="text-foreground py-2.5 pr-4 font-semibold">
                              Amount due
                            </td>
                            <td className="text-primary py-2.5 text-right tabular-nums font-bold">
                              {peso(bnpcResult.net)}
                            </td>
                          </tr>
                          <tr>
                            <td className="text-muted-foreground py-2.5 pr-4">
                              Cap remaining after this purchase
                            </td>
                            <td className="py-2.5 text-right tabular-nums">
                              {peso(bnpcResult.newCap)}
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {bnpcResult.eligible < bnpcResult.amt && (
                        <p className="mt-3 text-xs text-amber-600 dark:text-amber-500">
                          ⚠ Purchase exceeds your remaining weekly cap of{" "}
                          {peso(bnpcResult.cap)}. Only {peso(bnpcResult.eligible)}{" "}
                          qualifies for the 5% discount.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </>
        )}

        {/* Legal References */}
        <Card className="shadow-sm">
          <CardHeader className="border-b">
            <div className="flex items-center gap-2">
              <Info className="text-muted-foreground h-4 w-4" />
              <CardTitle className="text-base font-semibold">
                How It&apos;s Computed
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-4 text-sm text-muted-foreground">
            <div>
              <p className="text-foreground mb-1 font-medium">
                SC/PWD 20% + VAT-exempt
              </p>
              <p>
                If the seller is VAT-registered, VAT is removed first (gross ÷
                1.12), then the 20% discount is applied on the VAT-exclusive
                amount. For non-VAT establishments, 20% applies directly to the
                price. PWD rules mirror Senior Citizen rules for covered items.
              </p>
              <p className="mt-1 text-xs">
                Legal refs: BIR RR 7-2010; RMC 38-2012 (Q&A); RR 5-2017 for
                PWD.
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-foreground mb-1 font-medium">Group bills</p>
              <p>
                When items aren&apos;t individualised, BIR allows proportional
                allocation of the VAT-exclusive base to the SC/PWD share before
                applying the 20% discount.
              </p>
              <p className="mt-1 text-xs">Ref: RMC 38-2012.</p>
            </div>
            <Separator />
            <div>
              <p className="text-foreground mb-1 font-medium">
                BNPC 5% special discount
              </p>
              <p>
                A separate rule for basic necessities and prime commodities,
                capped at ₱ 2,500 per calendar week. No VAT exemption applies
                under this rule.
              </p>
              <p className="mt-1 text-xs">Ref: DTI-DA-DOE JAO 24-02 (2024).</p>
            </div>
            <Separator />
            <div className="bg-muted/40 rounded-md p-3 text-xs">
              <strong>Classic example:</strong> ₱ 1,000 restaurant bill
              (VAT-registered) → base = 1,000 ÷ 1.12 ={" "}
              <strong>₱ 892.86</strong>; 20% = 178.57; net ={" "}
              <strong>₱ 714.29</strong>.
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <AlertCircle className="h-3 w-3 shrink-0" />
          For illustrative purposes only. Always verify with the latest BIR and
          DTI issuances. Discounts apply only to covered goods and services as
          defined by law.
        </p>
      </div>
    </div>
  );
}
