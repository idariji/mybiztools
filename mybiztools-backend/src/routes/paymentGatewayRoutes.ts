import { Router, Request, Response } from 'express';
import { PaymentGatewayService } from '../services/paymentGatewayService.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

// ============================================================================
// PAYMENT GATEWAY ROUTES — Paystack
// ============================================================================

const router = Router();

/** GET /api/payments/plans — Public */
router.get('/plans', (_req: Request, res: Response) => {
  const result = PaymentGatewayService.getPlans();
  res.status(200).json(result);
});

/** POST /api/payments/initialize — Creates a Paystack transaction, returns checkout URL */
router.post('/initialize', authenticateUser, async (req: Request, res: Response) => {
  const { plan, billingCycle, callbackUrl } = req.body;

  if (!plan || !billingCycle) {
    res.status(400).json({
      success: false,
      message: 'Plan and billing cycle are required',
      error: 'MISSING_FIELDS',
    });
    return;
  }

  if (!['monthly', 'yearly'].includes(billingCycle)) {
    res.status(400).json({
      success: false,
      message: 'Billing cycle must be monthly or yearly',
      error: 'INVALID_BILLING_CYCLE',
    });
    return;
  }

  const result = await PaymentGatewayService.initializePayment({
    userId: req.user!.id,
    email: req.user!.email,
    plan,
    billingCycle,
    callbackUrl,
  });

  res.status(result.success ? 200 : 400).json(result);
});

/** POST /api/payments/verify — Frontend calls this after Paystack redirects back */
router.post('/verify', authenticateUser, async (req: Request, res: Response) => {
  const { reference } = req.body;

  if (!reference) {
    res.status(400).json({
      success: false,
      message: 'Payment reference is required',
      error: 'MISSING_REFERENCE',
    });
    return;
  }

  const result = await PaymentGatewayService.verifyPayment({
    reference,
    userId: req.user!.id,
  });

  res.status(result.success ? 200 : 400).json(result);
});

/**
 * POST /api/payments/webhook/paystack — Paystack server-to-server notification
 *
 * NOTE: This route must NOT be authenticated (Paystack calls it, not the user).
 *       Signature verification is done inside handleWebhook using the raw body.
 *       We always respond 200 so Paystack does not retry.
 */
router.post('/webhook/paystack', async (req: Request, res: Response) => {
  const signature = req.headers['x-paystack-signature'] as string ?? '';
  const rawBody = ((req as any).rawBody as Buffer)?.toString('utf8') ?? '';

  // Respond immediately — Paystack expects 200 within 5 seconds
  res.status(200).json({ received: true });

  // Process asynchronously so the response is not held up
  PaymentGatewayService.handleWebhook(rawBody, signature).catch((err) =>
    console.error('[Webhook] Unhandled error:', err),
  );
});

export default router;
