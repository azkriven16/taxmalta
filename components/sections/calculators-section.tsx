"use client";

import { HoverEffect } from "../ui/card-hover-effect";
import { useCountry } from "@/context/country-context";

export const CalculatorsSection = () => {
  const { country } = useCountry();

  const items = country === "MT" ? maltaCalculators : phCalculators;
  const comingSoonItems = country === "MT" ? maltaComingSoon : phComingSoon;
  const heading =
    country === "MT"
      ? "Malta Tax & Compliance Calculators"
      : "Philippine Tax & Compliance Calculators";

  return (
    <section className="mx-auto max-w-7xl">
      <div>
        <h1 className="text-3xl font-extrabold lg:text-5xl">{heading}</h1>
      </div>
      <div>
        <HoverEffect items={items} />
      </div>
      {comingSoonItems.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-extrabold">COMING SOON:</h2>
          <HoverEffect items={comingSoonItems} />
        </div>
      )}
    </section>
  );
};

const maltaCalculators = [
  {
    title: "Personal Income Tax Calculator Without Children",
    description:
      "Specifically designed for individuals filing under the single tax status. View the exact tax bands and rates that apply to your gross income.",
    link: "/calculators/personal-tax/without-dependants",
    image: "/images/malta/personal-income-tax-calculator-without-children.svg",
  },
  {
    title: "Personal Income Tax Calculator With Children",
    description:
      "Maximize your tax savings using parent-specific rates. Calculate your net income while accounting for the deductions available to parents.",
    link: "/calculators/personal-tax/with-dependants",
    image: "/images/malta/personal-income-tax-calculator-with-children.svg",
  },
  {
    title: "Late Tax Penalty Calculator",
    description:
      "Avoid unnecessary costs by accurately estimating interest and penalties on overdue taxes. Get a clear breakdown based on the latest Maltese tax regulations.",
    link: "/calculators/late-penalty",
    image: "/images/malta/late-tax-penalty-calculator.svg",
  },
  {
    title: "Rental Income Tax Calculator",
    description:
      "Compare the 15% flat rate against progressive tax rates to find the most cost-effective way to declare your rental earnings in Malta.",
    link: "/calculators/rental-income",
    image: "/images/malta/rental-income-tax-calculator.svg",
  },
  {
    title: "Withholding Tax Calculator",
    description:
      "Calculate your withholding tax based on your gross salary and tax status.",
    link: "/calculators/salary-withholding",
    image: "/images/malta/withholding-tax-calculator.svg",
  },
  {
    title: "Notice Period Calculator",
    description:
      "Calculate your required notice period and final working day based on your length of service. Essential for planning your next career move smoothly.",
    link: "/calculators/notice-period",
    image: "/images/malta/notice-period-calculator.svg",
  },
];

const maltaComingSoon = [
  {
    title: "Audit Exemption Calculator",
    description:
      "Check if your company meets the legal thresholds for an audit exemption. Simply enter your turnover, asset value, and employee count.",
    link: "/calculators/audit-exemption",
    image: "/images/malta/audit-exemption-calculator.svg",
    comingSoon: true,
  },
];

const phCalculators = [
  {
    title: "Professional / Single Proprietor Tax Calculator",
    description:
      "Compare your tax obligations under Itemised Deduction, 40% OSD, and the 8% flat rate. Includes One Person Corporation (OPC) comparison. Based on 2026 Philippine tax tables.",
    link: "/calculators/ph-professional-tax",
    image: "/images/ph/professional-tax-calculator.svg",
  },
  {
    title: "SENIOR/PWD Discount Calculator",
    description:
      "Easily check if you're getting the right Senior Citizen or PWD discount. Automatically computes discounts, VAT exemptions, and total payable based on Philippine rules.",
    link: "/calculators/ph-senior-pwd",
    image: "/images/ph/senior-pwd-discount-calculator.svg",
  },
  {
    title: "HDMF/PAGIBIG Home Loan – Applied to Principal Calculator",
    description:
      "See how paying extra monthly towards your principal reduces your loan term and saves interest. Find out how long it takes to pay off your loan, or how much you need to pay to finish by a target date.",
    link: "/calculators/home-loan-principal",
    image: "/images/ph/home-loan-principal-calculator.svg",
  },
  {
    title: "MP2 Investment Calculator",
    description:
      "Project your Modified Pag-IBIG 2 savings over the 5-year maturity period using actual historical dividend rates. Compare Annual Payout vs. Compounded modes to see your total earnings.",
    link: "/calculators/mp2-investment",
    image: "/images/ph/mp2-investment-calculator.svg",
  },
  {
    title: "MP2 Ladder Investment Calculator",
    description:
      "Open up to 5 MP2 accounts, each starting one year apart. See combined projections, per-account maturity dates, and a year-by-year dividend breakdown across your entire ladder.",
    link: "/calculators/mp2-ladder",
    image: "/images/ph/mp2-ladder-investment-calculator.svg",
  },
  {
    title: "BIR Form 2316 Validation Calculator",
    description:
      "Validate the withholding tax on your BIR Form 2316. Compute your correct tax due including de minimis benefits, government contributions, and the ₱90,000 13th month pay ceiling. Check if you were over or underwithheld.",
    link: "/calculators/bir-2316-validation",
    image: "/images/ph/bir-2316-validation-calculator.svg",
  },
];

const phComingSoon = [
  {
    title: "Withholding Tax Validation Calculator",
    description:
      "Compute your per-payslip withholding tax for 2026. Supports Private and Government employees on Weekly, Semi-Monthly, or Monthly payroll. Automatically deducts SSS/GSIS, PhilHealth, and Pag-IBIG contributions.",
    link: "/calculators/ph-withholding-tax",
    image: "/images/ph/withholding-tax-validation-calculator.svg",
    comingSoon: true,
  },
];
