import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { timingSafeEqual } from 'crypto';
import { AdminController } from '../controllers/adminController.js';
import { authenticateAdmin, requireAdminRole } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import prisma from '../lib/prisma.js';
import Joi from 'joi';

// ============================================================================
// ADMIN ROUTES
// ============================================================================

const router = Router();

const allRoles = ['super_admin', 'billing_admin', 'support_admin', 'viewer'];
const billing  = ['super_admin', 'billing_admin'];
const support  = ['super_admin', 'billing_admin', 'support_admin'];

// ── Validators ───────────────────────────────────────────────────────────────

const loginSchema = Joi.object({
  email:    Joi.string().email().required(),
  password: Joi.string().required(),
});

const createAdminSchema = Joi.object({
  email:    Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  name:     Joi.string().trim().required(),
  role:     Joi.string().valid('super_admin', 'billing_admin', 'support_admin', 'viewer').optional(),
});

const updatePlanSchema = Joi.object({
  plan:   Joi.string().valid('free', 'pro', 'enterprise').required(),
  reason: Joi.string().trim().min(1).required(),
});

const suspensionSchema = Joi.object({
  suspend:   Joi.boolean().optional(),
  suspended: Joi.boolean().optional(),
  reason:    Joi.string().trim().min(1).required(),
}).or('suspend', 'suspended');

const extendSchema = Joi.object({
  days:   Joi.number().integer().min(1).max(365).required(),
  reason: Joi.string().trim().min(1).required(),
});

const refundSchema = Joi.object({
  amount: Joi.number().positive().required(),
  reason: Joi.string().trim().min(1).required(),
});

const abuseReportSchema = Joi.object({
  action: Joi.string().valid('suspended', 'warned', 'dismissed', 'overridden').required(),
  reason: Joi.string().trim().min(1).required(),
});

// ============================================================================

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin panel — user, payment, and platform management
 */

// --------------------------------------------------------------------------
// AUTH
// --------------------------------------------------------------------------

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful }
 *       401: { description: Invalid credentials }
 */
router.post('/login', validate(loginSchema), AdminController.login);

// SETUP UTILITY — gated by SETUP_SECRET, used for initial environment setup only
router.post('/setup-env', async (req: Request, res: Response) => {
  const { setupSecret, adminEmail, adminPassword, adminName, userEmail, userPlan } = req.body;
  const expected = process.env.SETUP_SECRET;
  if (!expected || !setupSecret) {
    res.status(403).json({ success: false, message: 'Forbidden' });
    return;
  }
  const a = Buffer.from(setupSecret as string);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    res.status(403).json({ success: false, message: 'Forbidden' });
    return;
  }
  const results: Record<string, any> = {};
  try {
    // Step 1: Inspect actual Admin table columns so we know exactly what exists
    const cols = await prisma.$queryRaw<{ column_name: string }[]>`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'Admin' AND table_schema = 'public'
      ORDER BY ordinal_position
    `;
    results.existingColumns = cols.map(c => c.column_name);

    // Step 2: Ensure every required column exists (idempotent — safe to re-run)
    await prisma.$executeRaw`ALTER TABLE "Admin" ADD COLUMN IF NOT EXISTS "is_active"     BOOLEAN   NOT NULL DEFAULT true`;
    await prisma.$executeRaw`ALTER TABLE "Admin" ADD COLUMN IF NOT EXISTS "created_at"    TIMESTAMP NOT NULL DEFAULT NOW()`;
    await prisma.$executeRaw`ALTER TABLE "Admin" ADD COLUMN IF NOT EXISTS "updated_at"    TIMESTAMP NOT NULL DEFAULT NOW()`;
    await prisma.$executeRaw`ALTER TABLE "Admin" ADD COLUMN IF NOT EXISTS "last_login_at" TIMESTAMP`;
    results.schemaRepair = 'done';

    // Step 3: Create or reset admin via dynamic raw SQL built from actual column list
    if (adminEmail && adminPassword && adminName) {
      const hashed = await bcrypt.hash(adminPassword, 12);
      const email  = adminEmail.toLowerCase();
      const id     = uuidv4();
      const existingCols = new Set(cols.map(c => c.column_name));

      // Build INSERT columns/values dynamically — covers any mix of camelCase or snake_case
      const colNames: string[] = ['id', 'email', 'password', 'name', 'role'];
      const colVals:  string[] = ['$1', '$2',    '$3',       '$4',   "'super_admin'"];
      if (existingCols.has('isActive'))    { colNames.push('"isActive"');    colVals.push('true'); }
      if (existingCols.has('is_active'))   { colNames.push('"is_active"');   colVals.push('true'); }
      if (existingCols.has('createdAt'))   { colNames.push('"createdAt"');   colVals.push('NOW()'); }
      if (existingCols.has('created_at'))  { colNames.push('"created_at"');  colVals.push('NOW()'); }
      if (existingCols.has('updatedAt'))   { colNames.push('"updatedAt"');   colVals.push('NOW()'); }
      if (existingCols.has('updated_at'))  { colNames.push('"updated_at"');  colVals.push('NOW()'); }

      const updateClauses = ["password = EXCLUDED.password", "name = EXCLUDED.name", "role = 'super_admin'"];
      if (existingCols.has('isActive'))    updateClauses.push('"isActive" = true');
      if (existingCols.has('is_active'))   updateClauses.push('"is_active" = true');
      if (existingCols.has('updatedAt'))   updateClauses.push('"updatedAt" = NOW()');
      if (existingCols.has('updated_at'))  updateClauses.push('"updated_at" = NOW()');

      const sql = `
        INSERT INTO "Admin" (${colNames.join(', ')})
        VALUES (${colVals.join(', ')})
        ON CONFLICT (email) DO UPDATE SET ${updateClauses.join(', ')}
      `;
      await prisma.$executeRawUnsafe(sql, id, email, hashed, adminName);
      results.admin = { email, role: 'super_admin', action: 'upserted' };
    }

    // Step 4: Upgrade user plan (isolated — failure here doesn't block admin creation)
    if (userEmail && userPlan) {
      try {
        const user = await prisma.user.update({
          where: { email: userEmail.toLowerCase() },
          data: { currentPlan: userPlan, subscriptionStatus: 'active' },
          select: { id: true, email: true, currentPlan: true },
        });
        results.user = { ...user, action: 'plan updated' };
      } catch (userErr: any) {
        results.userError = userErr.message;
      }
    }

    res.json({ success: true, message: 'Setup complete', data: results });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, partialResults: results });
  }
});

