import React, { useMemo } from 'react';
import { usePaymentStore } from '../../store/paymentStore';
import { PaymentMethod } from '../../types';
import { getDateRange } from '../../utils/dateRange';

interface PaymentMethodsTableProps {
  timeRange: string;
  customStartDate: Date | null;
  customEndDate: Date | null;
}

const paymentMethodLabels: Record<PaymentMethod, string> = {
  bank_transfer: 'Bank Transfer',
  cash: 'Cash',
  ecocash: 'EcoCash',
  innbucks: 'InnBucks',
  online_payment: 'Online Payment'
};

const PaymentMethodsTable: React.FC<PaymentMethodsTableProps> = ({
  timeRange,
  customStartDate,
  customEndDate
}) => {
  const { payments } = usePaymentStore();

  const paymentStats = useMemo(() => {
    // Get date range based on selected filter
    const { startDate, endDate } = customStartDate && customEndDate
      ? { startDate: customStartDate, endDate: customEndDate }
      : getDateRange(timeRange);

    // Filter payments by date range
    const filteredPayments = payments.filter(payment => {
      if (!payment || !payment.date) return false;
      
      // Handle both Timestamp and Date objects
      const paymentDate = payment.date instanceof Date 
        ? payment.date 
        : payment.date.toDate();
        
      return paymentDate >= startDate && paymentDate <= endDate;
    });

    // Initialize stats for all payment methods
    const stats: Record<PaymentMethod, { count: number; total: number }> = {
      bank_transfer: { count: 0, total: 0 },
      cash: { count: 0, total: 0 },
      ecocash: { count: 0, total: 0 },
      innbucks: { count: 0, total: 0 },
      online_payment: { count: 0, total: 0 }
    };

    // Calculate totals for each payment method
    filteredPayments.forEach(payment => {
      if (payment && payment.method) {
        stats[payment.method].count++;
        stats[payment.method].total += payment.amount;
      }
    });

    // Calculate grand totals
    const grandTotal = Object.values(stats).reduce((sum, { total }) => sum + total, 0);
    const totalCount = Object.values(stats).reduce((sum, { count }) => sum + count, 0);

    return { stats, grandTotal, totalCount };
  }, [payments, timeRange, customStartDate, customEndDate]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Payments by Method
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Payment Method
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Number of Payments
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Total Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                % of Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {(Object.entries(paymentStats.stats) as [PaymentMethod, { count: number; total: number }][])
              .filter(([_, stats]) => stats.count > 0)
              .sort(([_m1, statsA], [_m2, statsB]) => statsB.total - statsA.total)
              .map(([method, stats]) => (
                <tr key={method} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {paymentMethodLabels[method]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {stats.count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    ${stats.total.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {((stats.total / paymentStats.grandTotal) * 100).toFixed(1)}%
                  </td>
                </tr>
            ))}
            <tr className="bg-gray-50 dark:bg-gray-700 font-medium">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                Total
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {paymentStats.totalCount}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                ${paymentStats.grandTotal.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                100%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentMethodsTable;
