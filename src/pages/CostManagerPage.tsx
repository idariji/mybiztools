import React, { useState, useEffect } from 'react';
import { Plus, Trash2, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CostItem, COST_CATEGORIES, FREQUENCIES } from '../types/cost';
import { calculateCostSummary, calculateYearlyCost } from '../utils/costUtils';
import { formatCurrency } from '../utils/budgetUtils';
import { useToast } from '../utils/useToast';

const STORAGE_KEY = 'mybiztools_costs';

// Load costs from localStorage
const loadCosts = (): CostItem[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Convert date strings back to Date objects
      return parsed.map((cost: any) => ({
        ...cost,
        date: new Date(cost.date)
      }));
    }
  } catch (error) {
    console.error('Failed to load costs:', error);
  }
  return [];
};

// Save costs to localStorage
const saveCosts = (costs: CostItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(costs));
  } catch (error) {
    console.error('Failed to save costs:', error);
  }
};

export const CostManagerPage: React.FC = () => {
  const { addToast } = useToast();
  const [costs, setCosts] = useState<CostItem[]>(() => loadCosts());

  // Save costs whenever they change
  useEffect(() => {
    saveCosts(costs);
  }, [costs]);
  const [showForm, setShowForm] = useState(false);
  const [newCost, setNewCost] = useState<Partial<CostItem>>({
    name: '',
    category: COST_CATEGORIES[0],
    amount: 0,
    frequency: 'monthly',
    date: new Date(),
    notes: ''
  });

  const handleAddCost = () => {
    if (!newCost.name || !newCost.amount) {
      addToast('Please fill required fields', 'error');
      return;
    }

    const cost: CostItem = {
      id: Date.now().toString(),
      name: newCost.name!,
      category: newCost.category!,
      amount: newCost.amount!,
      frequency: newCost.frequency as any,
      date: newCost.date!,
      notes: newCost.notes
    };

    setCosts([...costs, cost]);
    setNewCost({ name: '', category: COST_CATEGORIES[0], amount: 0, frequency: 'monthly', date: new Date() });
    setShowForm(false);
    addToast('Cost added successfully!', 'success');
  };

  const handleDeleteCost = (id: string) => {
    setCosts(costs.filter(c => c.id !== id));
    addToast('Cost deleted', 'success');
  };

  const summary = calculateCostSummary(costs);
  const chartData = Object.entries(summary.byCategory).map(([category, amount]) => ({
    category,
    amount
  }));

  return (
    <div className="min-h-screen bg-[#F0F3F5]">
      <div className="px-3 sm:px-6 py-4 sm:py-6 mb-4 sm:mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Cost Manager</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Track and analyze your business costs</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base font-medium w-full sm:w-auto"
        >
          <Plus size={18} />
          Add Cost
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-slate-100 mx-3 sm:mx-6 mb-6">
          <h2 className="text-base sm:text-xl font-semibold mb-4">Add New Cost</h2>
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            <input
              type="text"
              value={newCost.name}
              onChange={(e) => setNewCost({ ...newCost, name: e.target.value })}
              placeholder="Cost name *"
              className="px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={newCost.category}
              onChange={(e) => setNewCost({ ...newCost, category: e.target.value })}
              className="px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {COST_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input
              type="number"
              value={newCost.amount}
              onChange={(e) => setNewCost({ ...newCost, amount: Number(e.target.value) })}
              placeholder="Amount *"
              className="px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={newCost.frequency}
              onChange={(e) => setNewCost({ ...newCost, frequency: e.target.value as any })}
              className="px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {FREQUENCIES.map(freq => (
                <option key={freq.value} value={freq.value}>{freq.label}</option>
              ))}
            </select>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleAddCost}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex-1 sm:flex-none"
            >
              Add Cost
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium flex-1 sm:flex-none"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 px-3 sm:px-6">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-slate-100">
          <p className="text-xs sm:text-sm text-gray-600">One-time Costs</p>
          <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-2">{formatCurrency(summary.totalOneTime)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-slate-100">
          <p className="text-xs sm:text-sm text-gray-600">Yearly Recurring</p>
          <p className="text-lg sm:text-2xl font-bold text-blue-600 mt-2">{formatCurrency(summary.totalRecurring)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-slate-100">
          <p className="text-xs sm:text-sm text-gray-600">Monthly Average</p>
          <p className="text-lg sm:text-2xl font-bold text-green-600 mt-2">{formatCurrency(summary.monthlyAverage)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-slate-100 sm:col-span-2 lg:col-span-1">
          <p className="text-xs sm:text-sm text-gray-600">Yearly Projection</p>
          <p className="text-lg sm:text-2xl font-bold text-orange-600 mt-2">{formatCurrency(summary.yearlyProjection)}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-3 sm:gap-6 px-3 sm:px-6 pb-6">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-slate-100">
          <h2 className="text-base sm:text-xl font-semibold mb-4">Cost List ({costs.length})</h2>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {costs.length === 0 ? (
              <div className="text-center py-8 sm:py-12 text-gray-500">
                <TrendingUp size={36} className="sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
                <p className="text-xs sm:text-base">No costs added yet</p>
              </div>
            ) : (
              costs.map((cost) => (
                <div key={cost.id} className="border rounded-lg p-3 sm:p-4 bg-gray-50 hover:bg-gray-100 transition-colors flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">{cost.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-600">{cost.category} • {cost.frequency}</p>
                    <p className="text-base sm:text-lg font-semibold text-blue-600 mt-1">{formatCurrency(cost.amount)}</p>
                    {cost.frequency !== 'one-time' && (
                      <p className="text-xs text-gray-500">Yearly: {formatCurrency(calculateYearlyCost(cost))}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteCost(cost.id)}
                    className="text-red-500 hover:text-red-700 flex-shrink-0 p-1"
                    title="Delete cost"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-slate-100">
          <h2 className="text-base sm:text-xl font-semibold mb-4">Costs by Category</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300} className="sm:h-[400px]">
              <BarChart data={chartData} margin={{ bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} interval={0} tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="amount" fill="#1e3a8a" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] sm:h-[400px] flex items-center justify-center text-gray-500">
              <p className="text-xs sm:text-base">No data to display</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
