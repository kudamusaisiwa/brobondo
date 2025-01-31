import React from 'react';
import { Plus, Upload, Download } from 'lucide-react';

interface CustomerListHeaderProps {
  onAddClick: () => void;
  onImportClick: () => void;
  onExportClick: () => void;
  canManageCustomers: boolean;
}

export default function CustomerListHeader({
  onAddClick,
  onImportClick,
  onExportClick,
  canManageCustomers
}: CustomerListHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white hidden sm:block">Customers</h1>
      {canManageCustomers && (
        <div className="flex space-x-2 sm:space-x-3">
          <button
            onClick={onImportClick}
            className="inline-flex items-center px-2 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            title="Import Customers"
          >
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline sm:ml-2">Import</span>
          </button>
          <button
            onClick={onExportClick}
            className="inline-flex items-center px-2 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            title="Export Customers"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline sm:ml-2">Export</span>
          </button>
          <button
            onClick={onAddClick}
            className="btn-primary inline-flex items-center"
            title="Add Customer"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline sm:ml-2">Add Customer</span>
          </button>
        </div>
      )}
    </div>
  );
}