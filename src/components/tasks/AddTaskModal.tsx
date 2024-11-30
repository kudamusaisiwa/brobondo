import React, { useState } from 'react';
import { X, Users, ClipboardList, AlertCircle } from 'lucide-react';
import { useOrderStore } from '../../store/orderStore';
import { useCustomerStore } from '../../store/customerStore';
import type { Task, TaskPriority, User } from '../../types';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  users: User[];
  currentUserId?: string;
  orderId?: string;
}

export default function AddTaskModal({ 
  isOpen, 
  onClose, 
  onAdd,
  users,
  currentUserId,
  orderId 
}: AddTaskModalProps) {
  const { orders } = useOrderStore();
  const { getCustomerById } = useCustomerStore();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'normal' as TaskPriority,
    assignedTo: '',
    orderId: orderId || '',
    dueDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!currentUserId) {
        throw new Error('No user is currently logged in');
      }

      // Clean up the data before sending to Firebase
      const cleanTaskData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null, // Convert empty string to null
        priority: formData.priority,
        status: 'pending' as const,
        assignedTo: formData.assignedTo || null, // Convert empty string to null
        orderId: formData.orderId || null, // Convert empty string to null
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
        assignedBy: currentUserId
      };

      // Validate task data
      const validationErrors = [];
      
      if (!cleanTaskData.title) {
        validationErrors.push('Title is required');
      }
      
      if (!cleanTaskData.orderId) {
        if (!cleanTaskData.description) {
          validationErrors.push('Description is required for tasks not connected to an order');
        }
        if (!cleanTaskData.assignedTo) {
          validationErrors.push('Assigned user is required for tasks not connected to an order');
        }
        if (!cleanTaskData.dueDate) {
          validationErrors.push('Due date is required for tasks not connected to an order');
        }
      }

      if (validationErrors.length > 0) {
        setError(validationErrors.join('\n'));
        setShowErrorPopup(true);
        setLoading(false);
        return;
      }

      await onAdd(cleanTaskData);
      // Only reset form and close if successful
      setFormData({
        title: '',
        description: '',
        priority: 'normal',
        assignedTo: '',
        orderId: orderId || '',
        dueDate: new Date().toISOString().split('T')[0]
      });
      onClose();
    } catch (error: any) {
      console.error('Error creating task:', error);
      let errorMessage = 'Failed to create task. Please try again.';
      
      // Handle Firebase errors
      if (error.code === 'invalid-argument') {
        errorMessage = 'Please fill in all required fields.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setShowErrorPopup(true);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

        <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl transition-all">
          <div className="absolute right-4 top-4">
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              type="button"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Add New Task</h2>

          {showErrorPopup && error && (
            <div className="mb-4 p-4 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400 dark:text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                    Please fix the following errors:
                  </h3>
                  <div className="text-sm text-red-700 dark:text-red-300 whitespace-pre-line">
                    {error.split('\n').map((err, index) => (
                      <div key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{err}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowErrorPopup(false)}
                    className="mt-2 text-sm text-red-700 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300"
                    type="button"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="modern-input mt-1"
                placeholder="Enter task title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="modern-textarea mt-1"
                rows={3}
                placeholder="Enter task description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Priority *
                </label>
                <select
                  required
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                  className="modern-select mt-1"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="modern-input mt-1"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Assign To
              </label>
              <div className="relative mt-1">
                <Users className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <select
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="modern-select pl-10"
                >
                  <option value="">Select user</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {!orderId && ( // Only show order selection if orderId wasn't provided
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Link to Order
                </label>
                <div className="relative mt-1">
                  <ClipboardList className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <select
                    value={formData.orderId}
                    onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                    className="modern-select pl-10"
                  >
                    <option value="">Select order</option>
                    {orders?.map((order) => {
                      if (!order) return null;
                      const customer = getCustomerById(order.customerId);
                      const customerName = customer 
                        ? `${customer.firstName} ${customer.lastName}`
                        : 'Unknown Customer';
                      
                      return (
                        <option key={order.id} value={order.id}>
                          Order #{order.id} - {customerName}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300"
              >
                {loading ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}