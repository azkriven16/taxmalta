import type { Metadata } from "next";
import Mp2LadderCalculator from "./_components/mp2-ladder-calculator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const metadata: Metadata = {
  title: "Pag-IBIG MP2 Ladder Investment Calculator (Philippines)",
  description:
    "Plan up to 5 staggered MP2 accounts, each starting one year apart. See compounded dividends per account, combined projections, and a year-by-year income breakdown over each 5-year maturity.",
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
              <BreadcrumbPage>MP2 Ladder Investment Calculator</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Mp2LadderCalculator />
      </section>
    </main>
  );
}
