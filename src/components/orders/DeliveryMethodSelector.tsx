import React, { useState } from 'react';
import { Truck, Package, AlertTriangle, X } from 'lucide-react';

interface DeliveryMethodSelectorProps {
  value: 'delivery' | 'collection';
  onChange: (method: 'delivery' | 'collection') => void;
  deliveryDate?: Date;
  collectionDate?: Date;
  onDateChange: (type: 'delivery' | 'collection', date?: Date) => void;
}

function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  newMethod 
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  newMethod: 'delivery' | 'collection';
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

        <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl transition-all">
          <div className="absolute right-4 top-4">
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-4 flex items-center">
            <AlertTriangle className="h-6 w-6 text-yellow-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Change Delivery Method
            </h2>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Are you sure you want to change the delivery method to {newMethod}? 
            This will clear any previously set {newMethod === 'delivery' ? 'collection' : 'delivery'} date.
          </p>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Confirm Change
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DeliveryMethodSelector({
  value,
  onChange,
  deliveryDate,
  collectionDate,
  onDateChange
}: DeliveryMethodSelectorProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingMethod, setPendingMethod] = useState<'delivery' | 'collection' | null>(null);

  const handleMethodClick = (method: 'delivery' | 'collection') => {
    if (method === value) return;
    setPendingMethod(method);
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    if (pendingMethod) {
      onChange(pendingMethod);
      // Clear the date for the previous method
      onDateChange(pendingMethod === 'delivery' ? 'collection' : 'delivery', undefined);
    }
    setShowConfirmation(false);
    setPendingMethod(null);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => handleMethodClick('delivery')}
          className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
            value === 'delivery'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
          }`}
        >
          <Truck className="h-6 w-6 mb-2" />
          <span className="text-sm font-medium">Delivery</span>
        </button>

        <button
          type="button"
          onClick={() => handleMethodClick('collection')}
          className={`flex flex-col items-center justify-center p-4 rounded-lg border ${
            value === 'collection'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
          }`}
        >
          <Package className="h-6 w-6 mb-2" />
          <span className="text-sm font-medium">Collection</span>
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {value === 'delivery' ? 'Delivery Date' : 'Collection Date'}
        </label>
        <input
          type="date"
          value={value === 'delivery' 
            ? deliveryDate?.toISOString().split('T')[0] || ''
            : collectionDate?.toISOString().split('T')[0] || ''
          }
          onChange={(e) => onDateChange(
            value,
            e.target.value ? new Date(e.target.value) : undefined
          )}
          min={new Date().toISOString().split('T')[0]}
          className="modern-input mt-1"
        />
      </div>

      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => {
          setShowConfirmation(false);
          setPendingMethod(null);
        }}
        onConfirm={handleConfirm}
        newMethod={pendingMethod || 'delivery'}
      />
    </div>
  );
}