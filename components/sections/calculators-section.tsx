import React from "react";
import { HoverEffect } from "../ui/card-hover-effect";

export const CalculatorsSection = () => {
  return (
    <section className="mx-auto max-w-7xl">
      <div>
        <h1 className="text-3xl font-extrabold lg:text-5xl">
          Our Malta Tax and Compliance Calculators
        </h1>
      </div>
      <div>
        <HoverEffect items={freeCalculators} />
      </div>
      {/* 
      <div>
        <h1 className="mt-10 text-3xl font-extrabold lg:text-5xl">
          Explore More Tools
        </h1>
        <p className="text-muted-foreground mx-auto mt-5 lg:text-lg">
          There’s plenty more where that came from. Browse our full range of
          Malta tax calculators and tools — designed to help you make smarter
          financial decisions.
        </p>
      </div>
      <div className="mx-auto max-w-7xl">
        <HoverEffect items={moreCalculators} />
      </div> */}
    </section>
  );
};

const freeCalculators = [
  {
    title: "Personal Income Tax (Single)",
    description:
      "Specifically designed for individuals filing under the single tax status. View the exact tax bands and rates that apply to your gross income.",
    link: "/calculators/personal-tax-calculator-without-children",
    image:
      "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Personal Income Tax (Parent)",
    description:
      "Maximize your tax savings using parent-specific rates. Calculate your net income while accounting for the deductions available to parents.",
    link: "/calculators/personal-tax-calculator-with-children",
    image:
      "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Late Tax Penalty Calculator",
    description:
      "Avoid unnecessary costs by accurately estimating interest and penalties on overdue taxes. Get a clear breakdown based on the latest Maltese tax regulations.",
    link: "/calculators/late-tax-penalty-calculator",
    image:
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Rental Income Tax Calculator",
    description:
      "Compare the 15% flat rate against progressive tax rates to find the most cost-effective way to declare your rental earnings in Malta.",
    link: "/calculators/rental-income-tax-calculator",
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Audit Exemption Calculator",
    description:
      "Check if your company meets the legal thresholds for an audit exemption. Simply enter your turnover, asset value, and employee count.",
    link: "/calculators/audit-exemption-calculator",
    image:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Notice Period Calculator",
    description:
      "Calculate your required notice period and final working day based on your length of service. Essential for planning your next career move smoothly.",
    link: "/calculators/notice-period-calculator",
    image:
      "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=800&q=80",
  },
];

const moreCalculators = [
  {
    title: "Corporate Tax Calculator",
    description:
      "Effortlessly find out how much tax and social security will be deducted from your salary.",
    link: "/calculator/late-tax-penalty-calculator",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
  },
  {
    title: "Audit Exemption Calculator",
    description:
      "Effortlessly find out how much tax and social security will be deducted from your salary.",
    link: "#2",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
  },
  {
    title: "Notice Period Calculator",
    description:
      "Effortlessly find out how much tax and social security will be deducted from your salary.",
    link: "#3",
    image:
      "https://plus.unsplash.com/premium_photo-1661311947753-065ef4af9087?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Capital Gains Calculator",
    description:
      "Thinking of selling shares you own in a company? Effortlessly calculate the tax on your capital gains under Malta’s capital gains rules.",
    link: "#4",
    image:
      "https://images.unsplash.com/photo-1561414927-6d86591d0c4f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
  },
  {
    title: "Stamp Duty Calculator",
    description:
      "Thinking of buying shares in a company? Quickly find out how much stamp duty you will have to pay based on the Duty on Documents and Transfers Act.",
    link: "#5",
    image:
      "https://images.unsplash.com/photo-1561414927-6d86591d0c4f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
  },
  {
    title: "Notional Interest Calculator",
    description:
      "Calculate your notional interest deduction under Malta’s tax rules with ease. Our tool helps you determine the allowable deduction on equity contributions allowing you to optimise your tax benefits.",
    link: "#6",
    image:
      "https://plus.unsplash.com/premium_photo-1661311947753-065ef4af9087?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];
