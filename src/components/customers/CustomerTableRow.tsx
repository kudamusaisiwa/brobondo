import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, Edit, Trash2, MessageSquare, Loader2 } from 'lucide-react';
import type { Customer } from '../../types';

interface CustomerTableRowProps {
  customer: Customer;
  canManageCustomers: boolean;
  onEditClick: (customer: Customer) => void;
  onDeleteClick: (customer: Customer) => void;
  onSendMessageClick: (customer: Customer) => void;
  isSendingMessage?: boolean;
}

export default function CustomerTableRow({
  customer,
  canManageCustomers,
  onEditClick,
  onDeleteClick,
  onSendMessageClick,
  isSendingMessage
}: CustomerTableRowProps) {
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
      <td className="px-6 py-4 whitespace-nowrap">
        <Link
          to={`/customers/${customer.id}`}
          className="flex items-start"
        >
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {customer.firstName} {customer.lastName}
            </div>
            {customer.companyName && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {customer.companyName}
              </div>
            )}
          </div>
        </Link>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Mail className="h-4 w-4 mr-2" />
            {customer.email}
          </div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Phone className="h-4 w-4 mr-2" />
            {customer.phone || 'No phone'}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {customer.totalOrders || 0}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        ${(customer.totalRevenue || 0).toLocaleString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex space-x-2 justify-end">
          {canManageCustomers && (
            <>
              <button 
                onClick={() => onEditClick(customer)}
                className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                title="Edit Customer"
              >
                <Edit className="h-5 w-5" />
              </button>
              <button 
                onClick={() => onDeleteClick(customer)}
                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                title="Delete Customer"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </>
          )}
          <button 
            onClick={() => !isSendingMessage && customer.phone && onSendMessageClick(customer)}
            className={`relative group ${
              customer.phone 
                ? 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300' 
                : 'text-gray-400 cursor-not-allowed'
            }`}
            disabled={!customer.phone || isSendingMessage}
            title={customer.phone ? 'Send Message' : 'No phone number available'}
          >
            {isSendingMessage ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <MessageSquare className="h-5 w-5" />
            )}
            
            {/* Tooltip */}
            {!customer.phone && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                No phone number available
              </div>
            )}
          </button>
        </div>
      </td>
    </tr>
  );
}