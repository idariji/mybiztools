import React, { useState, useEffect } from 'react';
import { Check, X, Loader2, Hexagon, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { normalisePlan, planDisplayName } from '../utils/planUtils';

interface ApiPricing {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
}

const PLAN_CONFIG = [
  {
    key: 'starter',
    displayName: 'Starter',
    description: 'Perfect for freelancers and solo entrepreneurs',
    color: 'slate',
    popular: false,
    features: [
      { text: 'Unlimited Invoices, Quotations, Receipts & Payslips', included: true },
      { text: 'Business Card & QR Code Generator', included: true },
      { text: 'Social Media Planner', included: true },
      { text: 'Cost Manager', included: true },
      { text: 'Budget Tracker', included: true },
      { text: 'Tax Calculator (PAYE, CIT, VAT, WHT)', included: true },
      { text: 'Email & WhatsApp document delivery', included: true },
      { text: 'DEDA AI Assistant', included: false },
      { text: 'Watermark-free exports', included: false },
      { text: 'Priority support', included: false },
    ],
  },
  {
    key: 'pro',
    displayName: 'Business Pro',
    description: 'For growing businesses that need the full toolkit',
    color: 'orange',
    popular: true,
    features: [
      { text: 'Everything in Starter', included: true },
      { text: 'DEDA AI Assistant', included: true },
      { text: 'Watermark-free exports', included: true },
      { text: 'Priority email support', included: true },
      { text: 'Advanced analytics & insights', included: true },
      { text: 'Custom business branding', included: true },
      { text: 'Bulk document generation', included: true },
      { text: 'Team / multi-user access', included: false },
      { text: 'Dedicated account manager', included: false },
    ],
  },
  {
    key: 'enterprise',
    displayName: 'Enterprise Suite',
    description: 'Full-scale solution for larger organisations',
    color: 'slate',
    popular: false,
    features: [
      { text: 'Everything in Business Pro', included: true },
      { text: 'Team / multi-user access', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'Custom integrations & API access', included: true },
      { text: 'SLA-backed uptime guarantee', included: true },
      { text: 'Onboarding & training sessions', included: true },
      { text: 'White-label / custom branding', included: true },
      { text: 'Quarterly business reviews', included: true },
    ],
  },
];

export function SubscriptionPage() {
  const navigate = useNavigate();
  const [pricing, setPricing] = useState<Record<string, ApiPricing>>({});
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const user = authService.getCurrentUser();
  const currentTier = normalisePlan(user?.current_plan);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/plans`);
      const result = await response.json();
      if (result.success) {
        const map: Record<string, ApiPricing> = {};
        result.data.plans.forEach((p: ApiPricing) => { map[p.name] = p; });
        setPricing(map);
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planKey: string) => {
    setProcessing(planKey);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan: planKey,
          billingCycle,
          callbackUrl: `${window.location.origin}/payment/callback`,
        }),
      });

      const result = await response.json();
      if (result.success) {
        window.location.href = result.data.checkoutUrl;
      } else {
        alert(result.message || 'Failed to initialize payment');
        setProcessing(null);
      }
    } catch (error) {
      console.error('Payment initialization failed:', error);
      alert('Failed to initialize payment. Please try again.');
      setProcessing(null);
    }
  };

  const getPrice = (planKey: string) => {
    const p = pricing[planKey];
    if (!p) return null;
    return billingCycle === 'yearly' ? p.yearlyPrice : p.monthlyPrice;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F0F3F5]">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF8A2B]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F3F5] py-12 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Hexagon className="w-8 h-8 fill-[#FF8A2B] text-[#FF8A2B]" />
            <span className="font-bold text-xl text-slate-900">MyBizTools</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Choose Your Plan</h1>
          <p className="text-lg text-slate-600 max-w-xl mx-auto">
            Start free, upgrade when you're ready. All paid plans include full feature access.
          </p>

          {/* Billing toggle */}
          <div className="mt-8 inline-flex items-center bg-white rounded-xl p-1 shadow-sm border border-slate-200">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-[#FF8A2B] text-white shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-[#FF8A2B] text-white shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Yearly <span className={`text-xs ml-1 ${billingCycle === 'yearly' ? 'text-orange-200' : 'text-green-600'}`}>Save 20%</span>
            </button>
          </div>
        </div>

        {/* Free tier banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-slate-900">No plan (Free)</p>
            <p className="text-sm text-slate-500 mt-0.5">
              Up to 2 invoices, quotations, receipts & payslips · Basic tools only · Watermark on all exports
            </p>
          </div>
          {currentTier === 'free' && (
            <span className="shrink-0 text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-600 rounded-full">Current Plan</span>
          )}
        </div>

        {/* Paid plan cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {PLAN_CONFIG.map((plan) => {
            const price = getPrice(plan.key);
            const isCurrent = currentTier === plan.key || (plan.key === 'pro' && currentTier === 'pro');
            const isPopular = plan.popular;

            return (
              <div
                key={plan.key}
                className={`relative bg-white rounded-2xl border shadow-sm flex flex-col ${
                  isPopular
                    ? 'border-[#FF8A2B] shadow-orange-100 shadow-lg ring-1 ring-[#FF8A2B]'
                    : 'border-slate-200'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="flex items-center gap-1 bg-gradient-to-r from-[#FF8A2B] to-[#FF6B00] text-white text-xs font-bold px-4 py-1 rounded-full shadow">
                      <Zap className="w-3 h-3" /> Most Popular
                    </span>
                  </div>
                )}

                <div className="p-7 flex-1 flex flex-col">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{plan.displayName}</h3>
                    <p className="text-sm text-slate-500">{plan.description}</p>
                  </div>

                  <div className="mb-6">
                    {price != null ? (
                      <>
                        <span className="text-4xl font-bold text-slate-900">
                          ₦{price.toLocaleString()}
                        </span>
                        <span className="text-slate-500 text-sm ml-1">
                          /{billingCycle === 'yearly' ? 'year' : 'month'}
                        </span>
                        {billingCycle === 'yearly' && (
                          <p className="text-xs text-green-600 mt-1 font-medium">
                            20% off · billed annually
                          </p>
                        )}
                      </>
                    ) : (
                      <span className="text-slate-400 text-sm">Pricing unavailable</span>
                    )}
                  </div>

                  <ul className="space-y-2.5 mb-8 flex-1">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        {feature.included ? (
                          <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                        )}
                        <span className={`text-sm ${feature.included ? 'text-slate-700' : 'text-slate-400'}`}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => !isCurrent && handleSubscribe(plan.key)}
                    disabled={!!processing || isCurrent}
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                      isCurrent
                        ? 'bg-slate-100 text-slate-500 cursor-not-allowed'
                        : isPopular
                        ? 'bg-gradient-to-r from-[#FF8A2B] to-[#FF6B00] text-white hover:opacity-90 shadow-md'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    } ${processing === plan.key ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    {processing === plan.key ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : isCurrent ? (
                      'Current Plan'
                    ) : (
                      `Get ${plan.displayName}`
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <p className="text-center text-sm text-slate-500 mt-8">
          All plans are billed in Nigerian Naira (₦). You can cancel or change your plan at any time.
          Payments processed securely via Monipoint.
        </p>
      </div>
    </div>
  );
}
