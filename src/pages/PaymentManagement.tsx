import React, { useState } from 'react';
import { useOrderStore } from '../store/orderStore';
import { usePaymentStore } from '../store/paymentStore';
import { useCustomerStore } from '../store/customerStore';
import { useUserStore } from '../store/userStore';
import { CreditCard, Search, Filter, Edit2, Trash2 } from 'lucide-react';
import type { Order, PaymentMethod, Payment } from '../types';
import PaymentMethodModal from '../components/modals/PaymentMethodModal';
import EditPaymentModal from '../components/modals/EditPaymentModal';
import DeletePaymentModal from '../components/modals/DeletePaymentModal';
import Pagination from '../components/ui/Pagination';
import Toast from '../components/ui/Toast';

export default function PaymentManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { orders = [] } = useOrderStore();
  const { payments = [], addPayment, updatePayment, deletePayment, getTotalPaidForOrder } = usePaymentStore();
  const { getCustomerById } = useCustomerStore();
  const { users = [] } = useUserStore();

  const filteredPayments = (payments || []).filter(payment => {
    if (!payment) return false;
    
    const order = orders.find(o => o?.id === payment.orderId);
    const customer = order ? getCustomerById(order.customerId) : null;
    const seller = users.find(u => u.id === payment.soldBy);
    const searchStr = searchTerm.toLowerCase();
    
    return (payment.reference?.toLowerCase() || '').includes(searchStr) ||
           (order?.id.toLowerCase() || '').includes(searchStr) ||
           (customer && `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchStr)) ||
           (seller && seller.name.toLowerCase().includes(searchStr));
  });

  // Calculate pagination
  const totalPages = itemsPerPage === -1 ? 1 : Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedPayments = itemsPerPage === -1 
    ? filteredPayments 
    : filteredPayments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleAddPayment = async (
    method: PaymentMethod, 
    amount: number, 
    notes?: string, 
    reference?: string,
    soldBy?: string
  ) => {
    if (!selectedOrder) return;

    try {
      await addPayment({
        orderId: selectedOrder.id,
        amount,
        method,
        notes,
        reference,
        soldBy
      });

      setToastMessage('Payment recorded successfully');
      setToastType('success');
    } catch (error: any) {
      setToastMessage(
        error.code === 'permission-denied' 
          ? 'You do not have permission to add payments' 
          : error.message || 'Failed to record payment'
      );
      setToastType('error');
    } finally {
      setShowToast(true);
      setShowPaymentModal(false);
      setSelectedOrder(null);
    }
  };

  const handleEditPayment = async (paymentId: string, paymentData: Partial<Payment>) => {
    try {
      await updatePayment(paymentId, paymentData);
      setToastMessage('Payment updated successfully');
      setToastType('success');
      setShowEditModal(false);
    } catch (error: any) {
      setToastMessage(error.message || 'Failed to update payment');
      setToastType('error');
    }
    setShowToast(true);
  };

  const handleDeletePayment = async () => {
    if (!selectedPayment) return;
    
    try {
      await deletePayment(selectedPayment.id);
      setToastMessage('Payment deleted successfully');
      setToastType('success');
      setShowDeleteModal(false);
      setSelectedPayment(null);
    } catch (error: any) {
      setToastMessage(error.message || 'Failed to delete payment');
      setToastType('error');
    }
    setShowToast(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Payment Management</h1>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by reference, customer name, or seller..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Sold By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No payments found
                  </td>
                </tr>
              ) : (
                paginatedPayments.map((payment) => {
                  if (!payment) return null;
                  const order = orders.find(o => o?.id === payment.orderId);
                  const customer = order ? getCustomerById(order.customerId) : null;
                  const seller = users.find(u => u.id === payment.soldBy);

                  return (
                    <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {payment.date.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {payment.reference || '-'}
                          </div>
                          {customer && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {customer.firstName} {customer.lastName}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {(payment.method || '').split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        ${payment.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {seller ? seller.name : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          payment.status === 'completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                            : payment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                        }`}>
                          {(payment.status || '').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowEditModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={filteredPayments.length}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>

      {selectedOrder && (
        <PaymentMethodModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedOrder(null);
          }}
          onConfirm={handleAddPayment}
          totalAmount={selectedOrder.totalAmount}
          paidAmount={getTotalPaidForOrder(selectedOrder.id)}
        />
      )}

      {selectedPayment && (
        <>
          <EditPaymentModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedPayment(null);
            }}
            onSave={handleEditPayment}
            payment={selectedPayment}
          />

          <DeletePaymentModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedPayment(null);
            }}
            onConfirm={handleDeletePayment}
            paymentAmount={selectedPayment.amount}
            paymentReference={selectedPayment.reference}
          />
        </>
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