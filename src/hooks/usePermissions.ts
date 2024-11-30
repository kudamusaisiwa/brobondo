import { useAuthStore } from '../store/authStore';
import type { UserRole, OperationalStatus } from '../types';

interface Permissions {
  canChangeStatus: boolean;
  canMarkAsPaid: boolean;
  canRevertPaid: boolean;
  canManageUsers: boolean;
  canViewFinancials: boolean;
  canEditProducts: boolean;
  canViewAllActivities: boolean;
  canAccessReports: boolean;
  canDeleteEntities: boolean;
  canManageCustomers: boolean;
  canViewUsers: boolean;
  canManagePayments: boolean;
}

export function usePermissions(): Permissions {
  const { user } = useAuthStore();
  const role = user?.role || 'staff';

  const isAdmin = role === 'admin';
  const isManager = role === 'manager';
  const isFinance = role === 'finance';
  const isPrivilegedUser = isAdmin || isManager;

  return {
    canChangeStatus: true,
    canMarkAsPaid: isAdmin || isManager || isFinance,
    canRevertPaid: isAdmin || isManager || isFinance,
    canManageUsers: isAdmin,
    canViewFinancials: isAdmin || isManager || isFinance,
    canEditProducts: isPrivilegedUser,
    canViewAllActivities: isPrivilegedUser,
    canAccessReports: isAdmin || isManager || isFinance,
    canDeleteEntities: isPrivilegedUser,
    canManageCustomers: isPrivilegedUser,
    canViewUsers: isAdmin || isManager,
    canManagePayments: isAdmin || isManager || isFinance
  };
}

const statusOrder: OperationalStatus[] = [
  'cipc_name',
  'cipc_pending',
  'cipc_complete',
  'fnb_forms',
  'account_opened',
  'card_delivered',
  'process_complete'
];

export function canChangeToStatus(
  currentStatus: OperationalStatus,
  newStatus: OperationalStatus,
  userRole: UserRole
): boolean {
  const currentIndex = statusOrder.indexOf(currentStatus);
  const newIndex = statusOrder.indexOf(newStatus);

  // Admin can move to any status
  if (userRole === 'admin') return true;

  // Manager can move one step forward or backward
  if (userRole === 'manager') {
    return Math.abs(newIndex - currentIndex) <= 1;
  }

  // Other roles can only move forward one step at a time
  return newIndex === currentIndex + 1;
}