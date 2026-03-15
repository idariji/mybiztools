import { motion } from 'framer-motion';
import { FileText, Receipt, CreditCard, QrCode, Calendar, PieChart, Calculator, TrendingUp, Bot, ShieldCheck, Globe, FileSpreadsheet, ArrowRight, Layers } from 'lucide-react';
import { Card } from '../ui/Card';
const tools = [{
  icon: FileText,
  title: 'Invoice Generator',
  desc: 'Create professional invoices in seconds.',
  color: 'text-blue-600',
  bg: 'bg-blue-50'
}, {
  icon: FileSpreadsheet,
  title: 'Quotation Maker',
  desc: 'Turn prospects into clients instantly.',
  color: 'text-indigo-600',
  bg: 'bg-indigo-50'
}, {
  icon: Receipt,
  title: 'Receipt Generator',
  desc: 'Issue digital receipts immediately.',
  color: 'text-[#FF8A2B]',
  bg: 'bg-orange-50'
}, {
  icon: CreditCard,
  title: 'Payslip Generator',
  desc: 'Manage salaries with compliance.',
  color: 'text-cyan-600',
  bg: 'bg-cyan-50'
}, {
  icon: QrCode,
  title: 'Business Card & QR',
  desc: 'Digital cards for instant sharing.',
  color: 'text-purple-600',
  bg: 'bg-purple-50'
}, {
  icon: Calendar,
  title: 'Social Planner',
  desc: 'Schedule marketing content easily.',
  color: 'text-pink-600',
  bg: 'bg-pink-50'
}, {
  icon: PieChart,
  title: 'Budget Tracker',
  desc: 'Track every naira, cedi, or shilling.',
  color: 'text-orange-600',
  bg: 'bg-orange-50'
}, {
  icon: Calculator,
  title: 'Tax Calculator',
  desc: 'Instant PAYE, VAT, and Tax calcs.',
  color: 'text-red-600',
  bg: 'bg-red-50'
}, {
  icon: TrendingUp,
  title: 'Cost Manager',
  desc: 'Analyze costs and save money.',
  color: 'text-teal-600',
  bg: 'bg-teal-50'
}, {
  icon: Bot,
  title: 'AI Assistant DEDA',
  desc: 'Your smart admin partner.',
  color: 'text-[#FF8A2B]',
  bg: 'bg-orange-100',
  highlight: true
}, {
  icon: ShieldCheck,
  title: 'Compliance Tools',
  desc: 'Updated for 2025-2026 policies.',
  color: 'text-slate-600',
  bg: 'bg-slate-100'
}, {
  icon: Globe,
  title: 'Cross-Border',
  desc: 'Multi-currency support (USD, NGN).',
  color: 'text-amber-600',
  bg: 'bg-amber-50'
}];
export function SolutionsGrid() {
  return <section id="features" className="py-20 sm:py-32 bg-slate-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-20">
          <motion.div initial={{
          opacity: 0,
          scale: 0.9
        }} whileInView={{
          opacity: 1,
          scale: 1
        }} viewport={{
          once: true
        }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100/50 text-[#FF8A2B] text-sm font-bold border border-orange-200 mb-5 sm:mb-6">
            <Layers className="w-4 h-4" />
            <span>All-in-One Platform</span>
          </motion.div>

          <motion.h2 initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 sm:mb-6">
            Everything You Need In One <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF8A2B] to-[#FF6B00]">
              Smart Workspace
            </span>
          </motion.h2>

          <motion.p initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          delay: 0.1
        }} className="text-base sm:text-xl text-slate-600">
            Replace dozens of disconnected apps with one integrated suite
            designed for African businesses.
          </motion.p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {tools.map((tool, index) => <motion.div key={index} initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.4,
          delay: index * 0.05
        }}>
              <Card hoverEffect className={`h-full p-4 sm:p-5 lg:p-6 flex flex-col group cursor-pointer border-slate-200/60 transition-all duration-300 ${tool.highlight ? 'ring-2 ring-[#FF8A2B]/20 bg-orange-50/30' : 'hover:bg-white'}`}>
                <div className="flex justify-between items-start mb-3 sm:mb-4">
                  <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl ${tool.bg} ${tool.color} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm shrink-0`}>
                    <tool.icon className="w-5 h-5 sm:w-7 sm:h-7" />
                  </div>
                  {tool.highlight && <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-orange-100 text-[#FF8A2B] text-xs font-bold rounded-full">
                      New
                    </span>}
                </div>

                <h3 className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 mb-1.5 sm:mb-2 group-hover:text-[#FF8A2B] transition-colors leading-snug">
                  {tool.title}
                </h3>

                <p className="text-slate-600 text-xs sm:text-sm mb-3 sm:mb-6 flex-grow leading-relaxed">
                  {tool.desc}
                </p>

                <div className="hidden sm:flex items-center text-[#FF8A2B] text-sm font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  Try Now <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </Card>
            </motion.div>)}
        </div>
      </div>
    </section>;
}
