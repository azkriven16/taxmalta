import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { Metadata } from "next";
import WithholdingTaxCalculator from "./_components/salary-withholding-tax-validation-calculator";

export const metadata: Metadata = {
  title: "Malta Salary Withholding Tax Calculator",
  description:
    "Calculate the tax withheld from your Malta employment income. Verify your employer's withholding is correct and see a full breakdown based on your gross salary and applicable tax band.",
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
              <BreadcrumbPage>Withholding Tax Calculator</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <WithholdingTaxCalculator />
      </section>
    </main>
  );
}
