import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTenantStore } from '../store/tenantStore';
import TenantDetailsCard from '../components/tenants/TenantDetailsCard';
import TenantDocumentsCard from '../components/tenants/TenantDocumentsCard';
import Toast from '../components/ui/Toast';

export default function TenantDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tenants, updateTenant, loading, error, initialize } = useTenantStore();
  const [showToast, setShowToast] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');
  const [toastType, setToastType] = React.useState<'success' | 'error'>('success');

  // Initialize tenants if not already loaded
  useEffect(() => {
    if (!tenants.length) {
      initialize();
    }
  }, [initialize, tenants]);

  const tenant = id ? tenants.find(t => t.id === id) : null;

  const handleUpdate = async (field: keyof typeof tenant, value: any) => {
    if (!tenant || !id) return;

    try {
      await updateTenant(id, { [field]: value });
      setToastMessage('Updated successfully');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      console.error('Error updating tenant:', error);
      setToastMessage('Failed to update');
      setToastType('error');
      setShowToast(true);
    }
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading tenant details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[400px]">
        <div className="bg-red-50 dark:bg-red-900/50 p-6 rounded-lg max-w-lg w-full text-center">
          <p className="text-red-800 dark:text-red-200">Error loading tenant details: {error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 inline-flex items-center text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!id) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[400px]">
        <div className="bg-yellow-50 dark:bg-yellow-900/50 p-6 rounded-lg max-w-lg w-full text-center">
          <p className="text-yellow-800 dark:text-yellow-200">Invalid tenant ID</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 inline-flex items-center text-yellow-700 dark:text-yellow-300 hover:text-yellow-800 dark:hover:text-yellow-200"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[400px]">
        <div className="bg-yellow-50 dark:bg-yellow-900/50 p-6 rounded-lg max-w-lg w-full text-center">
          <p className="text-yellow-800 dark:text-yellow-200">Tenant not found</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 inline-flex items-center text-yellow-700 dark:text-yellow-300 hover:text-yellow-800 dark:hover:text-yellow-200"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/tenants')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {tenant.firstName} {tenant.lastName}
          </h1>
          <span className={`
            px-2 py-1 text-sm rounded-full
            ${(tenant.leaseStatus || 'inactive') === 'active' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : (tenant.leaseStatus || 'inactive') === 'pending'
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }
          `}>
            {((tenant.leaseStatus || 'inactive').charAt(0).toUpperCase() + (tenant.leaseStatus || 'inactive').slice(1))}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TenantDetailsCard
          tenant={tenant}
          onUpdate={handleUpdate}
        />
        
        {id && (
          <TenantDocumentsCard
            tenantId={id}
          />
        )}
      </div>

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
