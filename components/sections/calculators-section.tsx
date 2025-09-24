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
    title: "Capital Gains Tax Calculator",
    description:
      "Quickly know how much Capital Gains Tax you owe on your profits from property, shares, crypto, and more.",
    link: "/calculators/late-tax-penalty-calculator",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
  },
  {
    title: "National Insurance Calculator",
    description:
      "Quickly calculate how much you owe in National Insurance if you’re earning money from employment or self-employment.",
    link: "/calculators/notice-period-calculator",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
  },
  {
    title: "Employed and Self-Employed Tax Calculator",
    description:
      "Quickly calculate how much Income Tax and National Insurance you owe on your earnings if you’re both employed and self-employed.",
    link: "#3",
    image:
      "https://plus.unsplash.com/premium_photo-1661311947753-065ef4af9087?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

const moreCalculators = [
  {
    title: "Capital Gains Tax Calculator",
    description:
      "Quickly know how much Capital Gains Tax you owe on your profits from property, shares, crypto, and more.",
    link: "/calculator/late-tax-penalty-calculator",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
  },
  {
    title: "National Insurance Calculator",
    description:
      "Quickly calculate how much you owe in National Insurance if you’re earning money from employment or self-employment.",
    link: "#2",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
  },
  {
    title: "Employed and Self-Employed Tax Calculator",
    description:
      "Quickly calculate how much Income Tax and National Insurance you owe on your earnings if you’re both employed and self-employed.",
    link: "#3",
    image:
      "https://plus.unsplash.com/premium_photo-1661311947753-065ef4af9087?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Salary After Tax Calculator",
    description:
      "Quickly calculate your take home pay and know how much you pay in taxes.",
    link: "#4",
    image:
      "https://images.unsplash.com/photo-1561414927-6d86591d0c4f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
  },
  {
    title: "UK Income Tax Calculator",
    description:
      "Quickly calculate how much tax you need to pay on your income.",
    link: "#5",
    image:
      "https://images.unsplash.com/photo-1561414927-6d86591d0c4f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
  },
  {
    title: "Pension Tax Relief Calculator",
    description:
      "Calculate how much tax relief your pension provider should get you and see how much additional tax relief you can claim from HMRC.",
    link: "#6",
    image:
      "https://plus.unsplash.com/premium_photo-1661311947753-065ef4af9087?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    title: "Child Benefit Calculator",
    description:
      "Quickly calculate how much Child Benefit you’re entitled to, how much you can receive, and if you need to pay any of it back as tax.",
    link: "#7",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
  },
  {
    title: "Late Tax Return Penalty Calculator",
    description:
      "Still haven’t submitted your Self Assessment tax return? Quickly calculate how much you can expect to pay in late penalties and interest.",
    link: "#8",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
  },
];
