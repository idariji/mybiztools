export interface Earnings {
  basicSalary: number;
  housing: number;
  transport: number;
  bonus: number;
  overtime: number;
  other: number;
}

export interface Deductions {
  paye: number;
  pension: number;
  nhf: number;
  loans: number;
  other: number;
}

export interface Payslip {
  id?: string;
  userId?: string;
  payslipNumber: string;
  month: string;
  year: number;
  employerInfo: {
    name: string;
    address: string;
    email: string;
    phone: string;
    logo?: string;
  };
  employeeInfo: {
    name: string;
    employeeId: string;
    department: string;
    position: string;
    email: string;
    bankAccount: string;
  };
  earnings: Earnings;
  deductions: Deductions;
  summary: {
    grossPay: number;
    totalDeductions: number;
    netPay: number;
  };
  paymentDate: string;
  status: 'draft' | 'issued' | 'paid';
  createdAt?: string;
  updatedAt?: string;
}

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const PAYE_BRACKETS_2026 = [
  { min: 0, max: 300000, rate: 7 },
  { min: 300000, max: 600000, rate: 11 },
  { min: 600000, max: 1100000, rate: 15 },
  { min: 1100000, max: 1600000, rate: 19 },
  { min: 1600000, max: 3200000, rate: 21 },
  { min: 3200000, max: Infinity, rate: 24 },
];

export const calculatePAYE = (annualIncome: number): number => {
  let tax = 0;
  let remaining = annualIncome;

  for (const bracket of PAYE_BRACKETS_2026) {
    if (remaining <= 0) break;
    
    const taxableInBracket = Math.min(remaining, bracket.max - bracket.min);
    tax += (taxableInBracket * bracket.rate) / 100;
    remaining -= taxableInBracket;
  }

  return tax / 12; // Monthly PAYE
};

export const calculatePension = (grossPay: number): { employee: number; employer: number } => {
  return {
    employee: grossPay * 0.08,
    employer: grossPay * 0.10,
  };
};

export const calculateNHF = (grossPay: number): number => {
  return grossPay * 0.025; // 2.5% of gross pay
};
