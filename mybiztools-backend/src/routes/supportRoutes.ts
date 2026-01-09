/**
 * Support Ticket Routes
 * Admin endpoints for managing customer support tickets
 */

import { Router, Request, Response } from 'express';
import { SupportService } from '../services/supportService.js';
import { authenticateAdmin, requireAdminRole } from '../middleware/authMiddleware.js';
import { validatePagination } from '../utils/validation.js';

const router = Router();

// ============ ADMIN SUPPORT TICKET ROUTES ============

// GET /api/admin/support/tickets - Get all tickets with filters
router.get(
  '/tickets',
  authenticateAdmin,
  requireAdminRole('super_admin', 'support_admin', 'billing_admin', 'viewer'),
  async (req: Request, res: Response) => {
    try {
      const { page, limit, status, priority, channel, assignedTo, search } = req.query;

      const pagination = validatePagination(page as string, limit as string);
      const result = await SupportService.getTickets({
        page: pagination.page,
        limit: pagination.limit,
        status: status as string,
        priority: priority as string,
        channel: channel as string,
        assignedTo: assignedTo as string,
        search: search as string,
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Get tickets route error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'SERVER_ERROR',
      });
    }
  }
);

// GET /api/admin/support/tickets/stats - Get ticket statistics
router.get(
  '/tickets/stats',
  authenticateAdmin,
  requireAdminRole('super_admin', 'support_admin', 'billing_admin', 'viewer'),
  async (req: Request, res: Response) => {
    try {
      const result = await SupportService.getTicketStats();

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Get ticket stats route error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'SERVER_ERROR',
      });
    }
  }
);

// GET /api/admin/support/tickets/:ticketId - Get ticket by ID
router.get(
  '/tickets/:ticketId',
  authenticateAdmin,
  requireAdminRole('super_admin', 'support_admin', 'billing_admin', 'viewer'),
  async (req: Request, res: Response) => {
    try {
      const { ticketId } = req.params;

      const result = await SupportService.getTicketById(ticketId);

      if (!result.success) {
        return res.status(404).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Get ticket route error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'SERVER_ERROR',
      });
    }
  }
);

// POST /api/admin/support/tickets/:ticketId/respond - Respond to ticket
router.post(
  '/tickets/:ticketId/respond',
  authenticateAdmin,
  requireAdminRole('super_admin', 'support_admin'),
  async (req: Request, res: Response) => {
    try {
      const { ticketId } = req.params;
      const { message, channel } = req.body;

      if (!message || !channel) {
        return res.status(400).json({
          success: false,
          message: 'message and channel are required',
          error: 'MISSING_FIELDS',
        });
      }

      const validChannels = ['email', 'whatsapp', 'sms'];
      if (!validChannels.includes(channel)) {
        return res.status(400).json({
          success: false,
          message: `channel must be one of: ${validChannels.join(', ')}`,
          error: 'INVALID_CHANNEL',
        });
      }

      const result = await SupportService.respondToTicket({
        ticketId,
        message,
        channel,
        adminId: req.admin!.id,
        adminName: req.admin!.name,
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Respond to ticket route error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'SERVER_ERROR',
      });
    }
  }
);

// PUT /api/admin/support/tickets/:ticketId/status - Update ticket status
router.put(
  '/tickets/:ticketId/status',
  authenticateAdmin,
  requireAdminRole('super_admin', 'support_admin'),
  async (req: Request, res: Response) => {
    try {
      const { ticketId } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'status is required',
          error: 'MISSING_FIELDS',
        });
      }

      const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `status must be one of: ${validStatuses.join(', ')}`,
          error: 'INVALID_STATUS',
        });
      }

      const result = await SupportService.updateTicketStatus(
        ticketId,
        status,
        req.admin!.id,
        req.admin!.name
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Update ticket status route error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'SERVER_ERROR',
      });
    }
  }
);

// PUT /api/admin/support/tickets/:ticketId/assign - Assign ticket to admin
router.put(
  '/tickets/:ticketId/assign',
  authenticateAdmin,
  requireAdminRole('super_admin', 'support_admin'),
  async (req: Request, res: Response) => {
    try {
      const { ticketId } = req.params;

      const result = await SupportService.assignTicket(
        ticketId,
        req.admin!.id,
        req.admin!.name
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Assign ticket route error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'SERVER_ERROR',
      });
    }
  }
);

export default router;
