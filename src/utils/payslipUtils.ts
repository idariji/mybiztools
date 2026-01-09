export const generatePayslipNumber = (month: string, year: number, employeeId: string): string => {
  const monthNum = String(new Date(`${month} 1, ${year}`).getMonth() + 1).padStart(2, '0');
  return `PS-${year}-${monthNum}-${employeeId}`;
};

export const formatCurrencyNGN = (amount: number): string => {
  return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
