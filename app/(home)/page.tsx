import type { Metadata } from "next";
import { CalculatorsSection } from "@/components/sections/calculators-section";
import { ContactSection } from "@/components/sections/contact-section";
import { HeroSection } from "@/components/sections/hero-section";

export const metadata: Metadata = {
  title: "Free Tax & Compliance Calculators",
  description:
    "Instant, reliable estimates for your Malta personal income tax, rental earnings, late penalties, and audit exemptions. 100% private, in-browser calculations with no sign-in required.",
};

export default function Page() {
  return (
    <main className="container mx-auto flex flex-col gap-20 p-4 pt-24 lg:gap-36 lg:p-8">
      <HeroSection />
      <CalculatorsSection />
      <ContactSection />
    </main>
  );
}
