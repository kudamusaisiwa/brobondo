import React from 'react';

interface ProfitMarginBadgeProps {
  margin: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function ProfitMarginBadge({ margin, size = 'md' }: ProfitMarginBadgeProps) {
  const getColor = (margin: number) => {
    if (margin >= 40) return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
    if (margin >= 30) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
    if (margin >= 20) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
    return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
  };

  const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-xs';
      case 'lg':
        return 'px-4 py-2 text-base';
      default:
        return 'px-2.5 py-1 text-sm';
    }
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${getColor(margin)} ${getSizeClasses(size)}`}>
      {margin.toFixed(1)}% margin
    </span>
  );
}