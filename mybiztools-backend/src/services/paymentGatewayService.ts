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
  free: {
    monthly: 0,
    yearly: 0,
    features: ['Basic features', '100MB storage', '5 documents', '10 contacts'],
  },
  pro: {
    monthly: 5000,
    yearly: 48000,
    features: ['All free features', '5GB storage', 'Unlimited documents', 'Unlimited contacts', 'Priority support'],
  },
  enterprise: {
    monthly: 25000,
    yearly: 240000,
    features: ['All pro features', '50GB storage', 'API access', 'Custom integrations', 'Dedicated support'],
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

      const result = await response.json();
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

      if (!['free', 'pro', 'enterprise'].includes(plan)) {
        return { success: false, message: 'Invalid plan selected', error: 'INVALID_PLAN' };
      }

      if (plan === 'free') {
        return { success: false, message: 'Free plan does not require payment', error: 'FREE_PLAN' };
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

      const result = await response.json();

      if (!result.requestSuccessful) {
        return { success: false, message: result.responseMessage, error: 'INIT_FAILED' };
      }

      // Store pending payment
      await prisma.payment.create({
        data: {
          user_id: userId,
          amount: BigInt(amount * 100),
          currency: 'NGN',
          status: 'pending',
          stripe_payment_id: reference,
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
        where: { stripe_payment_id: reference, user_id: userId, status: 'pending' },
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

      const result = await response.json();

      if (!result.requestSuccessful) {
        return { success: false, message: result.responseMessage, error: 'VERIFICATION_FAILED' };
      }

      const txn = result.responseBody;
      if (txn.paymentStatus !== 'PAID') {
        return { success: false, message: 'Payment not completed', error: 'PAYMENT_PENDING' };
      }

      // Process successful payment
      const metadata = txn.metaData || {};
      await this.processSuccessfulPayment(reference, metadata.plan, metadata.billingCycle);

      return {
        success: true,
        message: 'Payment verified successfully',
        data: { reference, amount: txn.amountPaid, status: 'succeeded' },
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
        where: { stripe_payment_id: reference },
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
            billing_period_start: now,
            billing_period_end: periodEnd,
          },
        }),
        // Update or create subscription
        prisma.subscription.upsert({
          where: { user_id: payment.user_id },
          create: {
            user_id: payment.user_id,
            plan_name: plan,
            status: 'active',
            current_period_start: now,
            current_period_end: periodEnd,
            mrr_value: BigInt(mrrValue),
            annual_value: BigInt(planPricing.yearly * 100),
            last_payment_id: payment.id,
          },
          update: {
            plan_name: plan,
            status: 'active',
            current_period_start: now,
            current_period_end: periodEnd,
            mrr_value: BigInt(mrrValue),
            annual_value: BigInt(planPricing.yearly * 100),
            last_payment_id: payment.id,
          },
        }),
        // Update user's current plan
        prisma.user.update({
          where: { id: payment.user_id },
          data: {
            current_plan: plan,
            subscription_status: 'active',
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
          where: { stripe_payment_id: data.paymentReference },
          data: { status: 'failed', failure_reason: data.paymentStatusDescription },
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
