import { Request, Response } from 'express';
import { SupportService } from '../services/supportService.js';
import { validatePagination } from '../utils/validation.js';

// ============================================================================
// SUPPORT CONTROLLER (Admin only)
// ============================================================================

export class SupportController {
  /** GET /api/admin/support/tickets */
  static async getTickets(req: Request, res: Response): Promise<void> {
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
    res.status(result.success ? 200 : 400).json(result);
  }

  /** GET /api/admin/support/tickets/stats */
  static async getTicketStats(_req: Request, res: Response): Promise<void> {
    const result = await SupportService.getTicketStats();
    res.status(result.success ? 200 : 400).json(result);
  }

  /** GET /api/admin/support/tickets/:ticketId */
  static async getTicketById(req: Request, res: Response): Promise<void> {
    const result = await SupportService.getTicketById(req.params.ticketId);
    res.status(result.success ? 200 : 404).json(result);
  }

  /** POST /api/admin/support/tickets/:ticketId/respond */
  static async respondToTicket(req: Request, res: Response): Promise<void> {
    const result = await SupportService.respondToTicket({
      ticketId: req.params.ticketId,
      message: req.body.message,
      channel: req.body.channel,
      adminId: req.admin!.id,
      adminName: req.admin!.name,
    });
    res.status(result.success ? 200 : 400).json(result);
  }

  /** PUT /api/admin/support/tickets/:ticketId/status */
  static async updateTicketStatus(req: Request, res: Response): Promise<void> {
    const result = await SupportService.updateTicketStatus(
      req.params.ticketId,
      req.body.status,
      req.admin!.id,
      req.admin!.name
    );
    res.status(result.success ? 200 : 400).json(result);
  }

  /** PUT /api/admin/support/tickets/:ticketId/assign */
  static async assignTicket(req: Request, res: Response): Promise<void> {
    const result = await SupportService.assignTicket(
      req.params.ticketId,
      req.admin!.id,
      req.admin!.name
    );
    res.status(result.success ? 200 : 400).json(result);
  }
}