import { maltaRules } from "@/config/maltaRules";
import { differenceInMonths } from "date-fns";

export function calculatePenalty(
  taxpayerType: "Corporate" | "Individual",
  dueDate: Date,
  submissionDate: Date
) {
  const monthsLate = Math.max(differenceInMonths(submissionDate, dueDate), 0);
  const tiers = maltaRules.penaltyTiers[taxpayerType];
  const tier = tiers.find((t) => monthsLate <= t.maxMonths);
  return tier ? tier.amount : 0;
}

export function calculateInterest(
  taxDue: number,
  dueDate: Date,
  paymentDate: Date
) {
  const monthsLate = Math.max(differenceInMonths(paymentDate, dueDate), 0);
  return taxDue * maltaRules.interestRate * monthsLate;
}
