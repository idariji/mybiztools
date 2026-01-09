/**
 * Nigerian Tax Calculator Service
 * Calculate various Nigerian taxes for businesses
 */

// Nigerian Tax Rates (2024/2025)
const TAX_RATES = {
  // Companies Income Tax (CIT)
  cit: {
    small: 0, // Companies with turnover < NGN 25 million
    medium: 0.20, // 20% for medium companies (NGN 25-100 million)
    large: 0.30, // 30% for large companies (> NGN 100 million)
  },

  // Value Added Tax (VAT)
  vat: 0.075, // 7.5%

  // Withholding Tax (WHT) rates
  wht: {
    dividends: 0.10, // 10%
    interest: 0.10, // 10%
    rent: 0.10, // 10%
    royalties: 0.10, // 10%
    commission: 0.10, // 10%
    consultancy: 0.10, // 10%
    management_fees: 0.10, // 10%
    technical_fees: 0.10, // 10%
    contracts: 0.05, // 5%
    director_fees: 0.10, // 10%
  },

  // Personal Income Tax (PIT) - Progressive rates
  pit: [
    { min: 0, max: 300000, rate: 0.07 }, // 7% for first NGN 300,000
    { min: 300000, max: 600000, rate: 0.11 }, // 11% for next NGN 300,000
    { min: 600000, max: 1100000, rate: 0.15 }, // 15% for next NGN 500,000
    { min: 1100000, max: 1600000, rate: 0.19 }, // 19% for next NGN 500,000
    { min: 1600000, max: 3200000, rate: 0.21 }, // 21% for next NGN 1,600,000
    { min: 3200000, max: Infinity, rate: 0.24 }, // 24% for above NGN 3,200,000
  ],

  // Tertiary Education Tax (TET)
  tet: 0.025, // 2.5% of assessable profit

  // NSITF (Nigeria Social Insurance Trust Fund)
  nsitf: 0.01, // 1% of monthly payroll

  // NHF (National Housing Fund)
  nhf: 0.025, // 2.5% of basic salary

  // Pension
  pension: {
    employee: 0.08, // 8% employee contribution
    employer: 0.10, // 10% employer contribution
  },
};

export interface CITCalculationInput {
  annualTurnover: number;
  assessableProfit: number;
}

export interface VATCalculationInput {
  amount: number;
  isInclusive?: boolean;
}

export interface PITCalculationInput {
  annualGrossIncome: number;
  reliefs?: {
    consolidatedRelief?: boolean; // 20% of gross income + NGN 200,000
    pensionContribution?: number;
    nhfContribution?: number;
    lifeInsurance?: number;
    nationalHealthInsurance?: number;
  };
}

export interface PayrollCalculationInput {
  basicSalary: number;
  housing?: number;
  transport?: number;
  otherAllowances?: number;
}

export class TaxService {
  /**
   * Calculate Companies Income Tax (CIT)
   */
  static calculateCIT(input: CITCalculationInput) {
    const { annualTurnover, assessableProfit } = input;

    let taxRate: number;
    let companySize: string;

    if (annualTurnover < 25000000) {
      taxRate = TAX_RATES.cit.small;
      companySize = 'small';
    } else if (annualTurnover < 100000000) {
      taxRate = TAX_RATES.cit.medium;
      companySize = 'medium';
    } else {
      taxRate = TAX_RATES.cit.large;
      companySize = 'large';
    }

    const citAmount = assessableProfit * taxRate;
    const tetAmount = assessableProfit * TAX_RATES.tet;
    const totalTax = citAmount + tetAmount;

    return {
      success: true,
      data: {
        companySize,
        annualTurnover,
        assessableProfit,
        citRate: taxRate * 100,
        citAmount: Math.round(citAmount),
        tetRate: TAX_RATES.tet * 100,
        tetAmount: Math.round(tetAmount),
        totalTax: Math.round(totalTax),
        effectiveRate: assessableProfit > 0
          ? Math.round((totalTax / assessableProfit) * 10000) / 100
          : 0,
      },
    };
  }

  /**
   * Calculate VAT
   */
  static calculateVAT(input: VATCalculationInput) {
    const { amount, isInclusive } = input;
    const vatRate = TAX_RATES.vat;

    let netAmount: number;
    let vatAmount: number;
    let grossAmount: number;

    if (isInclusive) {
      // Amount includes VAT, extract it
      grossAmount = amount;
      netAmount = amount / (1 + vatRate);
      vatAmount = amount - netAmount;
    } else {
      // Amount excludes VAT, add it
      netAmount = amount;
      vatAmount = amount * vatRate;
      grossAmount = amount + vatAmount;
    }

    return {
      success: true,
      data: {
        netAmount: Math.round(netAmount * 100) / 100,
        vatRate: vatRate * 100,
        vatAmount: Math.round(vatAmount * 100) / 100,
        grossAmount: Math.round(grossAmount * 100) / 100,
        isInclusive: !!isInclusive,
      },
    };
  }

