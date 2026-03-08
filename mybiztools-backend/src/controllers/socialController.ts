import { Request, Response } from 'express';
import { SocialService } from '../services/socialService.js';
import { validatePagination } from '../utils/validation.js';

// ============================================================================
// SOCIAL CONTROLLER
// ============================================================================

export class SocialController {
  /** POST /api/social/posts */
  static async createPost(req: Request, res: Response): Promise<void> {
    const { content, mediaUrls, platforms, scheduledAt } = req.body;
    const result = await SocialService.createPost({
      userId: req.user!.id,
      content,
      mediaUrls,
      platforms,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
    });
    res.status(result.success ? 201 : 400).json(result);
  }

  /** GET /api/social/posts */
  static async getPosts(req: Request, res: Response): Promise<void> {
    const { page, limit, status, platform } = req.query;
    const pagination = validatePagination(page as string, limit as string);
    const result = await SocialService.getPosts(req.user!.id, {
      page: pagination.page,
      limit: pagination.limit,
      status: status as string,
      platform: platform as string,
    });
    res.status(result.success ? 200 : 400).json(result);
  }

  /** GET /api/social/posts/scheduled */
  static async getScheduledPosts(req: Request, res: Response): Promise<void> {
    const { startDate, endDate } = req.query;
    const now = new Date();
    const start = startDate ? new Date(startDate as string) : now;
    const end = endDate
      ? new Date(endDate as string)
      : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const result = await SocialService.getScheduledPosts(req.user!.id, start, end);
    res.status(result.success ? 200 : 400).json(result);
  }

  /** GET /api/social/analytics */
  static async getAnalytics(req: Request, res: Response): Promise<void> {
    const result = await SocialService.getAnalytics(req.user!.id);
    res.status(result.success ? 200 : 400).json(result);
  }

  /** GET /api/social/posts/:postId */
  static async getPostById(req: Request, res: Response): Promise<void> {
    const result = await SocialService.getPostById(req.user!.id, req.params.postId);
    res.status(result.success ? 200 : 404).json(result);
  }

  /** PUT /api/social/posts/:postId */
  static async updatePost(req: Request, res: Response): Promise<void> {
    const { content, mediaUrls, platforms, scheduledAt } = req.body;
    const result = await SocialService.updatePost(req.user!.id, req.params.postId, {
      content,
      mediaUrls,
      platforms,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
    });
    res.status(result.success ? 200 : 400).json(result);
  }

  /** DELETE /api/social/posts/:postId */
  static async deletePost(req: Request, res: Response): Promise<void> {
    const result = await SocialService.deletePost(req.user!.id, req.params.postId);
    res.status(result.success ? 200 : 400).json(result);
  }
}