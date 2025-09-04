import TaxCalculator, { TaxRules } from "@/components/tax-calculator";

const maltaRules: TaxRules = {
  penaltyTiers: {
    thresholds: [1, 6, 12],
    individual: [20, 100, 300],
    company: [50, 300, 800],
  },
  interestPeriods: [
    { start: "2020-01-01", end: "9999-12-31", rate: 0.004 }, // 0.4%/month (example)
  ],
  currencySymbol: "€",
  locale: "en-MT",
};

// Philippines example (illustrative only; replace with real rules)
//  const philRules: TaxRules = {
//    customPenalty: ({ taxpayerType, fyEndDate, filedDate }) => {
//      // e.g. PH: 25% of tax due as surcharge + interest — placeholder
//      const monthsLate = Math.max(0, monthDiff(fyEndDate, filedDate));
//      // dummy formula: 2% per month + flat surcharge
//      const surcharge = taxpayerType === "Company" ? 1000 : 500;
//      const monthPenalty = monthsLate 0.02 1000; // depends on outstanding; adapt as needed
//      return surcharge + monthPenalty;
//    },
//    interestPeriods: [
//      { start: "2000-01-01", end: "9999-12-31", rate: 0.02 }, // placeholder: 2%/month — replace with real
//    ],
//    currencySymbol: "₱",
//    locale: "en-PH",
//  };

export default function Page() {
  return <TaxCalculator rules={maltaRules} defaultValues={{ taxYear: 2024 }} />;
}
