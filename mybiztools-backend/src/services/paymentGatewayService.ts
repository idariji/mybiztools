/**
 * Payment Gateway Service
 * Monnify Payment Integration
 * API Docs: https://docs.monnify.com/
 */

import prisma from '../lib/prisma.js';

// Monnify Configuration
const MONNIFY_API_KEY = process.env.MONNIFY_API_KEY || '';
const MONNIFY_SECRET_KEY = process.env.MONNIFY_SECRET_KEY || '';
const MONNIFY_CONTRACT_CODE = process.env.MONNIFY_CONTRACT_CODE || '';
const MONNIFY_BASE_URL = process.env.MONNIFY_BASE_URL || 'https://api.monnify.com';

// Plan pricing in Naira
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
};

export interface InitializePaymentInput {
  userId: string;
  email: string;
  plan: string;
  billingCycle: 'monthly' | 'yearly';
  callbackUrl?: string;
}

export interface PaymentVerificationInput {
  reference: string;
  userId: string;
}

export class PaymentGatewayService {
  /**
   * Get Monnify access token
   */
  private static async getAccessToken() {
    try {
      if (!MONNIFY_API_KEY || !MONNIFY_SECRET_KEY) {
        throw new Error('Monnify API credentials not configured');
      }

      const auth = Buffer.from(`${MONNIFY_API_KEY}:${MONNIFY_SECRET_KEY}`).toString('base64');
      const response = await fetch(`${MONNIFY_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json() as { requestSuccessful: boolean; responseBody: { accessToken: string }; responseMessage?: string };
      if (result.requestSuccessful) {
        return result.responseBody.accessToken;
      }
      console.error('Monnify auth response:', result);
      throw new Error(result.responseMessage || 'Failed to get access token');
    } catch (error) {
      console.error('Monnify auth error:', error);
      throw error;
    }
  }
  /**
   * Initialize a payment transaction
   */
  static async initializePayment(input: InitializePaymentInput) {
    try {
      const { userId, email, plan, billingCycle, callbackUrl } = input;

      if (!['starter', 'pro', 'enterprise'].includes(plan)) {
        return { success: false, message: 'Invalid plan selected', error: 'INVALID_PLAN' };
      }

      const planConfig = PLAN_PRICING[plan as keyof typeof PLAN_PRICING];
      const amount = billingCycle === 'yearly' ? planConfig.yearly : planConfig.monthly;
      const reference = `MBT_${userId}_${Date.now()}`;

      // Get Monnify access token
      const accessToken = await this.getAccessToken();

      // Initialize transaction with Monnify
      const response = await fetch(`${MONNIFY_BASE_URL}/api/v1/merchant/transactions/init-transaction`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          customerName: email.split('@')[0],
          customerEmail: email,
          paymentReference: reference,
          paymentDescription: `${plan.toUpperCase()} Plan - ${billingCycle}`,
          currencyCode: 'NGN',
          contractCode: MONNIFY_CONTRACT_CODE,
          redirectUrl: callbackUrl || `${process.env.FRONTEND_URL}/payment/callback`,
          paymentMethods: ['CARD', 'ACCOUNT_TRANSFER'],
          metadata: { userId, plan, billingCycle },
        }),
      });

      const result = await response.json() as { requestSuccessful: boolean; responseMessage?: string; responseBody: { checkoutUrl: string } };

      if (!result.requestSuccessful) {
        return { success: false, message: result.responseMessage, error: 'INIT_FAILED' };
      }

      // Store pending payment
      await prisma.payment.create({
        data: {
          userId: userId,
          amount: BigInt(amount * 100),
          currency: 'NGN',
          status: 'pending',
          stripePaymentId: reference,
        },
      });

      return {
        success: true,
        message: 'Payment initialized successfully',
        data: {
          reference,
          checkoutUrl: result.responseBody.checkoutUrl,
          amount,
          email,
          plan,
          billingCycle,
        },
      };
    } catch (error) {
      console.error('Initialize payment error:', error);
      return { success: false, message: 'Failed to initialize payment', error: 'PAYMENT_INIT_FAILED' };
    }
  }

  /**
   * Verify payment with Monipoint
   */
  static async verifyPayment(input: PaymentVerificationInput) {
    try {
      const { reference, userId } = input;

      const payment = await prisma.payment.findFirst({
        where: { stripePaymentId: reference, userId: userId, status: 'pending' },
      });

      if (!payment) {
        return { success: false, message: 'Payment not found or already processed', error: 'PAYMENT_NOT_FOUND' };
      }

      const accessToken = await this.getAccessToken();
      const response = await fetch(
        `${MONNIFY_BASE_URL}/api/v2/merchant/transactions/query?paymentReference=${reference}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json() as { requestSuccessful: boolean; responseMessage?: string; responseBody: { paymentStatus: string; amountPaid?: number; metaData?: { plan?: string; billingCycle?: string } } };

      if (!result.requestSuccessful) {
        return { success: false, message: result.responseMessage, error: 'VERIFICATION_FAILED' };
      }

      const txn = result.responseBody;
      if (txn.paymentStatus !== 'PAID') {
        return { success: false, message: 'Payment not completed', error: 'PAYMENT_PENDING' };
      }

      // Process successful payment
      const metadata = txn.metaData || {};
      await this.processSuccessfulPayment(reference, metadata.plan || 'pro', (metadata.billingCycle || 'monthly') as 'monthly' | 'yearly');

      return {
        success: true,
        message: 'Payment verified successfully',
        data: { reference, amount: txn.amountPaid || 0, status: 'succeeded' },
      };
    } catch (error) {
      console.error('Verify payment error:', error);
      return { success: false, message: 'Failed to verify payment', error: 'PAYMENT_VERIFY_FAILED' };
    }
  }

  /**
   * Process successful payment (update subscription)
   */
  static async processSuccessfulPayment(
    reference: string,
    plan: string,
    billingCycle: 'monthly' | 'yearly'
  ) {
    try {
      // Find the payment
      const payment = await prisma.payment.findFirst({
        where: { stripePaymentId: reference },
      });

      if (!payment) {
        return {
          success: false,
          message: 'Payment not found',
          error: 'PAYMENT_NOT_FOUND',
        };
      }

      // Calculate subscription dates
      const now = new Date();
      const periodEnd = new Date(now);
      if (billingCycle === 'yearly') {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }

      // Update or create subscription
      const planPricing = PLAN_PRICING[plan as keyof typeof PLAN_PRICING];
      const mrrValue = billingCycle === 'yearly'
        ? Math.round(planPricing.yearly / 12) * 100
        : planPricing.monthly * 100;

      await prisma.$transaction([
        // Update payment status
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'succeeded',
            billingPeriodStart: now,
            billingPeriodEnd: periodEnd,
          },
        }),
        // Update or create subscription
        prisma.subscription.upsert({
          where: { userId: payment.userId },
          create: {
            userId: payment.userId,
            planName: plan,
            status: 'active',
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            mrrValue: BigInt(mrrValue),
            annualValue: BigInt(planPricing.yearly * 100),
            lastPaymentId: payment.id,
          },
          update: {
            planName: plan,
            status: 'active',
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            mrrValue: BigInt(mrrValue),
            annualValue: BigInt(planPricing.yearly * 100),
            lastPaymentId: payment.id,
          },
        }),
        // Update user's current plan
        prisma.user.update({
          where: { id: payment.userId },
          data: {
            currentPlan: plan,
            subscriptionStatus: 'active',
          },
        }),
      ]);

