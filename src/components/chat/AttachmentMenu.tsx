import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Users, CreditCard } from 'lucide-react';
import { useCustomerStore } from '../../store/customerStore';
import { useOrderStore } from '../../store/orderStore';
import { usePaymentStore } from '../../store/paymentStore';

interface AttachmentMenuProps {
  onSelect: (attachment: {
    type: 'customer' | 'order' | 'payment';
    id: string;
    title: string;
    subtitle?: string;
    amount?: number;
  }) => void;
  onClose: () => void;
}

export default function AttachmentMenu({ onSelect, onClose }: AttachmentMenuProps) {
  const { customers } = useCustomerStore();
  const { orders } = useOrderStore();
  const { payments } = usePaymentStore();

  return (
    <div className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-2 space-y-1">
        <div className="font-medium text-sm text-gray-900 dark:text-white px-2 py-1">
          Attach to message:
        </div>
        
        {/* Customers */}
        <div className="space-y-1">
          <div className="flex items-center px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
            <Users className="h-4 w-4 mr-1" />
            Customers
          </div>
          <div className="max-h-32 overflow-y-auto">
            {customers.slice(0, 5).map(customer => (
              <button
                key={customer.id}
                onClick={() => {
                  onSelect({
                    type: 'customer',
                    id: customer.id,
                    title: `${customer.firstName} ${customer.lastName}`,
                    subtitle: customer.companyName || undefined
                  });
                  onClose();
                }}
                className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {customer.firstName} {customer.lastName}
              </button>
            ))}
          </div>
        </div>

        {/* Orders */}
        <div className="space-y-1">
          <div className="flex items-center px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
            <Package className="h-4 w-4 mr-1" />
            Recent Orders
          </div>
          <div className="max-h-32 overflow-y-auto">
            {orders.slice(0, 5).map(order => (
              <button
                key={order.id}
                onClick={() => {
                  onSelect({
                    type: 'order',
                    id: order.id,
                    title: `Order #${order.id}`,
                    amount: order.totalAmount
                  });
                  onClose();
                }}
                className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Order #{order.id}
              </button>
            ))}
          </div>
        </div>

        {/* Payments */}
        <div className="space-y-1">
          <div className="flex items-center px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
            <CreditCard className="h-4 w-4 mr-1" />
            Recent Payments
          </div>
          <div className="max-h-32 overflow-y-auto">
            {payments.slice(0, 5).map(payment => (
              <button
                key={payment.id}
                onClick={() => {
                  onSelect({
                    type: 'payment',
                    id: payment.id,
                    title: `Payment for Order #${payment.orderId}`,
                    amount: payment.amount
                  });
                  onClose();
                }}
                className="w-full px-2 py-1 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Payment ${payment.amount}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}