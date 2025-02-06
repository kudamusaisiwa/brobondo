import React, { useEffect, useState } from 'react';
import { Plus, Search, MoreVertical, UserSquare, Trash2, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTenantStore } from '../store/tenantStore';
import Toast from '../components/ui/Toast';
import { Modal } from '../components/ui/Modal';
import { TenantForm } from '../components/tenants/TenantForm';

export default function Tenants() {
  const navigate = useNavigate();
  const { tenants, loading, error, initialize, addTenant, deleteTenant } = useTenantStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTenant, setNewTenant] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    propertyCount: 0,
    status: 'active' as const,
    leaseStatus: 'pending' as const,
    rentedProperties: [],
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    initialize();
  }, [initialize]);

  const filteredTenants = tenants.filter(
    (tenant) =>
      tenant.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddTenant = async () => {
    try {
      await addTenant(newTenant);
      setShowAddModal(false);
      setNewTenant({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        propertyCount: 0,
        status: 'active',
        leaseStatus: 'pending',
        rentedProperties: [],
      });
      setToastMessage('Tenant added successfully');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      console.error('Error adding tenant:', error);
      setToastMessage('Failed to add tenant');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleDeleteTenant = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this tenant?')) return;

    try {
      await deleteTenant(id);
      setToastMessage('Tenant deleted successfully');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      console.error('Error deleting tenant:', error);
      setToastMessage('Failed to delete tenant');
      setToastType('error');
      setShowToast(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading tenants...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600 dark:text-red-400">Error loading tenants: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Tenants</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 rounded-md"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Tenant
        </button>
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search tenants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 text-sm border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Properties
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTenants.map((tenant) => (
              <tr key={tenant.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <UserSquare className="h-10 w-10 text-gray-400" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {tenant.firstName} {tenant.lastName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-300">
                        {tenant.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">{tenant.address}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-300">{tenant.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-900 dark:text-white">
                      {tenant.propertyCount} {tenant.propertyCount === 1 ? 'Property' : 'Properties'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      tenant.leaseStatus === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : tenant.leaseStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}
                  >
                    {tenant.leaseStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => navigate(`/admin/tenants/${tenant.id}`)}
                      className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                    >
                      <UserSquare className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTenant(tenant.id)}
                      className="text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-300"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Tenant"
      >
        <TenantForm
          onSubmit={handleAddTenant}
          onCancel={() => setShowAddModal(false)}
          initialData={newTenant}
        />
      </Modal>

      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        message={toastMessage}
        type={toastType}
      />
    </div>
  );
}
