import { Router, Response } from 'express';
import { SocialService } from '../services/socialService.js';
import { authenticateUser, AuthenticatedRequest } from '../middleware/authMiddleware.js';

const router = Router();

// All routes require authentication
router.use(authenticateUser);

// POST /api/social/posts
router.post('/posts', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { content, mediaUrls, platforms, scheduledAt } = req.body;

    if (!content || !platforms || platforms.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Content and at least one platform are required',
        error: 'MISSING_FIELDS',
      });
    }

    const result = await SocialService.createPost({
      userId: req.user!.id,
      content,
      mediaUrls,
      platforms,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error('Create post route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

// GET /api/social/posts
router.get('/posts', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page, limit, status, platform } = req.query;

    const result = await SocialService.getPosts(req.user!.id, {
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
      status: status as string,
      platform: platform as string,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Get posts route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

// GET /api/social/posts/scheduled
router.get('/posts/scheduled', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const now = new Date();
    const start = startDate ? new Date(startDate as string) : now;
    const end = endDate
      ? new Date(endDate as string)
      : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const result = await SocialService.getScheduledPosts(req.user!.id, start, end);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Get scheduled posts route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

// GET /api/social/analytics
router.get('/analytics', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await SocialService.getAnalytics(req.user!.id);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Get analytics route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

// GET /api/social/posts/:postId
router.get('/posts/:postId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { postId } = req.params;

    const result = await SocialService.getPostById(req.user!.id, postId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Get post route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

// PUT /api/social/posts/:postId
router.put('/posts/:postId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { postId } = req.params;
    const { content, mediaUrls, platforms, scheduledAt } = req.body;

    const result = await SocialService.updatePost(req.user!.id, postId, {
      content,
      mediaUrls,
      platforms,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Update post route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

// DELETE /api/social/posts/:postId
router.delete('/posts/:postId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { postId } = req.params;

    const result = await SocialService.deletePost(req.user!.id, postId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Delete post route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

export default router;
