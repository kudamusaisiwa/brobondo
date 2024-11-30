import React, { useState, useEffect } from 'react';
import { Customer } from '../types';
import { useCustomerStore } from '../store/customerStore';
import { useAuthStore } from '../store/authStore';
import { usePermissions } from '../hooks/usePermissions';
import CustomerListHeader from '../components/customers/CustomerListHeader';
import CustomerSearch from '../components/customers/CustomerSearch';
import CustomerTable from '../components/customers/CustomerTable';
import AddCustomerModal from '../components/modals/AddCustomerModal';
import EditCustomerModal from '../components/modals/EditCustomerModal';
import DeleteCustomerModal from '../components/modals/DeleteCustomerModal';
import ImportCustomersModal from '../components/modals/ImportCustomersModal';
import SendCustomerMessageModal from '../components/modals/SendCustomerMessageModal';
import Pagination from '../components/ui/Pagination';
import Toast from '../components/ui/Toast';
import { Upload, Download, Plus, Search } from 'lucide-react';

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [showToast, setShowToast] = useState(false);
  const [showSendMessageModal, setShowSendMessageModal] = useState(false);
  const [selectedCustomerForMessage, setSelectedCustomerForMessage] = useState<Customer | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { customers = [], addCustomer, updateCustomer, deleteCustomer, initialize, loading } = useCustomerStore();
  const { canManageCustomers } = usePermissions();

  // Initialize customers when component mounts
  useEffect(() => {
    const initializeCustomers = async () => {
      try {
        const cleanup = await initialize();
        return () => {
          if (typeof cleanup === 'function') {
            cleanup();
          }
        };
      } catch (error) {
        console.error('Error initializing customers:', error);
        return undefined;
      }
    };

    const cleanupPromise = initializeCustomers();
    return () => {
      cleanupPromise.then(cleanup => cleanup && cleanup());
    };
  }, [initialize]);

  const filteredCustomers = customers.filter(customer => {
    if (!customer || !searchTerm) return true;
    
    const searchStr = searchTerm.toLowerCase();
    const fullName = `${customer.firstName || ''} ${customer.lastName || ''}`.toLowerCase();
    const email = (customer.email || '').toLowerCase();
    const phone = customer.phone || '';
    const company = (customer.companyName || '').toLowerCase();
    
    return (
      fullName.includes(searchStr) ||
      email.includes(searchStr) ||
      phone.includes(searchStr) ||
      company.includes(searchStr)
    );
  });

  // Calculate pagination
  const totalPages = itemsPerPage === -1 ? 1 : Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = itemsPerPage === -1 
    ? filteredCustomers 
    : filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleAddCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'totalOrders' | 'totalRevenue'>) => {
    try {
      await addCustomer(customerData);
      setToastMessage('Customer added successfully');
      setToastType('success');
      setShowToast(true);
      setShowAddModal(false);
    } catch (error: any) {
      setToastMessage(error.message || 'Failed to add customer');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleEditCustomer = async (customerId: string, customerData: Partial<Customer>) => {
    console.log('Editing Customer:', { customerId, customerData });
    try {
      await updateCustomer(customerId, customerData);
      setToastMessage('Customer updated successfully');
      setToastType('success');
      setShowToast(true);
      setShowEditModal(false);
    } catch (error: any) {
      console.error('Edit Customer Error:', error);
      setToastMessage(error.message || 'Failed to update customer');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return;

    try {
      await deleteCustomer(selectedCustomer.id);
      
      setShowDeleteModal(false);
      setSelectedCustomer(null);
      
      // Show success toast
      setToastMessage('Customer deleted successfully');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      console.error('Failed to delete customer:', error);
      
      // Show error toast
      setToastMessage('Failed to delete customer');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleEditCustomerClick = (customer: Customer) => {
    console.log('Edit Customer Click:', customer);
    setSelectedCustomer(customer);
    setShowEditModal(true);
  };

  const handleDeleteCustomerClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDeleteModal(true);
  };

  const handleSendMessageClick = (customer: Customer) => {
    setSelectedCustomerForMessage(customer);
    setShowSendMessageModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading customers...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white hidden sm:block">Customers</h1>
        <div className="flex space-x-2 sm:space-x-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="hidden sm:inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            title="Import Customers"
          >
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline sm:ml-2">Import</span>
          </button>
          <button
            onClick={() => {}} // Add export functionality
            className="hidden sm:inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            title="Export Customers"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline sm:ml-2">Export</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center rounded-md bg-blue-600 px-2 sm:px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
            title="Add Customer"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline sm:ml-2">Add Customer</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input pl-10 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 w-full"
          />
        </div>
      </div>

      <CustomerTable
        customers={paginatedCustomers}
        canManageCustomers={canManageCustomers}
        onEditClick={handleEditCustomerClick}
        onDeleteClick={handleDeleteCustomerClick}
        onSendMessageClick={handleSendMessageClick}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        totalItems={filteredCustomers.length}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />

      <AddCustomerModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddCustomer}
      />

      {selectedCustomer && (
        <>
          <EditCustomerModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedCustomer(null);
            }}
            onSave={(customerData) => handleEditCustomer(selectedCustomer.id, customerData)}
            customer={selectedCustomer}
          />

          <DeleteCustomerModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedCustomer(null);
            }}
            onConfirm={handleDeleteCustomer}
            customerName={`${selectedCustomer.firstName} ${selectedCustomer.lastName}`}
          />
        </>
      )}

      <ImportCustomersModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
      />

      <SendCustomerMessageModal
        isOpen={showSendMessageModal}
        onClose={() => setShowSendMessageModal(false)}
        customer={selectedCustomerForMessage!}
      />

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}