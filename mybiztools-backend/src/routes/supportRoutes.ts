import { Router } from 'express';
import { SupportController } from '../controllers/supportController.js';
import { authenticateAdmin, requireAdminRole } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { respondToTicketSchema, updateTicketStatusSchema } from '../validators/supportValidator.js';

// ============================================================================
// SUPPORT ROUTES (Admin only)
// ============================================================================

const router = Router();

const viewRoles  = ['super_admin', 'support_admin', 'billing_admin', 'viewer'];
const writeRoles = ['super_admin', 'support_admin'];

/**
 * @swagger
 * tags:
 *   name: Support
 *   description: Admin support ticket management
 */

/**
 * @swagger
 * /api/admin/support/tickets:
 *   get:
 *     summary: Get all support tickets
 *     tags: [Support]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [open, in_progress, resolved, closed] }
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [low, medium, high, urgent] }
 *       - in: query
 *         name: channel
 *         schema: { type: string, enum: [email, whatsapp, sms, in_app] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Tickets retrieved successfully
 */
router.get(
  '/tickets',
  authenticateAdmin,
  requireAdminRole(...viewRoles),
  SupportController.getTickets
);

// NOTE: /tickets/stats must be before /tickets/:ticketId
/**
 * @swagger
 * /api/admin/support/tickets/stats:
 *   get:
 *     summary: Get ticket statistics
 *     tags: [Support]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Stats retrieved successfully
 */
router.get(
  '/tickets/stats',
  authenticateAdmin,
  requireAdminRole(...viewRoles),
  SupportController.getTicketStats
);

/**
 * @swagger
 * /api/admin/support/tickets/{ticketId}:
 *   get:
 *     summary: Get ticket by ID with all responses
 *     tags: [Support]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Ticket retrieved successfully
 *       404:
 *         description: Ticket not found
 */
router.get(
  '/tickets/:ticketId',
  authenticateAdmin,
  requireAdminRole(...viewRoles),
  SupportController.getTicketById
);

/**
 * @swagger
 * /api/admin/support/tickets/{ticketId}/respond:
 *   post:
 *     summary: Respond to a ticket via email, SMS, or WhatsApp
 *     tags: [Support]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message, channel]
 *             properties:
 *               message:
 *                 type: string
 *               channel:
 *                 type: string
 *                 enum: [email, whatsapp, sms]
 *     responses:
 *       200:
 *         description: Response sent successfully
 */
router.post(
  '/tickets/:ticketId/respond',
  authenticateAdmin,
  requireAdminRole(...writeRoles),
  validate(respondToTicketSchema),
  SupportController.respondToTicket
);

/**
 * @swagger
 * /api/admin/support/tickets/{ticketId}/status:
 *   put:
 *     summary: Update ticket status
 *     tags: [Support]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [open, in_progress, resolved, closed]
 *     responses:
 *       200:
 *         description: Status updated successfully
 */
router.put(
  '/tickets/:ticketId/status',
  authenticateAdmin,
  requireAdminRole(...writeRoles),
  validate(updateTicketStatusSchema),
  SupportController.updateTicketStatus
);

/**
 * @swagger
 * /api/admin/support/tickets/{ticketId}/assign:
 *   put:
 *     summary: Assign ticket to current admin
 *     tags: [Support]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Ticket assigned successfully
 */
router.put(
  '/tickets/:ticketId/assign',
  authenticateAdmin,
  requireAdminRole(...writeRoles),
  SupportController.assignTicket
);

export default router;