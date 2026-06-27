import React from 'react';
import { motion } from 'framer-motion';

/**
 * GlassCard - A premium glassmorphism card component.
 * Supports optional hover scaling/shadow animations.
 */
export default function GlassCard({ children, className = '', hover = true, onClick }) {
  const CardComponent = onClick ? motion.div : 'div';
  
  const hoverProps = onClick || hover ? {
    whileHover: { y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' },
    transition: { type: 'spring', stiffness: 300, damping: 20 }
  } : {};

  return (
    <CardComponent
      onClick={onClick}
      {...hoverProps}
      className={`backdrop-blur-md bg-white/70 border border-white/20 rounded-2xl shadow-lg p-6 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </CardComponent>
  );
}
