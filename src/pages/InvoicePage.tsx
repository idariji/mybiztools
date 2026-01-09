import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../layout/DashboardLayout';
import { Plus, Download, Eye, Trash2, FileText } from 'lucide-react';
import { Invoice } from '../types/invoice';
import { useToast } from '../utils/useToast';
import { ToastContainer } from '../components/ui/Toast';

export function InvoicePage() {
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);

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
        <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Invoice Generator</h1>
            <p className="text-slate-600 mt-1">Create and manage professional invoices</p>
          </div>
          <button 
            onClick={() => navigate('/dashboard/invoices/create')}
            className="flex items-center gap-2 px-6 py-3 bg-[#FF8A2B] text-white rounded-xl font-semibold hover:bg-[#FF6B00] transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Invoice
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Invoices ({invoices.length})</h2>
          
          {invoices.length === 0 ? (
            <div className="text-center py-12">
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
            <div className="overflow-x-auto">
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
                    <tr key={invoice.invoiceNumber} className="border-b border-slate-100 hover:bg-slate-50">
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
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
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
                            <Eye className="w-4 h-4 text-slate-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(invoice.invoiceNumber)}
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
