import React from 'react';
import { User, Mail, Phone, Calendar, ExternalLink } from 'lucide-react';
import { Tenant } from '../../store/tenantStore';
import { useNavigate } from 'react-router-dom';

interface TenantCardProps {
  tenant: Tenant;
}

export default function TenantCard({ tenant }: TenantCardProps) {
  const navigate = useNavigate();

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString();
  };

  return (
    <div 
      onClick={() => navigate(`/tenants/${tenant.id}`)}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 border-gray-200 dark:border-gray-700 
        p-4 cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 group transition-all"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
          <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <h3 className="font-medium text-gray-900 dark:text-white">
            {tenant.firstName} {tenant.lastName}
          </h3>
        </div>
        <ExternalLink className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
          <Mail className="w-4 h-4" />
          <span>{tenant.email}</span>
        </div>

        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
          <Phone className="w-4 h-4" />
          <span>{tenant.phone}</span>
        </div>

        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
          <Calendar className="w-4 h-4" />
          <span>
            Lease: {formatDate(tenant.leaseStartDate)} - {formatDate(tenant.leaseEndDate)}
          </span>
        </div>

        <div className="mt-2 text-sm">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-medium
            ${tenant.leaseStatus === 'active' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              : tenant.leaseStatus === 'pending'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
            }`}
          >
            {tenant.leaseStatus.charAt(0).toUpperCase() + tenant.leaseStatus.slice(1)}
          </span>
        </div>
      </div>
    </div>
  );
}
