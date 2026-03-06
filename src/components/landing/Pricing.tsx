import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Sparkles, Info } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
export function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);

  const freeTierItems = [
    'Up to 2 invoices, quotations, receipts & payslips',
    'Basic dashboard access',
    'Watermark on all exports',
  ];
  const freeLockedItems = [
    'Business Card & QR Generator',
    'Social Media Planner',
    'Budget Tracker',
    'Tax Calculator',
    'DEDA AI Assistant',
  ];

  const tiers = [{
    name: 'Starter',
    price: isAnnual ? 18000 : 2000,
    description: 'Perfect for freelancers and solo entrepreneurs',
    features: [
      'Unlimited Invoices, Quotations, Receipts & Payslips',
      'Business Card & QR Code Generator',
      'Social Media Planner',
      'Cost Manager',
      'Budget Tracker',
      'Tax Calculator (PAYE, CIT, VAT, WHT)',
      'Email & WhatsApp document delivery',
    ],
    notIncluded: [
      'DEDA AI Assistant',
      'Watermark-free exports',
      'Priority support',
    ],
    cta: 'Get Starter',
    variant: 'outline',
    highlight: false,
  }, {
    name: 'Business Pro',
    price: isAnnual ? 45000 : 4500,
    description: 'Most Popular – full toolkit for growing businesses',
    features: [
      'Everything in Starter',
      'DEDA AI Assistant',
      'Watermark-free exports',
      'Priority email support',
      'Advanced analytics & insights',
      'Custom business branding',
      'Bulk document generation',
    ],
    notIncluded: [
      'Team / multi-user access',
      'Dedicated account manager',
    ],
    cta: 'Start Business Pro',
    variant: 'glow',
    highlight: true,
  }, {
    name: 'Enterprise Suite',
    price: isAnnual ? 120000 : 12000,
    description: 'Full-scale solution for larger organisations',
    features: [
      'Everything in Business Pro',
      'Team / multi-user access (up to 10 users)',
      'Dedicated account manager',
      'Custom integrations & API access',
      'SLA-backed uptime guarantee',
      'Onboarding & training sessions',
      'White-label / custom branding',
      'Quarterly business reviews',
      'Export to XLSX, CSV, DOCX, PDF',
    ],
    notIncluded: [],
    cta: 'Go Enterprise',
    variant: 'secondary',
    highlight: false,
  }];
  return <section className="py-32 bg-white relative" id="pricing">
      {/* Background blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-50/50 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-amber-50/50 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">
            Simple Pricing That <br />
            <span className="text-[#FF8A2B]">Scales With You</span>
          </h2>
          <p className="text-xl text-slate-600 mb-10">
            Start for free, upgrade as you grow. No hidden fees.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-6 mb-8">
            <span className={`text-sm font-bold ${!isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>
              Monthly
            </span>
            <button onClick={() => setIsAnnual(!isAnnual)} className="relative w-16 h-8 bg-slate-200 rounded-full p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF8A2B] hover:bg-slate-300">
              <motion.div className="w-6 h-6 bg-white rounded-full shadow-md" animate={{
              x: isAnnual ? 32 : 0
            }} transition={{
              type: 'spring',
              stiffness: 500,
              damping: 30
            }} />
            </button>
            <span className={`text-sm font-bold ${isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>
              Annual{' '}
              <span className="text-[#FF8A2B] text-xs font-extrabold bg-orange-100 px-2 py-1 rounded-full ml-1 border border-orange-200">
                SAVE 20%
              </span>
            </span>
          </div>
        </div>

        {/* Free tier info banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto mb-10"
        >
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2 shrink-0">
              <Info className="w-5 h-5 text-slate-400" />
              <span className="font-semibold text-slate-700 text-sm">No plan (Free)</span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
              {freeTierItems.map((item, i) => (
                <span key={i} className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-green-500 shrink-0" /> {item}
                </span>
              ))}
              {freeLockedItems.map((item, i) => (
                <span key={i} className="flex items-center gap-1 opacity-50">
                  <X className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {item}
                </span>
              ))}
            </div>
            <Button variant="outline" size="sm" className="shrink-0 ml-auto" onClick={() => window.location.href = '/login'}>
              Start Free
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto items-start">
          {tiers.map((tier, index) => <motion.div key={index} initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.5,
          delay: index * 0.1
        }} className={tier.highlight ? 'md:-mt-8 md:mb-8 z-10' : ''}>
              <Card className={`h-full flex flex-col p-8 ${tier.highlight ? 'border-[#FF8A2B] ring-4 ring-[#FF8A2B]/10 shadow-2xl shadow-[#FF8A2B]/10 relative' : 'border-slate-200 hover:border-orange-200 transition-colors'}`} glass={tier.highlight}>
                {tier.highlight && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-[#FF8A2B] to-[#FF6B00] text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg shadow-[#FF8A2B]/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Most Popular
                  </div>}

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-900">
                    {tier.name}
                  </h3>
                  <p className="text-slate-500 text-sm mt-2 font-medium">
                    {tier.description}
                  </p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-extrabold text-slate-900 tracking-tight">
                      ₦{tier.price.toLocaleString()}
                    </span>
                    <span className="text-slate-500 ml-2 font-medium">
                      /{isAnnual ? 'year' : 'month'}
                    </span>
                  </div>
                  {isAnnual && (
                    <p className="text-xs text-green-600 mt-1 font-medium">20% off — billed annually</p>
                  )}
                </div>

                <Button variant={tier.variant as any} className="w-full mb-8" onClick={() => window.location.href = '/login'}>
                  {tier.cta}
                </Button>

                <div className="space-y-4 flex-grow">
                  {tier.features.map((feature, i) => <div key={i} className="flex items-start gap-3">
                      <div className="mt-0.5 w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-[#FF8A2B]" />
                      </div>
                      <span className="text-slate-700 text-sm font-medium">
                        {feature}
                      </span>
                    </div>)}
                  {tier.notIncluded.map((feature, i) => <div key={i} className="flex items-start gap-3 opacity-40 grayscale">
                      <div className="mt-0.5 w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        <X className="w-3 h-3 text-slate-400" />
                      </div>
                      <span className="text-slate-500 text-sm">{feature}</span>
                    </div>)}
                </div>
              </Card>
            </motion.div>)}
        </div>
      </div>
    </section>;
}