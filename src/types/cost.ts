export interface CostItem {
  id: string;
  name: string;
  category: string;
  amount: number;
  frequency: 'one-time' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  date: Date;
  notes?: string;
}

export interface CostSummary {
  totalOneTime: number;
  totalRecurring: number;
  monthlyAverage: number;
  yearlyProjection: number;
  byCategory: Record<string, number>;
}

export const COST_CATEGORIES = [
  'Marketing',
  'Operations',
  'Salaries',
  'Rent',
  'Utilities',
  'Equipment',
  'Software',
  'Travel',
  'Other'
];

export const FREQUENCIES = [
  { value: 'one-time', label: 'One-time', multiplier: 0 },
  { value: 'daily', label: 'Daily', multiplier: 365 },
  { value: 'weekly', label: 'Weekly', multiplier: 52 },
  { value: 'monthly', label: 'Monthly', multiplier: 12 },
  { value: 'yearly', label: 'Yearly', multiplier: 1 }
] as const;
