/**
 * Payment History Viewer Component
 * View and manage payment records
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  Download,
  RefreshCw,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  Search
} from 'lucide-react';
import { PaymentRecord } from '../types/admin';
import { DatabaseService } from '../services/databaseService';

interface PaymentHistoryViewerProps {
  onRefund?: (paymentId: string, reason: string) => void;
  onRetry?: (paymentId: string) => void;
}

export function PaymentHistoryViewer({
  onRefund,
  onRetry
}: PaymentHistoryViewerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedPayment, setExpandedPayment] = useState<string | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real payment data from database
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setIsLoading(true);
        const result = await DatabaseService.getPaymentHistory({});
        setPayments(result.payments || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch payments:', err);
        setError('Failed to load payments');
        setPayments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.user_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total_revenue: payments
      .filter((p) => p.status === 'succeeded')
      .reduce((sum, p) => sum + p.amount, 0),
    succeeded: payments.filter((p) => p.status === 'succeeded').length,
    failed: payments.filter((p) => p.status === 'failed').length,
    pending: payments.filter((p) => p.status === 'pending').length
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-orange-200 border-t-[#FF8A2B] rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-slate-600">Loading payments...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-2" />
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₦${(stats.total_revenue / 1000000).toFixed(2)}M`,
      icon: CreditCard,
      iconClass: 'bg-gradient-to-br from-emerald-400 to-green-600 shadow-lg shadow-green-500/25 p-3 rounded-xl'
    },
    {
      title: 'Succeeded',
      value: stats.succeeded,
      icon: CheckCircle,
      iconClass: 'bg-gradient-to-br from-emerald-400 to-green-600 shadow-lg shadow-green-500/25 p-3 rounded-xl'
    },
    {
      title: 'Failed',
      value: stats.failed,
      icon: AlertCircle,
      iconClass: 'bg-gradient-to-br from-red-400 to-rose-600 shadow-lg shadow-red-500/25 p-3 rounded-xl'
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: Clock,
      iconClass: 'bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg shadow-yellow-500/25 p-3 rounded-xl'
    }
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] hover:-translate-y-1 transition-all duration-300 p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">{card.title}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
                </div>
                <div className={card.iconClass}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 p-6">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4 pl-3 border-l-4 border-[#FF8A2B]">
            Payment History
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search payment ID or user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8A2B]/20 focus:border-[#FF8A2B] transition-all"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF8A2B]/20 focus:border-[#FF8A2B] transition-all"
            >
              <option value="all">All Status</option>
              <option value="succeeded">Succeeded</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
            </select>

            {/* Export */}
            <button className="bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-slate-950 text-white rounded-xl px-4 py-2 shadow-md hover:-translate-y-0.5 transition-all duration-200 text-sm font-medium flex items-center gap-2 justify-center">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>

          {/* Desktop Table */}
          {filteredPayments.length === 0 ? (
            <div className="text-center py-16 px-6 bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-dashed border-slate-200">
              <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No payments found</p>
              <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Payment ID</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">User</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600">Date</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPayments.map((payment) => (
                      <React.Fragment key={payment.id}>
                        <tr
                          className="hover:bg-gradient-to-r hover:from-slate-50 hover:to-white transition-colors duration-150 cursor-pointer"
                          onClick={() =>
                            setExpandedPayment(expandedPayment === payment.id ? null : payment.id)
                          }
                        >
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-blue-600 font-mono">
                              {payment.id.slice(0, 12)}…
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-slate-600">{payment.user_id}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-semibold text-slate-900">
                              ₦{payment.amount.toLocaleString()}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shadow-sm ${getPaymentStatusBadge(payment.status)}`}
                            >
                              {payment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-slate-600">
                              {payment.created_at.toLocaleDateString()}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); }}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                title="View details"
                              >
                                <Eye className="w-4 h-4 text-slate-600" />
                              </button>
                              {payment.status === 'failed' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRetry?.(payment.id);
                                  }}
                                  className="text-orange-600 hover:bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200 hover:border-orange-300 transition-all duration-200 text-sm font-medium flex items-center gap-1"
                                  title="Retry payment"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                  Retry
                                </button>
                              )}
                              {payment.status === 'succeeded' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRefund?.(payment.id, 'Admin refund');
                                  }}
                                  className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 hover:border-blue-300 transition-all duration-200 text-sm font-medium flex items-center gap-1"
                                  title="Process refund"
                                >
                                  <AlertCircle className="w-3.5 h-3.5" />
                                  Refund
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Expanded Details */}
                        {expandedPayment === payment.id && (
                          <tr>
                            <td colSpan={6} className="bg-gradient-to-r from-slate-50 to-white border-t border-slate-100 px-6 py-4">
                              <PaymentDetails payment={payment} />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {filteredPayments.map((payment, idx) => (
                  <motion.div
                    key={payment.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() =>
                      setExpandedPayment(expandedPayment === payment.id ? null : payment.id)
                    }
                    className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] hover:-translate-y-0.5 transition-all duration-300 p-4 cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-xs font-mono text-blue-600 font-medium">
                        {payment.id.slice(0, 14)}…
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shadow-sm ${getPaymentStatusBadge(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{payment.user_id}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-bold text-emerald-600">
                        ₦{payment.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-400">
                        {payment.created_at.toLocaleDateString()}
                      </p>
                    </div>
                    {expandedPayment === payment.id && (
                      <div className="mt-3 pt-3 border-t border-slate-100 bg-gradient-to-r from-slate-50 to-white rounded-xl p-3">
                        <PaymentDetails payment={payment} />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface PaymentDetailsProps {
  payment: PaymentRecord;
}

function PaymentDetails({ payment }: PaymentDetailsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {payment.stripe_payment_id && (
          <DetailRow label="Stripe ID" value={payment.stripe_payment_id} />
        )}
        {payment.stripe_invoice_id && (
          <DetailRow label="Invoice ID" value={payment.stripe_invoice_id} />
        )}
        <DetailRow label="Retry Count" value={payment.retry_count} />
        {payment.failure_reason && (
          <DetailRow label="Failure Reason" value={payment.failure_reason} />
        )}
      </div>

      {payment.billing_period_start && (
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <p className="text-xs text-slate-500 font-medium mb-1">Billing Period</p>
          <p className="text-sm text-slate-900">
            {payment.billing_period_start.toLocaleDateString()} -{' '}
            {payment.billing_period_end?.toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
}

interface DetailRowProps {
  label: string;
  value: string | number;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
      <p className="text-xs text-slate-500 font-medium mb-1">{label}</p>
      <p className="text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getPaymentStatusBadge(status: string): string {
  const map: Record<string, string> = {
    succeeded: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
    refunded: 'bg-blue-100 text-blue-800'
  };
  return map[status] || 'bg-slate-100 text-slate-800';
}
