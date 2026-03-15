/**
 * Admin Action Logging & Audit Trail Service
 * Logs all admin actions for complete auditability
 */

import {
  AdminActionLog,
  AdminAction,
  AdminUser
} from '../types/admin';

// ============================================================================
// ADMIN ACTION LOGGER
// ============================================================================

export class AdminActionLogger {
  
  /**
   * Log an admin action
   */
  static async logAction(
    admin: AdminUser,
    action: AdminAction,
    resourceType: 'user' | 'subscription' | 'payment' | 'abuse_report',
    resourceId: string,
    description: string,
    opts?: {
      changesBefore?: Record<string, any>;
      changesAfter?: Record<string, any>;
      status?: 'success' | 'failed';
      errorMessage?: string;
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<AdminActionLog> {
    const log: AdminActionLog = {
      id: this.generateLogId(),
      admin_id: admin.id,
      action_type: action,
      resource_type: resourceType,
      resource_id: resourceId,
      description,
      changes_before: opts?.changesBefore,
      changes_after: opts?.changesAfter,
      status: opts?.status || 'success',
      error_message: opts?.errorMessage,
      ip_address: opts?.ipAddress,
      user_agent: opts?.userAgent,
      created_at: new Date()
    };

    // In production, save to database
    console.log('[AUDIT LOG]', {
      admin: admin.email,
      action: action,
      resource: `${resourceType}/${resourceId}`,
      description,
      timestamp: log.created_at
    });

    return log;
  }

  /**
   * Log successful user modification
   */
  static async logUserModification(
    admin: AdminUser,
    userId: string,
    changesBefore: Record<string, any>,
    changesAfter: Record<string, any>,
    reason: string,
    ipAddress?: string
  ): Promise<AdminActionLog> {
    return this.logAction(
      admin,
      'edit',
      'user',
      userId,
      `User modified: ${reason}`,
      {
        changesBefore,
        changesAfter,
        status: 'success',
        ipAddress
      }
    );
  }

  /**
   * Log subscription change
   */
  static async logSubscriptionChange(
    admin: AdminUser,
    userId: string,
    action: 'upgrade' | 'downgrade' | 'suspend' | 'reactivate',
    fromPlan: string | null,
    toPlan: string | null,
    reason: string,
    ipAddress?: string
  ): Promise<AdminActionLog> {
    return this.logAction(
      admin,
      action === 'suspend' ? 'suspend' : 'edit',
      'subscription',
      userId,
      `Subscription ${action}: ${fromPlan || 'N/A'} -> ${toPlan || 'N/A'}. Reason: ${reason}`,
      {
        changesBefore: { plan: fromPlan },
        changesAfter: { plan: toPlan },
        status: 'success',
        ipAddress
      }
    );
  }

  /**
   * Log refund processed
   */
  static async logRefund(
    admin: AdminUser,
    paymentId: string,
    amount: number,
    reason: string,
    ipAddress?: string
  ): Promise<AdminActionLog> {
    return this.logAction(
      admin,
      'refund',
      'payment',
      paymentId,
      `Refund processed: $${amount}. Reason: ${reason}`,
      {
        changesAfter: { refunded: true, amount },
        status: 'success',
        ipAddress
      }
    );
  }

  /**
   * Log abuse action
   */
  static async logAbuseAction(
    admin: AdminUser,
    abuseReportId: string,
    action: 'investigate' | 'resolve' | 'dismiss',
    notes: string,
    ipAddress?: string
  ): Promise<AdminActionLog> {
    return this.logAction(
      admin,
      action === 'investigate' ? 'edit' : 'override',
      'abuse_report',
      abuseReportId,
      `Abuse report ${action}: ${notes}`,
      {
        changesAfter: { status: action },
        status: 'success',
        ipAddress
      }
    );
  }

  /**
   * Log failed action
   */
  static async logFailedAction(
    admin: AdminUser,
    action: AdminAction,
    resourceType: 'user' | 'subscription' | 'payment' | 'abuse_report',
    resourceId: string,
    errorMessage: string,
    ipAddress?: string
  ): Promise<AdminActionLog> {
    return this.logAction(
      admin,
      action,
      resourceType,
      resourceId,
      `Failed action: ${errorMessage}`,
      {
        status: 'failed',
        errorMessage,
        ipAddress
      }
    );
  }

  /**
   * Get audit trail for specific resource
   */
  static async getAuditTrail(
    resourceType: string,
    resourceId: string,
    _limit: number = 50
  ): Promise<AdminActionLog[]> {
    // In production, query from database
    // This is a placeholder
    console.log(`Fetching audit trail for ${resourceType}/${resourceId}`);
    return [];
  }

  /**
   * Get admin activity log
   */
  static async getAdminActivityLog(
    adminId: string,
    _limit: number = 100
  ): Promise<AdminActionLog[]> {
    // In production, query from database
    console.log(`Fetching activity log for admin ${adminId}`);
    return [];
  }

  /**
   * Generate unique log ID
   */
  private static generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============================================================================
// AUDIT TRAIL UTILITIES
// ============================================================================

export class AuditTrailHelper {
  
  /**
   * Format log for display
   */
  static formatLog(log: AdminActionLog): {
    admin: string;
    action: string;
    resource: string;
    time: string;
    status: string;
  } {
    return {
      admin: log.admin_id,
      action: log.action_type,
      resource: `${log.resource_type}/${log.resource_id}`,
      time: log.created_at.toLocaleString(),
      status: log.status
    };
  }

  /**
   * Generate audit report
   */
  static generateAuditReport(logs: AdminActionLog[]): {
    total_actions: number;
    by_type: Record<string, number>;
    by_status: Record<string, number>;
    critical_actions: AdminActionLog[];
  } {
    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    const critical: AdminActionLog[] = [];

    logs.forEach((log) => {
      // Count by type
      byType[log.action_type] = (byType[log.action_type] || 0) + 1;

      // Count by status
      byStatus[log.status] = (byStatus[log.status] || 0) + 1;

      // Identify critical actions
      if (
        ['refund', 'delete', 'suspend'].includes(log.action_type) ||
        log.status === 'failed'
      ) {
        critical.push(log);
      }
    });

    return {
      total_actions: logs.length,
      by_type: byType,
      by_status: byStatus,
      critical_actions: critical
    };
  }

  /**
   * Check if action requires approval
   */
  static requiresApproval(action: AdminAction): boolean {
    return ['delete', 'refund', 'suspend'].includes(action);
  }
}
