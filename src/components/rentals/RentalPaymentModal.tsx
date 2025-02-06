import React, { useState } from 'react';
import { X } from 'lucide-react';
import { usePaymentStore } from '../../store/paymentStore';
import { useAuthStore } from '../../store/authStore';
import { RentalSchedule } from '../../store/rentalStore';

interface RentalPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: RentalSchedule;
  onPaymentRecorded: () => void;
}

export default function RentalPaymentModal({
  isOpen,
  onClose,
  schedule,
  onPaymentRecorded
}: RentalPaymentModalProps) {
  const { addPayment, loading } = usePaymentStore();
  const auth = useAuthStore();
  console.log('Auth state:', auth);
  console.log('User:', auth.user);
  const [amount, setAmount] = useState(schedule.monthlyRent);
  const [method, setMethod] = useState<'cash' | 'bank_transfer' | 'card'>('bank_transfer');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date());

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.user?.uid) {
      console.error('User not authenticated');
      return;
    }
    console.log('Creating payment with user ID:', auth.user.uid);

    try {
      await addPayment({
        orderId: schedule.id, // Using schedule ID as order ID
        amount,
        method,
        reference,
        notes,
        date,
        createdBy: auth.user.uid
      });
      onPaymentRecorded();
      onClose();
    } catch (error) {
      console.error('Error recording payment:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500/75 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-2xl transition-all">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Record Payment</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Recording payment for {schedule.propertyId}
            </p>
          </div>

          {/* Close button */}
          <div className="absolute right-4 top-4">
            <button
              type="button"
              className="rounded-full p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-colors"
              onClick={onClose}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
              
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
            <div className="space-y-2">
              <label className="block text-base font-medium text-gray-700 dark:text-gray-300">
                Amount
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="block w-full h-12 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-lg transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-base font-medium text-gray-700 dark:text-gray-300">
                Payment Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as typeof method)}
                className="block w-full h-12 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-lg appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNyA3TDEwIDEwTDEzIDciIHN0cm9rZT0iIzZCN0M5MyIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=')] bg-no-repeat bg-[center_right_1rem] transition-colors"
                required
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-base font-medium text-gray-700 dark:text-gray-300">
                Reference Number
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="block w-full h-12 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-lg transition-colors"
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-base font-medium text-gray-700 dark:text-gray-300">
                Payment Date
              </label>
              <input
                type="date"
                value={date.toISOString().split('T')[0]}
                onChange={(e) => setDate(new Date(e.target.value))}
                className="block w-full h-12 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-lg transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-base font-medium text-gray-700 dark:text-gray-300">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="block w-full p-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-lg transition-colors"
                placeholder="Optional"
              />
            </div>

            {/* Footer with action buttons */}
            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="mt-3 sm:mt-0 w-full sm:w-auto px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium text-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary-600 text-white font-medium text-lg hover:bg-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Recording...' : 'Record Payment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
