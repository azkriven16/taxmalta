import type { Metadata } from "next";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import ParentTaxCalc from "./_components/personal-tax-calculator";

export const metadata: Metadata = {
  title: "Malta Personal Tax Calculator — Parent Rates",
  description:
    "Estimate your Malta income tax using the parent tax rates for married couples with dependants. Includes a full tax band breakdown and net income calculation.",
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
              <BreadcrumbPage>
                Personal Income Tax Calculator with Children
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <ParentTaxCalc />
      </section>
    </main>
  );
}
