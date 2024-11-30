import React, { useState } from 'react';
import { CreditCard, Calendar, Plus, User } from 'lucide-react';
import { usePaymentStore } from '../../store/paymentStore';
import { usePermissions } from '../../hooks/usePermissions';
import { useUserStore } from '../../store/userStore';
import PaymentMethodModal from '../modals/PaymentMethodModal';
import Toast from '../ui/Toast';

interface PaymentHistoryProps {
  orderId: string;
  totalAmount: number;
}

export default function PaymentHistory({ orderId, totalAmount }: PaymentHistoryProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const { getPaymentsByOrder, getTotalPaidForOrder, addPayment } = usePaymentStore();
  const { getUserById } = useUserStore();
  const { canManagePayments } = usePermissions();

  const payments = getPaymentsByOrder(orderId);
  const totalPaid = getTotalPaidForOrder(orderId);
  const remainingBalance = totalAmount - totalPaid;
  const paymentProgress = (totalPaid / totalAmount) * 100;

  const handleAddPayment = async (method: PaymentMethod, amount: number, notes?: string, reference?: string, soldBy?: string, date?: Date) => {
    try {
      await addPayment({
        orderId,
        amount,
        method,
        notes,
        reference,
        soldBy,
        date
      });

      setToastMessage('Payment added successfully');
      setToastType('success');
    } catch (error: any) {
      setToastMessage(error.message || 'Failed to add payment');
      setToastType('error');
    } finally {
      setShowToast(true);
      setShowPaymentModal(false);
    }
  };

  const getSoldByName = (userId: string) => {
    const user = getUserById(userId);
    return user ? user.name : userId;
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'cash':
        return 'Cash';
      case 'ecocash':
        return 'EcoCash';
      case 'innbucks':
        return 'InnBucks';
      default:
        return method;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Payment History</h3>
          {canManagePayments && remainingBalance > 0 && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Payment
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Total Amount</p>
            <p className="font-medium text-gray-900 dark:text-white">${totalAmount.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Total Paid</p>
            <p className="font-medium text-green-600 dark:text-green-400">${totalPaid.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Remaining</p>
            <p className="font-medium text-red-600 dark:text-red-400">${remainingBalance.toFixed(2)}</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-green-600 dark:bg-green-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${paymentProgress}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
            {paymentProgress.toFixed(1)}% paid
          </p>
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {payments.map((payment) => (
          <div key={payment.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {getPaymentMethodIcon(payment.method)}
                  </span>
                </div>
                <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="h-4 w-4 mr-2" />
                  {payment.date.toLocaleDateString()}
                </div>
                {payment.soldBy && (
                  <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <User className="h-4 w-4 mr-2" />
                    Sold by: {getSoldByName(payment.soldBy)}
                  </div>
                )}
                {payment.notes && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 italic">
                    {payment.notes}
                  </p>
                )}
                {payment.reference && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Ref: {payment.reference}
                  </p>
                )}
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                ${payment.amount.toFixed(2)}
              </span>
            </div>
          </div>
        ))}

        {payments.length === 0 && (
          <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
            No payments recorded yet
          </div>
        )}
      </div>

      {showPaymentModal && (
        <PaymentMethodModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onConfirm={handleAddPayment}
          totalAmount={totalAmount}
          paidAmount={totalPaid}
        />
      )}

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}