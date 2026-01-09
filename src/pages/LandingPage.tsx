import React, { useEffect, useState } from 'react';
import { Hero } from '../components/landing/Hero';
import { ProblemSection } from '../components/landing/ProblemSection';
import { SolutionsGrid } from '../components/landing/SolutionsGrid';
import { DedaShowcase } from '../components/landing/DedaShowcase';
import { ProductDemo } from '../components/landing/ProductDemo';
import { Pricing } from '../components/landing/Pricing';
import { Testimonials } from '../components/landing/Testimonials';
import { FAQ } from '../components/landing/FAQ';
import { Footer } from '../components/landing/Footer';
import { Button } from '../components/ui/Button';
import { Hexagon, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
export function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };
  return <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sticky Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-slate-900">
            <Hexagon className="fill-[#1e3a8a] text-[#1e3a8a]" />
            MyBizTools
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="text-sm font-medium text-slate-600 hover:text-[#1e3a8a] transition-colors cursor-pointer">
              Features
            </a>
            <a href="#pricing" onClick={(e) => scrollToSection(e, 'pricing')} className="text-sm font-medium text-slate-600 hover:text-[#1e3a8a] transition-colors cursor-pointer">
              Pricing
            </a>
            <a href="#testimonials" onClick={(e) => scrollToSection(e, 'testimonials')} className="text-sm font-medium text-slate-600 hover:text-[#1e3a8a] transition-colors cursor-pointer">
              Testimonials
            </a>
            <a href="#faq" onClick={(e) => scrollToSection(e, 'faq')} className="text-sm font-medium text-slate-600 hover:text-[#1e3a8a] transition-colors cursor-pointer">
              FAQ
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => window.location.href = '/login'}>
              Log In
            </Button>
            <Button size="sm" onClick={() => window.location.href = '/login'}>
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 text-slate-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu />
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && <motion.div initial={{
          opacity: 0,
          height: 0
        }} animate={{
          opacity: 1,
          height: 'auto'
        }} exit={{
          opacity: 0,
          height: 0
        }} className="md:hidden bg-white border-b border-slate-100 overflow-hidden">
              <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
                <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="text-sm font-medium text-slate-600 py-2 cursor-pointer">
                  Features
                </a>
                <a href="#pricing" onClick={(e) => scrollToSection(e, 'pricing')} className="text-sm font-medium text-slate-600 py-2 cursor-pointer">
                  Pricing
                </a>
                <a href="#testimonials" onClick={(e) => scrollToSection(e, 'testimonials')} className="text-sm font-medium text-slate-600 py-2 cursor-pointer">
                  Testimonials
                </a>
                <a href="#faq" onClick={(e) => scrollToSection(e, 'faq')} className="text-sm font-medium text-slate-600 py-2 cursor-pointer">
                  FAQ
                </a>
                <Button variant="ghost" className="justify-start w-full" onClick={() => window.location.href = '/login'}>
                  Log In
                </Button>
                <Button className="w-full" onClick={() => window.location.href = '/login'}>
                  Get Started
                </Button>
              </div>
            </motion.div>}
        </AnimatePresence>
      </header>

      <main>
        <Hero />
        <ProblemSection />
        <SolutionsGrid />
        <DedaShowcase />
        <ProductDemo />
        <Pricing />
        <Testimonials />
        <FAQ />
      </main>

      <Footer />
    </div>;
}