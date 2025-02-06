import React from 'react';
import { X } from 'lucide-react';
import { RentalSchedule, RentalPayment } from '../../store/rentalStore';
import { Property } from '../../store/propertyStore';
import { Tenant } from '../../store/tenantStore';

interface RentalStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: RentalSchedule;
  property: Property;
  tenant: Tenant;
}

const ensureDate = (value: any): Date | undefined => {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  if (typeof value === 'object' && 'toDate' in value) {
    return value.toDate();
  }
  try {
    return new Date(value);
  } catch (e) {
    console.error('Failed to convert to date:', value, e);
    return undefined;
  }
};

export default function RentalStatementModal({
  isOpen,
  onClose,
  schedule,
  property,
  tenant
}: RentalStatementModalProps) {
  if (!isOpen) return null;

  console.log('Statement Modal - Schedule:', schedule);
  console.log('Statement Modal - Payments:', schedule.payments);

  const now = new Date();

  // Process payments
  const payments = (schedule.payments || []).map(p => ({
    ...p,
    dueDate: ensureDate(p.dueDate) || new Date(),
    paidDate: ensureDate(p.paidDate),
    amount: typeof p.amount === 'number' ? p.amount : 0,
    status: p.status || 'pending',
    type: p.type || 'rent',
    description: p.description || '',
    reference: p.reference || ''
  }));

  // Calculate total paid (all paid payments)
  const totalPaid = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  // Find next payment due
  const nextPaymentDate = new Date(now.getFullYear(), now.getMonth() + 1, schedule.paymentDay);
  const totalPending = schedule.monthlyRent; // Next month's rent

  // Calculate overdue (any unpaid payments with due dates before today)
  const totalOverdue = payments
    .filter(p => {
      const isPaid = p.status === 'paid';
      const isDueBeforeToday = p.dueDate < now;
      return !isPaid && isDueBeforeToday;
    })
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="inline-block transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:p-6 sm:align-middle">
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button
              type="button"
              className="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={onClose}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="w-full">
              {/* Header */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Rental Statement</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{property.title}</p>
              </div>

              {/* Tenant Information */}
              <div className="mt-4 border-b border-gray-200 dark:border-gray-700 pb-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Tenant Information</h4>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {tenant.firstName} {tenant.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Contact</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{tenant.email}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{tenant.phone}</p>
                  </div>
                </div>
              </div>

              {/* Lease Details */}
              <div className="mt-4 border-b border-gray-200 dark:border-gray-700 pb-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Lease Details</h4>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Rent</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">${schedule.monthlyRent}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Security Deposit</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">${schedule.depositAmount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Lease Period</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {schedule.leaseStartDate.toLocaleDateString()} - {schedule.leaseEndDate.toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Payment Day</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Day {schedule.paymentDay} of each month</p>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="mt-4 border-b border-gray-200 dark:border-gray-700 pb-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Payment Summary</h4>
                <div className="mt-2 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Paid</p>
                    <p className="text-lg font-medium text-green-600 dark:text-green-400">${totalPaid.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
                    <p className="text-lg font-medium text-yellow-600 dark:text-yellow-400">${totalPending.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Due: {nextPaymentDate.toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Overdue</p>
                    <p className="text-lg font-medium text-red-600 dark:text-red-400">${totalOverdue.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Payment History */}
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Payment History</h4>
                <div className="mt-2 flow-root">
                  <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                      <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                        <thead>
                          <tr>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Date</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Type</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Amount</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                            <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Reference</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {payments
                            .sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime())
                            .map((payment, idx) => (
                              <tr key={payment.id || idx} className={idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                  {payment.dueDate.toLocaleDateString()}
                                  {payment.paidDate && (
                                    <div className="text-xs text-gray-400 dark:text-gray-500">
                                      Paid: {payment.paidDate.toLocaleDateString()}
                                    </div>
                                  )}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                  {payment.type.charAt(0).toUpperCase() + payment.type.slice(1).replace('_', ' ')}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                  ${payment.amount.toFixed(2)}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                                  <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                    payment.status === 'paid' 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                      : payment.status === 'pending'
                                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                  }`}>
                                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                  </span>
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                                  {payment.reference || '-'}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
