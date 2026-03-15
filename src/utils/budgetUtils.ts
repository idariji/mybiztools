import { BudgetCategory } from '../types/budget';

export const calculateBudgetProgress = (category: BudgetCategory): number => {
  if (category.budgeted === 0) return 0;
  return (category.spent / category.budgeted) * 100;
};

export const getBudgetStatus = (progress: number): 'good' | 'warning' | 'danger' => {
  if (progress < 75) return 'good';
  if (progress < 90) return 'warning';
  return 'danger';
};

export const calculateTotalBudget = (categories: BudgetCategory[]): number => {
  return categories.reduce((sum, cat) => sum + cat.budgeted, 0);
};

export const calculateTotalSpent = (categories: BudgetCategory[]): number => {
  return categories.reduce((sum, cat) => sum + cat.spent, 0);
};

export const formatCurrency = (amount: number, currency: string = 'NGN'): string => {
  const symbols: Record<string, string> = {
    NGN: '₦', USD: '$', GHS: '₵', KES: 'KSh', ZAR: 'R'
  };
  return `${symbols[currency] || currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
