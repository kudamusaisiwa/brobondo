import { useAuthStore } from '../store/authStore';
import type { UserRole, OperationalStatus } from '../types';

interface Permissions {
  canManageLeads: boolean;
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
  const { userRole } = useAuthStore();
  
  const isAdmin = userRole === 'admin';
  const isAgent = userRole === 'agent';
  const isPrivilegedUser = isAdmin || isAgent;

  return {
    canManageLeads: isPrivilegedUser,
    canChangeStatus: isPrivilegedUser,
    canMarkAsPaid: isAdmin,
    canRevertPaid: isAdmin,
    canManageUsers: isAdmin,
    canViewFinancials: isAdmin,
    canEditProducts: isAdmin,
    canViewAllActivities: isPrivilegedUser,
    canAccessReports: isAdmin,
    canDeleteEntities: isAdmin,
    canManageCustomers: isPrivilegedUser,
    canViewUsers: isPrivilegedUser,
    canManagePayments: isAdmin
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