import {
  TaxCalculation, PayeCalculation, CitCalculation, WhtCalculation,
  PAYE_BRACKETS, VAT_RATE,
  CRA_FIXED, CRA_VARIABLE_RATE,
  PENSION_EMPLOYEE_RATE, NHF_RATE, NHIS_RATE,
  CIT_RATE_SMALL, CIT_RATE_MEDIUM, CIT_RATE_LARGE,
  CIT_SMALL_THRESHOLD, CIT_MEDIUM_THRESHOLD,
  EDUCATION_TAX_RATE, WHT_RATES,
} from '../types/tax';

function applyBrackets(taxableIncome) {
  let remaining = taxableIncome, totalTax = 0;
  const breakdown = [];
  for (const bracket of PAYE_BRACKETS) {
    if (remaining <= 0) break;
    const bracketSize = bracket.max ? bracket.max - bracket.min : remaining;
    const taxable = Math.min(remaining, bracketSize);
    const tax = taxable * bracket.rate;
    if (taxable > 0) breakdown.push({ label: bracket.label, taxable, tax });
    totalTax += tax;
    remaining -= taxable;
  }
  return { totalTax, breakdown };
}

export function calculatePaye(annualGrossIncome) {
  const cra = CRA_FIXED + CRA_VARIABLE_RATE * annualGrossIncome;
  const pension = PENSION_EMPLOYEE_RATE * annualGrossIncome;
  const nhf = NHF_RATE * annualGrossIncome;
  const nhis = NHIS_RATE * annualGrossIncome;
  const totalRelief = cra + pension + nhf + nhis;
  const taxableIncome = Math.max(0, annualGrossIncome - totalRelief);
  const { totalTax: annualPaye, breakdown } = applyBrackets(taxableIncome);
  const monthlyGross = annualGrossIncome / 12;
  const monthlyPaye = annualPaye / 12;
  const monthlyNet = monthlyGross - monthlyPaye - (pension / 12) - (nhf / 12) - (nhis / 12);
  const effectiveRate = annualGrossIncome > 0 ? (annualPaye / annualGrossIncome) * 100 : 0;
  return { grossIncome: annualGrossIncome, cra, pension, nhf, nhis, totalRelief, taxableIncome, annualPaye, monthlyPaye, monthlyGross, monthlyNet, effectiveRate, bracketBreakdown: breakdown };
}

export function calculateCit(turnover, assessableProfit) {
  let companySize, citRate;
  if (turnover < CIT_SMALL_THRESHOLD) { companySize = 'small'; citRate = CIT_RATE_SMALL; }
  else if (turnover <= CIT_MEDIUM_THRESHOLD) { companySize = 'medium'; citRate = CIT_RATE_MEDIUM; }
  else { companySize = 'large'; citRate = CIT_RATE_LARGE; }
  const cit = assessableProfit * citRate;
  const educationTax = assessableProfit > 0 ? assessableProfit * EDUCATION_TAX_RATE : 0;
  const totalTax = cit + educationTax;
  const netProfit = assessableProfit - totalTax;
  const effectiveRate = assessableProfit > 0 ? (totalTax / assessableProfit) * 100 : 0;
  return { turnover, assessableProfit, companySize, citRate, cit, educationTax, totalTax, effectiveRate, netProfit };
}

export function calculateWht(paymentTypeKey, grossAmount) {
  const entry = WHT_RATES.find(w => w.key === paymentTypeKey) ?? WHT_RATES[0];
  const whtAmount = grossAmount * entry.rate;
  return { paymentType: entry.label, grossAmount, whtRate: entry.rate, whtAmount, netPayable: grossAmount - whtAmount };
}

export function calculateVat(taxableAmount) {
  return { vat: taxableAmount * VAT_RATE, total: taxableAmount * (1 + VAT_RATE) };
}

export const calculateIncomeTax = (taxableIncome) => applyBrackets(taxableIncome).totalTax;

export const calculateTax = (income, deductions, vatAmount = 0) => {
  const taxableIncome = Math.max(0, income - deductions);
  const incomeTax = calculateIncomeTax(taxableIncome);
  const vat = vatAmount > 0 ? vatAmount * VAT_RATE : 0;
  const totalTax = incomeTax + vat;
  return { income, deductions, taxableIncome, incomeTax, vat, totalTax, netIncome: income - totalTax };
};
