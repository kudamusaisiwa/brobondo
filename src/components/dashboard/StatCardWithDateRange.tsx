import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface StatCardWithDateRangeProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon?: LucideIcon;
  iconColor?: string;
  startDate: Date;
  endDate: Date;
  previousValue?: string | number;
  details?: {
    label: string;
    value: string;
  }[];
}

export default function StatCardWithDateRange({ 
  title, 
  value, 
  subValue,
  icon: Icon,
  iconColor = 'text-blue-500',
  startDate,
  endDate,
  previousValue,
  details
}: StatCardWithDateRangeProps) {
  // Calculate percentage change
  const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;
  const numericPrevValue = typeof previousValue === 'number' ? previousValue : parseFloat(previousValue || '0') || 0;
  const percentageChange = numericPrevValue === 0 ? 0 : ((numericValue - numericPrevValue) / numericPrevValue) * 100;
  const trend = percentageChange >= 0 ? 'up' : 'down';

  return (
    <div className="relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        {Icon && <Icon className={`h-5 w-5 ${iconColor}`} />}
      </div>
      <div className="mt-2 flex items-baseline">
        <p className="text-3xl font-semibold text-gray-900 dark:text-white">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {subValue && (
          <p className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            ({subValue})
          </p>
        )}
      </div>
      {previousValue !== undefined && (
        <div className="mt-4 flex items-center">
          {trend === 'up' ? (
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          )}
          <span className={`text-sm font-medium ${
            trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {Math.abs(percentageChange).toFixed(1)}%
          </span>
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            vs. previous period
          </span>
        </div>
      )}
      {details && (
        <div className="mt-4 space-y-1">
          {details.map((detail, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">{detail.label}</span>
              <span className="font-medium text-gray-900 dark:text-white">{detail.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
