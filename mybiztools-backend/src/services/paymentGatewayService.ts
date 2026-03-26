import crypto from 'node:crypto';
import prisma from '../lib/prisma.js';
import type { ServiceResponse } from '../types/index.js';

// ============================================================================
// PAYMENT GATEWAY SERVICE — Paystack
// ============================================================================

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY ?? '';
const PAYSTACK_BASE = 'https://api.paystack.co';

export const PLAN_PRICING = {
  starter: {
    monthly: 2000,
    yearly: 18000,
    features: [
      'Unlimited Invoices, Quotations, Receipts & Payslips',
      'Business Card & QR Code Generator',
      'Social Media Planner',
      'Cost Manager',
      'Budget Tracker',
      'Tax Calculator (PAYE, CIT, VAT, WHT)',
      'Email & WhatsApp document delivery',
      'Watermark on exports',
    ],
  },
  pro: {
    monthly: 4500,
    yearly: 45000,
    features: [
      'Everything in Starter',
      'DEDA AI Assistant',
      'Watermark-free exports',
      'Priority email support',
      'Advanced analytics & insights',
      'Custom business branding',
      'Bulk document generation',
    ],
  },
  enterprise: {
    monthly: 12000,
    yearly: 120000,
    features: [
      'Everything in Business Pro',
      'Team / multi-user access (up to 10 users)',
      'Dedicated account manager',
      'Custom integrations & API access',
      'SLA-backed uptime guarantee',
      'Onboarding & training sessions',
      'White-label / custom branding',
      'Quarterly business reviews',
    ],
  },
} as const;

// --------------------------------------------------------------------------
// Paystack API helpers
// --------------------------------------------------------------------------

