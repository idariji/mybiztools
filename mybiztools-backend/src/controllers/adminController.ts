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
    const result = await AdminService.login(req.body);
    res.status(result.success ? 200 : 401).json(result);
  }

  /** POST /api/admin/bootstrap — creates first super_admin if none exist */
  static async bootstrap(req: Request, res: Response): Promise<void> {
    const { setupSecret, ...adminData } = req.body;
    const expected = process.env.SETUP_SECRET;
    if (!expected || setupSecret !== expected) {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }
    const result = await AdminService.bootstrap(adminData);
    res.status(result.success ? 201 : 409).json(result);
  }

  /** POST /api/admin/create */
  static async createAdmin(req: Request, res: Response): Promise<void> {
    const result = await AdminService.createAdmin(req.body);
    res.status(result.success ? 201 : 400).json(result);
  }

  // --------------------------------------------------------------------------
  // USERS
  // --------------------------------------------------------------------------

  /** GET /api/admin/users */
  static async getUsers(req: Request, res: Response): Promise<void> {
    const { page, limit, search, plan, status } = req.query;
    const pagination = validatePagination(page as string, limit as string);
    const result = await AdminService.getUsers({
      ...pagination,
      search: search as string,
      plan: plan as string,
      status: status as string,
    });
    res.status(result.success ? 200 : 400).json(result);
  }

  /** GET /api/admin/users/:userId */
  static async getUserById(req: Request, res: Response): Promise<void> {
    const result = await AdminService.getUserById(req.params.userId);
    res.status(result.success ? 200 : 404).json(result);
  }

  /** GET /api/admin/users/:userId/subscriptions */
  static async getUserSubscriptions(req: Request, res: Response): Promise<void> {
    const result = await AdminService.getUserSubscriptions(req.params.userId);
    res.status(200).json(result);
  }

  /** PUT /api/admin/users/:userId/plan */
  static async updateUserPlan(req: Request, res: Response): Promise<void> {
    const { plan, reason } = req.body;
    const result = await AdminService.updateUserPlan(
      req.params.userId, plan, req.admin!.id, req.admin!.name, req.admin!.role, reason
    );
    res.status(result.success ? 200 : 400).json(result);
  }

  /** PUT /api/admin/users/:userId/suspension */
  static async updateUserSuspension(req: Request, res: Response): Promise<void> {
    const { suspend, suspended, reason } = req.body;
    const shouldSuspend = suspend ?? suspended;
    const result = await AdminService.updateUserSuspension(
      req.params.userId, shouldSuspend, req.admin!.id, req.admin!.name, req.admin!.role, reason
    );
    res.status(result.success ? 200 : 400).json(result);
  }

  /** POST /api/admin/users/:userId/extend */
  static async extendSubscription(req: Request, res: Response): Promise<void> {
    const { days, reason } = req.body;
    const result = await AdminService.extendSubscription(
      req.params.userId, parseInt(days), req.admin!.id, req.admin!.name, req.admin!.role, reason
    );
    res.status(result.success ? 200 : 400).json(result);
  }

  // --------------------------------------------------------------------------
  // PAYMENTS
  // --------------------------------------------------------------------------

  /** GET /api/admin/payments */
  static async getPayments(req: Request, res: Response): Promise<void> {
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
  }

  /** GET /api/admin/payments/:paymentId */
  static async getPaymentById(req: Request, res: Response): Promise<void> {
    const result = await PaymentService.getPaymentById(req.params.paymentId);
    res.status(result.success ? 200 : 404).json(result);
  }

  /** POST /api/admin/payments/:paymentId/refund */
  static async processRefund(req: Request, res: Response): Promise<void> {
    const { amount, reason } = req.body;
    const result = await PaymentService.processRefund({
      paymentId: req.params.paymentId,
      amount: parseFloat(amount),
      reason,
      adminId: req.admin!.id,
      adminName: req.admin!.name,
    });
    res.status(result.success ? 200 : 400).json(result);
  }

  /** PUT /api/admin/payments/:paymentId/retry */
  static async retryPayment(req: Request, res: Response): Promise<void> {
    const result = await PaymentService.retryPayment(
      req.params.paymentId, req.admin!.id, req.admin!.name
    );
    res.status(result.success ? 200 : 400).json(result);
  }

  // --------------------------------------------------------------------------
  // METRICS
  // --------------------------------------------------------------------------

  /** GET /api/admin/metrics */
  static async getMetrics(_req: Request, res: Response): Promise<void> {
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
  }

  /** GET /api/admin/document-stats */
  static async getDocumentStats(_req: Request, res: Response): Promise<void> {
    const result = await DocumentStatsService.getAdminDocumentStats();
    res.status(result.success ? 200 : 400).json(result);
  }

  // --------------------------------------------------------------------------
  // ABUSE REPORTS
  // --------------------------------------------------------------------------

  /** GET /api/admin/abuse-reports */
  static async getAbuseReports(req: Request, res: Response): Promise<void> {
    const { page, limit, severity, status } = req.query;
    const pagination = validatePagination(page as string, limit as string);
    const result = await PaymentService.getAbuseReports({
      ...pagination,
      severity: severity as string,
      status: status as string,
    });
    res.status(result.success ? 200 : 400).json(result);
  }

  /** PUT /api/admin/abuse-reports/:reportId */
  static async updateAbuseReport(req: Request, res: Response): Promise<void> {
    const { action, reason } = req.body;
    const result = await PaymentService.updateAbuseReport(
      req.params.reportId, action, reason, req.admin!.id, req.admin!.name
    );
    res.status(result.success ? 200 : 400).json(result);
  }
}