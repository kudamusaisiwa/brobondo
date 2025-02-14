import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import type { Customer } from '../../types';
import { useCustomerStore } from '../../store/customerStore';

interface CustomerSelectorProps {
  onSelectCustomer: (customer: Customer) => void;
  selectedCustomer: Customer | null;
  onNewCustomer: () => void;
}

export default function CustomerSelector({
  onSelectCustomer,
  selectedCustomer,
  onNewCustomer
}: CustomerSelectorProps) {
  const { customers = [] } = useCustomerStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);

  const filteredCustomers = customers.filter(customer => {
    if (!customer || !searchTerm) return false;
    
    const searchStr = searchTerm.toLowerCase();
    const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
    const email = customer.email?.toLowerCase() || '';
    const phone = customer.phone || '';
    
    return (
      fullName.includes(searchStr) ||
      email.includes(searchStr) ||
      phone.includes(searchStr)
    );
  });

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <div className="flex items-center justify-end mb-6">
        <button
          onClick={onNewCustomer}
          className="btn-primary inline-flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Customer
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search customers by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setShowResults(true)}
          className="search-input dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
        />
        
        {showResults && searchTerm && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => {
                    onSelectCustomer(customer);
                    setSearchTerm(`${customer.firstName} ${customer.lastName}`);
                    setShowResults(false);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600 border-b border-gray-100 dark:border-gray-600 last:border-0"
                >
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {customer.firstName} {customer.lastName}
                  </div>
                  {customer.email && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {customer.email}
                    </div>
                  )}
                  {customer.phone && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {customer.phone}
                    </div>
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                No customers found
              </div>
            )}
          </div>
        )}
      </div>

      {selectedCustomer && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Selected Customer</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {selectedCustomer.firstName} {selectedCustomer.lastName}
          </p>
          {selectedCustomer.email && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {selectedCustomer.email}
            </p>
          )}
          {selectedCustomer.phone && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {selectedCustomer.phone}
            </p>
          )}
          {selectedCustomer.address && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {selectedCustomer.address}
            </p>
          )}
        </div>
      )}
    </div>
  );
}