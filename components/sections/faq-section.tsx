import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

const faq = [
  {
    question: "How does the Malta tax calculator work?",
    answer:
      "The Malta tax calculator estimates your income tax based on the latest tax rates, your income, residency status, and any deductions or allowances you’re eligible for.",
  },
  {
    question: "Who can use the Malta tax calculator?",
    answer:
      "The calculator is designed for individuals who are employed, self-employed, or receiving pension income in Malta. Both residents and non-residents can use it for estimation purposes.",
  },
  {
    question: "Does the calculator include Social Security contributions?",
    answer:
      "Yes, the calculator includes Social Security (NI) contributions based on your income and employment status, following Malta’s official contribution rates.",
  },
  {
    question: "Is the tax calculator accurate for 2025?",
    answer:
      "The calculator uses the latest available tax brackets and rates for 2025. However, for official figures or complex tax situations, consult a certified tax advisor.",
  },
  {
    question: "Can the calculator handle multiple income sources?",
    answer:
      "Yes, you can input income from various sources such as salary, freelance work, and rental income. The calculator will estimate your total tax liability accordingly.",
  },
];

export const FaqSection = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="w-full max-w-7xl">
        <h1 className="text-3xl font-extrabold lg:text-5xl">
          Frequently Asked Questions
        </h1>
        <p className="text-muted-foreground mt-2 text-xl">
          Quick answers to common questions about our products and services.
        </p>

        <Accordion
          type="single"
          collapsible
          className="mt-8 space-y-4 sm:mt-10"
          defaultValue="question-0"
        >
          {faq.map(({ question, answer }, index) => (
            <AccordionItem
              key={question}
              value={`question-${index}`}
              className="bg-accent rounded-xl border-none px-4 py-1"
            >
              <AccordionTrigger
                className={cn(
                  "flex flex-1 items-center justify-between pt-4 pb-3 font-semibold tracking-tight transition-all hover:underline [&[data-state=open]>svg]:rotate-45",
                  "text-start text-lg",
                )}
              >
                {question}
              </AccordionTrigger>

              <AccordionContent className="text-muted-foreground text-base">
                {answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};
