import { Router, Request, Response } from 'express';
import { AdminService } from '../services/adminService.js';
import { PaymentService } from '../services/paymentService.js';
import { DocumentStatsService } from '../services/documentGeneratorService.js';
import { authenticateAdmin, requireAdminRole } from '../middleware/authMiddleware.js';
import { validatePagination } from '../utils/validation.js';

const router = Router();

// POST /api/admin/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
        error: 'MISSING_FIELDS',
      });
    }

    const result = await AdminService.login({ email, password });

    if (!result.success) {
      return res.status(401).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Admin login route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

// POST /api/admin/create (super_admin only)
router.post(
  '/create',
  authenticateAdmin,
  requireAdminRole('super_admin'),
  async (req: Request, res: Response) => {
    try {
      const { email, password, name, role } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({
          success: false,
          message: 'Email, password, and name are required',
          error: 'MISSING_FIELDS',
        });
      }

      const result = await AdminService.createAdmin({ email, password, name, role });

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(201).json(result);
    } catch (error) {
      console.error('Create admin route error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'SERVER_ERROR',
      });
    }
  }
);

// GET /api/admin/users
router.get(
  '/users',
  authenticateAdmin,
  requireAdminRole('super_admin', 'billing_admin', 'support_admin', 'viewer'),
  async (req: Request, res: Response) => {
    try {
      const { page, limit, search, plan, status } = req.query;

      const pagination = validatePagination(page as string, limit as string);
      const result = await AdminService.getUsers({
        page: pagination.page,
        limit: pagination.limit,
        search: search as string,
        plan: plan as string,
        status: status as string,
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Get users route error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'SERVER_ERROR',
      });
    }
  }
);

// GET /api/admin/users/:userId
router.get(
  '/users/:userId',
  authenticateAdmin,
  requireAdminRole('super_admin', 'billing_admin', 'support_admin', 'viewer'),
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      const result = await AdminService.getUserById(userId);

      if (!result.success) {
        return res.status(404).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Get user route error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'SERVER_ERROR',
      });
    }
  }
);

// GET /api/admin/users/:userId/subscriptions
router.get(
  '/users/:userId/subscriptions',
  authenticateAdmin,
  requireAdminRole('super_admin', 'billing_admin', 'support_admin', 'viewer'),
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      const result = await AdminService.getUserSubscriptions(userId);

      return res.status(200).json(result);
    } catch (error) {
      console.error('Get user subscriptions route error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'SERVER_ERROR',
      });
    }
  }
);

// PUT /api/admin/users/:userId/plan
router.put(
  '/users/:userId/plan',
  authenticateAdmin,
  requireAdminRole('super_admin', 'billing_admin'),
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { plan, reason } = req.body;

      if (!plan || !reason) {
        return res.status(400).json({
          success: false,
          message: 'Plan and reason are required',
          error: 'MISSING_FIELDS',
        });
      }

      const validPlans = ['free', 'pro', 'enterprise'];
      if (!validPlans.includes(plan)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid plan. Must be one of: free, pro, enterprise',
          error: 'INVALID_PLAN',
        });
      }

      const result = await AdminService.updateUserPlan(
        userId,
        plan,
        req.admin!.id,
        req.admin!.name,
        req.admin!.role,
        reason
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Update user plan route error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'SERVER_ERROR',
      });
    }
  }
);

// PUT /api/admin/users/:userId/suspension
router.put(
  '/users/:userId/suspension',
  authenticateAdmin,
  requireAdminRole('super_admin', 'billing_admin', 'support_admin'),
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      // Accept both 'suspend' and 'suspended' for frontend compatibility
      const { suspend, suspended, reason } = req.body;
      const shouldSuspend = suspend ?? suspended;

      if (typeof shouldSuspend !== 'boolean' || !reason) {
        return res.status(400).json({
          success: false,
          message: 'suspend/suspended (boolean) and reason are required',
          error: 'MISSING_FIELDS',
        });
      }

      const result = await AdminService.updateUserSuspension(
        userId,
        shouldSuspend,
        req.admin!.id,
        req.admin!.name,
        req.admin!.role,
        reason
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Update user suspension route error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'SERVER_ERROR',
      });
    }
  }
);

// POST /api/admin/users/:userId/extend
router.post(
  '/users/:userId/extend',
  authenticateAdmin,
  requireAdminRole('super_admin', 'billing_admin'),
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { days, reason } = req.body;

      if (!days || !reason) {
        return res.status(400).json({
          success: false,
          message: 'days and reason are required',
          error: 'MISSING_FIELDS',
        });
      }

      const daysNum = parseInt(days);
      if (isNaN(daysNum) || daysNum < 1 || daysNum > 365) {
        return res.status(400).json({
          success: false,
          message: 'days must be a number between 1 and 365',
          error: 'INVALID_DAYS',
        });
      }

      const result = await AdminService.extendSubscription(
        userId,
        daysNum,
        req.admin!.id,
        req.admin!.name,
        req.admin!.role,
        reason
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Extend subscription route error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'SERVER_ERROR',
      });
    }
  }
);

// ============ PAYMENT ROUTES ============

