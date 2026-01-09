import { CostItem, CostSummary, FREQUENCIES } from '../types/cost';

export const calculateYearlyCost = (item: CostItem): number => {
  const freq = FREQUENCIES.find(f => f.value === item.frequency);
  return freq ? item.amount * freq.multiplier : 0;
};

export const calculateCostSummary = (items: CostItem[]): CostSummary => {
  const totalOneTime = items
    .filter(i => i.frequency === 'one-time')
    .reduce((sum, i) => sum + i.amount, 0);

  const totalRecurring = items
    .filter(i => i.frequency !== 'one-time')
    .reduce((sum, i) => sum + calculateYearlyCost(i), 0);

  const byCategory: Record<string, number> = {};
  items.forEach(item => {
    const cost = item.frequency === 'one-time' ? item.amount : calculateYearlyCost(item);
    byCategory[item.category] = (byCategory[item.category] || 0) + cost;
  });

  return {
    totalOneTime,
    totalRecurring,
    monthlyAverage: totalRecurring / 12,
    yearlyProjection: totalOneTime + totalRecurring,
    byCategory
  };
};
