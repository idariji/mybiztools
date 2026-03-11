import prisma from '../lib/prisma.js';
import type { ServiceResponse } from '../types/index.js';

// ============================================================================
// PAYMENT SERVICE
// ============================================================================

export interface PaymentFilters {
  page?: number;
  limit?: number;
  status?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface RefundInput {
  paymentId: string;
  amount: number;
  reason: string;
  adminId: string;
  adminName: string;
}

const formatPayment = (p: any) => ({
  id: p.id,
  userId: p.userId,
  subscriptionId: p.subscriptionId,
  amount: Number(p.amount) / 100,
  currency: p.currency,
  status: p.status,
  stripePaymentId: p.stripePaymentId,
  billingPeriodStart: p.billingPeriodStart?.toISOString() ?? null,
  billingPeriodEnd: p.billingPeriodEnd?.toISOString() ?? null,
  failureReason: p.failureReason,
  retryCount: p.retryCount,
  refundedAmount: Number(p.refundedAmount) / 100,
  refundReason: p.refundReason,
  refundedAt: p.refundedAt?.toISOString() ?? null,
  createdAt: p.createdAt?.toISOString() ?? null,
  user: p.user ?? undefined,
  refundLogs: p.refundLogs ?? undefined,
});

export class PaymentService {
  // --------------------------------------------------------------------------
  // GET PAYMENTS
  // --------------------------------------------------------------------------

