import type { Metadata } from "next";
import { CalculatorsSection } from "@/components/sections/calculators-section";

export const metadata: Metadata = {
  title: "Tax & Compliance Calculators",
  description:
    "Free in-browser tax and compliance calculators for Malta and the Philippines. Instantly calculate personal income tax, rental earnings, audit exemptions, late penalties, MP2 savings, and more.",
};

export default function CalculatorsPage() {
  return (
    <main className="container mx-auto flex flex-col gap-20 p-4 pt-24 lg:gap-36 lg:p-8 lg:pt-40">
      <CalculatorsSection />
    </main>
  );
}
