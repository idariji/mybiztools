import React from 'react';
import { motion } from 'framer-motion';
import { FileWarning, Calculator, CreditCard, Users, ArrowRight } from 'lucide-react';
import { Card } from '../ui/Card';
const problems = [{
  icon: FileWarning,
  title: 'Document Chaos',
  description: 'Drowning in paper receipts, lost invoices, and disorganized filing systems that slow you down.',
  color: 'text-red-500',
  gradient: 'from-red-500/20 to-orange-500/20',
  border: 'group-hover:border-red-200'
}, {
  icon: Calculator,
  title: 'Tax Headaches',
  description: 'Struggling to keep track of expenses and fearing the complexity of tax compliance.',
  color: 'text-amber-500',
  gradient: 'from-amber-500/20 to-yellow-500/20',
  border: 'group-hover:border-amber-200'
}, {
  icon: CreditCard,
  title: 'Design Costs',
  description: 'Paying designers high fees every time you need a simple business card or invoice design.',
  color: 'text-blue-500',
  gradient: 'from-blue-500/20 to-cyan-500/20',
  border: 'group-hover:border-blue-200'
}, {
  icon: Users,
  title: 'Admin Overload',
  description: 'Hiring full-time staff for administrative tasks that could be automated for a fraction of the cost.',
  color: 'text-purple-500',
  gradient: 'from-purple-500/20 to-pink-500/20',
  border: 'group-hover:border-purple-200'
}];
export function ProblemSection() {
  return <section className="py-16 sm:py-24 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-slate-50 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-16 gap-5 sm:gap-6">
          <div className="max-w-2xl">
            <motion.span initial={{
            opacity: 0,
            y: 10
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} className="text-[#FF8A2B] font-bold tracking-wider uppercase text-xs sm:text-sm mb-2 block">
              The Problem
            </motion.span>
            <motion.h2 initial={{
            opacity: 0,
            y: 10
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: 0.1
          }} className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight">
              Running a business is hard. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                The admin shouldn't be.
              </span>
            </motion.h2>
          </div>
          <motion.p initial={{
          opacity: 0,
          x: 20
        }} whileInView={{
          opacity: 1,
          x: 0
        }} viewport={{
          once: true
        }} transition={{
          delay: 0.2
        }} className="text-base sm:text-lg text-slate-600 max-w-md">
            Stop wasting time on manual processes. We solve the core pains of
            African entrepreneurs.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {problems.map((problem, index) => <motion.div key={index} initial={{
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
        }}>
              <Card className={`h-full p-5 sm:p-8 group transition-all duration-300 hover:shadow-xl ${problem.border}`}>
                <div className="flex items-start gap-4 sm:gap-6">
                  <div className={`relative p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br ${problem.gradient} shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <problem.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${problem.color}`} />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 sm:mb-3 group-hover:text-[#FF8A2B] transition-colors">
                      {problem.title}
                    </h3>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-3 sm:mb-4">
                      {problem.description}
                    </p>
                    <div className="flex items-center text-xs sm:text-sm font-bold text-slate-400 group-hover:text-[#FF8A2B] transition-colors">
                      <span className="mr-2">Learn more</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>)}
        </div>
      </div>
    </section>;
}
