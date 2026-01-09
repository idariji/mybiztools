import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
export function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);
  const tiers = [{
    name: 'Starter',
    price: 0,
    description: 'Best for Beginners',
    features: ['10 invoices/month', '10 quotes/month', '10 receipts/month', 'Budget tracker (basic)', 'Cost manager (basic)', 'Tax calculator (basic)', 'DEDA AI Assistant (Lite / 5 prompts per day)', 'Basic dashboard', 'Watermarked exports'],
    notIncluded: ['Unlimited documents', 'Payslip generator', 'Business Card + QR generator', 'Social Media Planner', 'Custom branding', 'Multi-user access', 'Priority support', 'API Access'],
    cta: 'Get Started – Free',
    variant: 'outline',
    tag: 'Best for Beginners'
  }, {
    name: 'Business Pro',
    price: isAnnual ? 45000 : 4500,
    description: 'Most Popular',
    features: ['Unlimited invoices', 'Unlimited quotes', 'Unlimited receipts', 'Payslip generator', 'Business Card + QR generator', 'Social Media Planner – basic', 'Budget tracker (advanced)', 'Cost manager (full analytics)', 'Tax Calculator (smart mode)', 'DEDA AI Assistant – Standard (50 prompts/day)', 'Custom branding on documents', 'Exports: PDF, DOCX, PNG', 'Email + in-app support'],
    notIncluded: ['Multi-user access (10 users)', 'Unlimited DEDA AI prompts', 'API Access', 'Custom domain', 'Automated recurring invoices', 'Advanced templates pack'],
    cta: 'Start Pro Plan',
    variant: 'glow',
    highlight: true
  }, {
    name: 'Enterprise Suite',
    price: isAnnual ? 120000 : 12000,
    description: 'For scaling teams and established companies.',
    features: ['Everything in Pro', 'Up to 10 users', '24/7 priority support', 'DEDA AI Assistant – Full Mode (unlimited prompts)', 'Full Social Media Planner with analytics', 'Automated recurring invoices', 'API Access', 'Business insights dashboard', 'Custom domain for invoices/receipts', 'Finance reports', 'Advanced templates pack', 'Export to XLSX, CSV, DOCX, PDF'],
    notIncluded: [],
    cta: 'Go Enterprise',
    variant: 'secondary'
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
                      {tier.price === 0 ? '₦0' : `₦${tier.price.toLocaleString()}`}
                    </span>
                    <span className="text-slate-500 ml-2 font-medium">
                      /{isAnnual && tier.price > 0 ? 'year' : 'month'}
                    </span>
                  </div>
                </div>

                <Button variant={tier.variant as any} className="w-full mb-8">
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