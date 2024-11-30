import React from 'react';
import { Filter } from 'lucide-react';
import type { OperationalStatus } from '../../types';

interface OrderStatusFilterProps {
  selectedStatus: OperationalStatus | 'all';
  onChange: (status: OperationalStatus | 'all') => void;
}

const statuses: Array<{ value: OperationalStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All Orders' },
  { value: 'cipc_name', label: 'CIPC Name' },
  { value: 'cipc_pending', label: 'CIPC Pending' },
  { value: 'cipc_complete', label: 'CIPC Complete' },
  { value: 'fnb_forms', label: 'FNB Forms' },
  { value: 'account_opened', label: 'Account Opened' },
  { value: 'card_delivered', label: 'Card Delivered' },
  { value: 'process_complete', label: 'Process Complete' }
];

export default function OrderStatusFilter({ selectedStatus, onChange }: OrderStatusFilterProps) {
  return (
    <div className="flex items-center space-x-2 w-full sm:w-auto">
      <Filter className="h-5 w-5 text-gray-400 flex-shrink-0" />
      <select
        value={selectedStatus}
        onChange={(e) => onChange(e.target.value as OperationalStatus | 'all')}
        className="modern-select py-2 pl-3 pr-10 text-base"
      >
        {statuses.map(status => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>
    </div>
  );
}