/**
 * @swagger
 * /api/admin/bootstrap:
 *   post:
 *     summary: Create first super_admin if none exist (requires SETUP_SECRET header)
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name, setupSecret]
 *             properties:
 *               email:       { type: string, format: email }
 *               password:    { type: string, minLength: 8 }
 *               name:        { type: string }
 *               setupSecret: { type: string }
 *     responses:
 *       201: { description: First admin created }
 *       403: { description: Forbidden }
 *       409: { description: Admin already exists }
 */
router.post('/bootstrap', AdminController.bootstrap);

/**
 * @swagger
 * /api/admin/create:
 *   post:
 *     summary: Create a new admin (super_admin only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name]
 *             properties:
 *               email:    { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               name:     { type: string }
 *               role:     { type: string, enum: [super_admin, billing_admin, support_admin, viewer] }
 *     responses:
 *       201: { description: Admin created }
 */
router.post('/create', authenticateAdmin, requireAdminRole('super_admin'), validate(createAdminSchema), AdminController.createAdmin);

// --------------------------------------------------------------------------
// USERS
// --------------------------------------------------------------------------

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users with filters
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - { in: query, name: page,   schema: { type: integer } }
 *       - { in: query, name: limit,  schema: { type: integer } }
 *       - { in: query, name: search, schema: { type: string } }
 *       - { in: query, name: plan,   schema: { type: string, enum: [free, pro, enterprise] } }
 *       - { in: query, name: status, schema: { type: string, enum: [active, suspended] } }
 *     responses:
 *       200: { description: Users retrieved }
 */
router.get('/users', authenticateAdmin, requireAdminRole(...allRoles), AdminController.getUsers);

/**
 * @swagger
 * /api/admin/users/{userId}:
 *   get:
 *     summary: Get user by ID with full details
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - { in: path, name: userId, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: User retrieved }
 *       404: { description: User not found }
 */
router.get('/users/:userId', authenticateAdmin, requireAdminRole(...allRoles), AdminController.getUserById);

/**
 * @swagger
 * /api/admin/users/{userId}/subscriptions:
 *   get:
 *     summary: Get user subscription details
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - { in: path, name: userId, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Subscription retrieved }
 */
router.get('/users/:userId/subscriptions', authenticateAdmin, requireAdminRole(...allRoles), AdminController.getUserSubscriptions);

/**
 * @swagger
 * /api/admin/users/{userId}/plan:
 *   put:
 *     summary: Update user plan
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - { in: path, name: userId, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [plan, reason]
 *             properties:
 *               plan:   { type: string, enum: [free, pro, enterprise] }
 *               reason: { type: string }
 *     responses:
 *       200: { description: Plan updated }
 */
router.put('/users/:userId/plan', authenticateAdmin, requireAdminRole(...billing), validate(updatePlanSchema), AdminController.updateUserPlan);

