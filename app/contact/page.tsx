import type { Metadata } from "next";
import { ContactSection } from "@/components/sections/contact-section";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the CipTaxPro team. Send us your questions, feedback, or calculator requests.",
};

export default function ContactPage() {
  return (
    <main className="container mx-auto flex flex-col gap-20 p-4 pt-24 lg:gap-36 lg:p-8 lg:pt-40">
      <ContactSection />
    </main>
  );
}
