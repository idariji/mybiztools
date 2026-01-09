import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
const testimonials = [{
  id: 1,
  content: 'MyBizTools saved me hours every week. The invoice generator alone is worth it! I can finally focus on my design work instead of chasing payments.',
  author: 'Sarah O.',
  role: 'Freelance Designer',
  location: 'Lagos, Nigeria',
  image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
}, {
  id: 2,
  content: 'DEDA is a game changer. I asked it about tax compliance for my new branch in Ghana, and it gave me a breakdown in seconds. Incredible.',
  author: 'Kwame A.',
  role: 'Retail Business Owner',
  location: 'Accra, Ghana',
  image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kwame'
}, {
  id: 3,
  content: 'The budget tracker helped us identify leaks in our operational costs. We reduced expenses by 15% in the first month alone.',
  author: 'Chidi N.',
  role: 'Logistics Manager',
  location: 'Abuja, Nigeria',
  image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chidi'
}, {
  id: 4,
  content: 'Finally, a tool that understands African business context. The multi-currency support is exactly what I needed for my cross-border trade.',
  author: 'Zainab M.',
  role: 'Import/Export Merchant',
  location: 'Nairobi, Kenya',
  image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zainab'
}];
export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const next = () => {
    setCurrentIndex(prev => (prev + 1) % testimonials.length);
  };
  const prev = () => {
    setCurrentIndex(prev => (prev - 1 + testimonials.length) % testimonials.length);
  };
  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, []);
  return <section id="testimonials" className="py-32 bg-slate-50 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
              Trusted by Entrepreneurs
            </h2>
            <p className="text-lg text-slate-600">
              Join thousands of businesses growing with MyBizTools.
            </p>
          </div>

          <div className="relative bg-white rounded-3xl shadow-2xl shadow-slate-200/50 p-8 md:p-16 border border-slate-100">
            {/* Decorative Quote Mark */}
            <div className="absolute top-10 left-10 text-orange-100 opacity-50">
              <Quote size={120} fill="currentColor" />
            </div>

            <div className="relative z-10 min-h-[280px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div key={currentIndex} initial={{
                opacity: 0,
                x: 50
              }} animate={{
                opacity: 1,
                x: 0
              }} exit={{
                opacity: 0,
                x: -50
              }} transition={{
                duration: 0.5,
                ease: 'easeOut'
              }} className="text-center max-w-3xl">
                  <p className="text-2xl md:text-3xl text-slate-800 font-medium leading-relaxed mb-10 tracking-tight">
                    "{testimonials[currentIndex].content}"
                  </p>

                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-slate-100 mb-4 border-2 border-[#FF8A2B] p-1">
                      <img src={testimonials[currentIndex].image} alt={testimonials[currentIndex].author} className="w-full h-full rounded-full bg-slate-200" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-900">
                      {testimonials[currentIndex].author}
                    </h4>
                    <p className="text-[#FF8A2B] font-medium">
                      {testimonials[currentIndex].role}
                    </p>
                    <p className="text-slate-400 text-sm mt-1">
                      {testimonials[currentIndex].location}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="flex justify-between items-center absolute top-1/2 -translate-y-1/2 left-4 right-4 md:-left-6 md:-right-6 pointer-events-none">
              <button onClick={prev} className="pointer-events-auto p-3 rounded-full bg-white shadow-lg border border-slate-100 text-slate-600 hover:text-[#FF8A2B] hover:scale-110 transition-all" aria-label="Previous testimonial">
                <ChevronLeft size={24} />
              </button>
              <button onClick={next} className="pointer-events-auto p-3 rounded-full bg-white shadow-lg border border-slate-100 text-slate-600 hover:text-[#FF8A2B] hover:scale-110 transition-all" aria-label="Next testimonial">
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-8 absolute bottom-8 left-0 right-0">
              {testimonials.map((_, idx) => <button key={idx} onClick={() => setCurrentIndex(idx)} className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-[#FF8A2B]' : 'w-2 bg-slate-200 hover:bg-slate-300'}`} aria-label={`Go to testimonial ${idx + 1}`} />)}
            </div>
          </div>
        </div>
      </div>
    </section>;
}