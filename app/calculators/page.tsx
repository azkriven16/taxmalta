import type { Metadata } from "next";
import { CalculatorsSection } from "@/components/sections/calculators-section";
import { FaqSection } from "@/components/sections/faq-section";

export const metadata: Metadata = {
  title: "Malta Tax & Compliance Calculators",
  description:
    "Explore our full suite of free Malta tax and compliance calculators. Instantly calculate personal income tax, rental earnings, audit exemptions, late penalties, and notice periods.",
};

export default function CalculatorsPage() {
  return (
    <main className="container mx-auto flex flex-col gap-20 p-4 pt-24 lg:gap-36 lg:p-8 lg:pt-40">
      <CalculatorsSection />
      <FaqSection />
      {/* <FeaturesSection />
      <StatsSection /> */}
    </main>
  );
}
