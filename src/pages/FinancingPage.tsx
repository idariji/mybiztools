import { motion } from 'framer-motion';
import { BarChart2, CheckCircle, TrendingUp, FileText, Building2, ArrowRight, Sparkles, Star, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '../layout/DashboardLayout';

const lenders = [
  { name: 'Bank of Industry (BOI)', type: 'DFI', interest: '5–9% p.a.', minLoan: '₦5M', focus: 'Manufacturing, Agriculture, Solid Minerals', eligible: true },
  { name: 'NIRSAL Microfinance Bank', type: 'Microfinance', interest: '9% p.a.', minLoan: '₦50K', focus: 'SMEs, Agriculture, Youth/Women', eligible: true },
  { name: 'Carbon (formerly Paylater)', type: 'Fintech', interest: '1.75–30% monthly', minLoan: '₦20K', focus: 'Individuals, Small businesses', eligible: false },
  { name: 'Lidya Africa', type: 'Fintech', interest: '3.5% monthly', minLoan: '₦150K', focus: 'SMEs with digital transaction history', eligible: false },
];

const checklist = [
  { item: 'CAC Business Registration Certificate', done: false },
  { item: 'Tax Identification Number (TIN)', done: false },
  { item: '6 months bank statements', done: false },
  { item: '2 years audited financial statements', done: false },
  { item: 'Business plan or pitch deck', done: false },
  { item: 'Proof of business address', done: false },
  { item: 'Passport photograph (director)', done: false },
  { item: 'Valid government-issued ID', done: false },
];

export function FinancingPage() {
  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-slate-900">Financing Readiness</h1>
          <div className="h-1 w-16 bg-gradient-to-r from-[#FF8A2B] to-[#FF6B00] rounded-full mt-2 mb-1" />
          <p className="text-sm text-slate-500">Build your credit profile and prepare for business loans</p>
        </div>

        {/* Health Score Coming Soon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] rounded-2xl p-6 text-white shadow-[0_8px_30px_rgba(30,58,138,0.3)]"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold mb-1">Financial Health Score</h2>
                <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">Coming Soon</span>
              </div>
              <p className="text-white/80 text-sm">
                Once you have 3+ months of invoice and bookkeeping data, your Financial Health Score
                will be automatically calculated — ready to share with lenders as proof of creditworthiness.
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['Revenue Consistency', 'Invoice Payment Rate', 'Expense Ratio', 'Account Age'].map((m) => (
              <div key={m} className="bg-white/10 rounded-xl p-3 text-center">
                <Star className="w-4 h-4 mx-auto mb-1 text-yellow-300" />
                <p className="text-xs text-white/80">{m}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Loan Readiness Checklist */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-slate-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-gradient-to-br from-[#FF8A2B] to-[#FF6B00] rounded-lg">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-semibold text-slate-900">Loan Readiness Checklist</h2>
          </div>
          <p className="text-sm text-slate-500 mb-4">Tick off these items before applying to any lender:</p>
          <div className="space-y-2">
            {checklist.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center shrink-0">
                  {item.done && <CheckCircle className="w-5 h-5 text-green-500" />}
                </div>
                <span className="text-sm text-slate-700">{item.item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Lender Directory */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-slate-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-semibold text-slate-900">Lender Directory</h2>
          </div>
          <div className="space-y-3">
            {lenders.map((lender, i) => (
              <motion.div
                key={lender.name}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.05 }}
                className="p-4 rounded-xl border border-slate-100 hover:border-[#FF8A2B]/30 hover:bg-orange-50/30 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900 text-sm">{lender.name}</h3>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{lender.type}</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">{lender.focus}</p>
                    <div className="flex gap-3 text-xs">
                      <span className="text-slate-600"><span className="font-medium">Rate:</span> {lender.interest}</span>
                      <span className="text-slate-600"><span className="font-medium">Min:</span> {lender.minLoan}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {lender.eligible
                      ? <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Eligible</span>
                      : <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Check criteria</span>
                    }
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Export CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#FF8A2B] to-[#FF6B00] rounded-xl">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Export Financial Profile</h3>
              <p className="text-sm text-slate-500">One-click PDF of your full financial profile — ready for lenders</p>
            </div>
          </div>
          <button className="flex items-center gap-2 bg-gradient-to-r from-[#FF8A2B] to-[#FF6B00] text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all whitespace-nowrap opacity-50 cursor-not-allowed">
            Coming Soon <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
