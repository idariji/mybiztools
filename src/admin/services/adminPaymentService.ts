/**
 * Admin Payment Management Service
 * Handles admin-level payment operations
 */

import { PaymentRecord, AdminUser } from '../types/admin';
import { AdminActionLogger } from './adminActionLogger';

// ============================================================================
// PAYMENT MANAGEMENT SERVICE
// ============================================================================

export class AdminPaymentService {
  
  /**
   * Process refund for payment
   */
  static async processRefund(
    adminUser: AdminUser,
    paymentId: string,
    amount: number,
    reason: string,
    opts?: {
      notify_user?: boolean;
      reissue_credit?: boolean;
      ipAddress?: string;
    }
  ): Promise<PaymentRecord> {
    // Log the refund action
    await AdminActionLogger.logRefund(
      adminUser,
      paymentId,
      amount,
      reason,
      opts?.ipAddress
    );

    console.log(`[PAYMENT] Processed refund of $${amount} for payment ${paymentId}`);

    // In production, process through payment gateway
    return {
      id: paymentId,
      user_id: 'user-id',
      amount: amount,
      currency: 'USD',
      status: 'refunded',
      created_at: new Date(),
      updated_at: new Date(),
      retry_count: 0
    };
  }

  /**
   * Retry failed payment
   */
  static async retryPayment(
    adminUser: AdminUser,
    paymentId: string,
    reason: string,
    ipAddress?: string
  ): Promise<PaymentRecord> {
    await AdminActionLogger.logAction(
      adminUser,
      'edit',
      'payment',
      paymentId,
      `Manually retried payment. Reason: ${reason}`,
      { ipAddress }
    );

    console.log(`[PAYMENT] Manually retried payment ${paymentId}`);

    // In production, attempt payment collection
    return {
      id: paymentId,
      user_id: 'user-id',
      amount: 0,
      currency: 'USD',
      status: 'pending',
      retry_count: 1,
      created_at: new Date(),
      updated_at: new Date()
    };
  }

  /**
   * Adjust payment (partial refund or credit)
   */
  static async adjustPayment(
    adminUser: AdminUser,
    paymentId: string,
    originalAmount: number,
    adjustmentAmount: number,
    reason: string,
    ipAddress?: string
  ): Promise<PaymentRecord> {
    const newAmount = originalAmount - adjustmentAmount;

    await AdminActionLogger.logAction(
      adminUser,
      'edit',
      'payment',
      paymentId,
      `Payment adjusted: $${originalAmount} -> $${newAmount}. Reason: ${reason}`,
      {
        changesBefore: { amount: originalAmount },
        changesAfter: { amount: newAmount },
        ipAddress
      }
    );

    console.log(
      `[PAYMENT] Adjusted payment ${paymentId} by $${adjustmentAmount}`
    );

    return {
      id: paymentId,
      user_id: 'user-id',
      amount: newAmount,
      currency: 'USD',
      status: 'succeeded',
      created_at: new Date(),
      updated_at: new Date(),
      retry_count: 0
    };
  }

  /**
   * Manually record payment
   */
  static async recordManualPayment(
    adminUser: AdminUser,
    userId: string,
    amount: number,
    currency: string,
    description: string,
    ipAddress?: string
  ): Promise<PaymentRecord> {
    const payment: PaymentRecord = {
      id: this.generatePaymentId(),
      user_id: userId,
      amount,
      currency,
      status: 'succeeded',
      created_at: new Date(),
      updated_at: new Date(),
      retry_count: 0
    };

    await AdminActionLogger.logAction(
      adminUser,
      'edit',
      'payment',
      payment.id,
      `Manually recorded payment: ${currency} ${amount}. Reason: ${description}`,
      { ipAddress }
    );

    console.log(
      `[PAYMENT] Manually recorded payment of ${currency} ${amount} for user ${userId}`
    );

    return payment;
  }

  /**
   * Write off bad debt
   */
  static async writeOffDebt(
    adminUser: AdminUser,
    paymentId: string,
    amount: number,
    reason: string,
    ipAddress?: string
  ): Promise<void> {
    await AdminActionLogger.logAction(
      adminUser,
      'edit',
      'payment',
      paymentId,
      `Write off debt: ${amount}. Reason: ${reason}`,
      { ipAddress }
    );

    console.log(
      `[PAYMENT] Wrote off debt of $${amount} for payment ${paymentId}`
    );

    // In production, mark payment as written off in database
  }

  /**
   * Get payment history for user
   */
  static async getUserPaymentHistory(
    userId: string,
    opts?: {
      limit?: number;
      offset?: number;
      status?: string;
    }
  ): Promise<PaymentRecord[]> {
    // In production, query from database
    console.log(`Fetching payment history for user ${userId}`);
    return [];
  }

