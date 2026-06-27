import React from 'react';
import { motion } from 'framer-motion';

/**
 * RiskMeter - Semi-circle SVG dial gauge representing soil moisture risk level.
 * Values: 0 - 100 (moisture level).
 */
export default function RiskMeter({ value = 50 }) {
  // Normalize value to clamp it [0, 100]
  const pct = Math.max(0, Math.min(100, value));
  
  // Angle: -90 degrees (start, left) to +90 degrees (end, right)
  const angle = (pct / 100) * 180 - 90;

  // Decide colors and labels based on value ranges
  let color = '#E53E3E'; // Red (High risk)
  let status = 'High Drought Risk';
  let desc = 'Critical - immediate irrigation needed.';

  if (pct >= 50 && pct <= 75) {
    color = '#38A169'; // Green (Optimal)
    status = 'Optimal Moisture';
    desc = 'Perfect soil moisture for growth.';
  } else if (pct > 75) {
    color = '#3182CE'; // Blue (Excessive)
    status = 'Excessive Moisture';
    desc = 'Saturated soil. Monitor drainage.';
  } else if (pct >= 30 && pct < 50) {
    color = '#DD6B20'; // Orange (Medium)
    status = 'Moderate Moisture';
    desc = 'Drying soil. Schedule watering soon.';
  }

  return (
    <div className="flex flex-col items-center p-4 bg-white/40 rounded-2xl border border-white/20 shadow-sm max-w-sm">
      <div className="relative w-48 h-28 flex justify-center overflow-hidden">
        {/* Arc Background */}
        <svg width="180" height="90" viewBox="0 0 100 50" className="absolute bottom-0">
          {/* Base Arc */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Highlight Color Arc (for the segments) */}
          {/* Red Segment (0-30%) */}
          <path
            d="M 10 50 A 40 40 0 0 1 34.6 18.2"
            fill="none"
            stroke="#FEB2B2"
            strokeWidth="8"
          />
          {/* Orange Segment (30-50%) */}
          <path
            d="M 34.6 18.2 A 40 40 0 0 1 50 10"
            fill="none"
            stroke="#FEEBC8"
            strokeWidth="8"
          />
          {/* Green Segment (50-75%) */}
          <path
            d="M 50 10 A 40 40 0 0 1 78.2 21.8"
            fill="none"
            stroke="#C6F6D5"
            strokeWidth="8"
          />
          {/* Blue Segment (75-100%) */}
          <path
            d="M 78.2 21.8 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="#BEE3F8"
            strokeWidth="8"
          />
        </svg>

        {/* Needle Pin */}
        <div className="absolute bottom-0 w-4 h-4 bg-gray-800 rounded-full z-10 border border-white shadow-md" />

        {/* Animated Needle */}
        <motion.div
          className="absolute bottom-0 w-2 h-20 bg-gray-800 origin-bottom rounded-t-full shadow-lg"
          style={{ bottom: 2 }}
          initial={{ rotate: -90 }}
          animate={{ rotate: angle }}
          transition={{ type: 'spring', stiffness: 80, damping: 15 }}
        />
      </div>

      <div className="text-center mt-4 space-y-1">
        <span className="text-3xl font-extrabold text-gray-900">{value}%</span>
        <h4 className="text-sm font-bold mt-1" style={{ color }}>{status}</h4>
        <p className="text-xs text-gray-500 max-w-xs">{desc}</p>
      </div>
    </div>
  );
}
