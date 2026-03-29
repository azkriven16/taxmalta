import type { Metadata } from "next";
import Bir2316ValidationCalculator from "./_components/bir-2316-validation-calculator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: "Philippines BIR Form 2316 Withholding Tax Validator",
  description:
    "Verify the annual withholding tax on your BIR Form 2316. Computes correct tax due using the 2025 Revised Withholding Tax Table, including de minimis benefits, government contributions, and the ₱90,000 13th month pay ceiling.",
};

export default function Page() {
  return (
    <main className="container mx-auto flex flex-col gap-20 p-4 pt-24 lg:gap-36 lg:p-8 lg:pt-40">
      <section className="mx-auto w-full max-w-7xl">
        <Breadcrumb className="mb-5">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/calculators">Calculators</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>BIR Form 2316 Validation</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Bir2316ValidationCalculator />
      </section>
    </main>
  );
}