  static async getPayments(filters: PaymentFilters): Promise<ServiceResponse> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.userId) where.userId = filters.userId;
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo)   where.createdAt.lte = new Date(filters.dateTo);
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true, businessName: true },
          },
          refundLogs: true,
        },
      }),
      prisma.payment.count({ where }),
    ]);

    return {
      success: true,
      message: 'Payments retrieved successfully',
      data: {
        payments: (payments as any[]).map(formatPayment),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    };
  }

  // --------------------------------------------------------------------------
  // GET PAYMENT BY ID
  // --------------------------------------------------------------------------

  static async getPaymentById(paymentId: string): Promise<ServiceResponse> {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true, businessName: true },
        },
        refundLogs: true,
      },
    });

    if (!payment) {
      return { success: false, message: 'Payment not found', error: 'PAYMENT_NOT_FOUND' };
    }

    return {
      success: true,
      message: 'Payment retrieved successfully',
      data: { payment: formatPayment(payment) },
    };
  }

  // --------------------------------------------------------------------------
  // PROCESS REFUND
  // --------------------------------------------------------------------------

  static async processRefund(input: RefundInput): Promise<ServiceResponse> {
    const payment = await prisma.payment.findUnique({
      where: { id: input.paymentId },
    }) as any;

    if (!payment) {
      return { success: false, message: 'Payment not found', error: 'PAYMENT_NOT_FOUND' };
    }

    if (payment.status === 'refunded') {
      return { success: false, message: 'Payment has already been fully refunded', error: 'ALREADY_REFUNDED' };
    }

    const currentRefunded = Number(payment.refundedAmount);
    const paymentAmount   = Number(payment.amount);
    const refundAmount    = input.amount;

    if (currentRefunded + refundAmount > paymentAmount) {
      return {
        success: false,
        message: 'Refund amount exceeds remaining payment amount',
        error: 'REFUND_EXCEEDS_PAYMENT',
        data: {
          paymentAmount: paymentAmount / 100,
          alreadyRefunded: currentRefunded / 100,
          maxRefundable: (paymentAmount - currentRefunded) / 100,
        },
      };
    }

    const newRefundedTotal = currentRefunded + refundAmount;
    const newStatus = newRefundedTotal >= paymentAmount ? 'refunded' : payment.status;

    await prisma.payment.update({
      where: { id: input.paymentId },
      data: {
        refundedAmount: BigInt(newRefundedTotal),
        refundReason: input.reason,
        refundedAt: new Date(),
        status: newStatus,
      },
    });

    await prisma.refundLog.create({
      data: {
        paymentId: input.paymentId,
        amount: BigInt(refundAmount),
        reason: input.reason,
        adminId: input.adminId,
        adminName: input.adminName,
      },
    });

    await prisma.adminAuditLog.create({
      data: {
        adminId: input.adminId,
        adminName: input.adminName,
        adminRole: 'billing_admin',
        targetUserId: payment.userId,
        action: 'update',
        resource: 'payment',
        resourceId: input.paymentId,
        changes: { refundAmount, totalRefunded: newRefundedTotal, newStatus },
        reason: input.reason,
      },
    });

    return {
      success: true,
      message: 'Refund processed successfully',
      data: {
        refundAmount: refundAmount / 100,
        totalRefunded: newRefundedTotal / 100,
        newStatus,
      },
    };
  }

  // --------------------------------------------------------------------------
  // RETRY PAYMENT
  // --------------------------------------------------------------------------

  static async retryPayment(
    paymentId: string,
    adminId: string,
    adminName: string
  ): Promise<ServiceResponse> {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    }) as any;

    if (!payment) {
      return { success: false, message: 'Payment not found', error: 'PAYMENT_NOT_FOUND' };
    }

    if (payment.status !== 'failed') {
      return { success: false, message: 'Can only retry failed payments', error: 'INVALID_STATUS' };
    }

    if (payment.maxRetriesReached) {
      return { success: false, message: 'Maximum retries reached for this payment', error: 'MAX_RETRIES_REACHED' };
    }

    const newRetryCount = payment.retryCount + 1;
    const maxRetries = 3;

    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'pending',
        retryCount: newRetryCount,
        nextRetryAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        maxRetriesReached: newRetryCount >= maxRetries,
      },
    });

    await prisma.adminAuditLog.create({
      data: {
        adminId,
        adminName,
        adminRole: 'billing_admin',
        targetUserId: payment.userId,
        action: 'update',
        resource: 'payment',
        resourceId: paymentId,
        changes: { action: 'retry', retryCount: newRetryCount },
        reason: 'Manual payment retry',
      },
    });

    return {
      success: true,
      message: 'Payment retry initiated',
      data: { retryCount: newRetryCount, maxRetries },
    };
  }

  // --------------------------------------------------------------------------
  // GET METRICS
  // --------------------------------------------------------------------------

  static async getMetrics(): Promise<ServiceResponse> {
    const now = new Date();
    const startOfMonth     = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth   = new Date(now.getFullYear(), now.getMonth(), 0);
    const weekAgo          = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers, activeUsers, freeUsers, proUsers, enterpriseUsers, suspendedUsers,
      thisMonthPayments, lastMonthPayments, pendingAbuseReports,
      activeSubscriptions, recentSignups, failedPayments,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { subscriptionStatus: 'active' } }),
      prisma.user.count({ where: { currentPlan: 'free' } }),
      prisma.user.count({ where: { currentPlan: 'pro' } }),
      prisma.user.count({ where: { currentPlan: 'enterprise' } }),
      prisma.user.count({ where: { subscriptionStatus: 'suspended' } }),
      prisma.payment.findMany({ where: { status: 'succeeded', createdAt: { gte: startOfMonth } } }),
      prisma.payment.findMany({ where: { status: 'succeeded', createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
      prisma.abuseReport.count({ where: { status: 'pending' } }),
      prisma.subscription.findMany({ where: { status: 'active' } }),
      prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.payment.count({ where: { status: 'failed' } }),
    ]);

    const thisMonthRevenue = (thisMonthPayments as any[]).reduce((sum, p) => sum + Number(p.amount), 0);
    const lastMonthRevenue = (lastMonthPayments as any[]).reduce((sum, p) => sum + Number(p.amount), 0);
    const mrr = (activeSubscriptions as any[]).reduce((sum, s) => sum + Number(s.mrrValue), 0);

    return {
      success: true,
      message: 'Metrics retrieved successfully',
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          suspended: suspendedUsers,
          byPlan: { free: freeUsers, pro: proUsers, enterprise: enterpriseUsers },
          recentSignups,
        },
        revenue: {
          mrr: mrr / 100,
          thisMonth: thisMonthRevenue / 100,
          lastMonth: lastMonthRevenue / 100,
          growth: lastMonthRevenue > 0
            ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(2)
            : 0,
        },
        payments: {
          thisMonthCount: thisMonthPayments.length,
          lastMonthCount: lastMonthPayments.length,
          failedCount: failedPayments,
        },
        abuse: { pendingReports: pendingAbuseReports },
        generatedAt: now.toISOString(),
      },
    };
  }

  // --------------------------------------------------------------------------
  // GET ABUSE REPORTS
  // --------------------------------------------------------------------------

  static async getAbuseReports(filters: {
    severity?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ServiceResponse> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.severity) where.severity = filters.severity;
    if (filters.status)   where.status   = filters.status;

    const [reports, total] = await Promise.all([
      prisma.abuseReport.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true, currentPlan: true },
          },
        },
      }),
      prisma.abuseReport.count({ where }),
    ]);

    return {
      success: true,
      message: 'Abuse reports retrieved successfully',
      data: {
        reports,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    };
  }

  // --------------------------------------------------------------------------
  // UPDATE ABUSE REPORT
  // --------------------------------------------------------------------------

  static async updateAbuseReport(
    reportId: string,
    action: string,
    reason: string,
    adminId: string,
    adminName: string
  ): Promise<ServiceResponse> {
    const report = await prisma.abuseReport.findUnique({
      where: { id: reportId },
    }) as any;

    if (!report) {
      return { success: false, message: 'Abuse report not found', error: 'REPORT_NOT_FOUND' };
    }

    await prisma.abuseReport.update({
      where: { id: reportId },
      data: {
        status: 'reviewed',
        reviewedAt: new Date(),
        reviewedBy: adminId,
        actionTaken: action,
        actionReason: reason,
      },
    });

    if (action === 'suspended') {
      await prisma.user.update({
        where: { id: report.userId },
        data: { subscriptionStatus: 'suspended' },
      });
    }

    await prisma.adminAuditLog.create({
      data: {
        adminId,
        adminName,
        adminRole: 'support_admin',
        targetUserId: report.userId,
        action: 'update',
        resource: 'abuse_report',
        resourceId: reportId,
        changes: { actionTaken: action },
        reason,
      },
    });

    return {
      success: true,
      message: 'Abuse report updated successfully',
      data: { action },
    };
  }
}

export default PaymentService;