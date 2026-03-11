import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../layout/DashboardLayout';
import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';

interface BudgetEntry {
  id: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  category: string;
  date: string;
}

export function BudgetPage() {
  const [entries, setEntries] = useState<BudgetEntry[]>([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('budget-entries') || '[]');
    setEntries(saved);
  }, []);

  const totalIncome = entries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
  const totalExpenses = entries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
  const netBalance = totalIncome - totalExpenses;
  const fmt = (n: number) => `₦${n.toLocaleString()}`;

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-slate-900">Budget Tracker</h1>
          <p className="text-slate-600 mt-1">Track income and expenses</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg"><TrendingUp className="w-5 h-5 text-green-600" /></div>
              <h3 className="text-sm font-semibold text-slate-600">Total Income</h3>
            </div>
            <p className="text-xl sm:text-3xl font-bold text-green-600">{fmt(totalIncome)}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-100 rounded-lg"><TrendingDown className="w-5 h-5 text-red-600" /></div>
              <h3 className="text-sm font-semibold text-slate-600">Total Expenses</h3>
            </div>
            <p className="text-xl sm:text-3xl font-bold text-red-600">{fmt(totalExpenses)}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-100 rounded-lg"><DollarSign className="w-5 h-5 text-[#FF8A2B]" /></div>
              <h3 className="text-sm font-semibold text-slate-600">Net Balance</h3>
            </div>
            <p className={`text-xl sm:text-3xl font-bold ${netBalance >= 0 ? 'text-[#FF8A2B]' : 'text-red-600'}`}>{fmt(netBalance)}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">Transactions</h2>
            <span className="text-sm text-slate-500 flex items-center gap-1">
              <PieChart className="w-4 h-4" /> {entries.length} entries
            </span>
          </div>
          {entries.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-1">No transactions yet</h3>
              <p className="text-slate-500 text-sm">Your income and expense entries will appear here once you start tracking.</p>
            </div>
          ) : (
            <>
            {/* Desktop table - hidden on mobile */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Description</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Category</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Type</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map(entry => (
                    <tr key={entry.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-sm text-slate-600">{new Date(entry.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-sm text-slate-900">{entry.description}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{entry.category}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${entry.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {entry.type}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-sm font-semibold text-right ${entry.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {entry.type === 'income' ? '+' : '-'}{fmt(entry.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list - hidden on desktop */}
            <div className="md:hidden space-y-3">
              {entries.map(entry => (
                <div key={entry.id} className="bg-white border border-slate-200 rounded-xl p-4 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs text-slate-500">{new Date(entry.date).toLocaleDateString()}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${entry.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {entry.type}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-900">{entry.description}</p>
                  <p className="text-xs text-slate-500">{entry.category}</p>
                  <p className={`text-base font-semibold ${entry.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {entry.type === 'income' ? '+' : '-'}{fmt(entry.amount)}
                  </p>
                </div>
              ))}
            </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
