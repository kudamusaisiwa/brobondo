import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import type { Order } from '../../types';

interface OrderTimelineProps {
  order?: Order | null;
}

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    cipc_name: 'CIPC Name Registration Started',
    cipc_pending: 'CIPC Application Processing',
    cipc_complete: 'CIPC Registration Completed',
    fnb_forms: 'FNB Forms Submitted',
    account_opened: 'Bank Account Opened',
    card_delivered: 'Bank Card Delivered',
    process_complete: 'Process Completed'
  };
  return labels[status] || status;
};

const getStatusDescription = (status: string): string => {
  const descriptions: Record<string, string> = {
    cipc_name: 'Your company name registration process has begun with CIPC',
    cipc_pending: 'Your application is being processed by CIPC',
    cipc_complete: 'Your company has been successfully registered with CIPC',
    fnb_forms: 'Your bank account application forms have been submitted to FNB',
    account_opened: 'Your FNB bank account has been successfully opened',
    card_delivered: 'Your FNB bank card has been delivered',
    process_complete: 'All registration processes have been completed'
  };
  return descriptions[status] || '';
};

export default function OrderTimeline({ order }: OrderTimelineProps) {
  if (!order) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Timeline</h2>
        <div className="text-center text-gray-500 dark:text-gray-400 py-4">
          No order information available
        </div>
      </div>
    );
  }

  const statusHistory = order.statusHistory || [order.status];
  const formatDate = (date: Date) => {
    return format(new Date(date), 'PPpp'); // e.g., "Apr 29, 2021, 5:34 PM"
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Timeline</h2>
      <div className="flow-root">
        <ul className="-mb-8">
          {statusHistory.map((status, index) => {
            const isLast = index === statusHistory.length - 1;
            const date = index === 0 ? order.createdAt : order.updatedAt;
            
            return (
              <li key={status}>
                <div className="relative pb-8">
                  {!isLast && (
                    <span
                      className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                      aria-hidden="true"
                    />
                  )}
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center ring-8 ring-white dark:ring-gray-800">
                        {index === 0 ? (
                          <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-200" />
                        ) : (
                          <Clock className="h-5 w-5 text-blue-600 dark:text-blue-200" />
                        )}
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {getStatusLabel(status)}
                        </p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {getStatusDescription(status)}
                        </p>
                      </div>
                      <div className="whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(date)}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}