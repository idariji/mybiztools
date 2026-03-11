import prisma from '../lib/prisma.js';

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

export class PaymentService {
  // Get payments with filters and pagination
  static async getPayments(filters: PaymentFilters) {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.userId) {
        where.userId = filters.userId;
      }

      if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {};
        if (filters.dateFrom) {
          where.createdAt.gte = new Date(filters.dateFrom);
        }
        if (filters.dateTo) {
          where.createdAt.lte = new Date(filters.dateTo);
        }
      }

      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                businessName: true,
              },
            },
            refundLogs: true,
          },
        }),
        prisma.payment.count({ where }),
      ]);

      return {
        success: true,
        data: {
          payments,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      console.error('Get payments error:', error);
      return {
        success: false,
        message: 'Failed to fetch payments',
        error: 'FETCH_FAILED',
      };
    }
  }

  // Get single payment by ID
  static async getPaymentById(paymentId: string) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              businessName: true,
            },
          },
          refundLogs: true,
        },
      });

      if (!payment) {
        return {
          success: false,
          message: 'Payment not found',
          error: 'PAYMENT_NOT_FOUND',
        };
      }

      return {
        success: true,
        data: payment,
      };
    } catch (error) {
      console.error('Get payment by ID error:', error);
      return {
        success: false,
        message: 'Failed to fetch payment',
        error: 'FETCH_FAILED',
      };
    }
  }

  // Process refund
  static async processRefund(input: RefundInput) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: input.paymentId },
      });

      if (!payment) {
        return {
          success: false,
          message: 'Payment not found',
          error: 'PAYMENT_NOT_FOUND',
        };
      }

      if (payment.status === 'refunded') {
        return {
          success: false,
          message: 'Payment has already been fully refunded',
          error: 'ALREADY_REFUNDED',
        };
      }

      const currentRefunded = Number(payment.refundedAmount);
      const paymentAmount = Number(payment.amount);
      const refundAmount = input.amount;

      if (currentRefunded + refundAmount > paymentAmount) {
        return {
          success: false,
          message: 'Refund amount exceeds remaining payment amount',
          error: 'REFUND_EXCEEDS_PAYMENT',
          data: {
            paymentAmount,
            alreadyRefunded: currentRefunded,
            maxRefundable: paymentAmount - currentRefunded,
          },
        };
      }

      const newRefundedTotal = currentRefunded + refundAmount;
      const newStatus = newRefundedTotal >= paymentAmount ? 'refunded' : payment.status;

      // Update payment
      await prisma.payment.update({
        where: { id: input.paymentId },
        data: {
          refundedAmount: BigInt(newRefundedTotal),
          refundReason: input.reason,
          refundedAt: new Date(),
          status: newStatus,
        },
      });

      // Create refund log
      await prisma.refundLog.create({
        data: {
          paymentId: input.paymentId,
          amount: BigInt(refundAmount),
          reason: input.reason,
          adminId: input.adminId,
          adminName: input.adminName,
        },
      });

      // Log admin action
      await prisma.adminAuditLog.create({
        data: {
          adminId: input.adminId,
          adminName: input.adminName,
          adminRole: 'billing_admin',
          targetUserId: payment.userId,
          action: 'update',
          resource: 'payment',
          resourceId: input.paymentId,
          changes: {
            refund_amount: refundAmount,
            total_refunded: newRefundedTotal,
            new_status: newStatus,
          },
          reason: input.reason,
        },
      });

      return {
        success: true,
        message: 'Refund processed successfully',
        data: {
          refundAmount,
          totalRefunded: newRefundedTotal,
          newStatus,
        },
      };
    } catch (error) {
      console.error('Process refund error:', error);
      return {
        success: false,
        message: 'Failed to process refund',
        error: 'REFUND_FAILED',
      };
    }
  }

  // Retry failed payment
  static async retryPayment(paymentId: string, adminId: string, adminName: string) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
      });

      if (!payment) {
        return {
          success: false,
          message: 'Payment not found',
          error: 'PAYMENT_NOT_FOUND',
        };
      }

      if (payment.status !== 'failed') {
        return {
          success: false,
          message: 'Can only retry failed payments',
          error: 'INVALID_STATUS',
        };
      }

      if (payment.maxRetriesReached) {
        return {
          success: false,
          message: 'Maximum retries reached for this payment',
          error: 'MAX_RETRIES_REACHED',
        };
      }

      const newRetryCount = payment.retryCount + 1;
      const maxRetries = 3;

      // Update payment for retry
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'pending',
          retryCount: newRetryCount,
          nextRetryAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          maxRetriesReached: newRetryCount >= maxRetries,
        },
      });

      // Log admin action
      await prisma.adminAuditLog.create({
        data: {
          adminId: adminId,
          adminName: adminName,
          adminRole: 'billing_admin',
          targetUserId: payment.userId,
          action: 'update',
          resource: 'payment',
          resourceId: paymentId,
          changes: { action: 'retry', retry_count: newRetryCount },
          reason: 'Manual payment retry',
        },
      });

      return {
        success: true,
        message: 'Payment retry initiated',
        data: {
          retryCount: newRetryCount,
          maxRetries,
        },
      };
    } catch (error) {
      console.error('Retry payment error:', error);
      return {
        success: false,
        message: 'Failed to retry payment',
        error: 'RETRY_FAILED',
      };
    }
  }

  // Get dashboard metrics
  static async getMetrics() {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      // Get counts
      const [
        totalUsers,
        activeUsers,
        freeUsers,
        proUsers,
        enterpriseUsers,
        suspendedUsers,
        thisMonthPayments,
        lastMonthPayments,
        pendingAbuseReports,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { subscriptionStatus: 'active' } }),
        prisma.user.count({ where: { currentPlan: 'free' } }),
        prisma.user.count({ where: { currentPlan: 'pro' } }),
        prisma.user.count({ where: { currentPlan: 'enterprise' } }),
        prisma.user.count({ where: { subscriptionStatus: 'suspended' } }),
        prisma.payment.findMany({
          where: {
            status: 'succeeded',
            createdAt: { gte: startOfMonth },
          },
        }),
        prisma.payment.findMany({
          where: {
            status: 'succeeded',
            createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
          },
        }),
        prisma.abuseReport.count({ where: { status: 'pending' } }),
      ]);

      // Calculate MRR
      const thisMonthRevenue = thisMonthPayments.reduce(
        (sum, p) => sum + Number(p.amount),
        0
      );
      const lastMonthRevenue = lastMonthPayments.reduce(
        (sum, p) => sum + Number(p.amount),
        0
      );

      // Get MRR from active subscriptions
      const activeSubscriptions = await prisma.subscription.findMany({
        where: { status: 'active' },
      });

      const mrr = activeSubscriptions.reduce(
        (sum, s) => sum + Number(s.mrrValue),
        0
      );

      // Recent signups (last 7 days)
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const recentSignups = await prisma.user.count({
        where: { createdAt: { gte: weekAgo } },
      });

      // Failed payments count
      const failedPayments = await prisma.payment.count({
        where: { status: 'failed' },
      });

      return {
        success: true,
        data: {
          users: {
            total: totalUsers,
            active: activeUsers,
            suspended: suspendedUsers,
            byPlan: {
              free: freeUsers,
              pro: proUsers,
              enterprise: enterpriseUsers,
            },
            recentSignups,
          },
          revenue: {
            mrr,
            thisMonth: thisMonthRevenue,
            lastMonth: lastMonthRevenue,
            growth: lastMonthRevenue > 0
              ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(2)
              : 0,
          },
          payments: {
            thisMonthCount: thisMonthPayments.length,
            lastMonthCount: lastMonthPayments.length,
            failedCount: failedPayments,
          },
          abuse: {
            pendingReports: pendingAbuseReports,
          },
          generatedAt: now.toISOString(),
        },
      };
    } catch (error) {
      console.error('Get metrics error:', error);
      return {
        success: false,
        message: 'Failed to fetch metrics',
        error: 'FETCH_FAILED',
      };
    }
  }

  // Get abuse reports
  static async getAbuseReports(filters: { severity?: string; status?: string; page?: number; limit?: number }) {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (filters.severity) {
        where.severity = filters.severity;
      }

      if (filters.status) {
        where.status = filters.status;
      }

      const [reports, total] = await Promise.all([
        prisma.abuseReport.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                currentPlan: true,
              },
            },
          },
        }),
        prisma.abuseReport.count({ where }),
      ]);

      return {
        success: true,
        data: {
          reports,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      console.error('Get abuse reports error:', error);
      return {
        success: false,
        message: 'Failed to fetch abuse reports',
        error: 'FETCH_FAILED',
      };
    }
  }

  // Update abuse report
  static async updateAbuseReport(
    reportId: string,
    action: string,
    reason: string,
    adminId: string,
    adminName: string
  ) {
    try {
      const report = await prisma.abuseReport.findUnique({
        where: { id: reportId },
      });

      if (!report) {
        return {
          success: false,
          message: 'Abuse report not found',
          error: 'REPORT_NOT_FOUND',
        };
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

      // If action is suspend, suspend the user
      if (action === 'suspended') {
        await prisma.user.update({
          where: { id: report.userId },
          data: { subscriptionStatus: 'suspended' },
        });
      }

      // Log admin action
      await prisma.adminAuditLog.create({
        data: {
          adminId: adminId,
          adminName: adminName,
          adminRole: 'support_admin',
          targetUserId: report.userId,
          action: 'update',
          resource: 'abuse_report',
          resourceId: reportId,
          changes: { action_taken: action },
          reason,
        },
      });

      return {
        success: true,
        message: 'Abuse report updated',
        data: { action },
      };
    } catch (error) {
      console.error('Update abuse report error:', error);
      return {
        success: false,
        message: 'Failed to update abuse report',
        error: 'UPDATE_FAILED',
      };
    }
  }
}

export default PaymentService;
