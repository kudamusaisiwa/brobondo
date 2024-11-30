import React from 'react';
import { useOrderStore } from '../store/orderStore';
import { useCustomerStore } from '../store/customerStore';
import { format } from 'date-fns';
import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import QuickStatusChange from '../components/orders/QuickStatusChange';
import { Link } from 'react-router-dom';
import { Customer } from '../types';

export default function OrderList() {
  const { orders } = useOrderStore();
  const { getCustomerById } = useCustomerStore();

  const getCustomerDetails = (customerId: string): Customer | null => {
    return getCustomerById(customerId);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
        <Link
          to="/orders/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          New Order
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          {orders.map((order) => {
            const customer = getCustomerDetails(order.customerId);
            return (
              <div key={order.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                  {/* Order Number and Date */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        #{order.id.slice(-6)}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {format(order.orderDate.toDate(), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="flex-1">
                    <div className="text-sm">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown Customer'}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400">{customer?.email}</p>
                      <p className="text-gray-500 dark:text-gray-400">{customer?.phone}</p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex-1">
                    <QuickStatusChange orderId={order.id} currentStatus={order.status} />
                  </div>

                  {/* Total */}
                  <div className="flex-1 text-right">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-4">
                    <Link
                      to={`/orders/${order.id}`}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      title="View Details"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </Link>
                    <Link
                      to={`/orders/${order.id}/edit`}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                      title="Edit Order"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => {/* Add delete handler */}}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      title="Delete Order"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}