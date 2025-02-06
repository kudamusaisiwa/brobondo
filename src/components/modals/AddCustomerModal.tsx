import React from 'react';
import { X } from 'lucide-react';
import CustomerRegistrationForm from '../forms/CustomerRegistrationForm';
import type { Customer } from '../../types';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'totalOrders' | 'totalRevenue'>) => void;
}

export default function AddCustomerModal({ isOpen, onClose, onAdd }: AddCustomerModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

        <div className="relative w-full max-w-4xl transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl transition-all">
          <div className="absolute right-4 top-4">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Register New Buyer</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Please fill in all required fields to register a new buyer.
            </p>
          </div>

          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            <CustomerRegistrationForm onSubmit={onAdd} onCancel={onClose} />
          </div>
        </div>
      </div>
    </div>
  );
}