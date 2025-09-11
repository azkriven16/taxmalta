import { CalculatorsSection } from "@/components/sections/calculators-section";
import { FaqSection } from "@/components/sections/faq-section";
import { FeaturesSection } from "@/components/sections/how-to-use-section";
import { StatsSection } from "@/components/sections/stats-section";

export default function CalculatorsPage() {
  return (
    <main className="container mx-auto flex flex-col gap-20 p-4 pt-24 lg:gap-36 lg:p-8 lg:pt-40">
      <CalculatorsSection />
      <FeaturesSection />
      <FaqSection />
      <StatsSection />
    </main>
  );
}
