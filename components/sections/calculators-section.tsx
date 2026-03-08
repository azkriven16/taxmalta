"use client";

import { HoverEffect } from "../ui/card-hover-effect";
import { useCountry } from "@/context/country-context";

export const CalculatorsSection = () => {
  const { country } = useCountry();

  const items = country === "MT" ? maltaCalculators : phCalculators;
  const heading =
    country === "MT"
      ? "Malta Tax & Compliance Calculators"
      : "Philippine Tax Calculators";

  return (
    <section className="mx-auto max-w-7xl">
      <div>
        <h1 className="text-3xl font-extrabold lg:text-5xl">{heading}</h1>
      </div>
      <div>
        <HoverEffect items={items} />
      </div>
    </section>
  );
};

const maltaCalculators = [
  {
    title: "Personal Income Tax Calculator Without Children",
    description:
      "Specifically designed for individuals filing under the single tax status. View the exact tax bands and rates that apply to your gross income.",
    link: "/calculators/personal-tax/without-dependants",
    image: "/images/personal-income-tax-calculator-without-children.svg",
  },
  {
    title: "Personal Income Tax Calculator With Children",
    description:
      "Maximize your tax savings using parent-specific rates. Calculate your net income while accounting for the deductions available to parents.",
    link: "/calculators/personal-tax/with-dependants",
    image: "/images/personal-income-tax-calculator-with-children.svg",
  },
  {
    title: "Late Tax Penalty Calculator",
    description:
      "Avoid unnecessary costs by accurately estimating interest and penalties on overdue taxes. Get a clear breakdown based on the latest Maltese tax regulations.",
    link: "/calculators/late-penalty",
    image: "/images/late-tax-penalty-calculator.svg",
  },
  {
    title: "Rental Income Tax Calculator",
    description:
      "Compare the 15% flat rate against progressive tax rates to find the most cost-effective way to declare your rental earnings in Malta.",
    link: "/calculators/rental-income",
    image: "/images/rental-income-tax-calculator.svg",
  },
  {
    title: "Audit Exemption Calculator",
    description:
      "Check if your company meets the legal thresholds for an audit exemption. Simply enter your turnover, asset value, and employee count.",
    link: "/calculators/audit-exemption",
    image: "/images/audit-exemption-calculator.svg",
  },
  {
    title: "Notice Period Calculator",
    description:
      "Calculate your required notice period and final working day based on your length of service. Essential for planning your next career move smoothly.",
    link: "/calculators/notice-period",
    image: "/images/notice-period-calculator.svg",
  },
  {
    title: "Withholding Tax Calculator",
    description:
      "Calculate your withholding tax based on your gross salary and tax status.",
    link: "/calculators/salary-withholding",
    image: "/images/withholding-tax-calculator.svg",
  },
];

const phCalculators = [
  {
    title: "Professional / Single Proprietor Tax Calculator",
    description:
      "Compare your tax obligations under Itemised Deduction, 40% OSD, and the 8% flat rate. Includes One Person Corporation (OPC) comparison. Based on 2026 Philippine tax tables.",
    link: "/calculators/ph-professional-tax",
    image: "/images/ph-professional-tax-calculator.svg",
  },
];
