import React from 'react';
import { Button } from '../ui/Button';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, PlayCircle, Zap } from 'lucide-react';
import { DashboardMockup } from '../dashboard/DashboardMockup';
export function Hero() {
  const {
    scrollY
  } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 100]);
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 30
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 50,
        damping: 20
      }
    }
  };
  return <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-[#F2F4F7]">
      {/* Animated Background Mesh */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <motion.div animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 10, 0]
      }} transition={{
        duration: 20,
        repeat: Infinity,
        ease: 'linear'
      }} className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-[#FFD6C2]/40 to-[#FFE6D6]/40 blur-[100px]" />
        <motion.div animate={{
        scale: [1, 1.3, 1],
        rotate: [0, -15, 0]
      }} transition={{
        duration: 25,
        repeat: Infinity,
        ease: 'linear'
      }} className="absolute top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-[#FF8A2B]/10 to-[#F6F0FF]/40 blur-[100px]" />

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div className="max-w-5xl mx-auto text-center" variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants} className="flex justify-center mb-6 sm:mb-8">
            <motion.span whileHover={{
            scale: 1.05
          }} className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md text-[#FF8A2B] text-xs sm:text-sm font-bold border border-[#FFD6C2] shadow-sm cursor-default">
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FF8A2B] fill-[#FF8A2B]" />
              <span className="bg-gradient-to-r from-[#FF8A2B] to-[#E56A00] bg-clip-text text-transparent">
                Trusted by 10,000+ African Entrepreneurs
              </span>
            </motion.span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-[#1F2D3D] mb-6 sm:mb-8 leading-[1.1]">
            Run Your Business <br className="hidden sm:block" />
            <span className="relative inline-block">
              <span className="absolute -inset-1 bg-gradient-to-r from-[#FFD6C2]/50 to-[#FFE6D6]/50 blur-lg rounded-lg"></span>
              <span className="relative bg-gradient-to-r from-[#FF8A2B] via-[#FF6B00] to-[#FF8A2B] bg-clip-text text-transparent bg-300% animate-gradient">
                Smarter & Faster.
              </span>
            </span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-base sm:text-xl text-[#1F2D3D]/80 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed font-medium px-2 sm:px-0">
            The all-in-one operating system for African businesses. Invoices,
            payments, taxes, and AI strategy—all in one place.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-12 sm:mb-20">
            <Button size="lg" className="w-full sm:w-auto sm:min-w-[180px] text-base sm:text-lg bg-[#FF8A2B] hover:bg-[#E56A00] text-white shadow-lg shadow-[#FF8A2B]/30 border-none" onClick={() => window.location.href = '/login?signup=true'}>
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto sm:min-w-[180px] text-base sm:text-lg group bg-white/50 backdrop-blur-sm border-[#FFD6C2] text-[#1F2D3D] hover:border-[#FF8A2B] hover:text-[#FF8A2B]"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              <PlayCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-[#FF8A2B] group-hover:scale-110 transition-transform" />
              Watch Demo
            </Button>
          </motion.div>
        </motion.div>

        {/* Realistic Dashboard Mockup */}
        <motion.div style={{
        y: y1
      }} initial={{
        opacity: 0,
        rotateX: 10,
        y: 100
      }} animate={{
        opacity: 1,
        rotateX: 0,
        y: 0
      }} transition={{
        duration: 1,
        delay: 0.4,
        type: 'spring',
        bounce: 0.2
      }} className="relative max-w-7xl mx-auto perspective-1000">
          <DashboardMockup />

          {/* Floating Elements */}
          <motion.div className="absolute -right-4 md:-right-12 top-20 bg-white p-3 sm:p-4 rounded-xl shadow-xl shadow-[#FF8A2B]/10 hidden lg:block z-30 border border-[#FFD6C2]/30" animate={{
          y: [0, -20, 0]
        }} transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut'
        }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-[#FFD6C2]/30 flex items-center justify-center text-[#FF8A2B]">
                <Zap size={16} />
              </div>
              <div>
                <div className="text-xs text-[#1F2D3D]/50">AI Insight</div>
                <div className="text-sm font-bold text-[#1F2D3D]">
                  Tax Saving Found
                </div>
              </div>
            </div>
            <div className="text-[#2EA44F] font-bold text-lg">+ ₦150,000</div>
          </motion.div>
        </motion.div>
      </div>
    </section>;
}
