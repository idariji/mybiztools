import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../layout/DashboardLayout';
import { Plus, Download, Eye, Edit, Copy, Trash2, FileText, Search, Lock, Zap } from 'lucide-react';
import { Quotation, QUOTATION_STATUSES } from '../types/quotation';
import { authService } from '../services/authService';
import { canCreateDocument, FREE_DOCUMENT_LIMIT, normalisePlan } from '../utils/planUtils';

export function QuotationPage() {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const user = authService.getCurrentUser();
  const plan = user?.current_plan;
  const isFree = normalisePlan(plan) === 'free';

  useEffect(() => {
    const drafts = JSON.parse(localStorage.getItem('quotation-drafts') || '[]');
    setQuotations(drafts);
  }, []);

  const filteredQuotations = quotations.filter(q => {
    const matchesSearch = q.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         q.clientInfo.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDuplicate = (quotation: Quotation) => {
    const duplicated = {
      ...quotation,
      quotationNumber: `${quotation.quotationNumber}-COPY`,
      status: 'draft' as const,
      createdAt: new Date().toISOString(),
    };
    const drafts = [...quotations, duplicated];
    localStorage.setItem('quotation-drafts', JSON.stringify(drafts));
    setQuotations(drafts);
  };

  const handleDelete = (quotationNumber: string) => {
    if (confirm('Are you sure you want to delete this quotation?')) {
      const updated = quotations.filter(q => q.quotationNumber !== quotationNumber);
      localStorage.setItem('quotation-drafts', JSON.stringify(updated));
      setQuotations(updated);
    }
  };

  const STATUS_CLASS_MAP: Record<string, string> = {
    gray: 'bg-gray-100 text-gray-700',
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
    orange: 'bg-orange-100 text-orange-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    purple: 'bg-purple-100 text-purple-700',
  };

  const getStatusClasses = (status: string) => {
    const statusObj = QUOTATION_STATUSES.find(s => s.value === status);
    return STATUS_CLASS_MAP[statusObj?.color || 'gray'] || STATUS_CLASS_MAP.gray;
  };

  const handleView = (quotation: Quotation) => {
    localStorage.setItem('current-quotation', JSON.stringify(quotation));
    navigate('/dashboard/quotations/create');
  };

  const handleConvertToInvoice = (quotation: Quotation) => {
    const invoiceData = {
      invoiceNumber: `INV-${Date.now()}`,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: quotation.validUntil,
      currency: quotation.currency,
      businessInfo: quotation.businessInfo,
      clientInfo: quotation.clientInfo,
      items: quotation.items,
      summary: {
        subtotal: quotation.summary.subtotal,
        tax: quotation.summary.totalVat,
        discount: quotation.summary.discount,
        total: quotation.summary.total,
      },
      notes: quotation.notes,
      terms: quotation.terms,
      status: 'draft',
    };
    localStorage.setItem('current-invoice', JSON.stringify(invoiceData));
    navigate('/dashboard/invoices/create');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Quotation Generator</h1>
            <p className="text-slate-600 mt-1">Create and manage professional quotations</p>
          </div>
          <div className="flex items-center gap-3">
            {isFree && (
              <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
                {quotations.length}/{FREE_DOCUMENT_LIMIT} quotations used
              </span>
            )}
            <button
              onClick={() => {
                if (!canCreateDocument(plan, quotations.length)) { setShowUpgrade(true); return; }
                navigate('/dashboard/quotations/create');
              }}
              className="flex items-center gap-2 px-6 py-3 bg-[#FF8A2B] text-white rounded-xl font-semibold hover:bg-[#FF6B00] transition-colors"
            >
              {!canCreateDocument(plan, quotations.length) ? <Lock className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              New Quotation
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by quotation number or client name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF8A2B] focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              {QUOTATION_STATUSES.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quotations Table */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Quotations ({filteredQuotations.length})
          </h2>
          {/* Desktop table - hidden on mobile */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Quotation #</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Client</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Valid Until</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      No quotations found. Create your first quotation!
                    </td>
                  </tr>
                ) : (
                  filteredQuotations.map((quotation) => (
                    <tr key={quotation.quotationNumber} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-4 px-4 text-sm text-slate-900 font-medium">{quotation.quotationNumber}</td>
                      <td className="py-4 px-4 text-sm text-slate-600">{quotation.clientInfo.name}</td>
                      <td className="py-4 px-4 text-sm text-slate-900 font-semibold">
                        {quotation.summary.total.toLocaleString()} {quotation.currency}
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-600">
                        {new Date(quotation.validUntil).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClasses(quotation.status)}`}>
                          {QUOTATION_STATUSES.find(s => s.value === quotation.status)?.label}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleView(quotation)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            title="View / Edit"
                          >
                            <Eye className="w-4 h-4 text-slate-600" />
                          </button>
                          <button
                            onClick={() => handleView(quotation)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-slate-600" />
                          </button>
                          <button
                            onClick={() => handleDuplicate(quotation)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Duplicate"
                          >
                            <Copy className="w-4 h-4 text-slate-600" />
                          </button>
                          <button
                            onClick={() => handleView(quotation)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Download (opens editor)"
                          >
                            <Download className="w-4 h-4 text-slate-600" />
                          </button>
                          <button
                            onClick={() => handleConvertToInvoice(quotation)}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Convert to Invoice"
                          >
                            <FileText className="w-4 h-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(quotation.quotationNumber)}
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

          {/* Mobile card list - hidden on desktop */}
          {filteredQuotations.length === 0 ? (
            <div className="md:hidden py-8 text-center text-gray-500">
              No quotations found. Create your first quotation!
            </div>
          ) : (
            <div className="md:hidden space-y-3">
              {filteredQuotations.map((quotation) => (
                <div key={quotation.quotationNumber} className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-bold text-slate-900">{quotation.quotationNumber}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${getStatusClasses(quotation.status)}`}>
                      {QUOTATION_STATUSES.find(s => s.value === quotation.status)?.label}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{quotation.clientInfo.name}</p>
                  <p className="text-base font-semibold text-slate-900">
                    {quotation.summary.total.toLocaleString()} {quotation.currency}
                  </p>
                  <p className="text-xs text-slate-500">Valid Until: {new Date(quotation.validUntil).toLocaleDateString()}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleView(quotation)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                    <button
                      onClick={() => handleConvertToInvoice(quotation)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" /> Convert
                    </button>
                    <button
                      onClick={() => handleDelete(quotation.quotationNumber)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
              You've reached the <strong>{FREE_DOCUMENT_LIMIT} quotation limit</strong> on the Free plan.
            </p>
            <p className="text-slate-600 mb-6">
              Upgrade to <strong>Starter, Business Pro, or Enterprise Suite</strong> for unlimited quotations and full access to all features.
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
