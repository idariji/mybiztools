import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
const faqs = [{
  question: 'Is MyBizTools free?',
  answer: 'Yes! We offer a generous Free Starter plan that includes unlimited invoices, receipts, and basic tools. You only pay when you need advanced features like team accounts or unlimited AI access.'
}, {
  question: 'Is my data secure?',
  answer: 'Absolutely. We use bank-grade encryption to protect your financial data. Your information is stored securely and is never shared with third parties without your explicit consent.'
}, {
  question: 'Can I use it for my small business?',
  answer: "MyBizTools is specifically designed for small and medium businesses (SMEs), freelancers, and startups in Africa. Whether you're a solo consultant or a retail store with 10 employees, we have tools for you."
}, {
  question: 'Does it work for freelancers?',
  answer: 'Yes, freelancers love our Invoice and Quotation generators. It helps you look professional and get paid faster without the overhead of complex accounting software.'
}, {
  question: 'Is DEDA safe to use for tax advice?',
  answer: 'DEDA is trained on current tax laws and regulations, but it serves as an assistant, not a certified accountant. We recommend using DEDA for estimates and understanding rules, but always consulting a professional for final filings.'
}];
export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return <section id="faq" className="py-32 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-1">
            <div className="sticky top-32">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm font-bold mb-6">
                <HelpCircle className="w-4 h-4" />
                <span>Support</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">
                Frequently Asked <br /> Questions
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                Can't find the answer you're looking for? Chat with our support
                team.
              </p>
              <button className="text-[#FF8A2B] font-bold hover:underline">
                Contact Support →
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {faqs.map((faq, index) => <motion.div key={index} initial={{
            opacity: 0,
            y: 10
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: index * 0.1
          }} className={`border rounded-2xl overflow-hidden transition-all duration-300 ${openIndex === index ? 'border-[#FF8A2B]/30 shadow-lg shadow-[#FF8A2B]/5 bg-orange-50/10' : 'border-slate-200 bg-white'}`}>
                <button onClick={() => setOpenIndex(openIndex === index ? null : index)} className="w-full flex items-center justify-between p-6 text-left focus:outline-none">
                  <span className={`font-bold text-lg transition-colors ${openIndex === index ? 'text-[#FF8A2B]' : 'text-slate-900'}`}>
                    {faq.question}
                  </span>
                  <div className={`p-2 rounded-full transition-colors ${openIndex === index ? 'bg-orange-100 text-[#FF8A2B]' : 'bg-slate-100 text-slate-500'}`}>
                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                <AnimatePresence>
                  {openIndex === index && <motion.div initial={{
                height: 0,
                opacity: 0
              }} animate={{
                height: 'auto',
                opacity: 1
              }} exit={{
                height: 0,
                opacity: 0
              }} transition={{
                duration: 0.3,
                ease: 'easeInOut'
              }}>
                      <div className="p-6 pt-0 text-slate-600 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>}
                </AnimatePresence>
              </motion.div>)}
          </div>
        </div>
      </div>
    </section>;
}