import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../layout/DashboardLayout';
import { Plus, Download, Eye, Trash2, Search, Lock, Zap } from 'lucide-react';
import { Receipt } from '../types/receipt';
import { authService } from '../services/authService';
import { canCreateDocument, FREE_DOCUMENT_LIMIT, normalisePlan } from '../utils/planUtils';

export function ReceiptPage() {
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const user = authService.getCurrentUser();
  const plan = user?.current_plan;
  const isFree = normalisePlan(plan) === 'free';

  useEffect(() => {
    const drafts = JSON.parse(localStorage.getItem('receipt-drafts') || '[]');
    setReceipts(drafts);
  }, []);

  const filteredReceipts = receipts.filter(r => 
    r.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (receiptNumber: string) => {
    if (confirm('Are you sure you want to delete this receipt?')) {
      const updated = receipts.filter(r => r.receiptNumber !== receiptNumber);
      localStorage.setItem('receipt-drafts', JSON.stringify(updated));
      setReceipts(updated);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Receipt Generator</h1>
            <p className="text-slate-600 mt-1">Create and manage digital receipts</p>
          </div>
          <div className="flex items-center gap-3">
            {isFree && (
              <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
                {receipts.length}/{FREE_DOCUMENT_LIMIT} receipts used
              </span>
            )}
            <button
              onClick={() => {
                if (!canCreateDocument(plan, receipts.length)) { setShowUpgrade(true); return; }
                navigate('/dashboard/receipts/create');
              }}
              className="flex items-center gap-2 px-6 py-3 bg-[#FF8A2B] text-white rounded-xl font-semibold hover:bg-[#FF6B00] transition-colors"
            >
              {!canCreateDocument(plan, receipts.length) ? <Lock className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              New Receipt
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by receipt number or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
            />
          </div>
        </div>

        {/* Receipts Table */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Receipts ({filteredReceipts.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Receipt #</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Payment</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReceipts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      No receipts found. Create your first receipt!
                    </td>
                  </tr>
                ) : (
                  filteredReceipts.map((receipt) => (
                    <tr key={receipt.receiptNumber} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-4 px-4 text-sm text-slate-900 font-medium">{receipt.receiptNumber}</td>
                      <td className="py-4 px-4 text-sm text-slate-600">{receipt.customerInfo.name}</td>
                      <td className="py-4 px-4 text-sm text-slate-900 font-semibold">
                        {receipt.summary.total.toLocaleString()} {receipt.currency}
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-600">
                        {new Date(receipt.receiptDate).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-600">{receipt.paymentMethod}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="View">
                            <Eye className="w-4 h-4 text-slate-600" />
                          </button>
                          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="Download">
                            <Download className="w-4 h-4 text-slate-600" />
                          </button>
                          <button 
                            onClick={() => handleDelete(receipt.receiptNumber)}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgrade && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Zap className="w-6 h-6 text-[#FF8A2B]" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Upgrade Required</h2>
            </div>
            <p className="text-slate-600 mb-2">
              You've reached the <strong>{FREE_DOCUMENT_LIMIT} receipt limit</strong> on the Free plan.
            </p>
            <p className="text-slate-600 mb-6">
              Upgrade to <strong>Business Pro</strong> or <strong>Enterprise Suite</strong> for unlimited receipts and full access to all features.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgrade(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowUpgrade(false); navigate('/dashboard/subscription'); }}
                className="flex-1 px-4 py-2 bg-[#FF8A2B] text-white rounded-xl font-semibold hover:bg-[#FF6B00] transition-colors"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
