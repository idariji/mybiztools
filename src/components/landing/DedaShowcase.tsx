import React from 'react';
import { motion } from 'framer-motion';
import { Check, Send, Sparkles, BrainCircuit, Zap } from 'lucide-react';
import { Button } from '../ui/Button';
export function DedaShowcase() {
  const features = ['Generate invoices & receipts automatically', 'Calculate tax instantly based on local laws', 'Plan marketing content and social captions', 'Analyze your budget and suggest savings', 'Make data-driven business decisions'];
  return <section className="py-32 bg-slate-950 overflow-hidden relative">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#FF8A2B]/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#FF6B00]/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left Content */}
          <motion.div initial={{
          opacity: 0,
          x: -50
        }} whileInView={{
          opacity: 1,
          x: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.8,
          ease: 'easeOut'
        }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF8A2B]/20 text-[#FF8A2B] text-sm font-bold border border-[#FF8A2B]/50 mb-8 backdrop-blur-md shadow-[0_0_15px_rgba(255,138,43,0.2)]">
              <BrainCircuit className="w-4 h-4" />
              <span>Meet DEDA AI 2.0</span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
              Your Admin & <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF8A2B] via-[#FFB84D] to-[#FF8A2B] animate-gradient bg-300%">
                Strategy Assistant
              </span>
            </h2>

            <p className="text-xl text-slate-400 mb-10 leading-relaxed max-w-lg">
              DEDA (Disciplined | Efficient | Determined | Accurate) isn't just
              a chatbot. It's a business partner that knows your local context.
            </p>

            <ul className="space-y-5 mb-12">
              {features.map((feature, idx) => <motion.li key={idx} initial={{
              opacity: 0,
              x: -20
            }} whileInView={{
              opacity: 1,
              x: 0
            }} viewport={{
              once: true
            }} transition={{
              delay: 0.1 * idx
            }} className="flex items-start gap-4 text-slate-300 group">
                  <div className="mt-1 w-6 h-6 rounded-full bg-[#FF8A2B]/20 flex items-center justify-center shrink-0 border border-[#FF8A2B]/30 group-hover:bg-[#FF8A2B]/40 transition-colors">
                    <Check className="w-3.5 h-3.5 text-[#FF8A2B]" />
                  </div>
                  <span className="group-hover:text-white transition-colors">
                    {feature}
                  </span>
                </motion.li>)}
            </ul>

            <Button variant="glow" size="lg" className="text-lg px-8">
              <Zap className="w-5 h-5 mr-2 fill-white" />
              Chat with DEDA Now
            </Button>
          </motion.div>

          {/* Right Chat Interface */}
          <motion.div initial={{
          opacity: 0,
          scale: 0.9,
          rotate: -2
        }} whileInView={{
          opacity: 1,
          scale: 1,
          rotate: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.8,
          type: 'spring',
          bounce: 0.2
        }} className="relative">
            {/* Glowing border effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#FF8A2B] to-[#FF6B00] rounded-3xl blur opacity-30"></div>

            <div className="relative bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden max-w-md mx-auto lg:ml-auto backdrop-blur-xl">
              {/* Chat Header */}
              <div className="bg-slate-900/80 p-5 border-b border-slate-800 flex items-center gap-4 backdrop-blur-md">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF8A2B] to-[#FF6B00] flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-[#FF8A2B]/50">
                    D
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-slate-900 rounded-full flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-[#FF8A2B] rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">
                    DEDA Assistant
                  </h3>
                  <p className="text-[#FF8A2B] text-xs font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Always Active
                  </p>
                </div>
              </div>

              {/* Chat Area */}
              <div className="p-6 space-y-6 h-[450px] overflow-y-auto bg-slate-900/50 scrollbar-hide">
                {/* Message 1 */}
                <motion.div initial={{
                opacity: 0,
                y: 10
              }} whileInView={{
                opacity: 1,
                y: 0
              }} transition={{
                delay: 0.2
              }} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 text-xs shrink-0 border border-slate-700">
                    You
                  </div>
                  <div className="bg-slate-800 text-slate-200 p-4 rounded-2xl rounded-tl-none text-sm max-w-[85%] shadow-sm border border-slate-700/50">
                    I need to send an invoice to Client X for web design
                    services. Total is ₦150,000.
                  </div>
                </motion.div>

                {/* Message 2 */}
                <motion.div initial={{
                opacity: 0,
                y: 10
              }} whileInView={{
                opacity: 1,
                y: 0
              }} transition={{
                delay: 0.6
              }} className="flex gap-4 flex-row-reverse">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF8A2B] to-[#FF6B00] flex items-center justify-center text-white text-xs shrink-0 shadow-lg shadow-[#FF8A2B]/50">
                    D
                  </div>
                  <div className="bg-[#FF8A2B]/10 border border-[#FF8A2B]/20 text-white p-4 rounded-2xl rounded-tr-none text-sm max-w-[85%] shadow-sm">
                    <p className="mb-3">
                      I can help with that! Here's a draft invoice:
                    </p>
                    <div className="bg-slate-950/50 rounded-lg p-3 mb-3 border border-[#FF8A2B]/10 text-xs font-mono text-[#FFB84D]/80">
                      INV-0023
                      <br />
                      To: Client X<br />
                      Service: Web Design
                      <br />
                      Amount: ₦150,000.00
                    </div>
                    <p>
                      Would you like me to email this directly or generate a PDF
                      link?
                    </p>
                  </div>
                </motion.div>

                {/* Message 3 */}
                <motion.div initial={{
                opacity: 0,
                y: 10
              }} whileInView={{
                opacity: 1,
                y: 0
              }} transition={{
                delay: 1.2
              }} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 text-xs shrink-0 border border-slate-700">
                    You
                  </div>
                  <div className="bg-slate-800 text-slate-200 p-4 rounded-2xl rounded-tl-none text-sm max-w-[85%] shadow-sm border border-slate-700/50">
                    Generate PDF link please. Also, what's the VAT on this?
                  </div>
                </motion.div>

                {/* Message 4 (Typing) */}
                <motion.div initial={{
                opacity: 0,
                y: 10
              }} whileInView={{
                opacity: 1,
                y: 0
              }} transition={{
                delay: 1.8
              }} className="flex gap-4 flex-row-reverse">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF8A2B] to-[#FF6B00] flex items-center justify-center text-white text-xs shrink-0 shadow-lg shadow-[#FF8A2B]/50">
                    D
                  </div>
                  <div className="bg-[#FF8A2B]/10 border border-[#FF8A2B]/20 p-4 rounded-2xl rounded-tr-none max-w-[85%] flex gap-1.5 items-center h-12">
                    <span className="w-2 h-2 bg-[#FF8A2B] rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-[#FF8A2B] rounded-full animate-bounce delay-75"></span>
                    <span className="w-2 h-2 bg-[#FF8A2B] rounded-full animate-bounce delay-150"></span>
                  </div>
                </motion.div>
              </div>

              {/* Input Area */}
              <div className="p-5 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md">
                <div className="relative">
                  <input type="text" placeholder="Ask DEDA anything..." className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3.5 px-5 pr-12 text-sm text-white focus:outline-none focus:border-[#FF8A2B] focus:ring-1 focus:ring-[#FF8A2B] placeholder:text-slate-600 shadow-inner" disabled />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#FF8A2B] rounded-lg text-white hover:bg-[#FF6B00] transition-colors shadow-lg shadow-[#FF8A2B]/50">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-[#FF8A2B]/20 rounded-full blur-3xl -z-10 animate-pulse delay-700"></div>
          </motion.div>
        </div>
      </div>
    </section>;
}