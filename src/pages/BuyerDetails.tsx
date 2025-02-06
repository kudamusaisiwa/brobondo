import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useBuyerStore } from '../store/buyerStore';
import BuyerDetailsCard from '../components/buyers/BuyerDetailsCard';
import BuyerDocumentsCard from '../components/buyers/BuyerDocumentsCard';
import Toast from '../components/ui/Toast';

export default function BuyerDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { buyers, updateBuyer, loading, error, initialize } = useBuyerStore();
  const [showToast, setShowToast] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');
  const [toastType, setToastType] = React.useState<'success' | 'error'>('success');

  useEffect(() => {
    if (!buyers.length) {
      initialize();
    }
  }, [initialize, buyers]);

  const buyer = id ? buyers.find(b => b.id === id) : null;

  const handleUpdate = async (field: keyof typeof buyer, value: any) => {
    if (!buyer || !id) return;

    try {
      await updateBuyer(id, { [field]: value });
      setToastMessage('Updated successfully');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      console.error('Error updating buyer:', error);
      setToastMessage('Failed to update');
      setToastType('error');
      setShowToast(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading buyer details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600 dark:text-red-400">Error loading buyer: {error.message}</div>
      </div>
    );
  }

  if (!buyer) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Buyer not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/buyers')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Buyer Details</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-8">
          <BuyerDetailsCard buyer={buyer} onUpdate={handleUpdate} />
        </div>

        {/* Right Column - Documents */}
        <div>
          <BuyerDocumentsCard buyerId={buyer.id} />
        </div>
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
