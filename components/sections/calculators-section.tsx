import React from "react";
import { HoverEffect } from "../ui/card-hover-effect";

export const CalculatorsSection = () => {
  return (
    <section className="mx-auto max-w-7xl">
      <div>
        <h1 className="text-3xl font-extrabold lg:text-5xl">
          Most Popular Malta Tax Calculators
        </h1>
        <p className="text-muted-foreground mx-auto mt-5 lg:text-lg">
          Discover the top 3 tax calculators our users rely on the most. Simple,
          accurate, and easy to use — these tools make handling tax in Malta a
          breeze.
        </p>
      </div>
      <div>
        <HoverEffect items={freeCalculators} />
      </div>

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
      </div>
    </section>
  );
};

const freeCalculators = [
  {
    title: "Late Tax Penalty Calculator",
    description:
      "Effortlessly find out how much tax and social security will be deducted from your salary.",
    link: "/calculators/late-tax-penalty-calculator",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
  },
  {
    title: "Notice Period Calculator",
    description:
      "Easily calculate any interest and penalties on overdue income taxes. Our tool gives you a quick, accurate breakdown so you know exactly what you owe to avoid surprises.",
    link: "/calculators/notice-period-calculator",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
  },
  {
    title: "Rental Income Tax Calculator",
    description:
      "Quickly calculate the tax on your rental income under Malta’s latest rules. Our tool compares the best tax treatment to help you choose the most cost-effective option.",
    link: "/calculators/rental-income-tax-calculator",
    image:
      "https://plus.unsplash.com/premium_photo-1661311947753-065ef4af9087?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Audit Exemption Calculator",
    description:
      "Quickly calculate the tax on your rental income under Malta’s latest rules. Our tool compares the best tax treatment to help you choose the most cost-effective option.",
    link: "/calculators/audit-exemption-calculator",
    image:
      "https://plus.unsplash.com/premium_photo-1661311947753-065ef4af9087?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
   {
    title: "Personal Income Tax Calculator",
    description:
      "Quickly calculate the tax on your rental income under Malta’s latest rules. Our tool compares the best tax treatment to help you choose the most cost-effective option.",
    link: "/calculators/personal-tax-calculator",
    image:
      "https://plus.unsplash.com/premium_photo-1661311947753-065ef4af9087?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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
