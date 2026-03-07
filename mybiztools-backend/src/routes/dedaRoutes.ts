import { Router, Response } from 'express';
import { DedaService } from '../services/dedaService.js';
import { authenticateUser, requirePlan, AuthenticatedRequest } from '../middleware/authMiddleware.js';

const router = Router();

// All routes require authentication + Business Pro or Enterprise plan
router.use(authenticateUser);
router.use(requirePlan('pro', 'enterprise'));

// POST /api/deda/chat - Send a message to DEDA
router.post('/chat', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { message, conversationId, context } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
        error: 'MISSING_MESSAGE',
      });
    }

    if (message.length > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Message too long. Maximum 5000 characters.',
        error: 'MESSAGE_TOO_LONG',
      });
    }

    const result = await DedaService.chat({
      userId: req.user!.id,
      conversationId,
      message: message.trim(),
      context,
    });

    if (!result.success) {
      const statusCode = result.error === 'DAILY_LIMIT_REACHED' ? 429 : 400;
      return res.status(statusCode).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('DEDA chat route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

// GET /api/deda/conversations - Get user's conversations
router.get('/conversations', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page, limit } = req.query;

    const result = await DedaService.getConversations(
      req.user!.id,
      page ? parseInt(page as string) : 1,
      limit ? parseInt(limit as string) : 20
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Get conversations route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

// GET /api/deda/conversations/:conversationId - Get conversation messages
router.get('/conversations/:conversationId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { page, limit } = req.query;

    const result = await DedaService.getConversationMessages(
      req.user!.id,
      conversationId,
      page ? parseInt(page as string) : 1,
      limit ? parseInt(limit as string) : 50
    );

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Get conversation messages route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

// PUT /api/deda/conversations/:conversationId/archive - Archive a conversation
router.put('/conversations/:conversationId/archive', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { conversationId } = req.params;

    const result = await DedaService.archiveConversation(req.user!.id, conversationId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Archive conversation route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

// DELETE /api/deda/conversations/:conversationId - Delete a conversation
router.delete('/conversations/:conversationId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { conversationId } = req.params;

    const result = await DedaService.deleteConversation(req.user!.id, conversationId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Delete conversation route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

// POST /api/deda/messages/:messageId/feedback - Provide feedback on a message
router.post('/messages/:messageId/feedback', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { messageId } = req.params;
    const { feedback } = req.body;

    if (!feedback || !['helpful', 'not_helpful'].includes(feedback)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid feedback. Must be "helpful" or "not_helpful"',
        error: 'INVALID_FEEDBACK',
      });
    }

    const result = await DedaService.provideFeedback(req.user!.id, messageId, feedback);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Provide feedback route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

// GET /api/deda/usage - Get usage stats
router.get('/usage', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await DedaService.getUsageStats(req.user!.id);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Get usage stats route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

export default router;
