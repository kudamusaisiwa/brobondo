import React, { useState } from 'react';
import { X, DollarSign } from 'lucide-react';
import type { Expense, ExpenseCategory, PaymentMethod } from '../../types';

interface EditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expenseId: string, expenseData: Partial<Expense>) => Promise<void>;
  expense: Expense;
}

export default function EditExpenseModal({
  isOpen,
  onClose,
  onSave,
  expense
}: EditExpenseModalProps) {
  const [formData, setFormData] = useState({
    description: expense.description,
    amount: expense.amount.toString(),
    category: expense.category,
    paymentMethod: expense.paymentMethod,
    reference: expense.reference || '',
    date: expense.date.toISOString().split('T')[0],
    notes: expense.notes || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid amount');
      }

      await onSave(expense.id, {
        description: formData.description.trim(),
        amount,
        category: formData.category,
        paymentMethod: formData.paymentMethod,
        reference: formData.reference.trim() || undefined,
        date: new Date(formData.date),
        notes: formData.notes.trim() || undefined
      });

      onClose();
    } catch (error: any) {
      console.error('Error updating expense:', error);
      setError(error.message || 'Failed to update expense');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

        <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl transition-all">
          <div className="absolute right-4 top-4">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
              <X className="h-6 w-6" />
            </button>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Edit Expense</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description *
              </label>
              <input
                type="text"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="modern-input mt-1"
                placeholder="Enter expense description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Amount ($) *
              </label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="modern-input pl-10"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                className="modern-select mt-1"
              >
                <option value="office_supplies">Office Supplies</option>
                <option value="utilities">Utilities</option>
                <option value="rent">Rent</option>
                <option value="salaries">Salaries</option>
                <option value="marketing">Marketing</option>
                <option value="travel">Travel</option>
                <option value="software">Software</option>
                <option value="hardware">Hardware</option>
                <option value="consulting">Consulting</option>
                <option value="legal">Legal</option>
                <option value="banking">Banking</option>
                <option value="food">Food</option>
                <option value="director_withdrawal">Director Withdrawal</option>
                <option value="transport">Transport</option>
                <option value="salary_advance">Salary Advance</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Payment Method *
              </label>
              <select
                required
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                className="modern-select mt-1"
              >
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="ecocash">EcoCash</option>
                <option value="innbucks">InnBucks</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Reference Number
              </label>
              <input
                type="text"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                className="modern-input mt-1"
                placeholder="Enter reference number (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Date *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="modern-input mt-1"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="modern-textarea mt-1"
                rows={3}
                placeholder="Add any additional notes (optional)"
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                      {error}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}