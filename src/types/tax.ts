// ============================================================
// Nigerian Tax Types & Constants
// Sources: FIRS (Federal Inland Revenue Service)
//   - Personal Income Tax Act (PITA) 2011 as amended
//   - Finance Acts 2019, 2020, 2021, 2022, 2023
//   - Companies Income Tax Act (CITA) Cap C21 LFN 2004 as amended
//   - Pension Reform Act (PRA) 2014
//   - National Housing Fund (NHF) Act Cap N45 LFN 2004
//   - Value Added Tax Act Cap V1 LFN 2004 as amended
// ============================================================

export interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
  label: string;
}

// ---- PAYE (Personal Income Tax) ----
// PITA 2011 Schedule 6 — brackets apply to TAXABLE income
// (after Consolidated Relief Allowance and statutory deductions)
export const PAYE_BRACKETS: TaxBracket[] = [
  { min: 0,        max: 300000,  rate: 0.07, label: 'First ₦300,000'   },
  { min: 300000,   max: 600000,  rate: 0.11, label: 'Next ₦300,000'    },
  { min: 600000,   max: 1100000, rate: 0.15, label: 'Next ₦500,000'    },
  { min: 1100000,  max: 1600000, rate: 0.19, label: 'Next ₦500,000'    },
  { min: 1600000,  max: 3200000, rate: 0.21, label: 'Next ₦1,600,000'  },
  { min: 3200000,  max: null,    rate: 0.24, label: 'Above ₦3,200,000' },
];

// Legacy alias (keeps old imports working)
export const NIGERIAN_TAX_BRACKETS = PAYE_BRACKETS;

// ---- Consolidated Relief Allowance (CRA) — PITA S.33 ----
// CRA = ₦200,000 + 20% of gross annual income
export const CRA_FIXED = 200_000;
export const CRA_VARIABLE_RATE = 0.20;

// ---- Statutory Deductions (annual %) ----
export const PENSION_EMPLOYEE_RATE = 0.08;   // 8%  of annual emolument (PRA 2014 S.4)
export const PENSION_EMPLOYER_RATE = 0.10;   // 10% of annual emolument
export const NHF_RATE = 0.025;               // 2.5% of annual basic salary (NHF Act S.4)
export const NHIS_RATE = 0.0175;             // 1.75% of annual basic salary (employee share)

// ---- VAT — Finance Act 2020 ----
export const VAT_RATE = 0.075;                   // 7.5% (raised from 5% by Finance Act 2020)
export const VAT_REGISTRATION_THRESHOLD = 25_000_000; // ₦25m annual turnover

// ---- Company Income Tax (CIT) — CITA as amended ----
// Finance Act 2020: small companies (turnover < ₦25m) → 0%
// Finance Act 2019: medium companies (₦25m–₦100m) → 20%
// Large companies (> ₦100m) → 30%
export const CIT_RATE_SMALL  = 0.00;  // < ₦25m turnover
export const CIT_RATE_MEDIUM = 0.20;  // ₦25m – ₦100m
export const CIT_RATE_LARGE  = 0.30;  // > ₦100m
export const CIT_SMALL_THRESHOLD  = 25_000_000;
export const CIT_MEDIUM_THRESHOLD = 100_000_000;

// Legacy alias
export const CIT_RATE = CIT_RATE_LARGE;

// Education Tax (TETFund) — Finance Act 2021: 2% → 3% of assessable profit
export const EDUCATION_TAX_RATE = 0.03;

// ---- Capital Gains Tax (CGT) ----
export const CGT_RATE = 0.10; // 10% on chargeable gains (CGTA Cap C1 LFN 2004)

// ---- Withholding Tax (WHT) rates ----
export const WHT_RATES: { label: string; key: string; rate: number }[] = [
  { label: 'Dividends',           key: 'dividends',        rate: 0.10 },
  { label: 'Interest',            key: 'interest',         rate: 0.10 },
  { label: 'Royalties',           key: 'royalties',        rate: 0.10 },
  { label: 'Rent',                key: 'rent',             rate: 0.10 },
  { label: 'Professional Fees',   key: 'professionalFees', rate: 0.10 },
  { label: 'Directors\' Fees',    key: 'directorsFees',    rate: 0.10 },
  { label: 'Management Fees',     key: 'managementFees',   rate: 0.10 },
  { label: 'Technical Fees',      key: 'technicalFees',    rate: 0.10 },
  { label: 'Contracts & Agency',  key: 'contracts',        rate: 0.05 },
  { label: 'Commissions',         key: 'commissions',      rate: 0.10 },
];

// ---- Result types ----
export interface TaxCalculation {
  income: number;
  deductions: number;
  taxableIncome: number;
  incomeTax: number;
  vat: number;
  totalTax: number;
  netIncome: number;
}

export interface PayeCalculation {
  grossIncome: number;
  cra: number;
  pension: number;
  nhf: number;
  nhis: number;
  totalRelief: number;
  taxableIncome: number;
  annualPaye: number;
  monthlyPaye: number;
  monthlyGross: number;
  monthlyNet: number;
  effectiveRate: number;
  bracketBreakdown: { label: string; taxable: number; tax: number }[];
}

export interface CitCalculation {
  turnover: number;
  assessableProfit: number;
  companySize: 'small' | 'medium' | 'large';
  citRate: number;
  cit: number;
  educationTax: number;
  totalTax: number;
  effectiveRate: number;
  netProfit: number;
}

export interface WhtCalculation {
  paymentType: string;
  grossAmount: number;
  whtRate: number;
  whtAmount: number;
  netPayable: number;
}
