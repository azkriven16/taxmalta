import type { Metadata } from "next";
import PhWithholdingTaxCalculator from "./_components/ph-withholding-tax-calculator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: "Philippines Withholding Tax Calculator (BIR 2026)",
  description:
    "Compute your per-payslip withholding tax using the 2026 BIR Revised Withholding Tax Table. Supports private and government employees on weekly, semi-monthly, or monthly payroll. Automatically deducts SSS/GSIS, PhilHealth, and Pag-IBIG contributions.",
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
              <BreadcrumbPage>Withholding Tax Validation Calculator</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <PhWithholdingTaxCalculator />
      </section>
    </main>
  );
}
