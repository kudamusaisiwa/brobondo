import React, { useState } from 'react';
import { X, CreditCard, Banknote, Phone, Wallet, User, Calendar } from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import { playPositiveSound, playNegativeSound } from '../../utils/audio';
import type { PaymentMethod } from '../../types';

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (method: PaymentMethod, amount: number, notes?: string, reference?: string, soldBy?: string, date?: Date) => void;
  totalAmount: number;
  paidAmount: number;
}

const paymentMethods: Array<{
  value: PaymentMethod;
  label: string;
  icon: typeof CreditCard;
  description: string;
}> = [
  {
    value: 'bank_transfer',
    label: 'Bank Transfer',
    icon: CreditCard,
    description: 'Direct bank transfer to our account'
  },
  {
    value: 'cash',
    label: 'Cash',
    icon: Banknote,
    description: 'Cash payment at our office'
  },
  {
    value: 'ecocash',
    label: 'EcoCash',
    icon: Phone,
    description: 'Mobile money transfer via EcoCash'
  },
  {
    value: 'innbucks',
    label: 'InnBucks',
    icon: Wallet,
    description: 'Payment through InnBucks'
  },
  {
    value: 'online_payment',
    label: 'Online Payment',
    icon: CreditCard,
    description: 'Online payment via credit/debit card'
  }
];

export default function PaymentMethodModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  totalAmount,
  paidAmount
}: PaymentMethodModalProps) {
  const { users = [] } = useUserStore();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [amount, setAmount] = useState(totalAmount - paidAmount);
  const [notes, setNotes] = useState('');
  const [reference, setReference] = useState('');
  const [soldBy, setSoldBy] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  const remainingAmount = totalAmount - paidAmount;

  const handleSubmit = () => {
    if (!selectedMethod) {
      setError('Please select a payment method');
      playNegativeSound();
      return;
    }

    if (amount <= 0) {
      setError('Payment amount must be greater than 0');
      playNegativeSound();
      return;
    }

    if (amount > remainingAmount) {
      setError('Payment amount cannot exceed remaining balance');
      playNegativeSound();
      return;
    }

    if (!soldBy) {
      setError('Please select who made the sale');
      playNegativeSound();
      return;
    }

    if (!paymentDate) {
      setError('Please select a payment date');
      playNegativeSound();
      return;
    }

    onConfirm(selectedMethod, amount, notes, reference, soldBy, new Date(paymentDate));
    playPositiveSound();
    resetForm();
  };

  const resetForm = () => {
    setSelectedMethod(null);
    setAmount(remainingAmount);
    setNotes('');
    setReference('');
    setSoldBy('');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

        <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl transition-all">
          <div className="absolute right-4 top-4">
            <button onClick={() => { onClose(); resetForm(); }} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add Payment</h2>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              <p>Total Amount: ${totalAmount.toFixed(2)}</p>
              <p>Paid Amount: ${paidAmount.toFixed(2)}</p>
              <p>Remaining Balance: ${remainingAmount.toFixed(2)}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Payment Date *
              </label>
              <div className="relative mt-1">
                <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="modern-input pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Payment Amount *
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                min="0.01"
                max={remainingAmount}
                step="0.01"
                className="modern-input mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Payment Method *
              </label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {paymentMethods.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSelectedMethod(value)}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border ${
                      selectedMethod === value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <Icon className="h-6 w-6 mb-1" />
                    <span className="text-xs">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Sold By *
              </label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <select
                  value={soldBy}
                  onChange={(e) => setSoldBy(e.target.value)}
                  className="modern-select pl-10"
                  required
                >
                  <option value="">Select team member</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Reference Number
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="modern-input mt-1"
                placeholder="Enter payment reference..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="modern-textarea mt-1"
                rows={3}
                placeholder="Add any payment notes here..."
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => { onClose(); resetForm(); }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedMethod || amount <= 0 || amount > remainingAmount || !soldBy || !paymentDate}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-600"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}