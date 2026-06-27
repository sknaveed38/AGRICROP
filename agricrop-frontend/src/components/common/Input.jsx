import React from 'react';

/**
 * Input - Styled text input component with custom icon and error validation display.
 */
export default function Input({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon: Icon,
  required = false,
  className = '',
  ...props
}) {
  return (
    <div className={`flex flex-col space-y-1 w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={`w-full bg-white/80 border text-gray-900 rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white ${
            Icon ? 'pl-10' : ''
          } ${error ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:border-green-500'}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs font-medium text-red-500 pl-1">{error}</span>}
    </div>
  );
}
