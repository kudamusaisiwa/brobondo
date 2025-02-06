import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', value, ...props }, ref) => {
    // Convert null value to empty string
    const inputValue = value === null ? '' : value;
    return (
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
          {label}
        </label>
        <input
          ref={ref}
          className={`
            w-full px-4 py-2.5 text-base
            bg-white dark:bg-gray-800
            border border-gray-300 dark:border-gray-600
            rounded-lg
            placeholder-gray-400 dark:placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
            focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500 dark:border-red-400' : ''}
            ${className}
          `}
          {...props}
          value={inputValue}
        />
        {error && (
          <p className="mt-1 text-sm text-red-500 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
