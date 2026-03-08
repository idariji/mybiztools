// /**
//  * Support Ticket Routes
//  * Admin endpoints for managing customer support tickets
//  */

// import { Router, Request, Response } from 'express';
// import { SupportService } from '../services/supportService.js';
// import { authenticateAdmin, requireAdminRole } from '../middleware/authMiddleware.js';
// import { validatePagination } from '../utils/validation.js';

// const router = Router();

// // ============ ADMIN SUPPORT TICKET ROUTES ============

// // GET /api/admin/support/tickets - Get all tickets with filters
// router.get(
//   '/tickets',
//   authenticateAdmin,
//   requireAdminRole('super_admin', 'support_admin', 'billing_admin', 'viewer'),
//   async (req: Request, res: Response) => {
//     try {
//       const { page, limit, status, priority, channel, assignedTo, search } = req.query;

//       const pagination = validatePagination(page as string, limit as string);
//       const result = await SupportService.getTickets({
//         page: pagination.page,
//         limit: pagination.limit,
//         status: status as string,
//         priority: priority as string,
//         channel: channel as string,
//         assignedTo: assignedTo as string,
//         search: search as string,
//       });

//       if (!result.success) {
//         return res.status(400).json(result);
//       }

//       return res.status(200).json(result);
//     } catch (error) {
//       console.error('Get tickets route error:', error);
//       return res.status(500).json({
//         success: false,
//         message: 'Internal server error',
//         error: 'SERVER_ERROR',
//       });
//     }
//   }
// );

// // GET /api/admin/support/tickets/stats - Get ticket statistics
// router.get(
//   '/tickets/stats',
//   authenticateAdmin,
//   requireAdminRole('super_admin', 'support_admin', 'billing_admin', 'viewer'),
//   async (req: Request, res: Response) => {
//     try {
//       const result = await SupportService.getTicketStats();

//       if (!result.success) {
//         return res.status(400).json(result);
//       }

//       return res.status(200).json(result);
//     } catch (error) {
//       console.error('Get ticket stats route error:', error);
//       return res.status(500).json({
//         success: false,
//         message: 'Internal server error',
//         error: 'SERVER_ERROR',
//       });
//     }
//   }
// );

// // GET /api/admin/support/tickets/:ticketId - Get ticket by ID
// router.get(
//   '/tickets/:ticketId',
//   authenticateAdmin,
//   requireAdminRole('super_admin', 'support_admin', 'billing_admin', 'viewer'),
//   async (req: Request, res: Response) => {
//     try {
//       const { ticketId } = req.params;

//       const result = await SupportService.getTicketById(ticketId);

//       if (!result.success) {
//         return res.status(404).json(result);
//       }

//       return res.status(200).json(result);
//     } catch (error) {
//       console.error('Get ticket route error:', error);
//       return res.status(500).json({
//         success: false,
//         message: 'Internal server error',
//         error: 'SERVER_ERROR',
//       });
//     }
//   }
// );

// // POST /api/admin/support/tickets/:ticketId/respond - Respond to ticket
// router.post(
//   '/tickets/:ticketId/respond',
//   authenticateAdmin,
//   requireAdminRole('super_admin', 'support_admin'),
//   async (req: Request, res: Response) => {
//     try {
//       const { ticketId } = req.params;
//       const { message, channel } = req.body;

//       if (!message || !channel) {
//         return res.status(400).json({
//           success: false,
//           message: 'message and channel are required',
//           error: 'MISSING_FIELDS',
//         });
//       }

//       const validChannels = ['email', 'whatsapp', 'sms'];
//       if (!validChannels.includes(channel)) {
//         return res.status(400).json({
//           success: false,
//           message: `channel must be one of: ${validChannels.join(', ')}`,
//           error: 'INVALID_CHANNEL',
//         });
//       }

//       const result = await SupportService.respondToTicket({
//         ticketId,
//         message,
//         channel,
//         adminId: req.admin!.id,
//         adminName: req.admin!.name,
//       });

//       if (!result.success) {
//         return res.status(400).json(result);
//       }

//       return res.status(200).json(result);
//     } catch (error) {
//       console.error('Respond to ticket route error:', error);
//       return res.status(500).json({
//         success: false,
//         message: 'Internal server error',
//         error: 'SERVER_ERROR',
//       });
//     }
//   }
// );

// // PUT /api/admin/support/tickets/:ticketId/status - Update ticket status
// router.put(
//   '/tickets/:ticketId/status',
//   authenticateAdmin,
//   requireAdminRole('super_admin', 'support_admin'),
//   async (req: Request, res: Response) => {
//     try {
//       const { ticketId } = req.params;
//       const { status } = req.body;

//       if (!status) {
//         return res.status(400).json({
//           success: false,
//           message: 'status is required',
//           error: 'MISSING_FIELDS',
//         });
//       }

//       const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
//       if (!validStatuses.includes(status)) {
//         return res.status(400).json({
//           success: false,
//           message: `status must be one of: ${validStatuses.join(', ')}`,
//           error: 'INVALID_STATUS',
//         });
//       }

//       const result = await SupportService.updateTicketStatus(
//         ticketId,
//         status,
//         req.admin!.id,
//         req.admin!.name
//       );

//       if (!result.success) {
//         return res.status(400).json(result);
//       }

//       return res.status(200).json(result);
//     } catch (error) {
//       console.error('Update ticket status route error:', error);
//       return res.status(500).json({
//         success: false,
//         message: 'Internal server error',
//         error: 'SERVER_ERROR',
//       });
//     }
//   }
// );

// // PUT /api/admin/support/tickets/:ticketId/assign - Assign ticket to admin
// router.put(
//   '/tickets/:ticketId/assign',
//   authenticateAdmin,
//   requireAdminRole('super_admin', 'support_admin'),
//   async (req: Request, res: Response) => {
//     try {
//       const { ticketId } = req.params;

//       const result = await SupportService.assignTicket(
//         ticketId,
//         req.admin!.id,
//         req.admin!.name
//       );

//       if (!result.success) {
//         return res.status(400).json(result);
//       }

//       return res.status(200).json(result);
//     } catch (error) {
//       console.error('Assign ticket route error:', error);
//       return res.status(500).json({
//         success: false,
//         message: 'Internal server error',
//         error: 'SERVER_ERROR',
//       });
//     }
//   }
// );

// export default router;


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