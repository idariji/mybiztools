/**
 * Payment History Viewer Component
 * View and manage payment records
 */

import React, { useState, useEffect } from 'react';
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
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-600">Loading payments...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-2" />
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <PaymentStatCard
          title="Total Revenue"
          value={`₦${(stats.total_revenue / 1000000).toFixed(2)}M`}
          icon={CreditCard}
          color="bg-green-50"
        />
        <PaymentStatCard
          title="Succeeded"
          value={stats.succeeded}
          icon={CheckCircle}
          color="bg-green-50"
        />
        <PaymentStatCard
          title="Failed"
          value={stats.failed}
          icon={AlertCircle}
          color="bg-red-50"
        />
        <PaymentStatCard
          title="Pending"
          value={stats.pending}
          icon={Clock}
          color="bg-yellow-50"
        />
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Payment History</h2>        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search payment ID or user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="succeeded">Succeeded</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
          </select>

          {/* Export */}
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center gap-2 justify-center">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                  Payment ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <React.Fragment key={payment.id}>
                  <tr
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      setExpandedPayment(
                        expandedPayment === payment.id ? null : payment.id
                      )
                    }
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-blue-600">
                        {payment.id}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{payment.user_id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">
                        ₦{payment.amount.toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusBadge(
                          payment.status
                        )}`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">
                        {payment.created_at.toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        {payment.status === 'failed' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRetry?.(payment.id);
                            }}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Retry payment"
                          >
                            <RefreshCw className="w-4 h-4 text-blue-600" />
                          </button>
                        )}
                        {payment.status === 'succeeded' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRefund?.(payment.id, 'Admin refund');
                            }}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                            title="Process refund"
                          >
                            <AlertCircle className="w-4 h-4 text-red-600" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Details */}
                  {expandedPayment === payment.id && (
                    <tr className="bg-gray-50">
                      <td colSpan={6} className="px-6 py-4">
                        <PaymentDetails payment={payment} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface PaymentStatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

function PaymentStatCard({
  title,
  value,
  icon: Icon,
  color
}: PaymentStatCardProps) {
  return (
    <div className={`${color} rounded-lg border border-gray-200 p-4`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-600 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <Icon className="w-6 h-6 text-gray-400" />
      </div>
    </div>
  );
}

interface PaymentDetailsProps {
  payment: PaymentRecord;
}

function PaymentDetails({ payment }: PaymentDetailsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {payment.stripe_payment_id && (
          <DetailRow
            label="Stripe ID"
            value={payment.stripe_payment_id}
          />
        )}
        {payment.stripe_invoice_id && (
          <DetailRow
            label="Invoice ID"
            value={payment.stripe_invoice_id}
          />
        )}
        <DetailRow
          label="Retry Count"
          value={payment.retry_count}
        />
        {payment.failure_reason && (
          <DetailRow
            label="Failure Reason"
            value={payment.failure_reason}
          />
        )}
      </div>

      {payment.billing_period_start && (
        <div className="bg-gray-100 p-3 rounded border border-gray-300">
          <p className="text-xs text-gray-600 font-medium mb-1">Billing Period</p>
          <p className="text-sm text-gray-900">
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
    <div className="bg-gray-100 p-3 rounded border border-gray-300">
      <p className="text-xs text-gray-600 font-medium mb-1">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
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
  return map[status] || 'bg-gray-100 text-gray-800';
}
