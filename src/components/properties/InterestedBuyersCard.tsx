import React, { useEffect } from 'react';
import { Users, Mail, Phone, DollarSign } from 'lucide-react';
import { useBuyerStore } from '../../store/buyerStore';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters';

interface InterestedBuyersCardProps {
  propertyId: string;
}

export default function InterestedBuyersCard({ propertyId }: InterestedBuyersCardProps) {
  const { buyers, loading, error, initialize } = useBuyerStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!buyers.length) {
      initialize();
    }
  }, [initialize, buyers]);

  const interestedBuyers = buyers.filter(buyer => 
    buyer.interestedProperties?.includes(propertyId) && buyer.status === 'active'
  );

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Interested Buyers
            </h2>
          </div>
        </div>
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          Loading buyers...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Interested Buyers
            </h2>
          </div>
        </div>
        <div className="text-center py-4 text-red-500">
          Error loading buyers: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Interested Buyers
          </h2>
        </div>
        <span className="px-3 py-1 text-sm rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
          {interestedBuyers.length} {interestedBuyers.length === 1 ? 'buyer' : 'buyers'}
        </span>
      </div>

      <div className="space-y-4">
        {interestedBuyers.length > 0 ? (
          interestedBuyers.map(buyer => (
            <div
              key={buyer.id}
              className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
              onClick={() => navigate(`/admin/buyers/${buyer.id}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {buyer.name}
                  </h3>
                  <div className="mt-1 space-y-1">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Mail className="h-4 w-4 mr-2" />
                      {buyer.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Phone className="h-4 w-4 mr-2" />
                      {buyer.phone}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Budget: {formatCurrency(buyer.budget)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No interested buyers yet
          </div>
        )}
      </div>
    </div>
  );
}
