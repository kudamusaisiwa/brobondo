import React from 'react';
import { CheckCircle, Circle, Clock } from 'lucide-react';
import type { Order, OperationalStatus } from '../../types';

interface ServiceStagesProps {
  order?: Order | null;
}

const stages: Array<{
  status: OperationalStatus;
  label: string;
  description: string;
  estimatedTime: string;
}> = [
  {
    status: 'cipc_name',
    label: 'CIPC Name',
    description: 'Company name registration with CIPC',
    estimatedTime: '1-2 days'
  },
  {
    status: 'cipc_pending',
    label: 'CIPC Pending',
    description: 'Application processing',
    estimatedTime: '1-5 days'
  },
  {
    status: 'cipc_complete',
    label: 'CIPC Complete',
    description: 'Company registration completed',
    estimatedTime: 'Complete'
  },
  {
    status: 'fnb_forms',
    label: 'FNB Forms',
    description: 'Bank account application forms',
    estimatedTime: 'Same day'
  },
  {
    status: 'account_opened',
    label: 'Account Opened',
    description: 'Bank account successfully opened',
    estimatedTime: 'Same day'
  },
  {
    status: 'card_delivered',
    label: 'Card Delivered',
    description: 'Bank card delivery',
    estimatedTime: '7-14 days'
  },
  {
    status: 'process_complete',
    label: 'Complete',
    description: 'All processes completed',
    estimatedTime: 'Complete'
  }
];

export default function ServiceStages({ order }: ServiceStagesProps) {
  if (!order) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Service Progress</h2>
        <div className="text-center text-gray-500 dark:text-gray-400 py-4">
          No order information available
        </div>
      </div>
    );
  }

  const currentStatus = order.status;
  const statusHistory = order.statusHistory || [];

  const getStageStatus = (stage: OperationalStatus) => {
    const stageIndex = stages.findIndex(s => s.status === stage);
    const currentIndex = stages.findIndex(s => s.status === currentStatus);

    if (statusHistory.includes(stage)) return 'completed';
    if (stage === currentStatus) return 'current';
    if (stageIndex < currentIndex) return 'completed';
    return 'pending';
  };

  const calculateProgress = () => {
    const completedStages = stages.filter(stage => 
      getStageStatus(stage.status) === 'completed'
    ).length;
    const totalStages = stages.length;
    return Math.round((completedStages / (totalStages - 1)) * 100);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Service Progress</h2>
        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
          {calculateProgress()}% Complete
        </span>
      </div>
      
      <div className="relative mb-4">
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
          <div 
            className="h-2 bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${calculateProgress()}%` }}
          />
        </div>
      </div>

      <div className="space-y-4">
        {stages.map((stage, index) => {
          const status = getStageStatus(stage.status);
          
          return (
            <div key={stage.status} className="relative">
              {index !== stages.length - 1 && (
                <div 
                  className={`absolute left-3.5 top-8 w-0.5 h-full ${
                    status === 'completed' ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              )}
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {status === 'completed' ? (
                    <CheckCircle className="h-7 w-7 text-green-500" />
                  ) : status === 'current' ? (
                    <Clock className="h-7 w-7 text-blue-500 animate-pulse" />
                  ) : (
                    <Circle className="h-7 w-7 text-gray-300 dark:text-gray-600" />
                  )}
                </div>
                
                <div className="ml-4">
                  <h3 className={`text-sm font-medium ${
                    status === 'completed' ? 'text-green-500' :
                    status === 'current' ? 'text-blue-500' :
                    'text-gray-500 dark:text-gray-400'
                  }`}>
                    {stage.label}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    {stage.description}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {status === 'completed' ? 'Completed' : `Estimated time: ${stage.estimatedTime}`}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}