import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../layout/DashboardLayout';
import { Plus, Eye, Trash2, CreditCard, Lock, Zap } from 'lucide-react';
import { Payslip } from '../types/payslip';
import { useToast } from '../utils/useToast';
import { ToastContainer } from '../components/ui/Toast';
import { authService } from '../services/authService';
import { canCreateDocument, FREE_DOCUMENT_LIMIT, normalisePlan } from '../utils/planUtils';

export function PayslipPage() {
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const user = authService.getCurrentUser();
  const plan = user?.current_plan;
  const isFree = normalisePlan(plan) === 'free';

  useEffect(() => {
    loadPayslips();
  }, []);

  const loadPayslips = () => {
    const saved = JSON.parse(localStorage.getItem('payslip-drafts') || '[]');
    setPayslips(saved);
  };

  const handleDelete = (payslipNumber: string) => {
    if (confirm('Are you sure you want to delete this payslip?')) {
      const updated = payslips.filter(p => p.payslipNumber !== payslipNumber);
      localStorage.setItem('payslip-drafts', JSON.stringify(updated));
      setPayslips(updated);
      addToast('Payslip deleted successfully', 'success');
    }
  };

  const handleView = (payslip: Payslip) => {
    localStorage.setItem('current-payslip', JSON.stringify(payslip));
    navigate('/dashboard/payslips/create');
  };

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Payslip Generator</h1>
              <p className="text-slate-600 mt-1">Create and manage employee payslips</p>
            </div>
            <div className="flex items-center gap-3">
              {isFree && (
                <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
                  {payslips.length}/{FREE_DOCUMENT_LIMIT} payslips used
                </span>
              )}
              <button
                onClick={() => {
                  if (!canCreateDocument(plan, payslips.length)) { setShowUpgrade(true); return; }
                  navigate('/dashboard/payslips/create');
                }}
                className="flex items-center gap-2 px-6 py-3 bg-[#FF8A2B] text-white rounded-xl font-semibold hover:bg-[#FF6B00] transition-colors"
              >
                {!canCreateDocument(plan, payslips.length) ? <Lock className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                New Payslip
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Payslips ({payslips.length})</h2>

            {payslips.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No payslips yet</h3>
                <p className="text-slate-600 mb-6">Generate your first payslip to get started</p>
                <button
                  onClick={() => {
                    if (!canCreateDocument(plan, payslips.length)) { setShowUpgrade(true); return; }
                    navigate('/dashboard/payslips/create');
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF8A2B] text-white rounded-xl font-semibold hover:bg-[#FF6B00] transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Create Payslip
                </button>
              </div>
            ) : (
              <>
              {/* Desktop table - hidden on mobile */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Payslip #</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Employee</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Department</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Period</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Net Pay</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payslips.map((payslip) => (
                      <tr key={payslip.payslipNumber} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-4 px-4 text-sm text-slate-900 font-medium">{payslip.payslipNumber}</td>
                        <td className="py-4 px-4 text-sm text-slate-600">{payslip.employeeInfo?.name || 'N/A'}</td>
                        <td className="py-4 px-4 text-sm text-slate-600">{payslip.employeeInfo?.department || 'N/A'}</td>
                        <td className="py-4 px-4 text-sm text-slate-600">{payslip.month} {payslip.year}</td>
                        <td className="py-4 px-4 text-sm text-slate-900 font-semibold">
                          ₦{(payslip.summary?.netPay || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            payslip.status === 'paid' ? 'bg-green-100 text-green-700' :
                            payslip.status === 'issued' ? 'bg-blue-100 text-blue-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {payslip.status === 'paid' ? 'Paid' :
                             payslip.status === 'issued' ? 'Issued' : 'Draft'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleView(payslip)}
                              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                              title="View/Edit"
                            >
                              <Eye className="w-4 h-4 text-slate-600" />
                            </button>
                            <button
                              onClick={() => handleDelete(payslip.payslipNumber)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile card list - hidden on desktop */}
              <div className="md:hidden space-y-3">
                {payslips.map((payslip) => (
                  <div key={payslip.payslipNumber} className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-bold text-slate-900">{payslip.payslipNumber}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${
                        payslip.status === 'paid' ? 'bg-green-100 text-green-700' :
                        payslip.status === 'issued' ? 'bg-blue-100 text-blue-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {payslip.status === 'paid' ? 'Paid' :
                         payslip.status === 'issued' ? 'Issued' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 font-medium">{payslip.employeeInfo?.name || 'N/A'}</p>
                    <p className="text-xs text-slate-500">{payslip.employeeInfo?.department || 'N/A'}</p>
                    <p className="text-base font-semibold text-green-600">
                      ₦{(payslip.summary?.netPay || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-slate-500">{payslip.month} {payslip.year}</p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleView(payslip)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                      <button
                        onClick={() => handleDelete(payslip.payslipNumber)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              </>
            )}
          </div>
        </div>
      </DashboardLayout>

      {/* Upgrade Modal */}
      {showUpgrade && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-4 sm:p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Zap className="w-6 h-6 text-[#FF8A2B]" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Upgrade Required</h2>
            </div>
            <p className="text-slate-600 mb-2">
              You've reached the <strong>{FREE_DOCUMENT_LIMIT} payslip limit</strong> on the Free plan.
            </p>
            <p className="text-slate-600 mb-6">
              Upgrade to <strong>Starter, Business Pro, or Enterprise Suite</strong> for unlimited payslips and full access to all features.
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
    </>
  );
}
