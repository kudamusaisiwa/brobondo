import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { useTenantStore } from '../../store/tenantStore';
import Toast from '../ui/Toast';

interface AddTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddTenantModal({ isOpen, onClose }: AddTenantModalProps) {
  const { addTenant } = useTenantStore();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    leaseStatus: 'pending' as const,
    rentAmount: 0,
    securityDeposit: 0,
    notes: '',
    documents: [] as string[]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addTenant(formData);
      setToastMessage('Tenant added successfully');
      setToastType('success');
      setShowToast(true);
      onClose();
    } catch (error) {
      setToastMessage('Failed to add tenant');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={onClose}>
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-30" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="hidden sm:inline-block sm:h-screen sm:align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-md transform overflow-hidden rounded-xl bg-white p-8 text-left align-middle shadow-xl transition-all dark:bg-gray-800 sm:my-8 sm:align-middle">
                <Dialog.Title
                  as="h3"
                  className="text-2xl font-semibold text-gray-900 dark:text-white"
                >
                  Add New Tenant
                </Dialog.Title>

                <button
                  type="button"
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
                  onClick={onClose}
                >
                  <span className="sr-only">Close</span>
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-base font-medium text-gray-700 dark:text-gray-300">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        placeholder="Enter first name"
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="mt-1 block w-full px-4 py-3 text-base rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 transition duration-150 ease-in-out"
                      />
                    </div>
                    <div>
                      <label className="block text-base font-medium text-gray-700 dark:text-gray-300">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        placeholder="Enter last name"
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="mt-1 block w-full px-4 py-3 text-base rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 transition duration-150 ease-in-out"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-base font-medium text-gray-700 dark:text-gray-300">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      placeholder="Enter email address"
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="mt-1 block w-full px-4 py-3 text-base rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 transition duration-150 ease-in-out"
                    />
                  </div>

                  <div>
                    <label className="block text-base font-medium text-gray-700 dark:text-gray-300">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      placeholder="Enter phone number"
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="mt-1 block w-full px-4 py-3 text-base rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 transition duration-150 ease-in-out"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-base font-medium text-gray-700 dark:text-gray-300">
                        Rent Amount *
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.rentAmount}
                        placeholder="Enter rent amount"
                        onChange={(e) => handleInputChange('rentAmount', parseFloat(e.target.value))}
                        className="mt-1 block w-full px-4 py-3 text-base rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 transition duration-150 ease-in-out"
                      />
                    </div>
                    <div>
                      <label className="block text-base font-medium text-gray-700 dark:text-gray-300">
                        Security Deposit *
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.securityDeposit}
                        placeholder="Enter security deposit"
                        onChange={(e) => handleInputChange('securityDeposit', parseFloat(e.target.value))}
                        className="mt-1 block w-full px-4 py-3 text-base rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 transition duration-150 ease-in-out"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-base font-medium text-gray-700 dark:text-gray-300">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Enter any additional notes"
                      rows={4}
                      className="mt-1 block w-full px-4 py-3 text-base rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 transition duration-150 ease-in-out resize-none"
                    />
                  </div>

                  <div className="mt-8 flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 transition duration-150 ease-in-out min-w-[120px]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 text-base font-medium text-white bg-indigo-600 border border-transparent rounded-xl shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out min-w-[120px]"
                    >
                      Add Tenant
                    </button>
                  </div>
                </form>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
}
