import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Building,
  Calendar,
  Shield,
  CheckCircle,
  AlertCircle,
  FileText,
  ArrowRight,
  TrendingUp,
  Edit,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { authService } from '../services/authService';
import { normalisePlan, planDisplayName, FREE_DOCUMENT_LIMIT } from '../utils/planUtils';
import { safeGetJSON } from '../utils/storage';

// Helper: days ago from a timestamp
function daysAgo(ts: number | undefined): string {
  if (!ts) return 'None yet';
  const diff = Date.now() - ts;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

// Plan badge colors
function planBadgeClass(plan: string | undefined | null): string {
  const tier = normalisePlan(plan);
  if (tier === 'starter') return 'bg-blue-100 text-blue-700';
  if (tier === 'pro') return 'bg-orange-100 text-orange-800';
  if (tier === 'enterprise') return 'bg-purple-100 text-purple-800';
  return 'bg-gray-100 text-gray-700';
}

export const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [payslips, setPayslips] = useState<any[]>([]);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    setInvoices(safeGetJSON<any[]>('invoice-drafts', []));
    setQuotations(safeGetJSON<any[]>('quotation-drafts', []));
    setReceipts(safeGetJSON<any[]>('receipt-drafts', []));
    setPayslips(safeGetJSON<any[]>('payslip-drafts', []));
  }, []);

  const totalDocs = invoices.length + quotations.length + receipts.length + payslips.length;
  const plan = normalisePlan(user?.current_plan);
  const displayName = planDisplayName(user?.current_plan);
  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Not set';

  // Member since: prefer createdAt, fallback loginTime, fallback 'Today'
  const memberSinceRaw = user?.createdAt || user?.loginTime;
  const memberSince = memberSinceRaw
    ? new Date(memberSinceRaw).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Today';

  // Most recent createdAt per type
  function latestTs(arr: any[]): number | undefined {
    const timestamps = arr
      .map((d) => (d.createdAt ? new Date(d.createdAt).getTime() : 0))
      .filter((t) => t > 0);
    return timestamps.length > 0 ? Math.max(...timestamps) : undefined;
  }

  const statCards = [
    {
      label: 'Invoices',
      count: invoices.length,
      last: daysAgo(latestTs(invoices)),
      color: 'bg-blue-50',
      textColor: 'text-blue-600',
      iconGradient: 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/30',
      navigate: '/dashboard/invoices',
    },
    {
      label: 'Quotations',
      count: quotations.length,
      last: daysAgo(latestTs(quotations)),
      color: 'bg-orange-50',
      textColor: 'text-orange-600',
      iconGradient: 'bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-500/30',
      navigate: '/dashboard/quotations',
    },
    {
      label: 'Receipts',
      count: receipts.length,
      last: daysAgo(latestTs(receipts)),
      color: 'bg-green-50',
      textColor: 'text-green-600',
      iconGradient: 'bg-gradient-to-br from-emerald-400 to-green-600 shadow-lg shadow-emerald-500/30',
      navigate: '/dashboard/receipts',
    },
    {
      label: 'Payslips',
      count: payslips.length,
      last: daysAgo(latestTs(payslips)),
      color: 'bg-purple-50',
      textColor: 'text-purple-600',
      iconGradient: 'bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg shadow-purple-500/30',
      navigate: '/dashboard/payslips',
    },
  ];

  // Recent documents across all types (last 5 by createdAt)
  type DocRow = {
    type: 'Invoice' | 'Quotation' | 'Receipt' | 'Payslip';
    number: string;
    createdAt: number;
    path: string;
    badgeClass: string;
  };

  const allDocs: DocRow[] = [
    ...invoices.map((d) => ({
      type: 'Invoice' as const,
      number: d.invoiceNumber || d.id || '—',
      createdAt: d.createdAt ? new Date(d.createdAt).getTime() : 0,
      path: '/dashboard/invoices',
      badgeClass: 'bg-blue-100 text-blue-700',
    })),
    ...quotations.map((d) => ({
      type: 'Quotation' as const,
      number: d.quotationNumber || d.id || '—',
      createdAt: d.createdAt ? new Date(d.createdAt).getTime() : 0,
      path: '/dashboard/quotations',
      badgeClass: 'bg-orange-100 text-orange-700',
    })),
    ...receipts.map((d) => ({
      type: 'Receipt' as const,
      number: d.receiptNumber || d.id || '—',
      createdAt: d.createdAt ? new Date(d.createdAt).getTime() : 0,
      path: '/dashboard/receipts',
      badgeClass: 'bg-green-100 text-green-700',
    })),
    ...payslips.map((d) => ({
      type: 'Payslip' as const,
      number: d.payslipNumber || d.id || '—',
      createdAt: d.createdAt ? new Date(d.createdAt).getTime() : 0,
      path: '/dashboard/payslips',
      badgeClass: 'bg-purple-100 text-purple-700',
    })),
  ]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);

  const usagePercent = Math.min((totalDocs / FREE_DOCUMENT_LIMIT) * 100, 100);
  const usageNearLimit = usagePercent >= 75;

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Account</h1>
        <p className="text-gray-600 mt-1">View and manage your account information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* ── Left Column ── */}
        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
          {/* Profile Card */}
          <motion.div
            className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-100 p-4 sm:p-6 text-center transition-all duration-300"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold mx-auto mb-4 ring-4 ring-blue-100 ring-offset-2">
              {fullName !== 'Not set' ? fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{fullName}</h2>
            <p className="text-sm text-gray-500 mt-1">{user?.email || '—'}</p>
            {user?.businessName && (
              <p className="text-sm text-gray-400 mt-1">{user.businessName}</p>
            )}

            {/* Plan badge */}
            <div className="mt-3 flex justify-center">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${planBadgeClass(
                  user?.current_plan
                )}`}
              >
                {displayName}
              </span>
            </div>

            {/* Edit Profile button */}
            <button
              onClick={() => navigate('/dashboard/profile')}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-lg transition-colors hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>

            {/* Upgrade button (free only) */}
            {plan === 'free' && (
              <button
                onClick={() => navigate('/dashboard/subscription')}
                className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm rounded-lg transition-colors hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"
              >
                <TrendingUp className="w-4 h-4" />
                Upgrade Plan
              </button>
            )}
          </motion.div>

          {/* Document Usage Card */}
          <motion.div
            className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-100 p-4 sm:p-6 transition-all duration-300"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-base font-semibold text-gray-900 mb-3 pl-3 border-l-4 border-[#FF8A2B]">Document Usage</h3>
            {plan === 'free' ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    {totalDocs} of {FREE_DOCUMENT_LIMIT} documents used
                  </span>
                  <span className="text-xs text-gray-400">free plan limit</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-700 ease-out ${
                      usageNearLimit
                        ? 'bg-gradient-to-r from-orange-400 to-red-500'
                        : 'bg-gradient-to-r from-blue-400 to-blue-500'
                    }`}
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
                {totalDocs >= FREE_DOCUMENT_LIMIT && (
                  <p className="text-xs text-orange-600 mt-2 font-medium">
                    Limit reached.{' '}
                    <button
                      onClick={() => navigate('/dashboard/subscription')}
                      className="underline hover:no-underline"
                    >
                      Upgrade to create more
                    </button>
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">Unlimited documents</span>
              </div>
            )}
          </motion.div>
        </div>

        {/* ── Right Column ── */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Account Information Card */}
          <motion.div
            className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-100 p-4 sm:p-6 transition-all duration-300"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold mb-4 pl-3 border-l-4 border-[#FF8A2B]">Account Information</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 hover:bg-slate-50 rounded-lg p-2 -mx-2 transition-colors">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium text-gray-900">{fullName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 hover:bg-slate-50 rounded-lg p-2 -mx-2 transition-colors">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Email Address</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-900">{user?.email || 'Not set'}</p>
                    {user?.emailVerified ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <CheckCircle className="w-3 h-3" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                        <AlertCircle className="w-3 h-3" /> Pending
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {user?.businessName && (
                <div className="flex items-start gap-3 hover:bg-slate-50 rounded-lg p-2 -mx-2 transition-colors">
                  <Building className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Business Name</p>
                    <p className="font-medium text-gray-900">{user.businessName}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 hover:bg-slate-50 rounded-lg p-2 -mx-2 transition-colors">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium text-gray-900">{memberSince}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 hover:bg-slate-50 rounded-lg p-2 -mx-2 transition-colors">
                <Shield className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Account Status</p>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3" /> Active
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Account Statistics Card */}
          <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-100 p-4 sm:p-6 transition-all duration-300">
            <h3 className="text-lg font-semibold mb-4 pl-3 border-l-4 border-[#FF8A2B]">Account Statistics</h3>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {statCards.map((card, idx) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + idx * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className={`p-4 ${card.color} rounded-lg hover:-translate-y-1 hover:shadow-lg transition-all duration-300`}
                >
                  <p className="text-sm text-gray-600">{card.label}</p>
                  <p className={`text-2xl font-bold ${card.textColor} mt-1 tabular-nums`}>
                    {card.count}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Last: {card.last}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recent Documents Card */}
          <motion.div
            className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-100 p-4 sm:p-6 transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-lg font-semibold mb-4 pl-3 border-l-4 border-[#FF8A2B]">Recent Documents</h3>
            {allDocs.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No documents created yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {allDocs.map((doc, idx) => (
                  <button
                    key={idx}
                    onClick={() => navigate(doc.path)}
                    className="w-full flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 p-3 rounded-lg hover:bg-gradient-to-r hover:from-slate-50 hover:to-white transition-colors text-left"
                  >
                    <div className="flex items-center gap-2 w-full sm:contents">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${doc.badgeClass} shrink-0`}
                      >
                        {doc.type}
                      </span>
                      <span className="flex-1 text-sm font-medium text-gray-800 truncate">
                        #{doc.number}
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-300 shrink-0 sm:hidden" />
                    </div>
                    <span className="text-xs text-gray-400 sm:shrink-0 sm:ml-auto pl-0">
                      {doc.createdAt
                        ? new Date(doc.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-300 shrink-0 hidden sm:block" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
