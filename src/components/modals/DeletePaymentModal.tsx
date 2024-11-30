import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeletePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  paymentAmount: number;
  paymentReference?: string;
}

export default function DeletePaymentModal({
  isOpen,
  onClose,
  onConfirm,
  paymentAmount,
  paymentReference
}: DeletePaymentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

        <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl transition-all">
          <div className="absolute right-4 top-4">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-4 flex items-center">
            <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Delete Payment</h2>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Are you sure you want to delete this payment of{' '}
            <span className="font-medium text-gray-900 dark:text-white">
              ${paymentAmount.toFixed(2)}
            </span>
            {paymentReference && (
              <span>
                {' '}(Reference: <span className="font-medium">{paymentReference}</span>)
              </span>
            )}
            ? This action cannot be undone.
          </p>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              Delete Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}