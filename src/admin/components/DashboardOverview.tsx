/**
 * Admin Dashboard Overview Component
 * Main metrics and KPIs display
 */

import React, { useEffect, useState } from 'react';
import {
  Users,
  DollarSign,
  AlertTriangle,
  Activity,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { DashboardMetrics, SubscriptionMetrics, PaymentMetrics } from '../types/admin';
import { DatabaseService } from '../services/databaseService';

interface DashboardOverviewProps {
  metrics?: DashboardMetrics;
  subscriptionMetrics?: SubscriptionMetrics;
  paymentMetrics?: PaymentMetrics;
  loading?: boolean;
}

const revenueData = [
  { month: 'Oct', revenue: 145000, users: 120 },
  { month: 'Nov', revenue: 189000, users: 145 },
  { month: 'Dec', revenue: 210000, users: 178 },
  { month: 'Jan', revenue: 178000, users: 165 },
  { month: 'Feb', revenue: 243000, users: 210 },
  { month: 'Mar', revenue: 289000, users: 248 },
];

export function DashboardOverview({
  metrics: propMetrics,
  subscriptionMetrics: propSubMetrics,
  paymentMetrics: propPayMetrics,
  loading: propLoading
}: DashboardOverviewProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(propMetrics || null);
  const [subMetrics, setSubMetrics] = useState<SubscriptionMetrics | null>(propSubMetrics || null);
  const [payMetrics, setPayMetrics] = useState<PaymentMetrics | null>(propPayMetrics || null);
  const [isLoading, setIsLoading] = useState(propLoading ?? true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real dashboard metrics from database
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setIsLoading(true);
        const response = await DatabaseService.getDashboardMetrics();

        // Parse metrics from backend response structure
        if (response?.success && response.data) {
          const data = response.data;
          const totalUsers = data.users?.total || 0;
          const freeCount = data.users?.byPlan?.free || 0;
          const proCount = data.users?.byPlan?.pro || 0;
          const enterpriseCount = data.users?.byPlan?.enterprise || 0;
          const totalPaidUsers = proCount + enterpriseCount;

          setMetrics({
            total_users: totalUsers,
            active_subscriptions: data.users?.active || 0,
            revenue_current_month: data.revenue?.thisMonth || 0,
            revenue_previous_month: data.revenue?.lastMonth || 0,
            churn_rate: 0,
            payment_success_rate: totalPaidUsers > 0
              ? Math.round(((data.payments?.thisMonthCount || 0) / totalPaidUsers) * 100)
              : 0,
            open_abuse_reports: data.abuse?.pendingReports || 0,
            suspension_count: data.users?.suspended || 0
          });

          setSubMetrics({
            free_count: freeCount,
            pro_count: proCount,
            enterprise_count: enterpriseCount,
            free_percentage: totalUsers > 0 ? (freeCount / totalUsers) * 100 : 0,
            pro_percentage: totalUsers > 0 ? (proCount / totalUsers) * 100 : 0,
            enterprise_percentage: totalUsers > 0 ? (enterpriseCount / totalUsers) * 100 : 0,
            mrr: data.revenue?.mrr || 0,
            arr: (data.revenue?.mrr || 0) * 12
          });

          const thisMonthCount = data.payments?.thisMonthCount || 0;
          const failedCount = data.payments?.failedCount || 0;
          const totalPayments = thisMonthCount + failedCount;

          setPayMetrics({
            total_revenue: data.revenue?.thisMonth || 0,
            succeeded_payments: thisMonthCount,
            failed_payments: failedCount,
            pending_payments: 0,
            refunded_amount: 0,
            average_transaction: thisMonthCount > 0
              ? (data.revenue?.thisMonth || 0) / thisMonthCount
              : 0,
            payment_success_rate: totalPayments > 0
              ? Math.round((thisMonthCount / totalPayments) * 100)
              : 100
          });
        }
        setError(null);
      } catch (err) {
        console.error('Failed to fetch dashboard metrics:', err);
        // Show mock data when backend is unavailable
        setMetrics({
          total_users: 0,
          active_subscriptions: 0,
          revenue_current_month: 0,
          revenue_previous_month: 0,
          churn_rate: 0,
          payment_success_rate: 0,
          open_abuse_reports: 0,
          suspension_count: 0
        });
        setError('Backend unavailable. Start the backend server at http://localhost:3001');
      } finally {
        setIsLoading(false);
      }
    };

    if (!propMetrics) {
      fetchMetrics();
    }
  }, [propMetrics]);

  // Use zero values as defaults when data is not yet loaded
  const defaultMetrics: DashboardMetrics = metrics || {
    total_users: 0,
    active_subscriptions: 0,
    revenue_current_month: 0,
    revenue_previous_month: 0,
    churn_rate: 0,
    payment_success_rate: 0,
    open_abuse_reports: 0,
    suspension_count: 0
  };

  const defaultSubMetrics: SubscriptionMetrics = subMetrics || {
    free_count: 0,
    pro_count: 0,
    enterprise_count: 0,
    free_percentage: 0,
    pro_percentage: 0,
    enterprise_percentage: 0,
    mrr: 0,
    arr: 0
  };

  const defaultPayMetrics: PaymentMetrics = payMetrics || {
    total_revenue: 0,
    succeeded_payments: 0,
    failed_payments: 0,
    pending_payments: 0,
    refunded_amount: 0,
    average_transaction: 0,
    payment_success_rate: 0
  };

  const revenueGrowth =
    defaultMetrics.revenue_previous_month > 0
      ? ((defaultMetrics.revenue_current_month - defaultMetrics.revenue_previous_month) /
          defaultMetrics.revenue_previous_month) *
        100
      : 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-slate-100 rounded-2xl h-32 animate-pulse" />
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6 h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-orange-200 border-t-[#FF8A2B] rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-slate-600">Loading dashboard metrics...</p>
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
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-2" />
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const kpiCards = [
    {
      title: 'Total Users',
      value: defaultMetrics.total_users.toLocaleString(),
      icon: Users,
      trend: '+5.2%',
      accentColor: 'bg-blue-500',
      iconGradient: 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/30',
    },
    {
      title: 'Monthly Revenue',
      value: `₦${(defaultMetrics.revenue_current_month / 1000000).toFixed(1)}M`,
      icon: DollarSign,
      trend: `${revenueGrowth > 0 ? '+' : ''}${revenueGrowth.toFixed(1)}%`,
      accentColor: 'bg-emerald-500',
      iconGradient: 'bg-gradient-to-br from-emerald-400 to-green-600 shadow-lg shadow-green-500/30',
    },
    {
      title: 'Active Subscriptions',
      value: defaultMetrics.active_subscriptions.toLocaleString(),
      icon: Activity,
      trend: `${defaultMetrics.churn_rate}% churn`,
      accentColor: 'bg-purple-500',
      iconGradient: 'bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg shadow-purple-500/30',
    },
    {
      title: 'Payment Success',
      value: `${defaultMetrics.payment_success_rate}%`,
      icon: TrendingUp,
      trend: defaultMetrics.payment_success_rate >= 94 ? 'Healthy' : 'Low',
      accentColor: 'bg-orange-500',
      iconGradient: 'bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-500/30',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, idx) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            {/* Top accent bar */}
            <div className={`h-1 w-full ${card.accentColor}`} />
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-slate-500 font-medium">{card.title}</p>
                  <p className="text-3xl font-bold text-slate-900 tabular-nums mt-2">{card.value}</p>
                  {card.trend && (
                    <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {card.trend}
                    </span>
                  )}
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.iconGradient}`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart + Plan Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
          <h3 className="text-base font-semibold text-slate-900 border-l-4 border-[#FF8A2B] pl-3 mb-6">
            Revenue Overview
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF8A2B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF8A2B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `₦${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(v: number) => [`₦${v.toLocaleString()}`, 'Revenue']}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#FF8A2B"
                  strokeWidth={2.5}
                  fill="url(#revenueGradient)"
                  dot={{ fill: '#FF8A2B', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
          <h3 className="text-base font-semibold text-slate-900 border-l-4 border-[#FF8A2B] pl-3 mb-4">
            Plan Distribution
          </h3>
          <div className="space-y-4 mt-4">
            {/* Free */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Free</span>
                <span className="font-semibold text-slate-900">
                  {defaultSubMetrics.free_percentage.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full">
                <div
                  className="h-2 bg-gradient-to-r from-slate-400 to-slate-500 rounded-full transition-all duration-700"
                  style={{ width: `${defaultSubMetrics.free_percentage}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{defaultSubMetrics.free_count} users</p>
            </div>
            {/* Pro */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Pro</span>
                <span className="font-semibold text-slate-900">
                  {defaultSubMetrics.pro_percentage.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full">
                <div
                  className="h-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-700"
                  style={{ width: `${defaultSubMetrics.pro_percentage}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{defaultSubMetrics.pro_count} users</p>
            </div>
            {/* Enterprise */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Enterprise</span>
                <span className="font-semibold text-slate-900">
                  {defaultSubMetrics.enterprise_percentage.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full">
                <div
                  className="h-2 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-700"
                  style={{ width: `${defaultSubMetrics.enterprise_percentage}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{defaultSubMetrics.enterprise_count} users</p>
            </div>
          </div>

          {/* MRR / ARR */}
          <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-orange-50 rounded-xl">
              <p className="text-xs text-slate-500 mb-1">MRR</p>
              <p className="text-lg font-bold text-orange-600 tabular-nums">
                ₦{((defaultSubMetrics.mrr || 0) / 100).toLocaleString()}
              </p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-xl">
              <p className="text-xs text-slate-500 mb-1">ARR</p>
              <p className="text-lg font-bold text-purple-600 tabular-nums">
                ₦{((defaultSubMetrics.arr || 0) / 100).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Metrics + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Metrics */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
          <h3 className="text-base font-semibold text-slate-900 border-l-4 border-[#FF8A2B] pl-3 mb-4">
            Payment Metrics
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <PaymentMetricCard
              label="Succeeded"
              value={defaultPayMetrics.succeeded_payments}
              icon={CheckCircle}
              iconGradient="bg-gradient-to-br from-emerald-400 to-green-600 shadow-lg shadow-green-500/30"
            />
            <PaymentMetricCard
              label="Failed"
              value={defaultPayMetrics.failed_payments}
              icon={XCircle}
              iconGradient="bg-gradient-to-br from-red-400 to-red-600 shadow-lg shadow-red-500/30"
            />
            <PaymentMetricCard
              label="Pending"
              value={defaultPayMetrics.pending_payments}
              icon={Clock}
              iconGradient="bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg shadow-yellow-500/30"
            />
            <PaymentMetricCard
              label="Refunded"
              value={`₦${(defaultPayMetrics.refunded_amount / 1000000).toFixed(2)}M`}
              icon={RotateCcw}
              iconGradient="bg-gradient-to-br from-slate-400 to-slate-600 shadow-lg shadow-slate-500/30"
            />
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-sm text-slate-500 mb-1">Success Rate</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 tabular-nums">
                {defaultPayMetrics.payment_success_rate}%
              </span>
              <span className="text-sm text-emerald-600 font-medium">Healthy</span>
            </div>
          </div>
        </div>

        {/* Alerts & Issues */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6">
          <h3 className="text-base font-semibold text-slate-900 border-l-4 border-[#FF8A2B] pl-3 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            Alerts &amp; Issues
          </h3>
          <div className="space-y-3">
            <AlertItem
              title="Open Abuse Reports"
              value={defaultMetrics.open_abuse_reports}
              severity="high"
            />
            <AlertItem
              title="Suspended Users"
              value={defaultMetrics.suspension_count}
              severity="medium"
            />
            <AlertItem
              title="Payment Failures (Today)"
              value={defaultPayMetrics.failed_payments}
              severity={defaultPayMetrics.failed_payments > 10 ? 'high' : 'low'}
            />
            <AlertItem
              title="Pending Retries"
              value={defaultPayMetrics.pending_payments}
              severity="medium"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// COMPONENT PARTS
// ============================================================================

interface PaymentMetricCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  iconGradient: string;
}

function PaymentMetricCard({ label, value, icon: Icon, iconGradient }: PaymentMetricCardProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:-translate-y-1 transition-all duration-200">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconGradient}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-semibold text-slate-900 tabular-nums">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
      </div>
    </div>
  );
}

interface AlertItemProps {
  title: string;
  value: number;
  severity: 'low' | 'medium' | 'high';
}

function AlertItem({ title, value, severity }: AlertItemProps) {
  const styles = {
    low: 'border-l-4 border-emerald-400 bg-emerald-50 text-emerald-800',
    medium: 'border-l-4 border-orange-400 bg-orange-50 text-orange-800',
    high: 'border-l-4 border-red-500 bg-red-50 text-red-800'
  };

  return (
    <div className={`p-3 rounded-xl shadow-sm ${styles[severity]}`}>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-2xl font-bold mt-1 tabular-nums">{value}</p>
    </div>
  );
}
