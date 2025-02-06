import React, { useState } from 'react';
import { X } from 'lucide-react';
import { RentalSchedule } from '../../store/rentalStore';
import { Property } from '../../store/propertyStore';
import { Tenant } from '../../store/tenantStore';

interface RentalScheduleSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<RentalSchedule>) => Promise<void>;
  schedule: RentalSchedule;
  property: Property;
  tenant: Tenant;
}

export default function RentalScheduleSetupModal({
  isOpen,
  onClose,
  onSave,
  schedule,
  property,
  tenant
}: RentalScheduleSetupModalProps) {
  const [monthlyRent, setMonthlyRent] = useState(schedule.monthlyRent || property.price || 0);
  const [paymentDay, setPaymentDay] = useState(schedule.paymentDay || 1);
  const [depositAmount, setDepositAmount] = useState(schedule.depositAmount || property.leaseTerms?.deposit || 0);
  // Helper function to safely convert to Date
  const toDate = (value: any): Date => {
    if (!value) return new Date();
    if (value instanceof Date) return value;
    if (typeof value === 'object' && 'toDate' in value) {
      // Handle Firestore Timestamp
      return value.toDate();
    }
    return new Date(value);
  };

  // Helper to strip time from date
  const stripTime = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  // Initialize dates, ensuring they are valid Date objects
  const [leaseStartDate, setLeaseStartDate] = useState(() => {
    return stripTime(toDate(schedule.leaseStartDate));
  });

  const [leaseEndDate, setLeaseEndDate] = useState(() => {
    if (schedule.leaseEndDate) {
      return stripTime(toDate(schedule.leaseEndDate));
    }
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return stripTime(date);
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Create initial payments array
      const initialPayments = [
        // Security deposit
        {
          amount: depositAmount,
          dueDate: leaseStartDate,
          status: 'pending',
          type: 'security_deposit',
          description: 'Security Deposit'
        },
        // First month's rent
        {
          amount: monthlyRent,
          dueDate: leaseStartDate,
          status: 'pending',
          type: 'rent',
          description: 'First Month Rent'
        }
      ];

      await onSave({
        monthlyRent,
        paymentDay,
        depositAmount,
        leaseStartDate,
        leaseEndDate,
        status: 'active',
        payments: initialPayments
      });
      onClose();
    } catch (error) {
      console.error('Error saving rental schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button
              type="button"
              className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={onClose}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
                Setup Rental Schedule
              </h3>
              
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Monthly Rent
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      value={monthlyRent}
                      onChange={(e) => setMonthlyRent(Number(e.target.value))}
                      className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Payment Day (1-31)
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={paymentDay}
                      onChange={(e) => setPaymentDay(Number(e.target.value))}
                      className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Deposit Amount
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(Number(e.target.value))}
                      className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Lease Start Date
                  </label>
                  <div className="mt-1">
                    <input
                      type="date"
                      value={leaseStartDate.toISOString().split('T')[0]}
                      onChange={(e) => {
                        const date = toDate(e.target.value);
                        setLeaseStartDate(stripTime(date));
                      }}
                      className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Lease End Date
                  </label>
                  <div className="mt-1">
                    <input
                      type="date"
                      value={leaseEndDate.toISOString().split('T')[0]}
                      onChange={(e) => {
                        const date = toDate(e.target.value);
                        setLeaseEndDate(stripTime(date));
                      }}
                      className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="inline-flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Schedule'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 sm:mt-0 sm:w-auto"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
