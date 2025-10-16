import { CalculatorsSection } from "@/components/sections/calculators-section";
import { FaqSection } from "@/components/sections/faq-section";

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
