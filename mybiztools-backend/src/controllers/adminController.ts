import { Request, Response } from 'express';
import { AdminService } from '../services/adminService.js';
import { PaymentService } from '../services/paymentService.js';
import { DocumentStatsService } from '../services/documentGeneratorService.js';
import { validatePagination } from '../utils/validation.js';

// ============================================================================
// ADMIN CONTROLLER
// ============================================================================

export class AdminController {
  // --------------------------------------------------------------------------
  // AUTH
  // --------------------------------------------------------------------------

  /** POST /api/admin/login */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const result = await AdminService.login(req.body);
      res.status(result.success ? 200 : 401).json(result);
    } catch (err) {
      console.error('[AdminController.login]', err);
      res.status(500).json({ success: false, message: 'Login failed', error: 'SERVER_ERROR' });
    }
  }

  /** POST /api/admin/bootstrap — creates first super_admin if none exist */
  static async bootstrap(req: Request, res: Response): Promise<void> {
    const { setupSecret, ...adminData } = req.body;
    const expected = process.env.SETUP_SECRET;
    if (!expected || setupSecret !== expected) {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }
    try {
      const result = await AdminService.bootstrap(adminData);
      res.status(result.success ? 201 : 409).json(result);
    } catch (err) {
      console.error('[AdminController.bootstrap]', err);
      res.status(500).json({ success: false, message: 'Bootstrap failed', error: 'SERVER_ERROR' });
    }
  }

  /** POST /api/admin/create */
  static async createAdmin(req: Request, res: Response): Promise<void> {
    try {
      const result = await AdminService.createAdmin(req.body);
      res.status(result.success ? 201 : 400).json(result);
    } catch (err) {
      console.error('[AdminController.createAdmin]', err);
      res.status(500).json({ success: false, message: 'Create admin failed', error: 'SERVER_ERROR' });
    }
  }

  // --------------------------------------------------------------------------
  // USERS
  // --------------------------------------------------------------------------

  /** GET /api/admin/users */
  static async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, search, plan, status } = req.query;
      const pagination = validatePagination(page as string, limit as string);
      const result = await AdminService.getUsers({
        ...pagination,
        search: search as string,
        plan: plan as string,
        status: status as string,
      });
      res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('[AdminController.getUsers]', err);
      res.status(500).json({ success: false, message: 'Failed to fetch users', error: 'SERVER_ERROR' });
    }
  }

  /** GET /api/admin/users/:userId */
  static async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const result = await AdminService.getUserById(req.params.userId);
      res.status(result.success ? 200 : 404).json(result);
    } catch (err) {
      console.error('[AdminController.getUserById]', err);
      res.status(500).json({ success: false, message: 'Failed to fetch user', error: 'SERVER_ERROR' });
    }
  }

  /** GET /api/admin/users/:userId/subscriptions */
  static async getUserSubscriptions(req: Request, res: Response): Promise<void> {
    try {
      const result = await AdminService.getUserSubscriptions(req.params.userId);
      res.status(200).json(result);
    } catch (err) {
      console.error('[AdminController.getUserSubscriptions]', err);
      res.status(500).json({ success: false, message: 'Failed to fetch subscriptions', error: 'SERVER_ERROR' });
    }
  }

  /** PUT /api/admin/users/:userId/plan */
  static async updateUserPlan(req: Request, res: Response): Promise<void> {
    try {
      const { plan, reason } = req.body;
      const result = await AdminService.updateUserPlan(
        req.params.userId, plan, req.admin!.id, req.admin!.name, req.admin!.role, reason
      );
      res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('[AdminController.updateUserPlan]', err);
      res.status(500).json({ success: false, message: 'Failed to update plan', error: 'SERVER_ERROR' });
    }
  }

  /** PUT /api/admin/users/:userId/suspension */
  static async updateUserSuspension(req: Request, res: Response): Promise<void> {
    try {
      const { suspend, suspended, reason } = req.body;
      const shouldSuspend = suspend ?? suspended;
      const result = await AdminService.updateUserSuspension(
        req.params.userId, shouldSuspend, req.admin!.id, req.admin!.name, req.admin!.role, reason
      );
      res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('[AdminController.updateUserSuspension]', err);
      res.status(500).json({ success: false, message: 'Failed to update suspension', error: 'SERVER_ERROR' });
    }
  }

  /** POST /api/admin/users/:userId/extend */
  static async extendSubscription(req: Request, res: Response): Promise<void> {
    try {
      const { days, reason } = req.body;
      const result = await AdminService.extendSubscription(
        req.params.userId, parseInt(days), req.admin!.id, req.admin!.name, req.admin!.role, reason
      );
      res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('[AdminController.extendSubscription]', err);
      res.status(500).json({ success: false, message: 'Failed to extend subscription', error: 'SERVER_ERROR' });
    }
  }

  // --------------------------------------------------------------------------
  // PAYMENTS
  // --------------------------------------------------------------------------

  /** GET /api/admin/payments */
  static async getPayments(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, status, userId, dateFrom, dateTo } = req.query;
      const pagination = validatePagination(page as string, limit as string);
      const result = await PaymentService.getPayments({
        ...pagination,
        status: status as string,
        userId: userId as string,
        dateFrom: dateFrom as string,
        dateTo: dateTo as string,
      });
      res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('[AdminController.getPayments]', err);
      res.status(500).json({ success: false, message: 'Failed to fetch payments', error: 'SERVER_ERROR' });
    }
  }

  /** GET /api/admin/payments/:paymentId */
  static async getPaymentById(req: Request, res: Response): Promise<void> {
    try {
      const result = await PaymentService.getPaymentById(req.params.paymentId);
      res.status(result.success ? 200 : 404).json(result);
    } catch (err) {
      console.error('[AdminController.getPaymentById]', err);
      res.status(500).json({ success: false, message: 'Failed to fetch payment', error: 'SERVER_ERROR' });
    }
  }

  /** POST /api/admin/payments/:paymentId/refund */
  static async processRefund(req: Request, res: Response): Promise<void> {
    try {
      const { amount, reason } = req.body;
      const result = await PaymentService.processRefund({
        paymentId: req.params.paymentId,
        amount: parseFloat(amount),
        reason,
        adminId: req.admin!.id,
        adminName: req.admin!.name,
      });
      res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('[AdminController.processRefund]', err);
      res.status(500).json({ success: false, message: 'Failed to process refund', error: 'SERVER_ERROR' });
    }
  }

  /** PUT /api/admin/payments/:paymentId/retry */
  static async retryPayment(req: Request, res: Response): Promise<void> {
    try {
      const result = await PaymentService.retryPayment(
        req.params.paymentId, req.admin!.id, req.admin!.name
      );
      res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('[AdminController.retryPayment]', err);
      res.status(500).json({ success: false, message: 'Failed to retry payment', error: 'SERVER_ERROR' });
    }
  }

  // --------------------------------------------------------------------------
  // METRICS
  // --------------------------------------------------------------------------

  /** GET /api/admin/metrics */
  static async getMetrics(_req: Request, res: Response): Promise<void> {
    try {
      const [paymentMetrics, documentStats] = await Promise.all([
        PaymentService.getMetrics(),
        DocumentStatsService.getAdminDocumentStats(),
      ]);
      res.status(200).json({
        success: true,
        data: {
          ...paymentMetrics.data,
          documents: documentStats.success ? documentStats.data : null,
        },
      });
    } catch (err) {
      console.error('[AdminController.getMetrics]', err);
      res.status(500).json({ success: false, message: 'Failed to fetch metrics', error: 'SERVER_ERROR' });
    }
  }

  /** GET /api/admin/document-stats */
  static async getDocumentStats(_req: Request, res: Response): Promise<void> {
    try {
      const result = await DocumentStatsService.getAdminDocumentStats();
      res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('[AdminController.getDocumentStats]', err);
      res.status(500).json({ success: false, message: 'Failed to fetch document stats', error: 'SERVER_ERROR' });
    }
  }

  // --------------------------------------------------------------------------
  // ABUSE REPORTS
  // --------------------------------------------------------------------------

  /** GET /api/admin/abuse-reports */
  static async getAbuseReports(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, severity, status } = req.query;
      const pagination = validatePagination(page as string, limit as string);
      const result = await PaymentService.getAbuseReports({
        ...pagination,
        severity: severity as string,
        status: status as string,
      });
      res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('[AdminController.getAbuseReports]', err);
      res.status(500).json({ success: false, message: 'Failed to fetch abuse reports', error: 'SERVER_ERROR' });
    }
  }

  /** PUT /api/admin/abuse-reports/:reportId */
  static async updateAbuseReport(req: Request, res: Response): Promise<void> {
    try {
      const { action, reason } = req.body;
      const result = await PaymentService.updateAbuseReport(
        req.params.reportId, action, reason, req.admin!.id, req.admin!.name
      );
      res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
      console.error('[AdminController.updateAbuseReport]', err);
      res.status(500).json({ success: false, message: 'Failed to update abuse report', error: 'SERVER_ERROR' });
    }
  }
}