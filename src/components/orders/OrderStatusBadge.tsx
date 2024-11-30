import React from 'react';
import { usePaymentStore } from '../../store/paymentStore';
import type { OperationalStatus, PaymentStatus } from '../../types';

interface OrderStatusBadgeProps {
  status?: OperationalStatus;
  orderId?: string;
}

export default function OrderStatusBadge({ status, orderId }: OrderStatusBadgeProps) {
  const { getTotalPaidForOrder } = usePaymentStore();

  const getPaymentStatus = (orderId: string): PaymentStatus => {
    const totalPaid = getTotalPaidForOrder(orderId);
    if (totalPaid === 0) return 'unpaid';
    return totalPaid >= order.totalAmount ? 'paid' : 'partial';
  };

  const getStatusColor = (status: OperationalStatus, paymentStatus?: PaymentStatus): string => {
    switch (status) {
      case 'cipc_name':
        return 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300';
      case 'cipc_pending':
        return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300';
      case 'cipc_complete':
        return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300';
      case 'fnb_forms':
        return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300';
      case 'account_opened':
        return 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300';
      case 'card_delivered':
        return 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300';
      case 'process_complete':
        return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getStatusLabel = (status: OperationalStatus): string => {
    switch (status) {
      case 'cipc_name':
        return 'CIPC Name';
      case 'cipc_pending':
        return 'CIPC Pending';
      case 'cipc_complete':
        return 'CIPC Complete';
      case 'fnb_forms':
        return 'FNB Forms';
      case 'account_opened':
        return 'Account Opened';
      case 'card_delivered':
        return 'Card Delivered';
      case 'process_complete':
        return 'Process Complete';
      default:
        return 'Unknown Status';
    }
  };

  // If no status is provided, show a default badge
  if (!status) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
        Unknown
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
      getStatusColor(status, orderId ? getPaymentStatus(orderId) : undefined)
    }`}>
      {getStatusLabel(status)}
    </span>
  );
}