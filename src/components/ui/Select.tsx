import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'value'> {
  label?: string;
  error?: string;
  options: (SelectOption | string)[];
  value?: string;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, value, className = '', placeholder = 'Select...', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            value={value || ''}
            className={`
              w-full px-4 py-2.5 text-base appearance-none
              bg-white dark:bg-gray-800
              border border-gray-300 dark:border-gray-600
              rounded-lg
              text-gray-900 dark:text-gray-100
              focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
              focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              cursor-pointer
              ${error ? 'border-red-500 dark:border-red-400' : ''}
              ${className}
            `}
            {...props}
          >
            <option value="" disabled>
              {placeholder}
            </option>
            {options.map((option, index) => {
              const value = typeof option === 'string' ? option : option.value;
              const label = typeof option === 'string' ? option : option.label;
              return (
                <option key={`${value}-${index}`} value={value}>
                  {label}
                </option>
              );
            })}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-500 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
