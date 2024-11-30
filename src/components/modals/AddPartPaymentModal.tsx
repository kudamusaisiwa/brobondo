import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { PaymentMethod } from '../../types';

interface AddPartPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: number, method: PaymentMethod, notes?: string) => void;
  remainingAmount: number;
}

export default function AddPartPaymentModal({
  isOpen,
  onClose,
  onConfirm,
  remainingAmount
}: AddPartPaymentModalProps) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('bank_transfer');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const paymentAmount = parseFloat(amount);
    if (paymentAmount > 0 && paymentAmount <= remainingAmount) {
      onConfirm(paymentAmount, method, notes);
      setAmount('');
      setMethod('bank_transfer');
      setNotes('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

        <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
          <div className="absolute right-4 top-4">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="h-6 w-6" />
            </button>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Part Payment</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Amount (Remaining: ${remainingAmount.toFixed(2)})
              </label>
              <input
                type="number"
                required
                min="0.01"
                max={remainingAmount}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="modern-input mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Payment Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                className="modern-select mt-1"
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="ecocash">EcoCash</option>
                <option value="innbucks">InnBucks</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="modern-textarea mt-1"
                rows={3}
                placeholder="Optional payment notes"
              />
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Add Payment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}