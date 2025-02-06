import React from 'react';
import { User, Phone, Mail, DollarSign, Home, MapPin, FileText, Building2 } from 'lucide-react';
import QuickEditField from '../customers/QuickEditField';
import PropertySelector from '../properties/PropertySelector';
import type { Buyer } from '../../store/buyerStore';

interface BuyerDetailsCardProps {
  buyer: Buyer;
  onUpdate: (field: keyof Buyer, value: any) => Promise<void>;
}

export default function BuyerDetailsCard({ buyer, onUpdate }: BuyerDetailsCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Buyer Information</h3>
      
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <User className="h-4 w-4 mr-2" />
              <span>Name</span>
            </div>
            <QuickEditField
              icon={User}
              label="Name"
              value={buyer?.name || ''}
              onSave={(value) => onUpdate('name', value)}
              placeholder="Enter name"
              validation={{
                required: true,
                pattern: /^[a-zA-Z\s]{2,}$/,
                message: 'Please enter a valid name (at least 2 characters)'
              }}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Building2 className="h-4 w-4 mr-2" />
              <span>Company</span>
            </div>
            <QuickEditField
              icon={Building2}
              label="Company"
              value={buyer.company || ''}
              onSave={(value) => onUpdate('company', value)}
              placeholder="Enter company name (optional)"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Mail className="h-4 w-4 mr-2" />
              <span>Email</span>
            </div>
            <QuickEditField
              icon={Mail}
              label="Email"
              value={buyer?.email || ''}
              onSave={(value) => onUpdate('email', value)}
              placeholder="Enter email"
              validation={{
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email address'
              }}
            />
          </div>
        </div>

        <QuickEditField
          icon={Phone}
          label="Phone"
          value={buyer?.phone || ''}
          onSave={(value) => onUpdate('phone', value)}
          placeholder="Enter phone number"
          validation={{
            required: true,
            pattern: /^\+?[\d\s-]{10,}$/,
            message: 'Please enter a valid phone number'
          }}
        />

        <QuickEditField
          icon={DollarSign}
          label="Budget"
          value={buyer?.budget?.toString() || ''}
          onSave={(value) => onUpdate('budget', Number(value))}
          placeholder="Enter budget"
          type="number"
          validation={{
            required: true,
            min: 0,
            message: 'Please enter a valid budget amount'
          }}
        />

        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Home className="h-4 w-4 mr-2" />
            <span>Property Type</span>
          </div>
          <select
            value={buyer.propertyType}
            onChange={(e) => onUpdate('propertyType', e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="industrial">Industrial</option>
            <option value="land">Land</option>
          </select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <MapPin className="h-4 w-4 mr-2" />
            <span>Preferred Locations</span>
          </div>
          {buyer.preferredLocations.map((location, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={location}
                onChange={(e) => {
                  const newLocations = [...buyer.preferredLocations];
                  newLocations[index] = e.target.value;
                  onUpdate('preferredLocations', newLocations);
                }}
                className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                placeholder="Enter location"
              />
              {buyer.preferredLocations.length > 1 && (
                <button
                  onClick={() => {
                    const newLocations = buyer.preferredLocations.filter((_, i) => i !== index);
                    onUpdate('preferredLocations', newLocations);
                  }}
                  className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() => onUpdate('preferredLocations', [...buyer.preferredLocations, ''])}
            className="mt-2 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            + Add Location
          </button>
        </div>

        <QuickEditField
          icon={FileText}
          label="Notes"
          value={buyer?.notes || ''}
          onSave={(value) => onUpdate('notes', value)}
          placeholder="Enter notes"
          multiline
        />

        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <span>Status</span>
          </div>
          <select
            value={buyer.status}
            onChange={(e) => onUpdate('status', e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
            <Home className="h-4 w-4 mr-2" />
            <span>Interested Properties</span>
          </div>
          <PropertySelector
            selectedPropertyIds={buyer.interestedProperties || []}
            onChange={(propertyIds) => onUpdate('interestedProperties', propertyIds)}
            multiple={true}
            filterType="sale"
          />
        </div>
      </div>
    </div>
  );
}
