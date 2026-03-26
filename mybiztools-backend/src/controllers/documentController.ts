import { Request, Response } from 'express';
import { DocumentService } from '../services/documentService.js';
import { validatePagination } from '../utils/validation.js';

// ============================================================================
// DOCUMENT CONTROLLER
// ============================================================================

const parseTags = (tags: any): string[] | undefined => {
  if (!tags) return undefined;
  return Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim());
};

export class DocumentController {
  /** POST /api/documents/upload */
  static async uploadDocument(req: Request, res: Response): Promise<void> {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file provided', error: 'NO_FILE' });
      return;
    }

    const { name, category, tags, description } = req.body;
    const result = await DocumentService.uploadDocument({
      userId: req.user!.id,
      name: name || req.file.originalname,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      buffer: req.file.buffer,
      category,
      tags: parseTags(tags) ?? [],
      description,
    });
    res.status(result.success ? 201 : 400).json(result);
  }

  /** GET /api/documents */
  static async getDocuments(req: Request, res: Response): Promise<void> {
    const { page, limit, category, search } = req.query;
    const pagination = validatePagination(page as string, limit as string);
    const result = await DocumentService.getDocuments(req.user!.id, {
      page: pagination.page,
      limit: pagination.limit,
      category: category as string,
      search: search as string,
    });
    res.status(result.success ? 200 : 400).json(result);
  }

  /** GET /api/documents/usage */
  static async getStorageUsage(req: Request, res: Response): Promise<void> {
    const result = await DocumentService.getStorageUsage(req.user!.id);
    res.status(result.success ? 200 : 400).json(result);
  }

  /** GET /api/documents/:documentId */
  static async getDocumentById(req: Request, res: Response): Promise<void> {
    const result = await DocumentService.getDocumentById(req.user!.id, req.params.documentId);
    res.status(result.success ? 200 : 404).json(result);
  }

  /** GET /api/documents/:documentId/download */
  static async downloadDocument(req: Request, res: Response): Promise<void> {
    const result = await DocumentService.downloadDocument(req.user!.id, req.params.documentId);

    if (!result.success || !result.data) {
      res.status(404).json(result);
      return;
    }

    // Cloudinary: redirect to signed URL
    if (result.data.redirectUrl) {
      res.redirect(302, result.data.redirectUrl);
      return;
    }

    // Local: stream buffer
    res.setHeader('Content-Type', result.data.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.data.filename}"`);
    res.send(result.data.buffer);
  }

  /** PUT /api/documents/:documentId */
  static async updateDocument(req: Request, res: Response): Promise<void> {
    const { name, category, tags, description } = req.body;
    const result = await DocumentService.updateDocument(req.user!.id, req.params.documentId, {
      name,
      category,
      tags: parseTags(tags),
      description,
    });
    res.status(result.success ? 200 : 400).json(result);
  }

  /** DELETE /api/documents/:documentId */
  static async deleteDocument(req: Request, res: Response): Promise<void> {
    const result = await DocumentService.deleteDocument(req.user!.id, req.params.documentId);
    res.status(result.success ? 200 : 400).json(result);
  }
}