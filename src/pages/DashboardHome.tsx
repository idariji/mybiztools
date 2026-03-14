import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../layout/DashboardLayout';
import {
  FileText,
  DollarSign,
  Clock,
  TrendingUp,
  Plus,
  Receipt,
  CreditCard,
  Bot,
  AlertCircle,
  CheckCircle,
  Zap,
  ArrowRight,
  BarChart2,
  User,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../utils/useToast';
import { ToastContainer } from '../components/ui/Toast';
import { authService } from '../services/authService';
import { safeGetJSON } from '../utils/storage';
import {
  normalisePlan,
  planDisplayName,
  canCreateDocument,
  FREE_DOCUMENT_LIMIT,
} from '../utils/planUtils';
import { getRecentActivity } from '../utils/activityLogger';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useDashboardTour } from '../hooks/useDashboardTour';

// ── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(isoString: string): string {
  const ms = Date.now() - new Date(isoString).getTime();
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} minute${min !== 1 ? 's' : ''} ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
  return new Date(isoString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Build last-6-months chart data from invoice and receipt arrays
function buildChartData(
  invoices: any[],
  receipts: any[]
): Array<{ month: string; invoices: number; receipts: number }> {
  const now = new Date();
  const months: Array<{ month: string; invoices: number; receipts: number }> = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString('default', { month: 'short' });
    months.push({ month: label, invoices: 0, receipts: 0 });
  }

  function addToBucket(arr: any[], field: 'invoices' | 'receipts') {
    for (const doc of arr) {
      if (!doc.createdAt) continue;
      const docDate = new Date(doc.createdAt);
      for (const bucket of months) {
        // match month label in the last-6-months window
        const bucketLabel = docDate.toLocaleString('default', { month: 'short' });
        // Only count if within the 6-month window
        const monthsBack =
          (now.getFullYear() - docDate.getFullYear()) * 12 +
          (now.getMonth() - docDate.getMonth());
        if (bucketLabel === bucket.month && monthsBack >= 0 && monthsBack <= 5) {
          bucket[field]++;
        }
      }
    }
  }

  addToBucket(invoices, 'invoices');
  addToBucket(receipts, 'receipts');
  return months;
}

// Plan badge colors
function planBadgeClass(plan: string | undefined | null): string {
  const tier = normalisePlan(plan);
  if (tier === 'starter') return 'bg-blue-100 text-blue-700';
  if (tier === 'pro') return 'bg-orange-100 text-orange-800';
  if (tier === 'enterprise') return 'bg-purple-100 text-purple-800';
  return 'bg-gray-100 text-gray-700';
}

// Plan feature list
function planFeatures(plan: string | undefined | null): string[] {
  const tier = normalisePlan(plan);
  if (tier === 'enterprise')
    return ['Unlimited documents', 'Priority support', 'No watermark'];
  if (tier === 'pro')
    return ['Unlimited documents', 'All tools', 'No watermark'];
  if (tier === 'starter')
    return ['Unlimited documents', 'All tools', 'Watermark on exports'];
  return ['2 documents max', 'Basic tools', 'Watermark on exports'];
}

