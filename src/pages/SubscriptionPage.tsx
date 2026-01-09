import React, { useState, useEffect } from 'react';
import { Check, Loader2 } from 'lucide-react';

interface Plan {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  yearlySavings: number;
  features: string[];
}

export function SubscriptionPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/payments/plans`);
      const result = await response.json();
      if (result.success) {
        setPlans(result.data.plans);
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planName: string) => {
    if (planName === 'free') return;

    setProcessing(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/payments/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan: planName,
          billingCycle,
          callbackUrl: `${window.location.origin}/payment/callback`,
        }),
      });

      const result = await response.json();
      if (result.success) {
        // Redirect to Monipoint checkout
        window.location.href = result.data.checkoutUrl;
      } else {
        alert(result.message || 'Failed to initialize payment');
        setProcessing(false);
      }
    } catch (error) {
      console.error('Payment initialization failed:', error);
      alert('Failed to initialize payment. Please try again.');
      setProcessing(false);
    }
  };

  const verifyPayment = async (reference: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/payments/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reference }),
      });

      const result = await response.json();
      if (result.success) {
        alert('Payment successful! Your subscription has been activated.');
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Payment verification failed:', error);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600">Select the perfect plan for your business</p>

          <div className="mt-8 inline-flex items-center bg-white rounded-lg p-1 shadow">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md transition ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-md transition ${
                billingCycle === 'yearly'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly <span className="text-green-600 text-sm ml-1">(Save 20%)</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-lg shadow-lg p-8 ${
                plan.name === 'pro' ? 'ring-2 ring-blue-600 transform scale-105' : ''
              }`}
            >
              {plan.name === 'pro' && (
                <div className="bg-blue-600 text-white text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold text-gray-900 capitalize mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  ₦{billingCycle === 'yearly' ? plan.yearlyPrice.toLocaleString() : plan.monthlyPrice.toLocaleString()}
                </span>
                <span className="text-gray-600">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.name)}
                disabled={processing || plan.name === 'free'}
                className={`w-full py-3 rounded-lg font-semibold transition ${
                  plan.name === 'free'
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : plan.name === 'pro'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                } ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {processing ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : plan.name === 'free' ? (
                  'Current Plan'
                ) : (
                  'Subscribe Now'
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
