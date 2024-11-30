import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle } from 'lucide-react';
import { useCommunicationStore } from '../../store/communicationStore';
import { useAuthStore } from '../../store/authStore';
import { useCustomerDocumentStore } from '../../store/customerDocumentStore';

export default function CommunicationLog() {
  const { user } = useAuthStore();
  const { communications, loading } = useCommunicationStore();
  const { getDocumentsByCustomer } = useCustomerDocumentStore();

  // Filter communications for the current user if they are a customer
  const customerCommunications = React.useMemo(() => {
    if (!user) return [];
    
    // For customers, filter by their ID as customerId
    if (user.role === 'customer') {
      return communications
        .filter(comm => comm.customerId === user.id)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    
    // For admin/staff, show all communications
    return communications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [user, communications]);

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
          {customerCommunications.map((comm) => (
            <div 
              key={comm.id} 
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {comm.type}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(comm.createdAt, { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                {comm.summary}
              </p>
            </div>
          ))}
          {customerCommunications.length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400 py-4">
              No communications yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
