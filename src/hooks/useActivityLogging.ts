import { useActivityStore } from '../store/activityStore';
import { useAuthStore } from '../store/authStore';
import type { ActivityType } from '../types';

export function useActivityLogging() {
  const { logActivity } = useActivityStore();
  const { user } = useAuthStore();

  const logUserAction = async (
    type: ActivityType,
    message: string,
    metadata?: Record<string, any>,
    entityId?: string,
    entityType?: 'customer' | 'order' | 'payment' | 'task' | 'user' | 'communication'
  ) => {
    if (!user) {
      console.warn('Attempted to log activity without authenticated user');
      return;
    }

    try {
      await logActivity({
        type,
        message,
        userId: user.id,
        userName: user.name,
        entityId,
        entityType,
        metadata: {
          ...metadata,
          timestamp: new Date(),
          userRole: user.role
        }
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  };

  // Authentication activities
  const logLogin = () => logUserAction(
    'user_login',
    `${user?.name} logged in`,
    { lastLogin: new Date() }
  );

  const logLogout = () => logUserAction(
    'user_logout',
    `${user?.name} logged out`
  );

  const logPasswordReset = () => logUserAction(
    'password_reset',
    `Password reset requested for ${user?.email}`
  );

  // Customer activities
  const logCustomerCreated = (customerId: string, customerName: string, metadata?: any) => logUserAction(
    'customer_created',
    `New customer created: ${customerName}`,
    metadata,
    customerId,
    'customer'
  );

  const logCustomerUpdated = (customerId: string, customerName: string, changes: any) => logUserAction(
    'customer_updated',
    `Customer updated: ${customerName}`,
    { changes },
    customerId,
    'customer'
  );

  const logCustomerDeleted = (customerId: string, customerName: string) => logUserAction(
    'customer_deleted',
    `Customer deleted: ${customerName}`,
    undefined,
    customerId,
    'customer'
  );

  // Order activities
  const logOrderCreated = (orderId: string, metadata?: any) => logUserAction(
    'order_created',
    `New order created: #${orderId}`,
    metadata,
    orderId,
    'order'
  );

  const logOrderUpdated = (orderId: string, changes: any) => logUserAction(
    'order_updated',
    `Order #${orderId} updated`,
    { changes },
    orderId,
    'order'
  );

  const logStatusChange = (orderId: string, oldStatus: string, newStatus: string) => logUserAction(
    'status_change',
    `Order #${orderId} status changed from ${oldStatus} to ${newStatus}`,
    { previousStatus: oldStatus, newStatus },
    orderId,
    'order'
  );

  // Payment activities
  const logPaymentCreated = (paymentId: string, orderId: string, amount: number, method: string) => logUserAction(
    'payment_created',
    `Payment of $${amount} received for Order #${orderId}`,
    { amount, method },
    paymentId,
    'payment'
  );

  const logPaymentVoided = (paymentId: string, orderId: string, amount: number) => logUserAction(
    'payment_voided',
    `Payment of $${amount} voided for Order #${orderId}`,
    { amount },
    paymentId,
    'payment'
  );

  const logPaymentRefunded = (paymentId: string, orderId: string, amount: number) => logUserAction(
    'payment_refunded',
    `Payment of $${amount} refunded for Order #${orderId}`,
    { amount },
    paymentId,
    'payment'
  );

  // Task activities
  const logTaskCreated = (taskId: string, title: string, assignedTo?: string) => logUserAction(
    'task_created',
    `New task created: ${title}`,
    { assignedTo },
    taskId,
    'task'
  );

  const logTaskUpdated = (taskId: string, title: string, changes: any) => logUserAction(
    'task_updated',
    `Task updated: ${title}`,
    { changes },
    taskId,
    'task'
  );

  const logTaskCompleted = (taskId: string, title: string) => logUserAction(
    'task_completed',
    `Task completed: ${title}`,
    { completedAt: new Date() },
    taskId,
    'task'
  );

  // Communication activities
  const logCommunicationAdded = (
    communicationId: string,
    customerId: string,
    type: string
  ) => logUserAction(
    'communication_added',
    `New ${type} communication added`,
    { type },
    communicationId,
    'communication'
  );

  return {
    logUserAction,
    logLogin,
    logLogout,
    logPasswordReset,
    logCustomerCreated,
    logCustomerUpdated,
    logCustomerDeleted,
    logOrderCreated,
    logOrderUpdated,
    logStatusChange,
    logPaymentCreated,
    logPaymentVoided,
    logPaymentRefunded,
    logTaskCreated,
    logTaskUpdated,
    logTaskCompleted,
    logCommunicationAdded
  };
}