/**
 * @swagger
 * /api/admin/users/{userId}/suspension:
 *   put:
 *     summary: Suspend or reactivate a user
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - { in: path, name: userId, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reason]
 *             properties:
 *               suspend: { type: boolean }
 *               reason:  { type: string }
 *     responses:
 *       200: { description: User suspension updated }
 */
router.put('/users/:userId/suspension', authenticateAdmin, requireAdminRole(...support), validate(suspensionSchema), AdminController.updateUserSuspension);

/**
 * @swagger
 * /api/admin/users/{userId}/extend:
 *   post:
 *     summary: Extend user subscription
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - { in: path, name: userId, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [days, reason]
 *             properties:
 *               days:   { type: integer, minimum: 1, maximum: 365 }
 *               reason: { type: string }
 *     responses:
 *       200: { description: Subscription extended }
 */
router.post('/users/:userId/extend', authenticateAdmin, requireAdminRole(...billing), validate(extendSchema), AdminController.extendSubscription);

// --------------------------------------------------------------------------
// PAYMENTS
// --------------------------------------------------------------------------

/**
 * @swagger
 * /api/admin/payments:
 *   get:
 *     summary: Get all payments with filters
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - { in: query, name: page,     schema: { type: integer } }
 *       - { in: query, name: limit,    schema: { type: integer } }
 *       - { in: query, name: status,   schema: { type: string } }
 *       - { in: query, name: userId,   schema: { type: string } }
 *       - { in: query, name: dateFrom, schema: { type: string, format: date } }
 *       - { in: query, name: dateTo,   schema: { type: string, format: date } }
 *     responses:
 *       200: { description: Payments retrieved }
 */
router.get('/payments', authenticateAdmin, requireAdminRole('super_admin', 'billing_admin', 'viewer'), AdminController.getPayments);

/**
 * @swagger
 * /api/admin/payments/{paymentId}:
 *   get:
 *     summary: Get payment by ID
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - { in: path, name: paymentId, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Payment retrieved }
 *       404: { description: Payment not found }
 */
router.get('/payments/:paymentId', authenticateAdmin, requireAdminRole('super_admin', 'billing_admin', 'viewer'), AdminController.getPaymentById);

/**
 * @swagger
 * /api/admin/payments/{paymentId}/refund:
 *   post:
 *     summary: Process a refund
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - { in: path, name: paymentId, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, reason]
 *             properties:
 *               amount: { type: number }
 *               reason: { type: string }
 *     responses:
 *       200: { description: Refund processed }
 */
router.post('/payments/:paymentId/refund', authenticateAdmin, requireAdminRole(...billing), validate(refundSchema), AdminController.processRefund);

/**
 * @swagger
 * /api/admin/payments/{paymentId}/retry:
 *   put:
 *     summary: Retry a failed payment
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - { in: path, name: paymentId, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Retry initiated }
 */
router.put('/payments/:paymentId/retry', authenticateAdmin, requireAdminRole(...billing), AdminController.retryPayment);

// --------------------------------------------------------------------------
// METRICS
// --------------------------------------------------------------------------

/**
 * @swagger
 * /api/admin/metrics:
 *   get:
 *     summary: Get platform metrics and revenue stats
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200: { description: Metrics retrieved }
 */
router.get('/metrics', authenticateAdmin, requireAdminRole(...allRoles), AdminController.getMetrics);

/**
 * @swagger
 * /api/admin/document-stats:
 *   get:
 *     summary: Get document generation statistics
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200: { description: Document stats retrieved }
 */
router.get('/document-stats', authenticateAdmin, requireAdminRole(...allRoles), AdminController.getDocumentStats);

// --------------------------------------------------------------------------
// ABUSE REPORTS
// --------------------------------------------------------------------------

/**
 * @swagger
 * /api/admin/abuse-reports:
 *   get:
 *     summary: Get abuse reports
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - { in: query, name: severity, schema: { type: string, enum: [low, medium, high, critical] } }
 *       - { in: query, name: status,   schema: { type: string, enum: [pending, reviewed] } }
 *     responses:
 *       200: { description: Abuse reports retrieved }
 */
router.get('/abuse-reports', authenticateAdmin, requireAdminRole(...allRoles), AdminController.getAbuseReports);

/**
 * @swagger
 * /api/admin/abuse-reports/{reportId}:
 *   put:
 *     summary: Update abuse report action
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - { in: path, name: reportId, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [action, reason]
 *             properties:
 *               action: { type: string, enum: [suspended, warned, dismissed, overridden] }
 *               reason: { type: string }
 *     responses:
 *       200: { description: Report updated }
 */
router.put('/abuse-reports/:reportId', authenticateAdmin, requireAdminRole('super_admin', 'support_admin'), validate(abuseReportSchema), AdminController.updateAbuseReport);

export default router;