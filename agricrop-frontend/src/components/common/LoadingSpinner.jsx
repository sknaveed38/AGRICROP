import React from 'react';
import { motion } from 'framer-motion';
import { FiDatabase } from 'react-icons/fi';

/**
 * LoadingSpinner - Premium animated plant growth spinner.
 */
export default function LoadingSpinner({ message = 'Analyzing agricultural data...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Outer rotating pulse ring */}
        <motion.div
          className="absolute w-full h-full rounded-full border-4 border-dashed border-green-500/30"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
        />
        
        {/* Inner glow circle */}
        <motion.div
          className="absolute w-16 h-16 bg-green-100 rounded-full flex items-center justify-center"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        />

        {/* Growth SVG */}
        <svg className="w-10 h-10 text-green-600 z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <motion.path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-11.314l.707.707m11.314 11.314l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
          />
        </svg>
      </div>
      
      <div className="space-y-1">
        <h4 className="text-lg font-semibold text-gray-800">Processing</h4>
        <p className="text-sm text-gray-500 max-w-xs">{message}</p>
      </div>
    </div>
  );
}
