import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useOrderStore } from '../../store/orderStore';
import { canChangeToStatus } from '../../hooks/usePermissions';
import OrderStatusBadge from './OrderStatusBadge';
import PaymentMethodModal from '../modals/PaymentMethodModal';
import StatusWarningModal from '../modals/StatusWarningModal';
import Toast from '../ui/Toast';
import type { OrderStatus } from '../../types';

interface QuickStatusChangeProps {
  orderId: string;
  currentStatus: OrderStatus;
}

export default function QuickStatusChange({ orderId, currentStatus }: QuickStatusChangeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const { user } = useAuthStore();
  const { updateOrderStatus } = useOrderStore();

  const statuses: OrderStatus[] = [
    'cipc_name',
    'cipc_pending',
    'cipc_complete',
    'fnb_forms',
    'account_opened',
    'card_delivered',
    'process_complete'
  ];

  const handleStatusSelect = async (newStatus: OrderStatus) => {
    try {
      if (!user) {
        setToastMessage('You must be logged in to change order status');
        setToastType('error');
        setShowToast(true);
        setIsOpen(false);
        return;
      }

      // Check if user has permission to make this status change
      if (!canChangeToStatus(currentStatus, newStatus, user.role)) {
        setToastMessage('You do not have permission to make this status change');
        setToastType('error');
        setShowToast(true);
        setIsOpen(false);
        return;
      }

      await handleStatusChange(newStatus);
    } catch (error: any) {
      setToastMessage(error.message || 'Failed to update status');
      setToastType('error');
      setShowToast(true);
      setIsOpen(false);
    }
  };

  const handleStatusChange = async (newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setToastMessage(`Order status updated to ${newStatus}`);
      setToastType('success');
      setShowToast(true);
    } catch (error: any) {
      setToastMessage(error.message || 'Failed to update status');
      setToastType('error');
      setShowToast(true);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-between w-full px-3 py-2 text-sm rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <OrderStatusBadge status={currentStatus} />
        <ChevronDown className={`ml-2 h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 z-[101] mt-1 w-56 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              {statuses.map((status) => {
                const canChange = user ? canChangeToStatus(currentStatus, status, user.role) : false;
                const isCurrentStatus = status === currentStatus;
                
                return (
                  <button
                    key={status}
                    onClick={() => {
                      if (!isCurrentStatus && canChange) {
                        handleStatusSelect(status);
                        setIsOpen(false);
                      }
                    }}
                    disabled={!canChange || isCurrentStatus}
                    className={`w-full flex items-center px-4 py-3 text-sm ${
                      isCurrentStatus
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-default'
                        : canChange
                          ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <OrderStatusBadge status={status} />
                  </button>
                );
              })}
            </div>
          </div>
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