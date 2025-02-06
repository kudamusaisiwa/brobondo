import React from 'react';
import { LayoutGrid, Table } from 'lucide-react';

interface ViewToggleProps {
  view: 'grid' | 'table';
  onViewChange: (view: 'grid' | 'table') => void;
}

export default function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
      <button
        onClick={() => onViewChange('grid')}
        className={`p-1.5 rounded-md transition-colors ${
          view === 'grid'
            ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
      >
        <LayoutGrid className="h-5 w-5" />
      </button>
      <button
        onClick={() => onViewChange('table')}
        className={`p-1.5 rounded-md transition-colors ${
          view === 'table'
            ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
      >
        <Table className="h-5 w-5" />
      </button>
    </div>
  );
}