      return {
        success: true,
        message: 'Payment processed successfully',
        data: {
          plan,
          billingCycle,
          periodStart: now,
          periodEnd,
        },
      };
    } catch (error) {
      console.error('Process payment error:', error);
      return {
        success: false,
        message: 'Failed to process payment',
        error: 'PROCESS_PAYMENT_FAILED',
      };
    }
  }

  /**
   * Get available plans and pricing
   */
  static getPlans() {
    return {
      success: true,
      data: {
        plans: Object.entries(PLAN_PRICING).map(([name, config]) => ({
          name,
          monthlyPrice: config.monthly,
          yearlyPrice: config.yearly,
          yearlySavings: (config.monthly * 12) - config.yearly,
          features: config.features,
        })),
        currency: 'NGN',
        gateway: 'monnify',
      },
    };
  }

  /**
   * Handle webhook from Monipoint
   */
  static async handleWebhook(payload: any) {
    try {
      const event = payload.eventType;
      const data = payload.eventData;

      if (event === 'SUCCESSFUL_TRANSACTION') {
        const reference = data.paymentReference;
        const metadata = data.metaData || {};
        
        if (reference && metadata.plan && metadata.billingCycle) {
          await this.processSuccessfulPayment(reference, metadata.plan, metadata.billingCycle);
        }
      } else if (event === 'FAILED_TRANSACTION') {
        await prisma.payment.updateMany({
          where: { stripePaymentId: data.paymentReference },
          data: { status: 'failed', failureReason: data.paymentStatusDescription },
        });
      }

      return { success: true, message: 'Webhook processed' };
    } catch (error) {
      console.error('Webhook handler error:', error);
      return { success: false, message: 'Webhook processing failed', error: 'WEBHOOK_FAILED' };
    }
  }
}

export default PaymentGatewayService;
