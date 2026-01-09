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
  TrendingUp
} from 'lucide-react';
import { DashboardMetrics, SubscriptionMetrics, PaymentMetrics } from '../types/admin';
import { DatabaseService } from '../services/databaseService';

interface DashboardOverviewProps {
  metrics?: DashboardMetrics;
  subscriptionMetrics?: SubscriptionMetrics;
  paymentMetrics?: PaymentMetrics;
  loading?: boolean;
}

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
    ((defaultMetrics.revenue_current_month - defaultMetrics.revenue_previous_month) /
      defaultMetrics.revenue_previous_month) *
    100;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-100 rounded-lg h-32 animate-pulse" />
          ))}
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-600">Loading dashboard metrics...</p>
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
            <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-2" />
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Users"
          value={defaultMetrics.total_users.toLocaleString()}
          icon={Users}
          trend="+5.2%"
          color="bg-blue-50"
          iconColor="text-blue-600"
        />

        <KPICard
          title="Active Subscriptions"
          value={defaultMetrics.active_subscriptions.toLocaleString()}
          icon={Activity}
          trend={`${defaultMetrics.churn_rate}% churn`}
          color="bg-green-50"
          iconColor="text-green-600"
        />

        <KPICard
          title="Monthly Revenue"
          value={`₦${(defaultMetrics.revenue_current_month / 1000000).toFixed(1)}M`}
          icon={DollarSign}
          trend={`${revenueGrowth > 0 ? '+' : ''}${revenueGrowth.toFixed(1)}%`}
          color="bg-emerald-50"
          iconColor="text-emerald-600"
        />

        <KPICard
          title="Payment Success"
          value={`${defaultMetrics.payment_success_rate}%`}
          icon={TrendingUp}
          trend={
            defaultMetrics.payment_success_rate >= 94 ? '✓ Healthy' : '⚠️ Low'
          }
          color="bg-purple-50"
          iconColor="text-purple-600"
        />
      </div>

      {/* Subscription Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Subscription Distribution
          </h3>
          <div className="space-y-4">
            <SubscriptionDistributionRow
              plan="Free"
              count={defaultSubMetrics.free_count}
              percentage={defaultSubMetrics.free_percentage}
              color="bg-gray-200"
            />
            <SubscriptionDistributionRow
              plan="Pro"
              count={defaultSubMetrics.pro_count}
              percentage={defaultSubMetrics.pro_percentage}
              color="bg-blue-200"
            />
            <SubscriptionDistributionRow
              plan="Enterprise"
              count={defaultSubMetrics.enterprise_count}
              percentage={defaultSubMetrics.enterprise_percentage}
              color="bg-purple-200"
            />
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">MRR:</span>
              <span className="font-semibold text-gray-900">
                ₦{(defaultSubMetrics.mrr / 1000000).toFixed(2)}M
              </span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-gray-600">ARR:</span>
              <span className="font-semibold text-gray-900">
                ₦{(defaultSubMetrics.arr / 1000000).toFixed(0)}M
              </span>
            </div>
          </div>
        </div>

        {/* Payment Metrics */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Payment Metrics
          </h3>
          <div className="space-y-3">
            <MetricRow
              label="Succeeded"
              value={defaultPayMetrics.succeeded_payments}
              color="text-green-600"
            />
            <MetricRow
              label="Failed"
              value={defaultPayMetrics.failed_payments}
              color="text-red-600"
            />
            <MetricRow
              label="Pending"
              value={defaultPayMetrics.pending_payments}
              color="text-yellow-600"
            />
            <MetricRow
              label="Refunded"
              value={`₦${(defaultPayMetrics.refunded_amount / 1000000).toFixed(2)}M`}
              color="text-blue-600"
            />
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Success Rate</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">
                {defaultPayMetrics.payment_success_rate}%
              </span>
              <span className="text-sm text-green-600">✓ Healthy</span>
            </div>
          </div>
        </div>

        {/* Alerts & Issues */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Alerts & Issues
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
    </div>
  );
}

// ============================================================================
// COMPONENT PARTS
// ============================================================================

interface KPICardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  trend: string;
  color: string;
  iconColor: string;
}

function KPICard({
  title,
  value,
  icon: Icon,
  trend,
  color,
  iconColor
}: KPICardProps) {
  return (
    <div className={`${color} rounded-lg border border-gray-200 p-6`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          <p className="text-xs text-gray-500 mt-2">{trend}</p>
        </div>
        <Icon className={`${iconColor} w-8 h-8`} />
      </div>
    </div>
  );
}

interface SubscriptionDistributionRowProps {
  plan: string;
  count: number;
  percentage: number;
  color: string;
}

function SubscriptionDistributionRow({
  plan,
  count,
  percentage,
  color
}: SubscriptionDistributionRowProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">{plan}</span>
        <span className="text-sm font-semibold text-gray-900">
          {count} ({percentage.toFixed(1)}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`${color} h-2 rounded-full`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

interface MetricRowProps {
  label: string;
  value: string | number;
  color: string;
}

function MetricRow({ label, value, color }: MetricRowProps) {
  return (
    <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`text-sm font-semibold ${color}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
    </div>
  );
}

interface AlertItemProps {
  title: string;
  value: number;
  severity: 'low' | 'medium' | 'high';
}

function AlertItem({ title, value, severity }: AlertItemProps) {
  const colors = {
    low: 'text-green-600 bg-green-50',
    medium: 'text-yellow-600 bg-yellow-50',
    high: 'text-red-600 bg-red-50'
  };

  return (
    <div className={`p-3 rounded ${colors[severity]}`}>
      <p className="text-sm font-medium">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
