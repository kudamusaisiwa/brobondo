import React from 'react';
import { Download } from 'lucide-react';
import { usePaymentStore } from '../../store/paymentStore';
import { format } from 'date-fns';

interface PaymentHistoryProps {
  orderId: string;
}

export default function PaymentHistory({ orderId }: PaymentHistoryProps) {
  const { getPaymentsByOrder, getTotalPaidForOrder } = usePaymentStore();
  
  const payments = getPaymentsByOrder(orderId);
  const totalPaid = getTotalPaidForOrder(orderId);

  // Format currency to USD
  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Handle different date formats
  const formatDate = (dateValue: any) => {
    if (!dateValue) return 'N/A';
    
    try {
      const date = dateValue && typeof dateValue === 'object' && 'toDate' in dateValue
        ? dateValue.toDate()
        : new Date(dateValue);
      return format(date, 'PPP');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Payment History</h3>
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Total Paid: {formatUSD(totalPaid)}
          </p>
        </div>
        
        <div className="space-y-4">
          {payments.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No payments recorded yet.</p>
          ) : (
            payments.map((payment) => (
              <div
                key={payment.id}
                className="border dark:border-gray-700 rounded-lg p-4 space-y-2 bg-white dark:bg-gray-800"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{formatUSD(payment.amount)}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {formatDate(payment.date)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Method: {payment.method}
                    </p>
                    {payment.reference && (
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Reference: {payment.reference}
                      </p>
                    )}
                  </div>
                  {payment.receiptUrl && (
                    <button
                      onClick={() => window.open(payment.receiptUrl, '_blank')}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <Download size={16} />
                      <span className="text-sm">Receipt</span>
                    </button>
                  )}
                </div>
                {payment.notes && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    {payment.notes}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
