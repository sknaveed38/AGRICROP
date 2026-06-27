import React from 'react';
import GlassCard from './GlassCard';
import { useAnimatedCounter } from '../../hooks/useAnimatedCounter';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

/**
 * StatCard - Shows a single metric with an animated number and trend.
 */
export default function StatCard({ icon: Icon, label, value, trend, suffix = '', color = 'green' }) {
  const animatedValue = useAnimatedCounter(value, 1200);

  const colorClasses = {
    green: 'text-green-600 bg-green-50 border-green-200/50',
    blue: 'text-blue-600 bg-blue-50 border-blue-200/50',
    orange: 'text-orange-600 bg-orange-50 border-orange-200/50',
    red: 'text-red-600 bg-red-50 border-red-200/50',
    brown: 'text-amber-800 bg-amber-50 border-amber-200/50',
  };

  const selectedColor = colorClasses[color] || colorClasses.green;

  return (
    <GlassCard hover className="flex items-center space-x-4 border-l-4 border-l-green-600">
      <div className={`p-4 rounded-xl border ${selectedColor}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-500 truncate">{label}</p>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-gray-900">
            {animatedValue}
            <span className="text-lg font-medium ml-0.5">{suffix}</span>
          </span>
          {trend !== undefined && (
            <span className={`inline-flex items-center text-xs font-semibold ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? <FiTrendingUp className="mr-0.5" /> : <FiTrendingDown className="mr-0.5" />}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
