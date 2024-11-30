import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { canChangeToStatus } from '../../hooks/usePermissions';
import type { OrderStatus } from '../../types';

interface StatusSelectorProps {
  currentStatus: OrderStatus;
  onChange: (status: OrderStatus) => void;
  disabled?: boolean;
}

export default function StatusSelector({ currentStatus, onChange, disabled = false }: StatusSelectorProps) {
  const { user } = useAuthStore();
  const statuses: OrderStatus[] = [
    'quotation',
    'paid',
    'production',
    'quality_control',
    'dispatch',
    'installation',
    'completed'
  ];

  const getStatusLabel = (status: OrderStatus): string => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <select
      value={currentStatus}
      onChange={(e) => onChange(e.target.value as OrderStatus)}
      disabled={disabled}
      className="modern-select max-w-xs text-sm"
    >
      {statuses.map(status => {
        const canChange = user ? canChangeToStatus(currentStatus, status, user.role) : false;
        
        return (
          <option 
            key={status} 
            value={status}
            disabled={!canChange}
          >
            {getStatusLabel(status)}
          </option>
        );
      })}
    </select>
  );
}