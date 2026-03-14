import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Calculator, TrendingUp, MessageSquare, Receipt, Play } from 'lucide-react';
export function ProductDemo() {
  const [activeTab, setActiveTab] = useState(0);
  const tools = [{
    icon: FileText,
    title: 'Invoice Generator',
    desc: 'Create professional invoices with AI assistance, PDF export, and email/WhatsApp sharing',
    color: 'from-blue-500 to-cyan-400',
    iconColor: 'text-blue-500',
    features: ['AI-Powered', 'PDF Export', 'Multi-Currency', 'VAT Calculation'],
    image: '/Image/01.JPG'
  }, {
    icon: Receipt,
    title: 'Receipt Generator',
    desc: 'Generate digital receipts with VAT toggle and multiple payment methods',
    color: 'from-teal-500 to-emerald-400',
    iconColor: 'text-teal-500',
    features: ['VAT Toggle', 'Payment Methods', 'Instant PDF', 'Share Ready'],
    image: '/Image/02.JPG'
  }, {
    icon: Calculator,
    title: 'Tax Calculator',
    desc: 'Calculate Nigerian PAYE and Corporate Tax with 2026 compliance',
    color: 'from-[#FF8A2B] to-[#FF6B00]',
    iconColor: 'text-[#FF8A2B]',
    features: ['PAYE 2026', 'Corporate Tax', 'VAT 7.5%', 'Auto Calculate'],
    image: '/Image/03.JPG'
  }, {
    icon: TrendingUp,
    title: 'Budget Tracker',
    desc: 'Track spending by category with visual pie charts and progress indicators',
    color: 'from-purple-500 to-pink-400',
    iconColor: 'text-purple-500',
    features: ['Pie Charts', 'Categories', 'Progress Bars', 'Real-time'],
    image: '/Image/04.JPG'
  }];
  return <section className="py-32 bg-gradient-to-b from-white to-slate-50 overflow-hidden relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      <div className="absolute top-20 right-20 w-96 h-96 bg-[#FF8A2B]/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div initial={{
          opacity: 0,
          scale: 0.9
        }} whileInView={{
          opacity: 1,
          scale: 1
        }} viewport={{
          once: true
        }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF8A2B]/10 text-[#FF8A2B] text-sm font-bold border border-[#FF8A2B]/20 mb-6">
            <Play className="w-4 h-4" />
            <span>Live Preview</span>
          </motion.div>
          <motion.h2 initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">
            See MyBizTools <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF8A2B] to-[#FF6B00]">In Action</span>
          </motion.h2>
          <p className="text-xl text-slate-600">
            Powerful tools designed for simplicity and speed
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
            {tools.map((tool, idx) => <motion.button key={idx} initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: idx * 0.1
          }} onClick={() => setActiveTab(idx)} className={`p-4 rounded-2xl transition-all duration-300 ${activeTab === idx ? 'bg-white shadow-xl shadow-[#FF8A2B]/10 border-2 border-[#FF8A2B]' : 'bg-white/50 border-2 border-slate-200 hover:border-[#FF8A2B]/30'}`}>
                <tool.icon className={`w-8 h-8 mx-auto mb-2 ${activeTab === idx ? tool.iconColor : 'text-slate-400'}`} />
                <p className={`text-xs font-bold ${activeTab === idx ? 'text-slate-900' : 'text-slate-500'}`}>
                  {tool.title}
                </p>
              </motion.button>)}
          </div>

          <motion.div key={activeTab} initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.5
        }} className="relative">
            <div className={`absolute -inset-4 bg-gradient-to-r ${tools[activeTab].color} rounded-3xl blur-2xl opacity-20`}></div>
            <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-900 p-4 flex items-center gap-3">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex-1 bg-slate-800 rounded-lg px-4 py-2 text-sm text-slate-400 text-center">
                  mybiztools.app/{tools[activeTab].title.toLowerCase().replace(' ', '-')}
                </div>
              </div>
              <div className="bg-gradient-to-br from-slate-50 to-white p-8 relative overflow-hidden">
                <motion.div initial={{
                scale: 0.95,
                opacity: 0
              }} animate={{
                scale: 1,
                opacity: 1
              }} transition={{
                delay: 0.2
              }} className="relative z-10">
                  <img 
                    src={tools[activeTab].image} 
                    alt={tools[activeTab].title}
                    className="w-full h-auto rounded-xl shadow-2xl border border-slate-200"
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>;
}