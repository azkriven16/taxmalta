import { CalculatorsSection } from "@/components/sections/calculators-section";
import { FaqSection } from "@/components/sections/faq-section";
import { HeroSection } from "@/components/sections/hero-section";

export default function Page() {
  return (
    <main className="container mx-auto flex flex-col gap-20 p-4 pt-24 lg:gap-36 lg:p-8">
      <HeroSection />
      <CalculatorsSection />
      {/* <FeaturesSection /> */}
      {/* <FaqSection /> */}
      {/* <StatsSection /> */}
    </main>
  );
}
