import React from 'react';
import { User, Briefcase } from 'lucide-react';
import { useUserStore } from '../../store/userStore';

interface MandateHolderCardProps {
  mandateHolderId?: string;
}

export default function MandateHolderCard({ mandateHolderId }: MandateHolderCardProps) {
  const { users } = useUserStore();
  const mandateHolder = mandateHolderId ? users.find(user => user.id === mandateHolderId) : null;

  if (!mandateHolder) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Briefcase className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Mandate Holder
            </h2>
          </div>
        </div>
        <div className="text-gray-500 dark:text-gray-400">
          No mandate holder assigned
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Briefcase className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Mandate Holder
          </h2>
        </div>
      </div>
      
      <div className="flex items-center text-gray-600 dark:text-gray-300">
        <User className="h-4 w-4 mr-2" />
        <span className="font-medium text-gray-900 dark:text-white">
          {mandateHolder.name}
        </span>
      </div>
    </div>
  );
}
