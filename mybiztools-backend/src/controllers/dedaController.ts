import { Request, Response } from 'express';
import { DedaService } from '../services/dedaService.js';
import { validatePagination } from '../utils/validation.js';

// ============================================================================
// DEDA CONTROLLER
// ============================================================================

export class DedaController {
  /** POST /api/deda/chat */
  static async chat(req: Request, res: Response): Promise<void> {
    const result = await DedaService.chat({
      userId:         req.user!.id,
      message:        req.body.message.trim(),
      conversationId: req.body.conversationId,
      context:        req.body.context,
    });
    const status = result.error === 'DAILY_LIMIT_REACHED' ? 429 : result.success ? 200 : 400;
    res.status(status).json(result);
  }

  /** GET /api/deda/conversations */
  static async getConversations(req: Request, res: Response): Promise<void> {
    const { page, limit } = validatePagination(
      req.query.page as string,
      req.query.limit as string
    );
    const result = await DedaService.getConversations(req.user!.id, page, limit);
    res.status(result.success ? 200 : 400).json(result);
  }

  /** GET /api/deda/conversations/:conversationId */
  static async getConversationMessages(req: Request, res: Response): Promise<void> {
    const { page, limit } = validatePagination(
      req.query.page as string,
      req.query.limit as string,
      50
    );
    const result = await DedaService.getConversationMessages(
      req.user!.id,
      req.params.conversationId,
      page,
      limit
    );
    res.status(result.success ? 200 : 404).json(result);
  }

  /** PUT /api/deda/conversations/:conversationId/archive */
  static async archiveConversation(req: Request, res: Response): Promise<void> {
    const result = await DedaService.archiveConversation(
      req.user!.id,
      req.params.conversationId
    );
    res.status(result.success ? 200 : 400).json(result);
  }

  /** DELETE /api/deda/conversations/:conversationId */
  static async deleteConversation(req: Request, res: Response): Promise<void> {
    const result = await DedaService.deleteConversation(
      req.user!.id,
      req.params.conversationId
    );
    res.status(result.success ? 200 : 400).json(result);
  }

  /** POST /api/deda/messages/:messageId/feedback */
  static async provideFeedback(req: Request, res: Response): Promise<void> {
    const result = await DedaService.provideFeedback(
      req.user!.id,
      req.params.messageId,
      req.body.feedback
    );
    res.status(result.success ? 200 : 400).json(result);
  }

  /** GET /api/deda/usage */
  static async getUsageStats(req: Request, res: Response): Promise<void> {
    const result = await DedaService.getUsageStats(req.user!.id);
    res.status(result.success ? 200 : 400).json(result);
  }
}