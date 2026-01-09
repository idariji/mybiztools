import React, { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Budget, BudgetCategory, DEFAULT_CATEGORIES } from '../types/budget';
import { calculateBudgetProgress, getBudgetStatus, formatCurrency } from '../utils/budgetUtils';
import { useToast } from '../utils/useToast';

export const BudgetTrackerPage: React.FC = () => {
  const { addToast } = useToast();
  const [categories, setCategories] = useState<BudgetCategory[]>(
    DEFAULT_CATEGORIES.map((cat, idx) => ({
      id: idx.toString(),
      name: cat.name,
      budgeted: 0,
      spent: 0,
      color: cat.color,
      icon: cat.icon
    }))
  );

  const handleUpdateCategory = (id: string, field: 'budgeted' | 'spent', value: number) => {
    setCategories(categories.map(cat =>
      cat.id === id ? { ...cat, [field]: value } : cat
    ));
  };

  const totalBudgeted = categories.reduce((sum, cat) => sum + cat.budgeted, 0);
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
  const remaining = totalBudgeted - totalSpent;

  const chartData = categories
    .filter(cat => cat.spent > 0)
    .map(cat => ({ name: cat.name, value: cat.spent, color: cat.color }));

  return (
    <div className="min-h-screen bg-[#F0F3F5]">
      <div className="px-3 sm:px-6 py-4 sm:py-6 mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Budget Tracker</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Monitor your business expenses and budget</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-6 px-3 sm:px-6">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Total Budget</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">{formatCurrency(totalBudgeted)}</p>
            </div>
            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <DollarSign className="text-blue-600 w-5 sm:w-6 h-5 sm:h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Total Spent</p>
              <p className="text-xl sm:text-2xl font-bold text-red-600 mt-2">{formatCurrency(totalSpent)}</p>
            </div>
            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <TrendingDown className="text-red-600 w-5 sm:w-6 h-5 sm:h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-slate-100 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Remaining</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600 mt-2">{formatCurrency(remaining)}</p>
            </div>
            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <TrendingUp className="text-green-600 w-5 sm:w-6 h-5 sm:h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-3 sm:gap-6 px-3 sm:px-6 pb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-slate-100">
          <h2 className="text-base sm:text-xl font-semibold mb-4">Budget Categories</h2>
          <div className="space-y-3 sm:space-y-4">
            {categories.map((category) => {
              const progress = calculateBudgetProgress(category);
              const status = getBudgetStatus(progress);
              const statusColors = {
                good: 'bg-green-500',
                warning: 'bg-yellow-500',
                danger: 'bg-red-500'
              };

              return (
                <div key={category.id} className="border rounded-lg p-3 sm:p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                    <h3 className="font-medium text-gray-900 text-sm sm:text-base">{category.name}</h3>
                    <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                      {formatCurrency(category.spent)} / {formatCurrency(category.budgeted)}
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div
                      className={`h-2 rounded-full ${statusColors[status]} transition-all`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={category.budgeted || ''}
                      onChange={(e) => handleUpdateCategory(category.id, 'budgeted', Number(e.target.value))}
                      placeholder="Budget"
                      className="px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      value={category.spent || ''}
                      onChange={(e) => handleUpdateCategory(category.id, 'spent', Number(e.target.value))}
                      placeholder="Spent"
                      className="px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-slate-100">
          <h2 className="text-base sm:text-xl font-semibold mb-4">Spending Overview</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300} className="sm:h-[400px]">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] sm:h-[400px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <DollarSign size={36} className="sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
                <p className="text-xs sm:text-base">No spending data yet</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
