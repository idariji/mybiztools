import { Router, Request, Response } from 'express';
import { PaymentGatewayService } from '../services/paymentGatewayService.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = Router();

// GET /api/payments/plans - Public endpoint for plan information
router.get('/plans', (req: Request, res: Response) => {
  try {
    const result = PaymentGatewayService.getPlans();
    return res.status(200).json(result);
  } catch (error) {
    console.error('Get plans route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

// POST /api/payments/initialize - Initialize payment (requires auth)
router.post('/initialize', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { plan, billingCycle, callbackUrl } = req.body;

    if (!plan || !billingCycle) {
      return res.status(400).json({
        success: false,
        message: 'Plan and billing cycle are required',
        error: 'MISSING_FIELDS',
      });
    }

    if (!['monthly', 'yearly'].includes(billingCycle)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid billing cycle. Must be monthly or yearly',
        error: 'INVALID_BILLING_CYCLE',
      });
    }

    const result = await PaymentGatewayService.initializePayment({
      userId: req.user!.id,
      email: req.user!.email,
      plan,
      billingCycle,
      callbackUrl,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Initialize payment route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

// POST /api/payments/verify - Verify payment after callback
router.post('/verify', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({
        success: false,
        message: 'Payment reference is required',
        error: 'MISSING_REFERENCE',
      });
    }

    const result = await PaymentGatewayService.verifyPayment({
      reference,
      userId: req.user!.id,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Verify payment route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

// POST /api/payments/confirm - Manually confirm a payment (for testing/admin)
router.post('/confirm', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { reference, plan, billingCycle } = req.body;

    if (!reference || !plan || !billingCycle) {
      return res.status(400).json({
        success: false,
        message: 'Reference, plan, and billing cycle are required',
        error: 'MISSING_FIELDS',
      });
    }

    const result = await PaymentGatewayService.processSuccessfulPayment(
      reference,
      plan,
      billingCycle
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Confirm payment route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'SERVER_ERROR',
    });
  }
});

// POST /api/payments/webhook/monipoint - Monipoint webhook
router.post('/webhook/monipoint', async (req: Request, res: Response) => {
  try {
    const result = await PaymentGatewayService.handleWebhook(req.body);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Monipoint webhook route error:', error);
    return res.status(200).json({ success: false, message: 'Webhook processing error' });
  }
});

export default router;
