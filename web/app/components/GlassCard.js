'use client';
import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', animate = true, ...props }) {
  const Comp = animate ? motion.div : 'div';
  const animProps = animate ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: { duration: 0.3 },
  } : {};

  return (
    <Comp className={`glass rounded-3xl p-6 ${className}`} {...animProps} {...props}>
      {children}
    </Comp>
  );
}
