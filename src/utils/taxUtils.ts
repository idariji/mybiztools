import { TaxCalculation, NIGERIAN_TAX_BRACKETS, VAT_RATE } from '../types/tax';

export const calculateIncomeTax = (taxableIncome: number): number => {
  let tax = 0;
  let remainingIncome = taxableIncome;

  for (const bracket of NIGERIAN_TAX_BRACKETS) {
    if (remainingIncome <= 0) break;

    const bracketSize = bracket.max ? bracket.max - bracket.min : remainingIncome;
    const taxableAmount = Math.min(remainingIncome, bracketSize);
    
    tax += taxableAmount * bracket.rate;
    remainingIncome -= taxableAmount;
  }

  return tax;
};

export const calculateTax = (income: number, deductions: number, vatAmount: number = 0): TaxCalculation => {
  const taxableIncome = Math.max(0, income - deductions);
  const incomeTax = calculateIncomeTax(taxableIncome);
  const vat = vatAmount > 0 ? vatAmount * VAT_RATE : 0;
  const totalTax = incomeTax + vat;
  const netIncome = income - totalTax;

  return {
    income,
    deductions,
    taxableIncome,
    incomeTax,
    vat,
    totalTax,
    netIncome
  };
};
