import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useCommunicationStore } from '../../store/communicationStore';
import { useCustomerPortalStore } from '../../store/customerPortalStore';

export default function CommunicationLog() {
  const { communications, loading } = useCommunicationStore();
  const { customer } = useCustomerPortalStore();

  // Filter communications for the current customer
  const customerCommunications = React.useMemo(() => {
    if (!customer) return [];
    return communications
      .filter(comm => comm.customerId === customer.id)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [communications, customer]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Communication History</h2>
        <div className="text-center text-gray-500 dark:text-gray-400 py-4">
          Loading communications...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Communication History</h2>
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {customerCommunications.length > 0 ? (
            customerCommunications.map((comm) => (
              <div 
                key={comm.id} 
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2"
              >
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {comm.type}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                  {comm.summary}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-4">
              No communications yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
