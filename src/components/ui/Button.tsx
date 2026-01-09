import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glow';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}
export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'relative inline-flex items-center justify-center rounded-xl font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none overflow-hidden';
  const variants = {
    primary: 'bg-[#1e3a8a] text-white hover:bg-[#1e40af] focus:ring-[#1e3a8a] shadow-lg shadow-[#1e3a8a]/30 hover:shadow-[#1e3a8a]/50',
    secondary: 'bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-900 shadow-lg shadow-slate-900/20',
    outline: 'border-2 border-slate-200 bg-transparent hover:bg-slate-50 text-slate-900 focus:ring-slate-500 hover:border-[#1e3a8a] hover:text-[#1e3a8a]',
    ghost: 'bg-transparent hover:bg-[#1e3a8a]/10 text-slate-700 hover:text-[#1e3a8a] focus:ring-[#1e3a8a]',
    glow: 'bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white hover:from-[#1e40af] hover:to-[#3b82f6] shadow-lg shadow-[#1e3a8a]/40 hover:shadow-[#1e3a8a]/60 border border-white/20'
  };
  const sizes = {
    sm: 'h-9 px-4 text-sm',
    md: 'h-12 px-6 text-base',
    lg: 'h-14 px-8 text-lg'
  };
  return <motion.button whileHover={{
    scale: 1.02,
    y: -1
  }} whileTap={{
    scale: 0.98
  }} className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {/* Shine effect for primary/glow variants */}
      {(variant === 'primary' || variant === 'glow') && <motion.div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" initial={{
      x: '-100%'
    }} whileHover={{
      x: '200%'
    }} transition={{
      duration: 0.7,
      ease: 'easeInOut'
    }} />}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>;
}