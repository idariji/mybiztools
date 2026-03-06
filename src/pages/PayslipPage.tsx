import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../layout/DashboardLayout';
import { Plus, Eye, Trash2, CreditCard } from 'lucide-react';
import { Payslip } from '../types/payslip';
import { useToast } from '../utils/useToast';
import { ToastContainer } from '../components/ui/Toast';

export function PayslipPage() {
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();
  const [payslips, setPayslips] = useState<Payslip[]>([]);

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
            <button
              onClick={() => navigate('/dashboard/payslips/create')}
              className="flex items-center gap-2 px-6 py-3 bg-[#FF8A2B] text-white rounded-xl font-semibold hover:bg-[#FF6B00] transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Payslip
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Payslips ({payslips.length})</h2>

            {payslips.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No payslips yet</h3>
                <p className="text-slate-600 mb-6">Generate your first payslip to get started</p>
                <button
                  onClick={() => navigate('/dashboard/payslips/create')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF8A2B] text-white rounded-xl font-semibold hover:bg-[#FF6B00] transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Create Payslip
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
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
            )}
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