// GET /api/admin/payments
router.get(
  '/payments',
  authenticateAdmin,
  requireAdminRole('super_admin', 'billing_admin', 'viewer'),
  async (req: Request, res: Response) => {
    try {
      const { page, limit, status, userId, dateFrom, dateTo } = req.query;

      const pagination = validatePagination(page as string, limit as string);
      const result = await PaymentService.getPayments({
        page: pagination.page,
        limit: pagination.limit,
        status: status as string,
        userId: userId as string,
        dateFrom: dateFrom as string,
        dateTo: dateTo as string,
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Get payments route error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'SERVER_ERROR',
      });
    }
  }
);

// GET /api/admin/payments/:paymentId
router.get(
  '/payments/:paymentId',
  authenticateAdmin,
  requireAdminRole('super_admin', 'billing_admin', 'viewer'),
  async (req: Request, res: Response) => {
    try {
      const { paymentId } = req.params;

      const result = await PaymentService.getPaymentById(paymentId);

      if (!result.success) {
        return res.status(404).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Get payment route error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'SERVER_ERROR',
      });
    }
  }
);

// POST /api/admin/payments/:paymentId/refund
router.post(
  '/payments/:paymentId/refund',
  authenticateAdmin,
  requireAdminRole('super_admin', 'billing_admin'),
  async (req: Request, res: Response) => {
    try {
      const { paymentId } = req.params;
      const { amount, reason } = req.body;

      if (!amount || !reason) {
        return res.status(400).json({
          success: false,
          message: 'amount and reason are required',
          error: 'MISSING_FIELDS',
        });
      }

      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        return res.status(400).json({
          success: false,
          message: 'amount must be a positive number',
          error: 'INVALID_AMOUNT',
        });
      }

      const result = await PaymentService.processRefund({
        paymentId,
        amount: amountNum,
        reason,
        adminId: req.admin!.id,
        adminName: req.admin!.name,
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Refund route error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'SERVER_ERROR',
      });
    }
  }
);

// PUT /api/admin/payments/:paymentId/retry
router.put(
  '/payments/:paymentId/retry',
  authenticateAdmin,
  requireAdminRole('super_admin', 'billing_admin'),
  async (req: Request, res: Response) => {
    try {
      const { paymentId } = req.params;

      const result = await PaymentService.retryPayment(
        paymentId,
        req.admin!.id,
        req.admin!.name
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Retry payment route error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'SERVER_ERROR',
      });
    }
  }
);

// ============ METRICS ROUTES ============

// GET /api/admin/metrics
router.get(
  '/metrics',
  authenticateAdmin,
  requireAdminRole('super_admin', 'billing_admin', 'support_admin', 'viewer'),
  async (req: Request, res: Response) => {
    try {
      // Get payment metrics and document stats in parallel
      const [paymentMetrics, documentStats] = await Promise.all([
        PaymentService.getMetrics(),
        DocumentStatsService.getAdminDocumentStats(),
      ]);

      if (!paymentMetrics.success) {
        return res.status(400).json(paymentMetrics);
      }

      // Combine the metrics with document stats
      return res.status(200).json({
        success: true,
        data: {
          ...paymentMetrics.data,
          documents: documentStats.success ? documentStats.data : null,
        },
      });
    } catch (error) {
      console.error('Get metrics route error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'SERVER_ERROR',
      });
    }
  }
);

// GET /api/admin/document-stats
router.get(
  '/document-stats',
  authenticateAdmin,
  requireAdminRole('super_admin', 'billing_admin', 'support_admin', 'viewer'),
  async (req: Request, res: Response) => {
    try {
      const result = await DocumentStatsService.getAdminDocumentStats();

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Get document stats route error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'SERVER_ERROR',
      });
    }
  }
);

// ============ ABUSE REPORTS ROUTES ============

// GET /api/admin/abuse-reports
router.get(
  '/abuse-reports',
  authenticateAdmin,
  requireAdminRole('super_admin', 'billing_admin', 'support_admin', 'viewer'),
  async (req: Request, res: Response) => {
    try {
      const { page, limit, severity, status } = req.query;

      const pagination = validatePagination(page as string, limit as string);
      const result = await PaymentService.getAbuseReports({
        page: pagination.page,
        limit: pagination.limit,
        severity: severity as string,
        status: status as string,
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Get abuse reports route error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'SERVER_ERROR',
      });
    }
  }
);

// PUT /api/admin/abuse-reports/:reportId
router.put(
  '/abuse-reports/:reportId',
  authenticateAdmin,
  requireAdminRole('super_admin', 'support_admin'),
  async (req: Request, res: Response) => {
    try {
      const { reportId } = req.params;
      const { action, reason } = req.body;

      if (!action || !reason) {
        return res.status(400).json({
          success: false,
          message: 'action and reason are required',
          error: 'MISSING_FIELDS',
        });
      }

      const validActions = ['suspended', 'warned', 'dismissed', 'overridden'];
      if (!validActions.includes(action)) {
        return res.status(400).json({
          success: false,
          message: `action must be one of: ${validActions.join(', ')}`,
          error: 'INVALID_ACTION',
        });
      }

      const result = await PaymentService.updateAbuseReport(
        reportId,
        action,
        reason,
        req.admin!.id,
        req.admin!.name
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Update abuse report route error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'SERVER_ERROR',
      });
    }
  }
);

export default router;
