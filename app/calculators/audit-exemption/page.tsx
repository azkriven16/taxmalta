import type { Metadata } from "next";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import AuditExemptionCalculator from "./_components/audit-exemption-calculator";

export const metadata: Metadata = {
  title: "Malta Audit Exemption Eligibility Calculator",
  description:
    "Instantly check whether your Malta company qualifies for an audit exemption under the Companies Act. Enter your turnover, total assets, and employee count to verify eligibility against the official thresholds.",
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
              <BreadcrumbPage>Audit Exemption Calculator</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <AuditExemptionCalculator />
      </section>
    </main>
  );
}
