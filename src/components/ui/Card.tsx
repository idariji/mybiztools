import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
interface CardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  glass?: boolean;
  gradientBorder?: boolean;
}
export function Card({
  children,
  className = '',
  hoverEffect = false,
  glass = false,
  gradientBorder = false,
  ...props
}: CardProps) {
  return <motion.div className={`relative rounded-2xl overflow-hidden ${glass ? 'bg-white/70 backdrop-blur-lg border border-white/50 shadow-xl shadow-slate-200/50' : 'bg-white border border-slate-100 shadow-lg shadow-slate-200/40'} ${className}`} whileHover={hoverEffect ? {
    y: -8,
    boxShadow: '0 20px 40px -10px rgba(16, 185, 129, 0.15)'
  } : {}} transition={{
    type: 'spring',
    stiffness: 300,
    damping: 20
  }} {...props}>
      {gradientBorder && <div className="absolute inset-0 p-[1px] rounded-2xl bg-gradient-to-br from-emerald-400/30 via-transparent to-amber-400/30 pointer-events-none" />}
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>;
}