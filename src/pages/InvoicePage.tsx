import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DashboardLayout } from '../layout/DashboardLayout';
import { Plus, Eye, Trash2, FileText, Lock, Zap } from 'lucide-react';
import { Invoice } from '../types/invoice';
import { useToast } from '../utils/useToast';
import { ToastContainer } from '../components/ui/Toast';
import { authService } from '../services/authService';
import { canCreateDocument, FREE_DOCUMENT_LIMIT, normalisePlan } from '../utils/planUtils';

export function InvoicePage() {
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const user = authService.getCurrentUser();
  const plan = user?.current_plan;
  const isFree = normalisePlan(plan) === 'free';

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = () => {
    const saved = JSON.parse(localStorage.getItem('invoice-drafts') || '[]');
    setInvoices(saved);
  };

  const handleDelete = (invoiceNumber: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      const updated = invoices.filter(inv => inv.invoiceNumber !== invoiceNumber);
      localStorage.setItem('invoice-drafts', JSON.stringify(updated));
      setInvoices(updated);
      addToast('Invoice deleted successfully', 'success');
    }
  };

  const handleView = (invoice: Invoice) => {
    // Store invoice for viewing and navigate to generator
    localStorage.setItem('current-invoice', JSON.stringify(invoice));
    navigate('/dashboard/invoices/create');
  };

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <DashboardLayout>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-slate-900">Invoice Generator</h1>
              <div className="h-1 w-16 bg-gradient-to-r from-[#FF8A2B] to-[#FF6B00] rounded-full mt-2 mb-1" />
              <p className="text-sm text-slate-500">Create and manage professional invoices</p>
            </div>
            <div className="flex items-center gap-3">
              {isFree && (
                <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
                  {invoices.length}/{FREE_DOCUMENT_LIMIT} invoices used
                </span>
              )}
              <button
                onClick={() => {
                  if (!canCreateDocument(plan, invoices.length)) { setShowUpgrade(true); return; }
                  navigate('/dashboard/invoices/create');
                }}
                className="flex items-center gap-2 px-6 py-3 bg-[#FF8A2B] text-white rounded-xl font-semibold hover:bg-[#FF6B00] transition-colors"
              >
                <Plus className="w-5 h-5" />
                New Invoice
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Invoices ({invoices.length})</h2>

            {invoices.length === 0 ? (
              <div className="text-center py-16 px-6 bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-dashed border-slate-200">
                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No invoices yet</h3>
                <p className="text-slate-600 mb-6">Create your first invoice to get started</p>
                <button
                  onClick={() => navigate('/dashboard/invoices/create')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF8A2B] text-white rounded-xl font-semibold hover:bg-[#FF6B00] transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Create Invoice
                </button>
              </div>
            ) : (
              <>
              {/* Desktop table - hidden on mobile */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Invoice #</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Client</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.invoiceNumber} className="border-b border-slate-100 hover:bg-gradient-to-r hover:from-slate-50 hover:to-white transition-colors duration-150">
                        <td className="py-4 px-4 text-sm text-slate-900 font-medium">{invoice.invoiceNumber}</td>
                        <td className="py-4 px-4 text-sm text-slate-600">{invoice.clientInfo.name || 'N/A'}</td>
                        <td className="py-4 px-4 text-sm text-slate-900 font-semibold">
                          {invoice.currency === 'NGN' ? '₦' : invoice.currency === 'USD' ? '$' : invoice.currency}
                          {invoice.summary.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-600">
                          {new Date(invoice.invoiceDate).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                            invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                            invoice.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {invoice.status === 'paid' ? 'Paid' :
                             invoice.status === 'sent' ? 'Sent' : 'Draft'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleView(invoice)}
                              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                              title="View/Edit"
                            >
                              <Eye className="w-4 h-4 text-slate-600 hover:scale-110 transition-transform duration-150" />
                            </button>
                            <button
                              onClick={() => handleDelete(invoice.invoiceNumber)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-600 hover:scale-110 transition-transform duration-150" />
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
                {invoices.map((invoice, idx) => (
                  <motion.div
                    key={invoice.invoiceNumber}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-bold text-slate-900">{invoice.invoiceNumber}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 shadow-sm ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                        invoice.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {invoice.status === 'paid' ? 'Paid' :
                         invoice.status === 'sent' ? 'Sent' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{invoice.clientInfo.name || 'N/A'}</p>
                    <p className={`text-base font-semibold ${
                      invoice.status === 'paid' ? 'text-green-600' :
                      invoice.status === 'sent' ? 'text-blue-600' :
                      'text-slate-900'
                    }`}>
                      {invoice.currency === 'NGN' ? '₦' : invoice.currency === 'USD' ? '$' : invoice.currency}
                      {invoice.summary.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-slate-500">Due: {new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleView(invoice)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                      <button
                        onClick={() => handleDelete(invoice.invoiceNumber)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
              </>
            )}
          </div>
        </motion.div>
      </DashboardLayout>

      {showUpgrade && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center px-4" onClick={() => setShowUpgrade(false)}>
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 sm:p-8 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-[#FF8A2B]" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 text-center mb-2">Document Limit Reached</h2>
            <p className="text-slate-600 text-center text-sm mb-6">
              Free plan allows up to <strong>{FREE_DOCUMENT_LIMIT} documents</strong> total. Upgrade to <strong>Starter, Business Pro, or Enterprise Suite</strong> for unlimited documents and all premium features.
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={() => { setShowUpgrade(false); navigate('/dashboard/subscription'); }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#FF8A2B] text-white rounded-xl font-semibold hover:bg-[#FF6B00] transition-colors">
                <Zap className="w-4 h-4" /> View Plans
              </button>
              <button onClick={() => setShowUpgrade(false)} className="w-full py-3 text-slate-600 text-sm hover:underline">
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
