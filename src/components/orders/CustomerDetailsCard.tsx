import React from 'react';
import { Mail, Phone, Building2, MapPin } from 'lucide-react';
import type { Customer } from '../../types';

interface CustomerDetailsCardProps {
  customer: Customer | null;
}

export default function CustomerDetailsCard({ customer }: CustomerDetailsCardProps) {
  if (!customer) return null;

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getRandomColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  const avatarColor = getRandomColor(`${customer.firstName} ${customer.lastName}`);

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <div className="p-6">
        <div className="flex items-start space-x-4">
          {/* Avatar with Initials */}
          <div className={`flex-shrink-0 w-12 h-12 rounded-full ${avatarColor} flex items-center justify-center`}>
            <span className="text-white text-lg font-medium">
              {getInitials(customer.firstName, customer.lastName)}
            </span>
          </div>

          {/* Customer Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {customer.firstName} {customer.lastName}
              </h2>
            </div>
            {customer.companyName && (
              <div className="mt-1 flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Building2 className="flex-shrink-0 h-4 w-4 mr-1" />
                {customer.companyName}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Contact Details */}
          <div className="space-y-3">
            {customer.email && (
              <a
                href={`mailto:${customer.email}`}
                className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              >
                <Mail className="flex-shrink-0 h-4 w-4 mr-2" />
                <span className="truncate">{customer.email}</span>
              </a>
            )}
            
            {customer.phone && (
              <a
                href={`tel:${customer.phone}`}
                className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              >
                <Phone className="flex-shrink-0 h-4 w-4 mr-2" />
                <span>{customer.phone}</span>
              </a>
            )}
          </div>

          {/* Address */}
          {customer.address && (
            <div className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="flex-shrink-0 h-4 w-4 mt-0.5" />
              <span className="flex-1">{customer.address}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
