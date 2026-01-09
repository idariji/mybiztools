import React from 'react';
import { DashboardLayout } from '../layout/DashboardLayout';
import { Plus } from 'lucide-react';

export function BudgetPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Budget Tracker</h1>
            <p className="text-slate-600 mt-1">Track income and expenses</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-[#FF8A2B] text-white rounded-xl font-semibold hover:bg-[#FF6B00] transition-colors">
            <Plus className="w-5 h-5" />
            Add Entry
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-600 mb-2">Total Income</h3>
            <p className="text-3xl font-bold text-green-600">₦2,400,000</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-600 mb-2">Total Expenses</h3>
            <p className="text-3xl font-bold text-red-600">₦890,000</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-sm font-semibold text-slate-600 mb-2">Net Balance</h3>
            <p className="text-3xl font-bold text-[#FF8A2B]">₦1,510,000</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Transactions</h2>
          <p className="text-slate-600">Budget tracking features coming soon...</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
