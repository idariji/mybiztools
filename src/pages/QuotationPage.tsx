import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../layout/DashboardLayout';
import { Plus, Download, Eye, Edit, Copy, Trash2, FileText, Search } from 'lucide-react';
import { Quotation, QUOTATION_STATUSES } from '../types/quotation';

export function QuotationPage() {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

  const getStatusColor = (status: string) => {
    const statusObj = QUOTATION_STATUSES.find(s => s.value === status);
    return statusObj?.color || 'gray';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Quotation Generator</h1>
            <p className="text-slate-600 mt-1">Create and manage professional quotations</p>
          </div>
          <button 
            onClick={() => navigate('/dashboard/quotations/create')}
            className="flex items-center gap-2 px-6 py-3 bg-[#FF8A2B] text-white rounded-xl font-semibold hover:bg-[#FF6B00] transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Quotation
          </button>
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
          <div className="overflow-x-auto">
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
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-${getStatusColor(quotation.status)}-100 text-${getStatusColor(quotation.status)}-700`}>
                          {QUOTATION_STATUSES.find(s => s.value === quotation.status)?.label}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button 
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4 text-slate-600" />
                          </button>
                          <button 
                            onClick={() => navigate('/dashboard/quotations/create')}
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
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4 text-slate-600" />
                          </button>
                          <button 
                            onClick={() => navigate('/dashboard/invoices/create')}
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
        </div>
      </div>
    </DashboardLayout>
  );
}
