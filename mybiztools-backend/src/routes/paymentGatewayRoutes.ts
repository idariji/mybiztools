import { Router, Request, Response } from 'express';
import { PaymentGatewayService } from '../services/paymentGatewayService.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

// ============================================================================
// PAYMENT GATEWAY ROUTES
// ============================================================================

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment gateway and plan management
 */

/** GET /api/payments/plans — Public */
router.get('/plans', (_req: Request, res: Response) => {
  const result = PaymentGatewayService.getPlans();
  res.status(200).json(result);
});

/** POST /api/payments/initialize */
router.post('/initialize', authenticateUser, async (req: Request, res: Response) => {
  const { plan, billingCycle, callbackUrl } = req.body;

  if (!plan || !billingCycle) {
    res.status(400).json({ success: false, message: 'Plan and billing cycle are required', error: 'MISSING_FIELDS' });
    return;
  }

  if (!['monthly', 'yearly'].includes(billingCycle)) {
    res.status(400).json({ success: false, message: 'Billing cycle must be monthly or yearly', error: 'INVALID_BILLING_CYCLE' });
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

/** POST /api/payments/verify */
router.post('/verify', authenticateUser, async (req: Request, res: Response) => {
  const { reference } = req.body;

  if (!reference) {
    res.status(400).json({ success: false, message: 'Payment reference is required', error: 'MISSING_REFERENCE' });
    return;
  }

  const result = await PaymentGatewayService.verifyPayment({
    reference,
    userId: req.user!.id,
  });

  res.status(result.success ? 200 : 400).json(result);
});

/** POST /api/payments/confirm */
router.post('/confirm', authenticateUser, async (req: Request, res: Response) => {
  const { reference, plan, billingCycle } = req.body;

  if (!reference || !plan || !billingCycle) {
    res.status(400).json({ success: false, message: 'Reference, plan, and billing cycle are required', error: 'MISSING_FIELDS' });
    return;
  }

  const result = await PaymentGatewayService.processSuccessfulPayment(reference, plan, billingCycle);
  res.status(result.success ? 200 : 400).json(result);
});

/** POST /api/payments/webhook/monnify — Public webhook */
router.post('/webhook/monnify', async (req: Request, res: Response) => {
  const result = await PaymentGatewayService.handleWebhook(req.body);
  res.status(200).json(result);
});

export default router;