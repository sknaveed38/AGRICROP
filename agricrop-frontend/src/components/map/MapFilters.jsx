import React from 'react';
import { FiFilter, FiRefreshCw } from 'react-icons/fi';
import Button from '../common/Button';

const CROP_TYPES = [
  'Rice',
  'Wheat',
  'Corn',
  'Soybean',
  'Cotton',
  'Sugarcane',
  'Potato',
  'Tomato',
  'Onion',
  'Other',
];

const DISEASE_TYPES = [
  'Bacterial Blight',
  'Brown Spot',
  'Leaf Blast',
  'Leaf Smut',
  'Tungro',
  'Sheath Blight',
  'Rice Hispa',
  'Healthy',
];

const RISK_LEVELS = ['Low', 'Medium', 'High'];

const MapFilters = ({ filters = {}, onFilterChange, onApply, onReset }) => {
  const handleChange = (field, value) => {
    if (onFilterChange) {
      onFilterChange({ ...filters, [field]: value });
    }
  };

  const handleRiskToggle = (level) => {
    const currentLevels = filters.riskLevels || [];
    const updated = currentLevels.includes(level)
      ? currentLevels.filter((l) => l !== level)
      : [...currentLevels, level];
    handleChange('riskLevels', updated);
  };

  const riskColors = {
    Low: 'bg-green-50 border-green-300 text-green-700 peer-checked:bg-green-100 peer-checked:border-green-500',
    Medium: 'bg-orange-50 border-orange-300 text-orange-700 peer-checked:bg-orange-100 peer-checked:border-orange-500',
    High: 'bg-red-50 border-red-300 text-red-700 peer-checked:bg-red-100 peer-checked:border-red-500',
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/40 p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
        <div className="p-2 bg-green-50 rounded-lg">
          <FiFilter className="w-4 h-4 text-green-600" />
        </div>
        <h3 className="text-sm font-semibold text-gray-800">Map Filters</h3>
      </div>

      <div className="space-y-4">
        {/* Crop Type */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Crop Type
          </label>
          <select
            value={filters.cropType || ''}
            onChange={(e) => handleChange('cropType', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl
              focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400
              text-gray-700 transition-all duration-200 appearance-none cursor-pointer
              hover:border-gray-300"
          >
            <option value="">All Crops</option>
            {CROP_TYPES.map((crop) => (
              <option key={crop} value={crop}>
                {crop}
              </option>
            ))}
          </select>
        </div>

        {/* Disease Type */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Disease Type
          </label>
          <select
            value={filters.diseaseType || ''}
            onChange={(e) => handleChange('diseaseType', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl
              focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400
              text-gray-700 transition-all duration-200 appearance-none cursor-pointer
              hover:border-gray-300"
          >
            <option value="">All Diseases</option>
            {DISEASE_TYPES.map((disease) => (
              <option key={disease} value={disease}>
                {disease}
              </option>
            ))}
          </select>
        </div>

        {/* Risk Level */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">
            Risk Level
          </label>
          <div className="flex flex-wrap gap-2">
            {RISK_LEVELS.map((level) => {
              const isChecked = (filters.riskLevels || []).includes(level);
              return (
                <label key={level} className="relative cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleRiskToggle(level)}
                    className="peer sr-only"
                  />
                  <span
                    className={`inline-flex items-center px-3 py-1.5 text-xs font-medium
                      rounded-lg border transition-all duration-200
                      ${isChecked
                        ? riskColors[level]
                        : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                      }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full mr-1.5 ${
                        level === 'Low'
                          ? 'bg-green-500'
                          : level === 'Medium'
                          ? 'bg-orange-500'
                          : 'bg-red-500'
                      }`}
                    />
                    {level}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Start Date
          </label>
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => handleChange('startDate', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl
              focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400
              text-gray-700 transition-all duration-200 hover:border-gray-300"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            End Date
          </label>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => handleChange('endDate', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl
              focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400
              text-gray-700 transition-all duration-200 hover:border-gray-300"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          <Button
            onClick={onApply}
            className="flex-1 flex items-center justify-center gap-1.5"
          >
            <FiFilter className="w-3.5 h-3.5" />
            Apply
          </Button>
          <Button
            variant="outline"
            onClick={onReset}
            className="flex items-center justify-center gap-1.5 px-4"
          >
            <FiRefreshCw className="w-3.5 h-3.5" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MapFilters;
