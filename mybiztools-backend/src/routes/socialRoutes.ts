import { Router } from 'express';
import { SocialController } from '../controllers/socialController.js';
import { authenticateUser, requirePlan } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { createPostSchema, updatePostSchema } from '../validators/socialValidator.js';

// ============================================================================
// SOCIAL MEDIA ROUTES
// All routes require authentication
// ============================================================================

const router = Router();

router.use(authenticateUser);
router.use(requirePlan('starter', 'pro', 'enterprise'));

/**
 * @swagger
 * tags:
 *   name: Social
 *   description: Social media post planning and scheduling
 */

/**
 * @swagger
 * /api/social/posts:
 *   post:
 *     summary: Create a new social media post
 *     tags: [Social]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content, platforms]
 *             properties:
 *               content:
 *                 type: string
 *               platforms:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [twitter, facebook, instagram, linkedin, tiktok]
 *               mediaUrls:
 *                 type: array
 *                 items:
 *                   type: string
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Post created successfully
 *       400:
 *         description: Validation error
 */
router.post('/posts', validate(createPostSchema), SocialController.createPost);

/**
 * @swagger
 * /api/social/posts:
 *   get:
 *     summary: Get all posts for current user
 *     tags: [Social]
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
 *         schema:
 *           type: string
 *           enum: [draft, scheduled, published, failed]
 *       - in: query
 *         name: platform
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Posts retrieved successfully
 */
router.get('/posts', SocialController.getPosts);

// NOTE: /posts/scheduled and /analytics must be before /posts/:postId
/**
 * @swagger
 * /api/social/posts/scheduled:
 *   get:
 *     summary: Get scheduled posts for a date range
 *     tags: [Social]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Scheduled posts retrieved successfully
 */
router.get('/posts/scheduled', SocialController.getScheduledPosts);

/**
 * @swagger
 * /api/social/analytics:
 *   get:
 *     summary: Get social media analytics
 *     tags: [Social]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
 */
router.get('/analytics', SocialController.getAnalytics);

/**
 * @swagger
 * /api/social/posts/{postId}:
 *   get:
 *     summary: Get post by ID
 *     tags: [Social]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Post retrieved successfully
 *       404:
 *         description: Post not found
 */
router.get('/posts/:postId', SocialController.getPostById);

/**
 * @swagger
 * /api/social/posts/{postId}:
 *   put:
 *     summary: Update a post
 *     tags: [Social]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       400:
 *         description: Cannot edit published post
 */
router.put('/posts/:postId', validate(updatePostSchema), SocialController.updatePost);

/**
 * @swagger
 * /api/social/posts/{postId}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Social]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Post deleted successfully
 */
router.delete('/posts/:postId', SocialController.deletePost);

export default router;