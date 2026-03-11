import type { ServiceResponse } from '../types/index.js';

// ============================================================================
// PAYMENT GATEWAY SERVICE (Monnify — coming soon)
// ============================================================================

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
        gateway: 'monnify',
      },
    };
  }

  static async initializePayment(_input: {
    userId: string;
    email: string;
    plan: string;
    billingCycle: 'monthly' | 'yearly';
    callbackUrl?: string;
  }): Promise<ServiceResponse> {
    return {
      success: false,
      message: 'Payment gateway integration coming soon',
      error: 'NOT_IMPLEMENTED',
    };
  }

  static async verifyPayment(_input: {
    reference: string;
    userId: string;
  }): Promise<ServiceResponse> {
    return {
      success: false,
      message: 'Payment gateway integration coming soon',
      error: 'NOT_IMPLEMENTED',
    };
  }

  static async processSuccessfulPayment(
    _reference: string,
    _plan: string,
    _billingCycle: 'monthly' | 'yearly'
  ): Promise<ServiceResponse> {
    return {
      success: false,
      message: 'Payment gateway integration coming soon',
      error: 'NOT_IMPLEMENTED',
    };
  }

  static async handleWebhook(_payload: any): Promise<ServiceResponse> {
    return {
      success: false,
      message: 'Payment gateway integration coming soon',
      error: 'NOT_IMPLEMENTED',
    };
  }
}

export default PaymentGatewayService;