// Profile completion percentage
function profileCompletion(user: any): number {
  if (!user) return 0;
  const fields = [
    user.firstName,
    user.lastName,
    user.email,
    user.businessName,
    user.phone,
    user.address,
    user.website,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

// ── Component ─────────────────────────────────────────────────────────────────

export function DashboardHome() {
  useDashboardTour();
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [payslips, setPayslips] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    const inv = safeGetJSON<any[]>('invoice-drafts', []);
    const quot = safeGetJSON<any[]>('quotation-drafts', []);
    const rec = safeGetJSON<any[]>('receipt-drafts', []);
    const pay = safeGetJSON<any[]>('payslip-drafts', []);

    setInvoices(inv);
    setQuotations(quot);
    setReceipts(rec);
    setPayslips(pay);

    // Recent activity from logger; fall back to derived from docs
    const logged = getRecentActivity(8);
    if (logged.length > 0) {
      setRecentActivity(logged);
    } else {
      // Derive from all docs sorted by createdAt
      type DocItem = { type: string; label: string; createdAt: string };
      const derived: DocItem[] = [
        ...inv.map((d) => ({
          type: 'invoice',
          label: `Invoice #${d.invoiceNumber || d.id || '—'}`,
          createdAt: d.createdAt || new Date(0).toISOString(),
        })),
        ...quot.map((d) => ({
          type: 'quotation',
          label: `Quotation #${d.quotationNumber || d.id || '—'}`,
          createdAt: d.createdAt || new Date(0).toISOString(),
        })),
        ...rec.map((d) => ({
          type: 'receipt',
          label: `Receipt #${d.receiptNumber || d.id || '—'}`,
          createdAt: d.createdAt || new Date(0).toISOString(),
        })),
        ...pay.map((d) => ({
          type: 'payslip',
          label: `Payslip #${d.payslipNumber || d.id || '—'}`,
          createdAt: d.createdAt || new Date(0).toISOString(),
        })),
      ]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map((d) => ({ ...d, action: 'created', id: d.label, timestamp: d.createdAt }));
      setRecentActivity(derived);
    }

    // Welcome toast (once per session)
    const hasShownWelcome = sessionStorage.getItem('welcomeShown');
    if (!hasShownWelcome) {
      const userName = currentUser?.firstName || currentUser?.name || 'there';
      addToast(`Welcome back, ${userName}!`, 'success');
      sessionStorage.setItem('welcomeShown', 'true');
    }
  }, [addToast]);

  const totalDocs = invoices.length + quotations.length + receipts.length + payslips.length;
  const plan = normalisePlan(user?.current_plan);
  const completion = profileCompletion(user);
  const chartData = buildChartData(invoices, receipts);
  const hasChartData = chartData.some((d) => d.invoices > 0 || d.receipts > 0);

  // Financial summaries
  const totalRevenue = invoices.reduce((sum, d) => {
    const v = Number(d?.summary?.total || d?.total || 0);
    return sum + v;
  }, 0);
  const totalReceiptsSum = receipts.reduce((sum, d) => {
    const v = Number(d?.summary?.total || d?.total || 0);
    return sum + v;
  }, 0);
  const pendingDrafts = [
    ...invoices,
    ...quotations,
    ...receipts,
    ...payslips,
  ].filter((d) => d?.status === 'draft').length;

  // Usage bar for plan card
  const usagePercent = Math.min((totalDocs / FREE_DOCUMENT_LIMIT) * 100, 100);

  // Activity icon colors by type
  const activityIconColor: Record<string, string> = {
    invoice: 'bg-blue-100 text-blue-600',
    quotation: 'bg-orange-100 text-orange-600',
    receipt: 'bg-green-100 text-green-600',
    payslip: 'bg-purple-100 text-purple-600',
  };

  // Smart alerts
  type Alert = { message: string; type: 'error' | 'warning' | 'info' | 'success'; link?: string };
  const alerts: Alert[] = [];

  if (!user?.phone) {
    alerts.push({
      message: 'Add your phone number to complete your profile',
      type: 'info',
      link: '/dashboard/profile',
    });
  }
  if (!user?.emailVerified) {
    alerts.push({
      message: 'Please verify your email address',
      type: 'warning',
    });
  }
  if (plan === 'free' && totalDocs >= FREE_DOCUMENT_LIMIT) {
    alerts.push({
      message: "You've hit the free plan limit. Upgrade to create more.",
      type: 'warning',
      link: '/dashboard/subscription',
    });
  }
  if (totalDocs === 0) {
    alerts.push({
      message: 'Create your first document to get started',
      type: 'info',
      link: '/dashboard/invoices/create',
    });
  }
  if (plan !== 'free' && totalDocs > 0) {
    alerts.push({
      message: `Great work! You have ${totalDocs} document${totalDocs !== 1 ? 's' : ''} created`,
      type: 'success',
    });
  }

  const displayAlerts = alerts.slice(0, 4);

  const alertStyleMap: Record<string, { bg: string; icon: string; border: string }> = {
    error: { bg: 'bg-red-50', icon: 'text-red-600', border: 'border-l-4 border-red-400' },
    warning: { bg: 'bg-orange-50', icon: 'text-orange-600', border: 'border-l-4 border-orange-400' },
    info: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-l-4 border-blue-400' },
    success: { bg: 'bg-green-50', icon: 'text-green-600', border: 'border-l-4 border-green-400' },
  };

  const quickActions = [
    {
      icon: FileText,
      label: 'New Invoice',
      color: 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/30',
      action: () => navigate('/dashboard/invoices/create'),
    },
    {
      icon: Receipt,
      label: 'New Receipt',
      color: 'bg-gradient-to-br from-emerald-400 to-green-600 shadow-lg shadow-emerald-500/30',
      action: () => navigate('/dashboard/receipts/create'),
    },
    {
      icon: FileText,
      label: 'New Quotation',
      color: 'bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-500/30',
      action: () => navigate('/dashboard/quotations/create'),
    },
    {
      icon: CreditCard,
      label: 'Generate Payslip',
      color: 'bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg shadow-purple-500/30',
      action: () => navigate('/dashboard/payslips/create'),
    },
  ];

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <DashboardLayout>
        <div className="space-y-4 sm:space-y-6">

          {/* ── Header / Welcome ── */}
          <motion.div
            id="tour-welcome"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <h1 className="text-xl sm:text-3xl font-bold text-slate-900">
              Welcome back, {user?.firstName || user?.name || 'there'}!
            </h1>
            <p className="text-xs sm:text-base text-slate-600 mt-1">
              Here's what's happening with your business today.
            </p>

            {/* Profile completion bar */}
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1 bg-gray-200 rounded-full h-1.5 max-w-xs">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${completion}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">Profile {completion}% complete</span>
              {completion < 80 && (
                <button
                  onClick={() => navigate('/dashboard/profile')}
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  Complete Profile
                </button>
              )}
            </div>
          </motion.div>

          {/* ── Row 1: Financial Summary ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4" id="tour-stats">
            {[
              {
                icon: DollarSign,
                label: 'Total Revenue',
                value: `₦${Number(totalRevenue || 0).toLocaleString()}`,
                color: 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/30',
                topBar: 'bg-gradient-to-r from-blue-400 to-blue-600',
                bg: 'bg-blue-50',
              },
              {
                icon: Receipt,
                label: 'Total Receipts',
                value: `₦${Number(totalReceiptsSum || 0).toLocaleString()}`,
                color: 'bg-gradient-to-br from-emerald-400 to-green-600 shadow-lg shadow-emerald-500/30',
                topBar: 'bg-gradient-to-r from-emerald-400 to-green-600',
                bg: 'bg-green-50',
              },
              {
                icon: Clock,
                label: 'Pending Drafts',
                value: pendingDrafts.toString(),
                color: 'bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-500/30',
                topBar: 'bg-gradient-to-r from-orange-400 to-orange-600',
                bg: 'bg-orange-50',
              },
              {
                icon: FileText,
                label: 'Total Documents',
                value: totalDocs.toString(),
                color: 'bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg shadow-purple-500/30',
                topBar: 'bg-gradient-to-r from-purple-400 to-purple-600',
                bg: 'bg-purple-50',
              },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="bg-white rounded-2xl p-3.5 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-100 hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`h-1 ${stat.topBar} rounded-full mb-4`} />
                <div className={`inline-flex p-2.5 rounded-xl ${stat.color} mb-3`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-lg sm:text-2xl font-bold text-slate-900 truncate tabular-nums">{stat.value}</p>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* ── Row 2: Chart + Plan ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Monthly Overview Chart */}
            <motion.div
              className="lg:col-span-2 bg-white rounded-2xl p-4 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-100 transition-all duration-300"
              id="tour-chart"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 className="w-5 h-5 text-slate-500" />
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Monthly Overview</h2>
              </div>
              {hasChartData ? (
                <div className="h-40 sm:h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '13px',
                      }}
                    />
                    <Bar dataKey="invoices" name="Invoices" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="receipts" name="Receipts" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                  <BarChart2 className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm">No data yet — start creating documents</p>
                </div>
              )}
              {/* Legend */}
              {hasChartData && (
                <div className="flex items-center gap-4 mt-3 justify-end">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" />
                    <span className="text-xs text-gray-500">Invoices</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-green-500 inline-block" />
                    <span className="text-xs text-gray-500">Receipts</span>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Your Plan Card */}
            <div
              className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-4 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-100 flex flex-col gap-4 transition-all duration-300"
              id="tour-plan"
            >
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2 pl-3 border-l-4 border-[#FF8A2B]">Your Plan</h2>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${planBadgeClass(
                    user?.current_plan
                  )}`}
                >
                  {planDisplayName(user?.current_plan)}
                </span>
              </div>

              {/* Feature list */}
              <ul className="space-y-2">
                {planFeatures(user?.current_plan).map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-slate-700">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Usage bar */}
              {plan === 'free' && (
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{totalDocs} of {FREE_DOCUMENT_LIMIT} docs used</span>
                    <span>Free limit</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-orange-500 h-1.5 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                </div>
              )}
              {plan !== 'free' && (
                <div className="flex items-center gap-2 text-green-700 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Unlimited documents
                </div>
              )}

              <button
                onClick={() => navigate('/dashboard/subscription')}
                className="mt-auto w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm rounded-xl transition-colors hover:scale-[1.02] active:scale-[0.98]"
              >
                <TrendingUp className="w-4 h-4" />
                Upgrade Plan
              </button>
            </div>
          </div>

          {/* ── Row 3: Quick Actions ── */}
          <div
            className="bg-white rounded-2xl p-3.5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-100 transition-all duration-300"
            id="tour-quick-actions"
          >
            <h2 className="text-base sm:text-xl font-bold text-slate-900 mb-3 sm:mb-4 pl-3 border-l-4 border-[#FF8A2B]">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={action.action}
                  className="group flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-6 rounded-xl border-2 border-slate-200 hover:border-[#FF8A2B] hover:bg-slate-50 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#FF8A2B]/20 active:scale-95 transition-all duration-300"
                >
                  <div className={`${action.color} p-3 sm:p-4 rounded-xl`}>
                    <action.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform duration-200" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-900 text-center leading-tight">
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Row 4: Recent Activity + Smart Alerts ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
            {/* Recent Activity */}
            <div
              className="bg-white rounded-2xl p-3.5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-100 transition-all duration-300"
              id="tour-activity"
            >
              <h2 className="text-base sm:text-xl font-bold text-slate-900 mb-3 sm:mb-4 pl-3 border-l-4 border-[#FF8A2B]">
                Recent Activity
              </h2>
              {recentActivity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                  <Clock className="w-8 h-8 mb-2 opacity-40" />
                  <p className="text-sm">No recent activity. Create your first document!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentActivity.map((activity, idx) => {
                    const colorClass =
                      activityIconColor[activity.type] || 'bg-slate-100 text-slate-600';
                    return (
                      <div
                        key={activity.id || idx}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gradient-to-r hover:from-slate-50 hover:to-white transition-colors"
                      >
                        <div className={`p-2 rounded-lg shrink-0 ${colorClass}`}>
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {activity.label}
                          </p>
                          <p className="text-xs text-slate-400">
                            {activity.action === 'created' ? 'Created' : 'Updated'} ·{' '}
                            {activity.timestamp ? timeAgo(activity.timestamp) : '—'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Smart Alerts */}
            <div
              className="bg-white rounded-2xl p-3.5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-100 transition-all duration-300"
              id="tour-alerts"
            >
              <h2 className="text-base sm:text-xl font-bold text-slate-900 mb-3 sm:mb-4 pl-3 border-l-4 border-[#FF8A2B]">
                Alerts &amp; Reminders
              </h2>
              {displayAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                  <CheckCircle className="w-8 h-8 mb-2 opacity-40" />
                  <p className="text-sm">All clear! Nothing to action right now.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {displayAlerts.map((alert, idx) => {
                    const style = alertStyleMap[alert.type] || alertStyleMap['info'];
                    const Icon =
                      alert.type === 'success'
                        ? CheckCircle
                        : alert.type === 'error'
                        ? AlertCircle
                        : AlertCircle;
                    return (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 p-4 rounded-lg ${style.bg} ${style.border}`}
                      >
                        <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${style.icon}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-700">{alert.message}</p>
                          {alert.link && (
                            <button
                              onClick={() => navigate(alert.link!)}
                              className="text-xs font-medium mt-1 text-blue-600 hover:underline flex items-center gap-1"
                            >
                              Take action <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </DashboardLayout>
    </>
  );
}
