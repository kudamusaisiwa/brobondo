import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Plus, Search, Eye, Edit2, ArrowUpDown } from 'lucide-react';
import { useOrderStore } from '../store/orderStore';
import { useCustomerStore } from '../store/customerStore';
import { usePaymentStore } from '../store/paymentStore';
import QuickStatusChange from '../components/orders/QuickStatusChange';
import OrderStatusFilter from '../components/orders/OrderStatusFilter';
import { OrderStatus, OperationalStatus } from '../types';
import { db } from '../lib/firebase';

interface Order {
  id: string;
  customerId: string;
  orderDate: { toDate: () => Date } | Date;
  totalAmount: number;
  status: string;
  orderNumber: string;
  paidAmount: number;
}

export default function AllOrders() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<OperationalStatus | 'all'>('all');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const { orders = [], loading, error, initialize } = useOrderStore();
  const { getCustomerById, initialize: initializeCustomers } = useCustomerStore();
  const { getTotalPaidForOrder, initialize: initializePayments } = usePaymentStore();
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const initializeData = async () => {
      if (!db) {
        setInitError('Firebase is not initialized');
        return;
      }

      try {
        console.log('Initializing orders, customers, and payments...');
        const results = await Promise.all([
          initialize(),
          initializeCustomers(),
          initializePayments()
        ]);
        console.log('Initialization complete:', results);
      } catch (error) {
        console.error('Error initializing data:', error);
        setInitError(error instanceof Error ? error.message : 'Failed to initialize data');
      }
    };

    initializeData();
  }, [initialize, initializeCustomers, initializePayments]);

  useEffect(() => {
    console.log('Current state:', {
      ordersCount: orders.length,
      loading,
      error,
      initError
    });
  }, [orders, loading, error, initError]);

  const filteredOrders = orders.filter(order => {
    if (!order || !order.customerId) return false;
    
    const customer = getCustomerById(order.customerId);
    const customerName = customer ? 
      `${customer.firstName || ''} ${customer.lastName || ''}`.trim() : 
      '';
    
    // Skip initialization orders and unknown customers
    if (
      (customer?.firstName === 'Unknown' || !customer) || 
      order.id.includes('_init')
    ) {
      return false;
    }

    // Search term matching
    const orderNumber = order.orderNumber?.toLowerCase() || '';
    const orderId = order.id?.toLowerCase() || '';
    const searchTermLower = searchTerm.toLowerCase();
    
    const matchesSearch = 
      searchTerm === '' || 
      orderNumber.includes(searchTermLower) ||
      orderId.includes(searchTermLower) ||
      customerName.toLowerCase().includes(searchTermLower);
    
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Sort orders by date
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const dateA = a.orderDate && typeof a.orderDate.toDate === 'function' 
      ? a.orderDate.toDate() 
      : a.orderDate instanceof Date 
        ? a.orderDate 
        : new Date(a.orderDate);
    
    const dateB = b.orderDate && typeof b.orderDate.toDate === 'function'
      ? b.orderDate.toDate()
      : b.orderDate instanceof Date
        ? b.orderDate
        : new Date(b.orderDate);

    return sortDirection === 'desc' 
      ? dateB.getTime() - dateA.getTime()
      : dateA.getTime() - dateB.getTime();
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (error || initError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600 dark:text-red-400">
          Error loading orders: {error || initError}
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold dark:text-white">All Orders</h1>
          <Link
            to="/orders"
            className="btn-primary inline-flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Order
          </Link>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">No orders found. Create a new order to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold dark:text-white">All Orders ({sortedOrders.length})</h1>
        <Link
          to="/orders"
          className="btn-primary inline-flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Order
        </Link>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <OrderStatusFilter
          selectedStatus={selectedStatus}
          onChange={setSelectedStatus}
        />
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Order Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer group" onClick={() => setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc')}>
                  <div className="flex items-center">
                    Date
                    <ArrowUpDown className="h-4 w-4 ml-1 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[200px]">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Outstanding
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sortedOrders.map((order: Order) => {
                const customer = getCustomerById(order.customerId);
                return (
                  <tr 
                    key={order.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        #{order.orderNumber || order.id}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown Customer'}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          {customer?.email}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          {customer?.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {order.orderDate && typeof order.orderDate.toDate === 'function' 
                          ? format(order.orderDate.toDate(), 'MMM d, yyyy')
                          : order.orderDate instanceof Date 
                            ? format(order.orderDate, 'MMM d, yyyy')
                            : typeof order.orderDate === 'string'
                              ? format(new Date(order.orderDate), 'MMM d, yyyy')
                              : 'Invalid Date'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap status-cell">
                      <QuickStatusChange
                        orderId={order.id}
                        currentStatus={order.status as OrderStatus}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        ${(order.totalAmount ?? 0).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(() => {
                        const totalPaid = getTotalPaidForOrder(order.id);
                        const outstanding = (order.totalAmount ?? 0) - totalPaid;
                        return (
                          <div className={`text-sm ${
                            outstanding > 0 
                              ? 'text-red-600 dark:text-red-400' 
                              : 'text-green-600 dark:text-green-400'
                          }`}>
                            ${outstanding.toFixed(2)}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium action-buttons">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => navigate(`/orders/${order.id}`)}
                          className="p-2 text-blue-600 hover:text-white hover:bg-blue-600 rounded-full transition-colors duration-200 group relative"
                          aria-label="View Order Details"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                            View Order
                          </span>
                        </button>
                        <button
                          onClick={() => navigate(`/orders/${order.id}/edit`)}
                          className="p-2 text-gray-600 hover:text-white hover:bg-gray-600 rounded-full transition-colors duration-200 group relative"
                          aria-label="Edit Order"
                        >
                          <Edit2 className="h-4 w-4" />
                          <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                            Edit Order
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}