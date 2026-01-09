export interface Budget {
  id: string;
  name: string;
  period: 'monthly' | 'quarterly' | 'yearly';
  startDate: Date;
  endDate: Date;
  categories: BudgetCategory[];
  totalBudget: number;
  totalSpent: number;
  currency: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  budgeted: number;
  spent: number;
  color: string;
  icon: string;
}

export interface Transaction {
  id: string;
  categoryId: string;
  amount: number;
  description: string;
  date: Date;
  type: 'income' | 'expense';
}

export const DEFAULT_CATEGORIES = [
  { name: 'Marketing', color: '#FF8A2B', icon: 'Megaphone' },
  { name: 'Operations', color: '#1e3a8a', icon: 'Settings' },
  { name: 'Salaries', color: '#10B981', icon: 'Users' },
  { name: 'Rent', color: '#8B5CF6', icon: 'Home' },
  { name: 'Utilities', color: '#F59E0B', icon: 'Zap' },
  { name: 'Other', color: '#6B7280', icon: 'MoreHorizontal' }
];
