/**
 * Admin Dashboard - Core Types & Interfaces
 * Defines all data structures for admin billing management
 */

// ============================================================================
// ADMIN USER TYPES
// ============================================================================

export type AdminRole = 'super_admin' | 'billing_admin' | 'support_admin' | 'viewer';
export type AdminAction = 'view' | 'edit' | 'delete' | 'override' | 'suspend' | 'refund';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  permissions: AdminPermission[];
  is_active: boolean;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface AdminPermission {
  id: string;
  name: AdminAction;
  description: string;
  resource: 'users' | 'subscriptions' | 'payments' | 'abuse' | 'system';
}

// ============================================================================
// PLAN & ENTITLEMENT TYPES
// ============================================================================

export type PlanName = 'free' | 'pro' | 'enterprise';
export type BillingCycle = 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'past_due' | 'cancelled' | 'suspended';

export interface SubscriptionPlan {
  id: string;
  name: PlanName;
  display_name: string;
  description?: string;
  price_monthly?: number;
  price_yearly?: number;
  currency: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface PlanEntitlement {
  id: string;
  plan_id: string;
  feature_name: string;
  feature_type: 'counter' | 'boolean' | 'storage';
  monthly_limit?: number;
  yearly_limit?: number;
  storage_limit_mb?: number;
  reset_period: 'monthly' | 'yearly' | 'none';
  description?: string;
  is_active: boolean;
}

// ============================================================================
// SUBSCRIPTION & BILLING TYPES
// ============================================================================

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  billing_cycle: BillingCycle;
  started_at: Date;
  current_period_start: Date;
  current_period_end: Date;
  cancelled_at?: Date;
  expires_at?: Date;
  stripe_subscription_id?: string;
  payment_method_id?: string;
  last_reset_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface PaymentRecord {
  id: string;
  user_id: string;
  subscription_id?: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'pending' | 'refunded';
  stripe_payment_id?: string;
  stripe_invoice_id?: string;
  billing_period_start?: Date;
  billing_period_end?: Date;
  failure_reason?: string;
  retry_count: number;
  next_retry_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface UsageTracking {
  id: string;
  user_id: string;
  feature_name: string;
  usage_count: number;
  period_start: Date;
  period_end: Date;
  storage_used_mb?: number;
  last_incremented_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// AUDIT & LOGGING TYPES
// ============================================================================

export interface AdminActionLog {
  id: string;
  admin_id: string;
  action_type: AdminAction;
  resource_type: 'user' | 'subscription' | 'payment' | 'abuse_report';
  resource_id: string;
  description: string;
  changes_before?: Record<string, any>;
  changes_after?: Record<string, any>;
  status: 'success' | 'failed';
  error_message?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

export interface FeatureAccessLog {
  id: string;
  user_id: string;
  feature_name: string;
  action: string;
  status: 'allowed' | 'denied' | 'limited';
  reason?: string;
  resource_id?: string;
  resource_type?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

// ============================================================================
// ABUSE DETECTION TYPES
// ============================================================================

export type AbuseType = 
  | 'quota_abuse' 
  | 'payment_fraud' 
  | 'api_abuse' 
  | 'terms_violation'
  | 'suspicious_activity';

export type AbuseSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AbuseStatus = 'open' | 'investigating' | 'resolved' | 'dismissed';

export interface AbuseReport {
  id: string;
  user_id: string;
  abuse_type: AbuseType;
  severity: AbuseSeverity;
  status: AbuseStatus;
  description: string;
  evidence?: Record<string, any>;
  detected_at: Date;
  assigned_to?: string;
  resolved_by?: string;
  resolution_notes?: string;
  resolved_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// ============================================================================
// DASHBOARD ANALYTICS TYPES
// ============================================================================

export interface DashboardMetrics {
  total_users: number;
  active_subscriptions: number;
  revenue_current_month: number;
  revenue_previous_month: number;
  churn_rate: number;
  payment_success_rate: number;
  open_abuse_reports: number;
  suspension_count: number;
}

export interface SubscriptionMetrics {
  free_count: number;
  pro_count: number;
  enterprise_count: number;
  free_percentage: number;
  pro_percentage: number;
  enterprise_percentage: number;
  mrr: number;
  arr: number;
}

export interface PaymentMetrics {
  total_revenue: number;
  succeeded_payments: number;
  failed_payments: number;
  pending_payments: number;
  refunded_amount: number;
  average_transaction: number;
  payment_success_rate: number;
}

export interface UsageMetrics {
  feature_name: string;
  total_usage: number;
  average_per_user: number;
  free_plan_average: number;
  pro_plan_average: number;
  enterprise_plan_average: number;
  high_usage_users: number;
}

// ============================================================================
// USER BILLING PROFILE TYPES
// ============================================================================

export interface UserBillingProfile {
  user_id: string;
  email: string;
  name: string;
  current_plan: SubscriptionPlan;
  subscription: UserSubscription;
  usage: UsageTracking[];
  payment_history: PaymentRecord[];
  total_spent: number;
  account_created_at: Date;
  account_status: 'active' | 'suspended' | 'deleted';
  notes?: string;
}

// ============================================================================
// ADMIN OVERRIDE & PROMOTIONAL TYPES
// ============================================================================

export interface PromotionalOverride {
  id: string;
  user_id: string;
  admin_id: string;
  override_type: 'plan_upgrade' | 'quota_increase' | 'discount' | 'free_trial';
  from_value: string | number;
  to_value: string | number;
  reason: string;
  is_active: boolean;
  expires_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface ManualSubscriptionChange {
  id: string;
  user_id: string;
  admin_id: string;
  action: 'upgrade' | 'downgrade' | 'suspend' | 'reactivate' | 'cancel';
  from_plan?: PlanName;
  to_plan?: PlanName;
  effective_date: Date;
  reason: string;
  status: 'pending' | 'completed' | 'failed';
  error_message?: string;
  created_at: Date;
  completed_at?: Date;
}

// ============================================================================
// FILTER & SEARCH TYPES
// ============================================================================

export interface UserFilter {
  search_query?: string;
  plan?: PlanName;
  status?: SubscriptionStatus;
  sort_by?: 'email' | 'plan' | 'created_at' | 'spending';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PaymentFilter {
  user_id?: string;
  status?: 'succeeded' | 'failed' | 'pending' | 'refunded';
  date_from?: Date;
  date_to?: Date;
  min_amount?: number;
  max_amount?: number;
  sort_by?: 'date' | 'amount' | 'status';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface AbuseFilter {
  abuse_type?: AbuseType;
  severity?: AbuseSeverity;
  status?: AbuseStatus;
  assigned_to?: string;
  date_from?: Date;
  date_to?: Date;
  page?: number;
  limit?: number;
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface AdminResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface AdminActionResult {
  success: boolean;
  message: string;
  action_id: string;
  timestamp: Date;
}
