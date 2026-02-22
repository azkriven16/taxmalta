import {
  FaBalanceScale,
  FaCalculator,
  FaCoins,
  FaUserCheck,
} from "react-icons/fa";
import { Highlighter } from "../ui/highlighter";
import { ShimmerButton } from "../ui/shimmer-button";
import { TextEffect } from "../ui/text-effect";

export function HeroSection() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center">
      {/* background grid */}
      <div className="absolute inset-0 -z-10">
        {/* Grid background */}
        <div className="relative h-full w-full [&>div]:absolute [&>div]:inset-0 [&>div]:bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] [&>div]:bg-[size:24px_24px]">
          <div></div>
        </div>

        {/* Top gradient overlay */}
        <div className="from-background pointer-events-none absolute top-0 right-0 left-0 h-[33%] bg-gradient-to-b to-transparent" />

        {/* Bottom gradient overlay */}
        <div className="from-background pointer-events-none absolute right-0 bottom-0 left-0 h-[33%] bg-gradient-to-t to-transparent" />
      </div>
      {/* main section */}
      <section className="relative md:pt-32">
        <div className="container text-center">
          <div className="mx-auto flex max-w-5xl flex-col gap-6">
            {/* h1 */}
            <div className="text-3xl leading-tight font-extrabold lg:text-6xl">
              <TextEffect
                per="word"
                as="h1"
                preset="slide"
                className="inline-block"
                delay={0.25}
              >
                🤔 Know Your Numbers
              </TextEffect>
              <br />
              <TextEffect
                per="word"
                as="h1"
                preset="slide"
                className="inline-block"
                delay={0.5}
              >
                — Calculate
              </TextEffect>{" "}
              <Highlighter
                action="underline"
                padding={4}
                multiline={true}
                color="oklch(79.5% 0.184 86.047)"
                className="text-foreground font-extrabold"
                animationDuration={2000}
              >
                <TextEffect
                  per="word"
                  as="h1"
                  preset="slide"
                  className="inline-block"
                  delay={0.75}
                >
                  Instantly!
                </TextEffect>
              </Highlighter>{" "}
            </div>
            <TextEffect
              per="word"
              preset="blur"
              speedReveal={4}
              speedSegment={5}
              as="p"
              className="text-muted-foreground lg:text-lg"
            >
              Instant, reliable estimates for your Malta tax, audit, and other
              compliance obligations — all in a few clicks.
            </TextEffect>

            <p className="text-muted-foreground text-balance lg:text-lg">
              Try our calculators —{" "}
              <span className="text-foreground font-semibold lg:text-lg">
                no sign-in required.
              </span>
            </p>
          </div>

          <ShimmerButton className="mx-auto mt-10 shadow-2xl dark:invert">
            <span className="text-center text-sm leading-none font-medium tracking-tight whitespace-pre-wrap text-white lg:text-lg dark:from-white dark:to-slate-900/10">
              Try Now for Free
            </span>
          </ShimmerButton>
          <div className="mt-10 grid max-w-7xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, idx) => {
              return (
                <div
                  key={idx}
                  className={`bg-secondary border border-r-0 p-6 transition-shadow last:border-r hover:shadow-md`}
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
    </div>
  );
}

const features = [
  {
    icon: <FaBalanceScale className="text-2xl text-green-400" />,
    title: "Malta-Specific Tax Rules",
    description:
      "Accurately calculates taxes based on Malta's latest tax regulations.",
  },
  {
    icon: <FaCalculator className="text-2xl text-blue-400" />,
    title: "Instant Results",
    description:
      "Get real-time tax estimates for individuals and businesses in seconds.",
  },
  {
    icon: <FaCoins className="text-2xl text-yellow-400" />,
    title: "Supports Multiple Tax Scenarios",
    description:
      "Handles employment, corporate tax, rental, tax interest and penalties with ease.",
  },
  {
    icon: <FaUserCheck className="text-2xl text-purple-400" />,
    title: "Complete Data Privacy",
    description:
      "Your data never leaves your device. All calculations are processed inbrowser, and no personal data is saved, shared, or transmitted.",
  },
];
