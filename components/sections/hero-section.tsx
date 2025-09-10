import {
  FaBalanceScale,
  FaCalculator,
  FaCoins,
  FaUserCheck,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { HoverEffect } from "../ui/card-hover-effect";
import { Highlighter } from "../ui/highlighter";

const features = [
  {
    icon: <FaBalanceScale className="text-foreground text-2xl" />,
    title: "Malta-Specific Tax Rules",
    description:
      "Accurately calculates taxes based on Malta's latest tax regulations.",
  },
  {
    icon: <FaCalculator className="text-foreground text-2xl" />,
    title: "Instant Results",
    description:
      "Get real-time tax estimates for individuals and businesses in seconds.",
  },
  {
    icon: <FaCoins className="text-foreground text-2xl" />,
    title: "Supports Multiple Income Types",
    description:
      "Handles employment, self-employment, rental, and foreign income with ease.",
  },
  {
    icon: <FaUserCheck className="text-foreground text-2xl" />,
    title: "User-Friendly Interface",
    description:
      "Clean, intuitive design that works for everyone — no tax knowledge required.",
  },
];

export function HeroSection() {
  return (
    <main className="container mx-auto flex flex-col items-center justify-center space-y-20 p-8 pt-24">
      <div className="absolute inset-0 -z-10">
        <div className="relative h-full w-full [&>div]:absolute [&>div]:inset-0 [&>div]:bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] [&>div]:bg-[size:14px_24px]">
          <div></div>
        </div>
      </div>
      <section className="relative md:py-32">
        <div className="container text-center">
          <div className="mx-auto flex max-w-5xl flex-col gap-6">
            <h1 className="text-3xl leading-tight font-extrabold lg:text-6xl">
              <Highlighter
                action="crossed-off"
                padding={4}
                multiline={true}
                color="red"
                className="text-foreground font-extrabold"
              >
                No More
              </Highlighter>{" "}
              Guessing Your Tax 🤔
              <br />— Use Our{" "}
              <Highlighter
                action="underline"
                padding={4}
                multiline={true}
                color="oklch(79.5% 0.184 86.047)"
                className="text-foreground font-extrabold"
              >
                Free Malta Calculator
              </Highlighter>{" "}
            </h1>
            <p className="text-muted-foreground lg:text-lg">
              Instantly calculate your personal income tax in Malta based on the
              latest tax brackets. Whether you&apos;re employed, self-employed,
              or a pensioner, our tool gives you a clear breakdown of what you
              owe.
            </p>
            <p className="text-muted-foreground text-balance lg:text-lg">
              Try our calculators —{" "}
              <span className="text-foreground font-semibold">
                no sign-in required.
              </span>
            </p>
          </div>
          <Button asChild size="lg" className="mt-10">
            <a href="#">Try Now for Free</a>
          </Button>
          <div className="mt-10 grid grid-cols-1 p-2 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === features.length - 1;

              return (
                <div
                  key={idx}
                  className={`bg-secondary border p-6 transition-shadow hover:shadow-md ${isFirst ? "rounded-l-lg" : ""} ${isLast ? "rounded-r-lg" : ""} ${!isFirst && !isLast ? "rounded-none" : ""} border-r-0 last:border-r`}
                >
                  <div className="flex justify-around">
                    <div>{feature.icon}</div>
                    <h3 className="text-md mb-2 font-semibold">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section>
        <div className="text-center text-balance">
          <h1 className="text-3xl font-bold">Top of the UK tax calculators</h1>
          <p className="text-muted-foreground mx-auto mt-5 max-w-2xl">
            Try out the tax calculators that our users can’t get enough of.
            These are the top 3 when it comes to tax calculations made
            super-simple.
          </p>
        </div>
        <div className="mx-auto max-w-5xl md:px-8">
          <HoverEffect items={freeCalculators} />
        </div>
      </section>

      <section>
        <div className="text-center text-balance">
          <h1 className="text-3xl font-bold">But don’t stop there</h1>
          <p className="text-muted-foreground mx-auto mt-5 max-w-2xl">
            We’ve got a bunch more UK tax calculators and tools where those top
            3 came from. Scroll through to see what we have to offer.
          </p>
        </div>
        <div className="mx-auto max-w-5xl md:px-8">
          <HoverEffect items={moreCalculators} />
        </div>
      </section>
    </main>
  );
}

const freeCalculators = [
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
