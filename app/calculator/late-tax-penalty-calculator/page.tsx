"use client";
import LateTaxPenaltyCalc from "@/components/calculators/penalties-and-interests-calculator";

export default function Page() {
  return (
    <main className="container mx-auto flex flex-col items-center justify-center space-y-20 p-8 pt-24">
      <LateTaxPenaltyCalc />;
    </main>
  );
}
// Late tax return penalty and interest calculator
