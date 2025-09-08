export const maltaRules = {
  penaltyTiers: {
    Corporate: [
      { maxMonths: 6, amount: 50 },
      { maxMonths: 12, amount: 200 },
      { maxMonths: 18, amount: 400 },
      { maxMonths: 24, amount: 600 },
      { maxMonths: 36, amount: 800 },
      { maxMonths: 48, amount: 1000 },
      { maxMonths: 60, amount: 1200 },
      { maxMonths: Infinity, amount: 1500 },
    ],
    Individual: [
      { maxMonths: 6, amount: 10 },
      { maxMonths: 12, amount: 50 },
      { maxMonths: 18, amount: 100 },
      { maxMonths: 24, amount: 150 },
      { maxMonths: 36, amount: 200 },
      { maxMonths: 48, amount: 300 },
      { maxMonths: 60, amount: 400 },
      { maxMonths: Infinity, amount: 500 },
    ],
  },
  interestRate: 0.008, // example: 0.8% per month, update as needed
};
