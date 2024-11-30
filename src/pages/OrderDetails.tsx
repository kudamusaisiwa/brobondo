import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react';
import { useOrderStore } from '../store/orderStore';
import { useCustomerStore } from '../store/customerStore';
import { useTaskStore } from '../store/taskStore';
import { useUserStore } from '../store/userStore';
import { useAuthStore } from '../store/authStore';
import { usePermissions } from '../hooks/usePermissions';
import InvoiceView from '../components/orders/InvoiceView';
import EditOrderModal from '../components/modals/EditOrderModal';
import DeleteOrderModal from '../components/modals/DeleteOrderModal';
import CompanyDetailsCard from '../components/orders/CompanyDetailsCard';
import CustomerDetailsCard from '../components/orders/CustomerDetailsCard';
import PaymentHistory from '../components/orders/PaymentHistory';
import AddTaskModal from '../components/tasks/AddTaskModal';
import Toast from '../components/ui/Toast';
import QuickStatusChange from '../components/orders/QuickStatusChange';
import type { Order } from '../types';

interface Order {
  id: string;
  customerId: string;
  orderDate: { toDate: () => Date } | Date;
  totalAmount: number;
  status: string;
  orderNumber: string;
}

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const { getOrderById, updateOrder, deleteOrder, updateOrderStatus } = useOrderStore();
  const { getCustomerById } = useCustomerStore();
  const { addTask } = useTaskStore();
  const { users } = useUserStore();
  const { user } = useAuthStore();
  const { canManagePayments } = usePermissions();

  const order = id ? getOrderById(id) : null;
  const customer = order ? getCustomerById(order.customerId) : null;

  // Debug log
  console.log('Order Details:', { 
    id: order?.id,
    orderNumber: order?.orderNumber,
    customer: customer?.id
  });

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  const orderNumber = order.orderNumber;
  if (!orderNumber) {
    console.warn('Order found but no order number:', order.id);
  }

  const handleEdit = async (orderData: Partial<Order>) => {
    if (!order) return;
    try {
      await updateOrder(order.id, orderData);
      setShowEditModal(false);
      setToastMessage('Order updated successfully');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      console.error('Error updating order:', error);
      setToastMessage('Failed to update order');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleDelete = async () => {
    if (!order) return;
    try {
      await deleteOrder(order.id);
      setShowDeleteModal(false);
      navigate('/orders/all');
    } catch (error) {
      console.error('Error deleting order:', error);
      setToastMessage('Failed to delete order');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleAddTask = async (taskData: any) => {
    try {
      await addTask({
        ...taskData,
        orderId: order?.id
      });
      setToastMessage('Task created successfully');
      setToastType('success');
      setShowAddTaskModal(false);
    } catch (error: any) {
      console.error('Error creating task:', error);
      setToastMessage(error.message || 'Failed to create task');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleUpdateField = async (field: keyof Order, value: string) => {
    if (!order) return;
    try {
      await updateOrder(order.id, { [field]: value });
      setToastMessage(`${field.replace(/([A-Z])/g, ' $1').toLowerCase()} updated successfully`);
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      console.error('Error updating field:', error);
      setToastMessage('Failed to update field');
      setToastType('error');
      setShowToast(true);
    }
  };

  // Add customer data to order for PDF
  const orderWithCustomer = {
    ...order,
    customerName: customer ? `${customer.firstName} ${customer.lastName}` : undefined,
    customerCompany: customer?.companyName || undefined,
    customerEmail: customer?.email,
    customerPhone: customer?.phone,
    customerAddress: customer?.address
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/orders/all"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Orders
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {orderNumber ? `Order #${orderNumber}` : `Order ${order.id}`}
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <QuickStatusChange orderId={order.id} currentStatus={order.status} />
          <button
            onClick={() => setShowAddTaskModal(true)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:border-gray-600"
          >
            <Plus className="h-4 w-4 mr-2 inline" />
            Add Task
          </button>
          <button
            onClick={() => setShowEditModal(true)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:border-gray-600"
          >
            <Pencil className="h-4 w-4 mr-2 inline" />
            Edit
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/40 dark:border-red-900/50"
          >
            <Trash2 className="h-4 w-4 mr-2 inline" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Details Card */}
          <CustomerDetailsCard customer={customer} />

          {/* Company Details Card */}
          <CompanyDetailsCard 
            order={order}
            onUpdate={handleUpdateField}
          />

          {/* Invoice View */}
          <InvoiceView 
            order={orderWithCustomer}
            onStatusChange={updateOrderStatus}
            showStatusChange={true}
          />
        </div>

        {/* Sidebar content */}
        <div className="lg:col-span-1 space-y-6">
          {canManagePayments && (
            <PaymentHistory
              orderId={order.id}
              totalAmount={order.totalAmount}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <EditOrderModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleEdit}
        order={order}
      />

      <DeleteOrderModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        orderNumber={order.orderNumber}
      />

      <AddTaskModal
        isOpen={showAddTaskModal}
        onClose={() => setShowAddTaskModal(false)}
        onAdd={handleAddTask}
        users={users}
        currentUserId={user?.id}
        orderId={order.id}
      />

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