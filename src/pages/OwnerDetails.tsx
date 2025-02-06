import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useOwnerStore } from '../store/ownerStore';
import OwnerDetailsCard from '../components/owners/OwnerDetailsCard';
import OwnerDocumentsCard from '../components/owners/OwnerDocumentsCard';
import Toast from '../components/ui/Toast';

export default function OwnerDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { owners, updateOwner, loading, error, initialize } = useOwnerStore();
  const [showToast, setShowToast] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');
  const [toastType, setToastType] = React.useState<'success' | 'error'>('success');

  // Initialize owners if not already loaded
  useEffect(() => {
    if (!owners.length) {
      initialize();
    }
  }, [initialize, owners]);

  const owner = id ? owners.find(t => t.id === id) : null;

  const handleUpdate = async (field: keyof typeof owner, value: any) => {
    if (!owner || !id) return;

    try {
      await updateOwner(id, { [field]: value });
      setToastMessage('Updated successfully');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      console.error('Error updating owner:', error);
      setToastMessage('Failed to update');
      setToastType('error');
      setShowToast(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading owner details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600 dark:text-red-400">Error loading owner: {error}</div>
      </div>
    );
  }

  if (!id) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Invalid owner ID</div>
      </div>
    );
  }

  if (!owner) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Owner not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/owners')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {owner.firstName} {owner.lastName}
          </h1>
          <span className={`
            px-2 py-1 text-sm rounded-full
            ${owner.status === 'active' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }
          `}>
            {owner.status.charAt(0).toUpperCase() + owner.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OwnerDetailsCard
          owner={owner}
          onUpdate={handleUpdate}
        />
        
        {id && (
          <OwnerDocumentsCard
            ownerId={id}
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