  /**
   * Calculate Personal Income Tax (PAYE)
   */
  static calculatePIT(input: PITCalculationInput) {
    const { annualGrossIncome, reliefs = {} } = input;

    // Calculate reliefs
    let totalReliefs = 0;

    // Consolidated Relief Allowance (CRA)
    if (reliefs.consolidatedRelief !== false) {
      const cra = Math.max(200000, annualGrossIncome * 0.20);
      totalReliefs += cra;
    }

    // Pension contribution (exempt from tax)
    if (reliefs.pensionContribution) {
      totalReliefs += reliefs.pensionContribution;
    }

    // NHF contribution
    if (reliefs.nhfContribution) {
      totalReliefs += reliefs.nhfContribution;
    }

    // Life insurance premium (up to 20% of gross income)
    if (reliefs.lifeInsurance) {
      const maxInsurance = annualGrossIncome * 0.20;
      totalReliefs += Math.min(reliefs.lifeInsurance, maxInsurance);
    }

    // National Health Insurance
    if (reliefs.nationalHealthInsurance) {
      totalReliefs += reliefs.nationalHealthInsurance;
    }

    // Calculate taxable income
    const taxableIncome = Math.max(0, annualGrossIncome - totalReliefs);

    // Calculate tax using progressive rates
    let remainingIncome = taxableIncome;
    let totalTax = 0;
    const breakdown: { bracket: string; amount: number; rate: number; tax: number }[] = [];

    for (const bracket of TAX_RATES.pit) {
      if (remainingIncome <= 0) break;

      const bracketSize = bracket.max - bracket.min;
      const taxableInBracket = Math.min(remainingIncome, bracketSize);
      const taxInBracket = taxableInBracket * bracket.rate;

      totalTax += taxInBracket;
      breakdown.push({
        bracket: `${bracket.min.toLocaleString()} - ${bracket.max === Infinity ? 'Above' : bracket.max.toLocaleString()}`,
        amount: Math.round(taxableInBracket),
        rate: bracket.rate * 100,
        tax: Math.round(taxInBracket),
      });

      remainingIncome -= taxableInBracket;
    }

    // Minimum tax (1% of gross income if calculated tax < minimum)
    const minimumTax = annualGrossIncome * 0.01;
    const effectiveTax = Math.max(totalTax, minimumTax);

    return {
      success: true,
      data: {
        annualGrossIncome,
        totalReliefs: Math.round(totalReliefs),
        taxableIncome: Math.round(taxableIncome),
        calculatedTax: Math.round(totalTax),
        minimumTax: Math.round(minimumTax),
        annualTax: Math.round(effectiveTax),
        monthlyTax: Math.round(effectiveTax / 12),
        effectiveRate: annualGrossIncome > 0
          ? Math.round((effectiveTax / annualGrossIncome) * 10000) / 100
          : 0,
        breakdown,
      },
    };
  }

  /**
   * Calculate Withholding Tax
   */
  static calculateWHT(amount: number, type: keyof typeof TAX_RATES.wht) {
    const rate = TAX_RATES.wht[type];

    if (rate === undefined) {
      return {
        success: false,
        message: 'Invalid WHT type',
        error: 'INVALID_WHT_TYPE',
      };
    }

    const whtAmount = amount * rate;

    return {
      success: true,
      data: {
        grossAmount: amount,
        whtType: type,
        whtRate: rate * 100,
        whtAmount: Math.round(whtAmount * 100) / 100,
        netAmount: Math.round((amount - whtAmount) * 100) / 100,
      },
    };
  }

  /**
   * Calculate full payroll deductions
   */
  static calculatePayroll(input: PayrollCalculationInput) {
    const { basicSalary, housing = 0, transport = 0, otherAllowances = 0 } = input;

    const grossSalary = basicSalary + housing + transport + otherAllowances;
    const annualGross = grossSalary * 12;

    // Pension (8% employee, 10% employer - on basic + housing + transport)
    const pensionBase = basicSalary + housing + transport;
    const employeePension = pensionBase * TAX_RATES.pension.employee;
    const employerPension = pensionBase * TAX_RATES.pension.employer;

    // NHF (2.5% of basic)
    const nhf = basicSalary * TAX_RATES.nhf;

    // Calculate PAYE
    const payeResult = this.calculatePIT({
      annualGrossIncome: annualGross,
      reliefs: {
        consolidatedRelief: true,
        pensionContribution: employeePension * 12,
        nhfContribution: nhf * 12,
      },
    });

    const monthlyPaye = payeResult.data?.monthlyTax || 0;

    // Total deductions
    const totalDeductions = employeePension + nhf + monthlyPaye;
    const netSalary = grossSalary - totalDeductions;

    // Employer costs
    const employerNsitf = grossSalary * TAX_RATES.nsitf;
    const totalEmployerCost = grossSalary + employerPension + employerNsitf;

    return {
      success: true,
      data: {
        earnings: {
          basicSalary: Math.round(basicSalary),
          housing: Math.round(housing),
          transport: Math.round(transport),
          otherAllowances: Math.round(otherAllowances),
          grossSalary: Math.round(grossSalary),
        },
        deductions: {
          pension: Math.round(employeePension),
          nhf: Math.round(nhf),
          paye: Math.round(monthlyPaye),
          totalDeductions: Math.round(totalDeductions),
        },
        netSalary: Math.round(netSalary),
        employerContributions: {
          pension: Math.round(employerPension),
          nsitf: Math.round(employerNsitf),
          totalCost: Math.round(totalEmployerCost),
        },
      },
    };
  }

  /**
   * Get all tax rates
   */
  static getTaxRates() {
    return {
      success: true,
      data: {
        rates: TAX_RATES,
        currency: 'NGN',
        lastUpdated: '2024-01-01',
        notes: [
          'Small companies (turnover < NGN 25M) are exempt from CIT',
          'VAT rate is 7.5% on goods and services',
          'Personal Income Tax follows progressive rates from 7% to 24%',
          'Pension is 8% employee + 10% employer contribution',
        ],
      },
    };
  }
}

export default TaxService;
