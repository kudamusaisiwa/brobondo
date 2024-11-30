import React from 'react';
import type { Customer } from '../../types';
import CustomerTableHeader from './CustomerTableHeader';
import CustomerTableRow from './CustomerTableRow';

interface CustomerTableProps {
  customers: Customer[];
  canManageCustomers: boolean;
  onEditClick: (customer: Customer) => void;
  onDeleteClick: (customer: Customer) => void;
  onSendMessageClick: (customer: Customer) => void;
}

export default function CustomerTable({
  customers,
  canManageCustomers,
  onEditClick,
  onDeleteClick,
  onSendMessageClick
}: CustomerTableProps) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <CustomerTableHeader canManageCustomers={canManageCustomers} />
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {customers.map((customer) => (
              <CustomerTableRow
                key={customer.id}
                customer={customer}
                canManageCustomers={canManageCustomers}
                onEditClick={onEditClick}
                onDeleteClick={onDeleteClick}
                onSendMessageClick={onSendMessageClick}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}