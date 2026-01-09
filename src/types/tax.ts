export interface TaxCalculation {
  income: number;
  deductions: number;
  taxableIncome: number;
  incomeTax: number;
  vat: number;
  totalTax: number;
  netIncome: number;
}

export interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
}

export const NIGERIAN_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 300000, rate: 0.07 },
  { min: 300000, max: 600000, rate: 0.11 },
  { min: 600000, max: 1100000, rate: 0.15 },
  { min: 1100000, max: 1600000, rate: 0.19 },
  { min: 1600000, max: 3200000, rate: 0.21 },
  { min: 3200000, max: null, rate: 0.24 }
];

export const VAT_RATE = 0.075;
export const CIT_RATE = 0.30; // Corporate Income Tax
