import { ArrowRight } from "lucide-react";

export const StatsSection = () => {
  return (
    <section className="">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-extrabold lg:text-5xl">
            Malta Tax Calculator Insights
          </h1>
          <p className="text-muted-foreground mt-2 text-xl">
            Accurate, up-to-date tax calculations designed for individuals and
            businesses in Malta.
          </p>
          <a
            href="https://www.maltataxcalc.example"
            className="flex items-center gap-1 text-lg font-bold hover:underline"
          >
            Learn more about Malta’s tax system
            <ArrowRight className="h-auto w-4" />
          </a>
        </div>
        <div className="mt-14 grid gap-x-5 gap-y-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-5">
            <div className="text-6xl font-bold">35%</div>
            <p>Standard corporate tax rate in Malta</p>
          </div>
          <div className="flex flex-col gap-5">
            <div className="text-6xl font-bold">0% - 35%</div>
            <p>Personal income tax range</p>
          </div>
          <div className="flex flex-col gap-5">
            <div className="text-6xl font-bold">6,000+</div>
            <p>Users calculate taxes monthly</p>
          </div>
          <div className="flex flex-col gap-5">
            <div className="text-6xl font-bold">5 mins</div>
            <p>Average time to complete a tax estimate</p>
          </div>
        </div>
      </div>
    </section>
  );
};