async function paystackPost(path: string, body: object) {
  const res = await fetch(`${PAYSTACK_BASE}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function paystackGet(path: string) {
  const res = await fetch(`${PAYSTACK_BASE}${path}`, {
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
  });
  return res.json();
}

// --------------------------------------------------------------------------
// Service
// --------------------------------------------------------------------------

export class PaymentGatewayService {
  static getPlans(): ServiceResponse {
    return {
      success: true,
      message: 'Plans retrieved successfully',
      data: {
        plans: Object.entries(PLAN_PRICING).map(([name, config]) => ({
          name,
          monthlyPrice: config.monthly,
          yearlyPrice: config.yearly,
          yearlySavings: config.monthly * 12 - config.yearly,
          features: config.features,
        })),
        currency: 'NGN',
        gateway: 'paystack',
      },
    };
  }

  // -------------------------------------------------------------------------
  // Initialize — creates a Paystack transaction and returns the checkout URL
  // -------------------------------------------------------------------------

  static async initializePayment(input: {
    userId: string;
    email: string;
    plan: string;
    billingCycle: 'monthly' | 'yearly';
    callbackUrl?: string;
  }): Promise<ServiceResponse> {
    const { userId, email, plan, billingCycle, callbackUrl } = input;

    const planConfig = PLAN_PRICING[plan as keyof typeof PLAN_PRICING];
    if (!planConfig) {
      return { success: false, message: 'Invalid plan selected', error: 'INVALID_PLAN' };
    }

    const amountNGN = billingCycle === 'yearly' ? planConfig.yearly : planConfig.monthly;
    const amountKobo = amountNGN * 100;
    const reference = `MBT-${userId.slice(0, 8)}-${Date.now()}`;

    const paystackRes = await paystackPost('/transaction/initialize', {
      email,
      amount: amountKobo,
      reference,
      callback_url: callbackUrl,
      metadata: {
        userId,
        plan,
        billingCycle,
        custom_fields: [
          { display_name: 'Plan', variable_name: 'plan', value: plan },
          { display_name: 'Billing Cycle', variable_name: 'billing_cycle', value: billingCycle },
        ],
      },
    });

    if (!paystackRes.status) {
      return {
        success: false,
        message: paystackRes.message || 'Failed to initialize payment',
        error: 'PAYSTACK_ERROR',
      };
    }

    // Store a pending payment record so we have a local audit trail
    await prisma.payment.create({
      data: {
        userId,
        amount: BigInt(amountKobo),
        currency: 'NGN',
        status: 'pending',
        paystackReference: reference,
        plan,
        billingCycle,
      },
    });

    return {
      success: true,
      message: 'Payment initialized',
      data: {
        checkoutUrl: paystackRes.data.authorization_url,
        reference: paystackRes.data.reference,
        accessCode: paystackRes.data.access_code,
      },
    };
  }

  // -------------------------------------------------------------------------
  // Verify — called by the frontend after Paystack redirects back
  // Activates the subscription as a fallback if the webhook hasn't fired yet
  // -------------------------------------------------------------------------

  static async verifyPayment(input: {
    reference: string;
    userId: string;
  }): Promise<ServiceResponse> {
    const paystackRes = await paystackGet(
      `/transaction/verify/${encodeURIComponent(input.reference)}`,
    );

    if (!paystackRes.status) {
      return { success: false, message: 'Verification failed', error: 'VERIFICATION_FAILED' };
    }

    const txn = paystackRes.data;

    if (txn.status !== 'success') {
      return {
        success: false,
        message: `Payment status: ${txn.status}`,
        error: 'PAYMENT_NOT_SUCCESSFUL',
      };
    }

    // Confirm the payment belongs to this user
    const payment = await prisma.payment.findFirst({
      where: { paystackReference: input.reference, userId: input.userId },
    });

    if (!payment) {
      return { success: false, message: 'Payment record not found', error: 'PAYMENT_NOT_FOUND' };
    }

    // Activate subscription as a fallback — webhook may have already done this
    // activateSubscription is idempotent so calling it twice is safe
    const plan: string = txn.metadata?.plan ?? (payment as any).plan;
    const billingCycle: string = txn.metadata?.billingCycle ?? (payment as any).billingCycle;

    if (plan && billingCycle && (payment as any).status !== 'succeeded') {
      await PaymentGatewayService.activateSubscription(
        input.userId,
        plan,
        billingCycle,
        input.reference,
        txn.amount,
      );
    }

    return {
      success: true,
      message: 'Payment verified successfully',
      data: {
        status: txn.status,
        amount: txn.amount / 100,
        plan,
        billingCycle,
      },
    };
  }

  // -------------------------------------------------------------------------
  // Webhook — called by Paystack server when a payment is confirmed
  // rawBody is the unparsed request body (needed for signature verification)
  // -------------------------------------------------------------------------

  static async handleWebhook(rawBody: string, signature: string): Promise<ServiceResponse> {
    // 1. Verify the request actually came from Paystack
    const hash = crypto
      .createHmac('sha512', PAYSTACK_SECRET)
      .update(rawBody)
      .digest('hex');

    if (hash !== signature) {
      console.warn('[Webhook] Invalid Paystack signature');
      return { success: false, message: 'Invalid webhook signature', error: 'INVALID_SIGNATURE' };
    }

    const payload = JSON.parse(rawBody);

    // 2. Only process successful charges
    if (payload.event !== 'charge.success') {
      return { success: true, message: `Event ${payload.event} acknowledged` };
    }

    const { reference, amount, metadata } = payload.data;
    const userId: string = metadata?.userId;
    const plan: string = metadata?.plan;
    const billingCycle: string = metadata?.billingCycle;

    if (!userId || !plan || !billingCycle) {
      console.error('[Webhook] Missing metadata fields:', { userId, plan, billingCycle });
      return { success: false, message: 'Missing metadata in webhook', error: 'MISSING_METADATA' };
    }

    // 3. Verify with Paystack directly (defense in depth — never trust the payload alone)
    const verifyRes = await paystackGet(
      `/transaction/verify/${encodeURIComponent(reference)}`,
    );
    if (!verifyRes.status || verifyRes.data.status !== 'success') {
      return {
        success: false,
        message: 'Payment could not be verified with Paystack',
        error: 'VERIFICATION_FAILED',
      };
    }

    // 4. Idempotency — don't activate twice for the same reference
    const existing = await prisma.payment.findFirst({
      where: { paystackReference: reference, status: 'succeeded' },
    });
    if (existing) {
      return { success: true, message: 'Payment already processed' };
    }

    // 5. Activate the subscription
    await PaymentGatewayService.activateSubscription(userId, plan, billingCycle, reference, amount);

    console.log(`[Webhook] Subscription activated — user: ${userId}, plan: ${plan} (${billingCycle})`);
    return { success: true, message: 'Subscription activated successfully' };
  }

  // -------------------------------------------------------------------------
  // Private — activate subscription atomically
  // -------------------------------------------------------------------------

  private static async activateSubscription(
    userId: string,
    plan: string,
    billingCycle: string,
    reference: string,
    amountKobo: number,
  ): Promise<void> {
    const planConfig = PLAN_PRICING[plan as keyof typeof PLAN_PRICING];
    if (!planConfig) throw new Error(`Unknown plan: ${plan}`);

    const now = new Date();
    const periodEnd =
      billingCycle === 'yearly'
        ? new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
        : new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

    const mrrValue =
      billingCycle === 'yearly'
        ? BigInt(Math.round((planConfig.yearly / 12) * 100))
        : BigInt(planConfig.monthly * 100);

    await prisma.$transaction([
      // Mark payment as succeeded
      prisma.payment.updateMany({
        where: { paystackReference: reference },
        data: {
          status: 'succeeded',
          billingPeriodStart: now,
          billingPeriodEnd: periodEnd,
        },
      }),

      // Update user plan
      prisma.user.update({
        where: { id: userId },
        data: { currentPlan: plan, subscriptionStatus: 'active' },
      }),

      // Upsert subscription record
      prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          planName: plan,
          status: 'active',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          mrrValue,
          annualValue: BigInt(planConfig.yearly * 100),
          autoRenew: true,
        },
        update: {
          planName: plan,
          status: 'active',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          mrrValue,
          annualValue: BigInt(planConfig.yearly * 100),
        },
      }),
    ]);
  }
}

export default PaymentGatewayService;
