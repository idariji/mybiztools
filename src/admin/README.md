# 🔐 Admin Billing Dashboard - Complete Documentation

**Version:** 1.0  
**Created:** December 13, 2025  
**Status:** Production Ready  

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Getting Started](#getting-started)
4. [Features](#features)
5. [User Roles & Permissions](#user-roles--permissions)
6. [Core Components](#core-components)
7. [Services & Business Logic](#services--business-logic)
8. [Database Integration](#database-integration)
9. [API Integration](#api-integration)
10. [Security & Compliance](#security--compliance)
11. [Audit Trail](#audit-trail)
12. [Monitoring & Alerts](#monitoring--alerts)
13. [Troubleshooting](#troubleshooting)
14. [Contributing](#contributing)

---

## Overview

The Admin Billing Dashboard is a comprehensive system for MyBizTools administrators to manage:

- **User Billing**: Upgrade/downgrade plans, suspend/reactivate accounts, manage overrides
- **Subscription Management**: Manual plan changes, promotional overrides, expiry automation
- **Payment Operations**: View history, process refunds, retry failed payments, detect fraud
- **Abuse Detection**: Monitor suspicious patterns, investigate reports, enforce terms
- **Audit Logging**: Complete trail of all admin actions for compliance

### Key Statistics

- **Plans Supported**: 3 (Free, Pro, Enterprise)
- **User Roles**: 4 (Super Admin, Billing Admin, Support Admin, Viewer)
- **Permissions**: 6 core actions (view, edit, delete, override, suspend, refund)
- **Audit Trail**: 100% of admin actions logged
- **Abuse Detection**: 5 detection types (quota abuse, fraud, API abuse, terms violation, suspicious activity)

---

## Architecture

```
src/admin/
├── components/          # UI components for dashboard
│   ├── DashboardOverview.tsx        # Main metrics & KPIs
│   ├── UserBillingManager.tsx       # User management
│   ├── AbuseDetectionDashboard.tsx  # Abuse monitoring
│   └── PaymentHistoryViewer.tsx     # Payment management
├── pages/              # Page-level components
│   └── AdminDashboardPage.tsx       # Main dashboard page
├── services/           # Business logic & APIs
│   ├── adminAuthService.ts          # RBAC & authentication
│   ├── adminActionLogger.ts         # Audit logging
│   ├── adminSubscriptionService.ts  # Subscription operations
│   ├── adminPaymentService.ts       # Payment management
│   └── abuseDetectionService.ts     # Abuse detection & management
├── types/             # TypeScript interfaces
│   └── admin.ts       # All type definitions
├── utils/             # Helper functions
│   └── adminHelpers.ts     # Formatting, validation, utilities
└── hooks/             # Custom React hooks
```

---

## Getting Started

### 1. Import the Admin Dashboard

```typescript
// In your main App.tsx or routing file
import { AdminDashboardPage } from '@/admin/pages/AdminDashboardPage';

// Add route
<Route path="/admin/dashboard" element={<AdminDashboardPage />} />
```

### 2. Protect the Route

```typescript
import { AdminAuthService } from '@/admin/services/adminAuthService';

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    AdminAuthService.verifyAdminAccess(userId)
      .then(setIsAdmin)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!isAdmin) return <Navigate to="/login" />;

  return children;
}
```

### 3. Initialize Services

```typescript
import { AdminActionLogger } from '@/admin/services/adminActionLogger';
import { AdminAuthService } from '@/admin/services/adminAuthService';

// Check admin access
const adminUser = await AdminAuthService.getAdminUser(userId);

// Log actions
await AdminActionLogger.logAction(
  adminUser,
  'edit',
  'subscription',
  userId,
  'Upgraded to Pro plan'
);
```

---

## Features

### 📊 Dashboard Overview

Real-time metrics including:
- Total users and active subscriptions
- Monthly revenue and growth trends
- Payment success rate
- Subscription distribution (Free/Pro/Enterprise)
- Open abuse reports and suspensions
- MRR (Monthly Recurring Revenue) and ARR (Annual Recurring Revenue)

```typescript
<DashboardOverview
  metrics={dashboardMetrics}
  subscriptionMetrics={subscriptionMetrics}
  paymentMetrics={paymentMetrics}
/>
```

### 👥 User Billing Management

- **Search & Filter**: By email, name, plan, status
- **View Profiles**: User account details, spending, subscription status
- **Plan Changes**: Manual upgrade/downgrade with auditing
- **Suspend/Reactivate**: Disable accounts with reason logging
- **Usage Quotas**: View and reset monthly/yearly limits

```typescript
<UserBillingManager
  onUserSelect={(userId) => console.log('Selected:', userId)}
  onPlanChange={(userId, newPlan) => handlePlanChange(userId, newPlan)}
  onSuspend={(userId, reason) => handleSuspend(userId, reason)}
/>
```

### 💳 Payment Management

- **View History**: Complete payment records with status
- **Process Refunds**: Full or partial with reason tracking
- **Retry Failed Payments**: Manual trigger with retry tracking
- **Adjust Amounts**: Pro-rata adjustments and credits
- **Export Reports**: CSV/JSON export with date range filtering

```typescript
<PaymentHistoryViewer
  onRefund={(paymentId, reason) => handleRefund(paymentId, reason)}
  onRetry={(paymentId) => handleRetry(paymentId)}
/>
```

### 🚨 Abuse Detection

Real-time detection of:
- **Quota Abuse**: Users approaching/exceeding monthly limits
- **Payment Fraud**: Multiple failed attempts, suspicious patterns
- **API Abuse**: Excessive requests from single user
- **Terms Violation**: Reselling, data mining, unauthorized use
- **Suspicious Activity**: IP changes, device changes, location anomalies

```typescript
<AbuseDetectionDashboard
  onInvestigate={(reportId) => handleInvestigate(reportId)}
  onResolve={(reportId, decision) => handleResolve(reportId, decision)}
/>
```

---

## User Roles & Permissions

### Role Hierarchy

```
Super Admin (Level 4)
  ├── All permissions
  ├── Can delete users
  └── Highest approval authority

Billing Admin (Level 3)
  ├── view, edit, override, suspend, refund
  ├── Cannot delete users
  └── Payment operations allowed

Support Admin (Level 2)
  ├── view, edit, suspend
  ├── Limited user management
  └── Cannot process refunds

Viewer (Level 1)
  └── view only
```

### Permission Matrix

| Action | Users | Subscriptions | Payments | Abuse | System |
|--------|-------|---------------|----------|-------|--------|
| view   | ✓     | ✓             | ✓        | ✓     | ✓      |
| edit   | ✓     | ✓             | ✓        | ✓     | ✗      |
| delete | ✓ (Super) | ✗          | ✗        | ✗     | ✗      |
| override | ✗   | ✓             | ✓        | ✗     | ✗      |
| suspend | ✓    | ✓             | ✗        | ✗     | ✗      |
| refund | ✗     | ✗             | ✓        | ✗     | ✗      |

### Checking Permissions

```typescript
import { PermissionChecker } from '@/admin/services/adminAuthService';

const admin = await AdminAuthService.getAdminUser(userId);

if (PermissionChecker.canRefund(admin)) {
  // Allow refund operation
}

if (PermissionChecker.canModifySubscription(admin)) {
  // Allow subscription changes
}
```

---

## Core Components

### DashboardOverview

Displays high-level KPIs and metrics.

```typescript
export interface DashboardOverviewProps {
  metrics?: DashboardMetrics;
  subscriptionMetrics?: SubscriptionMetrics;
  paymentMetrics?: PaymentMetrics;
  loading?: boolean;
}
```

**Features:**
- KPI cards with trends
- Subscription distribution pie chart
- Payment metrics summary
- Alerts and issues panel

### UserBillingManager

Manages individual user subscriptions and billing.

```typescript
export interface UserBillingManagerProps {
  onUserSelect?: (userId: string) => void;
  onPlanChange?: (userId: string, newPlan: PlanName) => void;
  onSuspend?: (userId: string, reason: string) => void;
}
```

**Features:**
- User search and filtering
- Plan change interface
- Account suspension controls
- Expandable user details

### AbuseDetectionDashboard

Monitors and manages abuse reports.

**Features:**
- Real-time abuse report listing
- Severity filtering
- Status tracking
- Investigation workflow

### PaymentHistoryViewer

Reviews and manages payment records.

**Features:**
- Payment search and filtering
- Refund processing
- Retry management
- Export functionality

---

## Services & Business Logic

### AdminAuthService

Handles admin authentication and RBAC.

```typescript
// Check if user is admin
const admin = await AdminAuthService.getAdminUser(userId);

// Verify access
const hasAccess = await AdminAuthService.verifyAdminAccess(userId, 'billing_admin');

// Check specific action
const canRefund = await AdminAuthService.canPerformAction(
  userId,
  'refund',
  'payments'
);

// Get permission level
const level = AdminAuthService.getRoleLevel(admin.role);
```

### AdminSubscriptionService

Manages subscription operations.

```typescript
// Upgrade plan
await AdminSubscriptionService.adminUpgradePlan(
  adminUser,
  userId,
  'pro',
  'Customer requested upgrade',
  ipAddress
);

// Process downgrade
await AdminSubscriptionService.adminDowngradePlan(
  adminUser,
  userId,
  'free',
  'Customer requested downgrade',
  undefined,
  ipAddress
);

// Suspend subscription
await AdminSubscriptionService.suspendSubscription(
  adminUser,
  userId,
  'Payment fraud detected',
  ipAddress
);

// Apply promotional override
await AdminSubscriptionService.setPromotionalOverride(
  adminUser,
  userId,
  'plan_upgrade',
  'free',
  'pro',
  'Promotional offer',
  expiryDate
);
```

### AdminPaymentService

Manages payment operations.

```typescript
// Process refund
await AdminPaymentService.processRefund(
  adminUser,
  paymentId,
  99.99,
  'Customer dispute',
  { notify_user: true }
);

// Retry payment
await AdminPaymentService.retryPayment(
  adminUser,
  paymentId,
  'Manual retry requested'
);

// Adjust payment
await AdminPaymentService.adjustPayment(
  adminUser,
  paymentId,
  99.99,
  19.99,
  'Partial refund'
);

// Get statistics
const stats = await AdminPaymentService.getPaymentStatistics({
  date_from: startDate,
  date_to: endDate,
  status: 'succeeded'
});
```

### AbuseDetectionService

Detects and manages abuse patterns.

```typescript
// Detect quota abuse
const abuseReport = await AbuseDetectionService.detectQuotaAbuse(
  userId,
  usageData,
  limits
);

// Detect payment fraud
const fraudReport = await AbuseDetectionService.detectPaymentFraud(
  userId,
  {
    failed_attempts: 5,
    failed_in_hours: 12,
    amount_deviation: 500
  }
);

// Investigate report
await AbuseDetectionService.investigateReport(
  adminUser,
  reportId,
  'Checking user activity logs'
);

// Resolve report
await AbuseDetectionService.resolveReport(
  adminUser,
  reportId,
  'confirmed',
  'User was reselling access',
  {
    suspend_user: true,
    refund_payment: true
  }
);
```

### AdminActionLogger

Logs all admin operations.

```typescript
// Log custom action
await AdminActionLogger.logAction(
  adminUser,
  'edit',
  'user',
  userId,
  'Changed email address'
);

// Log subscription change
await AdminActionLogger.logSubscriptionChange(
  adminUser,
  userId,
  'upgrade',
  'free',
  'pro',
  'Customer request'
);

// Get audit trail
const trail = await AdminActionLogger.getAuditTrail('user', userId, 50);

// Generate audit report
const report = AuditTrailHelper.generateAuditReport(logs);
```

---

## Database Integration

### User Subscriptions Table

```sql
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  plan_id UUID NOT NULL,
  status VARCHAR(50),       -- 'active', 'past_due', 'suspended', 'cancelled'
  billing_cycle VARCHAR(10), -- 'monthly', 'yearly'
  started_at TIMESTAMP,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  expires_at TIMESTAMP,
  stripe_subscription_id VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Admin Action Logs Table

```sql
CREATE TABLE admin_action_logs (
  id UUID PRIMARY KEY,
  admin_id UUID NOT NULL,
  action_type VARCHAR(50),
  resource_type VARCHAR(50),
  resource_id VARCHAR(255),
  description TEXT,
  changes_before JSONB,
  changes_after JSONB,
  status VARCHAR(50),
  ip_address INET,
  created_at TIMESTAMP
);
```

### Abuse Reports Table

```sql
CREATE TABLE abuse_reports (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  abuse_type VARCHAR(50),
  severity VARCHAR(20),
  status VARCHAR(50),
  description TEXT,
  evidence JSONB,
  detected_at TIMESTAMP,
  resolved_by UUID,
  resolution_notes TEXT,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## API Integration

### Backend Endpoint Patterns

```typescript
// Subscription endpoints
POST   /api/admin/subscriptions/:userId/upgrade
POST   /api/admin/subscriptions/:userId/downgrade
POST   /api/admin/subscriptions/:userId/suspend
POST   /api/admin/subscriptions/:userId/reactivate
POST   /api/admin/subscriptions/:userId/override

// Payment endpoints
POST   /api/admin/payments/:paymentId/refund
POST   /api/admin/payments/:paymentId/retry
POST   /api/admin/payments/:paymentId/adjust

// Abuse endpoints
GET    /api/admin/abuse-reports
POST   /api/admin/abuse-reports/:reportId/investigate
POST   /api/admin/abuse-reports/:reportId/resolve

// User endpoints
GET    /api/admin/users
GET    /api/admin/users/:userId
POST   /api/admin/users/:userId/suspend
POST   /api/admin/users/:userId/override

// Audit endpoints
GET    /api/admin/audit-logs
GET    /api/admin/audit-logs/:resourceType/:resourceId
```

### Example API Call

```typescript
async function upgradeUserPlan(userId: string, newPlan: PlanName) {
  const response = await fetch(`/api/admin/subscriptions/${userId}/upgrade`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      new_plan: newPlan,
      reason: 'Customer requested',
      effective_date: new Date()
    })
  });

  if (!response.ok) {
    throw new Error('Failed to upgrade plan');
  }

  return response.json();
}
```

---

## Security & Compliance

### Authentication

- ✅ Admin users authenticated via JWT tokens
- ✅ Role-based access control (RBAC) enforced
- ✅ Multi-factor authentication support
- ✅ IP whitelist capability

### Authorization

- ✅ All actions require specific permissions
- ✅ Resource-level access control
- ✅ Action approval workflow for critical operations
- ✅ Delegation with audit trail

### Data Protection

- ✅ All sensitive data encrypted in transit (HTTPS)
- ✅ Payment data PCI-DSS compliant (via Stripe)
- ✅ Database encryption at rest
- ✅ PII masked in logs

### Audit & Compliance

- ✅ 100% of admin actions logged
- ✅ Complete audit trail retention (7+ years recommended)
- ✅ User identity and IP logging
- ✅ Compliance reports generation

---

## Audit Trail

### What Gets Logged

Every admin action is logged with:
- Admin identity (email, role)
- Action type (create, update, delete, etc.)
- Resource type and ID
- Before/after values for changes
- Timestamp and IP address
- Success/failure status
- Error messages if failed

### Audit Trail Queries

```typescript
// Get audit trail for specific user
const userAudit = await AdminActionLogger.getAuditTrail('user', userId);

// Get admin's activity log
const adminActivity = await AdminActionLogger.getAdminActivityLog(adminId);

// Generate compliance report
const report = AuditTrailHelper.generateAuditReport(logs);
// Returns: total_actions, by_type, by_status, critical_actions
```

### Critical Actions That Require Approval

- 🔴 Delete user account
- 🔴 Process refunds > $100
- 🔴 Suspend subscription manually
- 🔴 Reset quotas
- 🔴 Apply promotional overrides

---

## Monitoring & Alerts

### Automatic Alerts

The system monitors for:

1. **Payment Issues**
   - Multiple failed payment attempts
   - Unusual transaction patterns
   - Failed retry sequences

2. **Abuse Patterns**
   - Quota limit approaches
   - API request spikes
   - Suspicious login activity

3. **System Health**
   - High failure rates
   - Payment gateway issues
   - Database connection problems

### Alert Configuration

```typescript
const notificationPreferences = {
  email_notifications: true,
  abuse_alerts: true,
  payment_alerts: true,
  daily_reports: true,
  alert_threshold_failure_rate: 0.05, // 5%
  alert_threshold_api_requests: 1000   // per hour
};
```

---

## Troubleshooting

### Common Issues

**1. Admin Access Denied**
```typescript
// Check role level
const admin = await AdminAuthService.getAdminUser(userId);
console.log('Role:', admin.role);
console.log('Level:', AdminAuthService.getRoleLevel(admin.role));

// Verify permissions
const canEdit = await AdminAuthService.canPerformAction(userId, 'edit', 'users');
console.log('Can Edit Users:', canEdit);
```

**2. Action Not Logged**
```typescript
// Check logger initialization
await AdminActionLogger.logAction(
  adminUser,
  'edit',
  'subscription',
  userId,
  'Test action'
);

// Check database connection and permissions
```

**3. Missing Audit Trail**
```typescript
// Query audit logs
const logs = await AdminActionLogger.getAuditTrail('subscription', subscriptionId);
console.log('Found logs:', logs.length);

// Check retention policy
```

### Debug Mode

```typescript
// Enable debug logging
localStorage.setItem('admin_debug', 'true');

// Check browser console for detailed logs
console.log('[ADMIN DEBUG]', message);
```

---

## Contributing

### Adding New Features

1. **Add Type Definitions**
   ```typescript
   // In src/admin/types/admin.ts
   export interface NewFeature {
     id: string;
     // ... fields
   }
   ```

2. **Create Service Class**
   ```typescript
   // In src/admin/services/
   export class NewFeatureService {
     static async doSomething() { /* ... */ }
   }
   ```

3. **Build UI Component**
   ```typescript
   // In src/admin/components/
   export function NewFeatureComponent() { /* ... */ }
   ```

4. **Add to Dashboard**
   ```typescript
   // In AdminDashboardPage.tsx
   {activeTab === 'new_feature' && <NewFeatureComponent />}
   ```

### Code Standards

- Use TypeScript for type safety
- Follow naming conventions (camelCase for functions, PascalCase for components)
- Document complex logic with comments
- Add error handling and validation
- Log critical operations
- Write tests for business logic

---

## Resources

- **TypeScript Docs**: https://www.typescriptlang.org/docs/
- **React Docs**: https://react.dev
- **Lucide Icons**: https://lucide.dev
- **Stripe Documentation**: https://stripe.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review component prop interfaces
3. Check browser console for errors
4. Review audit logs for action history
5. Contact: admin-support@biztool.com

---

**Document Version:** 1.0  
**Last Updated:** December 13, 2025  
**Status:** Production Ready  
**Maintained By:** MyBizTools Admin Team  

