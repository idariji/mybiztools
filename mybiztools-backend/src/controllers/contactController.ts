import { Request, Response } from 'express';
import { ContactService } from '../services/contactService.js';
import { validatePagination } from '../utils/validation.js';

// ============================================================================
// CONTACT CONTROLLER
// ============================================================================

const parseTags = (tags: any): string[] | undefined => {
  if (!tags) return undefined;
  return Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim());
};

export class ContactController {
  /** POST /api/contacts */
  static async createContact(req: Request, res: Response): Promise<void> {
    const result = await ContactService.createContact({
      userId: req.user!.id,
      ...req.body,
      tags: parseTags(req.body.tags),
    });
    res.status(result.success ? 201 : 400).json(result);
  }

  /** GET /api/contacts */
  static async getContacts(req: Request, res: Response): Promise<void> {
    const { page, limit, type, search, isActive } = req.query;
    const pagination = validatePagination(page as string, limit as string);
    const result = await ContactService.getContacts(req.user!.id, {
      page: pagination.page,
      limit: pagination.limit,
      type: type as string,
      search: search as string,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    });
    res.status(result.success ? 200 : 400).json(result);
  }

  /** GET /api/contacts/stats */
  static async getContactStats(req: Request, res: Response): Promise<void> {
    const result = await ContactService.getContactStats(req.user!.id);
    res.status(result.success ? 200 : 400).json(result);
  }

  /** GET /api/contacts/:contactId */
  static async getContactById(req: Request, res: Response): Promise<void> {
    const result = await ContactService.getContactById(req.user!.id, req.params.contactId);
    res.status(result.success ? 200 : 404).json(result);
  }

  /** PUT /api/contacts/:contactId */
  static async updateContact(req: Request, res: Response): Promise<void> {
    const result = await ContactService.updateContact(req.user!.id, req.params.contactId, {
      ...req.body,
      tags: parseTags(req.body.tags),
    });
    res.status(result.success ? 200 : 400).json(result);
  }

  /** POST /api/contacts/:contactId/contacted */
  static async markContacted(req: Request, res: Response): Promise<void> {
    const result = await ContactService.markContacted(req.user!.id, req.params.contactId);
    res.status(result.success ? 200 : 400).json(result);
  }

  /** DELETE /api/contacts/:contactId */
  static async deleteContact(req: Request, res: Response): Promise<void> {
    const result = await ContactService.deleteContact(req.user!.id, req.params.contactId);
    res.status(result.success ? 200 : 400).json(result);
  }
}