  /**
   * Get payment statistics
   */
  static async getPaymentStatistics(opts?: {
    date_from?: Date;
    date_to?: Date;
    status?: string;
  }): Promise<{
    total_payments: number;
    total_amount: number;
    succeeded_count: number;
    failed_count: number;
    pending_count: number;
    average_amount: number;
    largest_transaction: number;
    smallest_transaction: number;
  }> {
    // In production, query from database
    console.log('Fetching payment statistics');

    return {
      total_payments: 0,
      total_amount: 0,
      succeeded_count: 0,
      failed_count: 0,
      pending_count: 0,
      average_amount: 0,
      largest_transaction: 0,
      smallest_transaction: 0
    };
  }

  /**
   * Flag suspicious payment pattern
   */
  static async flagSuspiciousPattern(
    adminUser: AdminUser,
    userId: string,
    pattern: string,
    reason: string,
    ipAddress?: string
  ): Promise<void> {
    await AdminActionLogger.logAction(
      adminUser,
      'edit',
      'payment',
      userId,
      `Flagged suspicious payment pattern: ${pattern}. Reason: ${reason}`,
      { ipAddress }
    );

    console.log(
      `[PAYMENT] Flagged suspicious pattern for user ${userId}: ${pattern}`
    );
  }

  /**
   * Generate payment report
   */
  static async generatePaymentReport(opts?: {
    date_from?: Date;
    date_to?: Date;
    group_by?: 'day' | 'week' | 'month';
  }): Promise<{
    period: string;
    total_revenue: number;
    transaction_count: number;
    success_rate: number;
  }[]> {
    // In production, generate from database
    console.log('Generating payment report');
    return [];
  }

  // =========================================================================
  // HELPER METHODS
  // =========================================================================

  private static generatePaymentId(): string {
    return `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============================================================================
// PAYMENT ANALYTICS
// ============================================================================

export class PaymentAnalytics {
  
  /**
   * Calculate payment health metrics
   */
  static calculatePaymentHealth(stats: {
    total_failed: number;
    total_attempted: number;
    avg_days_to_recovery: number;
    churn_rate: number;
  }): {
    health_score: number;
    status: 'excellent' | 'good' | 'fair' | 'poor';
    recommendations: string[];
  } {
    const failureRate = stats.total_failed / stats.total_attempted;
    const recoveryScore = Math.max(0, 1 - stats.avg_days_to_recovery / 7);
    const churnScore = Math.max(0, 1 - stats.churn_rate);

    const healthScore = (recoveryScore * 0.4 + churnScore * 0.4 + (1 - failureRate) * 0.2) * 100;

    let status: 'excellent' | 'good' | 'fair' | 'poor';
    if (healthScore >= 90) status = 'excellent';
    else if (healthScore >= 75) status = 'good';
    else if (healthScore >= 60) status = 'fair';
    else status = 'poor';

    const recommendations: string[] = [];
    if (failureRate > 0.1) recommendations.push('High payment failure rate - review payment gateway');
    if (stats.avg_days_to_recovery > 3) recommendations.push('Slow recovery time - improve retry strategy');
    if (stats.churn_rate > 0.05) recommendations.push('High churn rate - review subscription value');

    return { health_score: Math.round(healthScore), status, recommendations };
  }

  /**
   * Identify high-value customers
   */
  static identifyHighValueCustomers(payments: PaymentRecord[], threshold: number): string[] {
    const customerSpending = new Map<string, number>();

    payments.forEach((payment) => {
      if (payment.status === 'succeeded') {
        const current = customerSpending.get(payment.user_id) || 0;
        customerSpending.set(payment.user_id, current + payment.amount);
      }
    });

    return Array.from(customerSpending.entries())
      .filter(([, amount]) => amount >= threshold)
      .map(([userId]) => userId)
      .sort((a, b) => (customerSpending.get(b) || 0) - (customerSpending.get(a) || 0));
  }

  /**
   * Detect payment churn risk
   */
  static detectChurnRisk(
    payments: PaymentRecord[],
    daysInactive: number = 30
  ): { user_id: string; days_since_payment: number }[] {
    const customerLastPayment = new Map<string, Date>();

    payments.forEach((payment) => {
      if (payment.status === 'succeeded') {
        const lastPayment = customerLastPayment.get(payment.user_id);
        if (!lastPayment || payment.created_at > lastPayment) {
          customerLastPayment.set(payment.user_id, payment.created_at);
        }
      }
    });

    const now = new Date();
    const atRisk: { user_id: string; days_since_payment: number }[] = [];

    customerLastPayment.forEach((lastPayment, userId) => {
      const daysSincePayment = Math.floor(
        (now.getTime() - lastPayment.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSincePayment > daysInactive) {
        atRisk.push({ user_id: userId, days_since_payment: daysSincePayment });
      }
    });

    return atRisk.sort((a, b) => b.days_since_payment - a.days_since_payment);
  }
}
