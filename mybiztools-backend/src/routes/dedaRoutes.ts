import { Router } from 'express';
import { DedaController } from '../controllers/dedaController.js';
import { authenticateUser, requirePlan } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { chatSchema, feedbackSchema } from '../validators/dedaValidator.js';

// ============================================================================
// DEDA ROUTES
// ============================================================================

const router = Router();

// All DEDA routes require authentication
router.use(authenticateUser);
router.use(requirePlan('pro', 'enterprise'));

/**
 * @swagger
 * tags:
 *   name: DEDA
 *   description: DEDA AI chat assistant powered by Claude
 */

/**
 * @swagger
 * /api/deda/chat:
 *   post:
 *     summary: Send a message to DEDA
 *     tags: [DEDA]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message:
 *                 type: string
 *                 maxLength: 5000
 *               conversationId:
 *                 type: string
 *                 format: uuid
 *               context:
 *                 type: string
 *                 description: Optional business context passed to AI
 *                 maxLength: 2000
 *     responses:
 *       200:
 *         description: AI response generated
 *       429:
 *         description: Daily message limit reached
 */
router.post('/chat', validate(chatSchema), DedaController.chat);

/**
 * @swagger
 * /api/deda/usage:
 *   get:
 *     summary: Get current plan usage stats
 *     tags: [DEDA]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Usage stats retrieved
 */
// NOTE: /usage must be before /conversations to avoid route collision
router.get('/usage', DedaController.getUsageStats);

/**
 * @swagger
 * /api/deda/conversations:
 *   get:
 *     summary: Get user's conversations
 *     tags: [DEDA]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Conversations retrieved
 */
router.get('/conversations', DedaController.getConversations);

/**
 * @swagger
 * /api/deda/conversations/{conversationId}:
 *   get:
 *     summary: Get messages in a conversation
 *     tags: [DEDA]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Messages retrieved
 *       404:
 *         description: Conversation not found
 */
router.get('/conversations/:conversationId', DedaController.getConversationMessages);

/**
 * @swagger
 * /api/deda/conversations/{conversationId}/archive:
 *   put:
 *     summary: Archive a conversation
 *     tags: [DEDA]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Conversation archived
 */
router.put('/conversations/:conversationId/archive', DedaController.archiveConversation);

/**
 * @swagger
 * /api/deda/conversations/{conversationId}:
 *   delete:
 *     summary: Delete a conversation
 *     tags: [DEDA]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Conversation deleted
 */
router.delete('/conversations/:conversationId', DedaController.deleteConversation);

/**
 * @swagger
 * /api/deda/messages/{messageId}/feedback:
 *   post:
 *     summary: Submit feedback on an AI message
 *     tags: [DEDA]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [feedback]
 *             properties:
 *               feedback:
 *                 type: string
 *                 enum: [helpful, not_helpful]
 *     responses:
 *       200:
 *         description: Feedback recorded
 */
router.post('/messages/:messageId/feedback', validate(feedbackSchema), DedaController.provideFeedback);

export default router;