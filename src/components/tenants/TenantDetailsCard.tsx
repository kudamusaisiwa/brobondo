import React from 'react';
import { Home, Phone, Mail, Calendar, FileText, CreditCard, Building2, User } from 'lucide-react';
import QuickEditField from '../customers/QuickEditField';
import PropertySelector from './PropertySelector';
import DatePickerField from '../ui/DatePicker';
import type { Tenant } from '../../store/tenantStore';

interface TenantDetailsCardProps {
  tenant: Tenant;
  onUpdate: (field: keyof Tenant, value: any) => Promise<void>;
}

export default function TenantDetailsCard({ tenant, onUpdate }: TenantDetailsCardProps) {
  const formatDate = (date: Date | null | undefined): string => {
    if (!date) return '';
    try {
      return date instanceof Date ? 
        date.toISOString().split('T')[0] : 
        new Date(date).toISOString().split('T')[0];
    } catch (e) {
      console.error('Error formatting date:', e);
      return '';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Tenant Information</h3>
      
      <div className="space-y-6">
        <QuickEditField
          icon={User}
          label="First Name"
          value={tenant?.firstName || ''}
          onSave={(value) => onUpdate('firstName', value)}
          placeholder="Enter first name"
          validation={{
            required: true,
            pattern: /^[a-zA-Z\s]{2,}$/,
            message: 'Please enter a valid first name (at least 2 characters)'
          }}
        />

        <QuickEditField
          icon={User}
          label="Last Name"
          value={tenant.lastName}
          onSave={(value) => onUpdate('lastName', value)}
          validation={{
            required: true,
            pattern: /^[a-zA-Z\s]{2,}$/,
            message: 'Please enter a valid last name (at least 2 characters)'
          }}
        />

        <QuickEditField
          icon={Building2}
          label="Company"
          value={tenant.company || ''}
          onSave={(value) => onUpdate('company', value)}
          placeholder="Enter company name (optional)"
        />

        <QuickEditField
          icon={Mail}
          label="Email"
          value={tenant.email}
          onSave={(value) => onUpdate('email', value)}
          validation={{
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Please enter a valid email address'
          }}
        />

        <QuickEditField
          icon={Phone}
          label="Phone"
          value={tenant.phone}
          onSave={(value) => onUpdate('phone', value)}
          validation={{
            required: true,
            pattern: /^\+?[\d\s-]{10,}$/,
            message: 'Please enter a valid phone number'
          }}
        />

        <QuickEditField
          icon={Home}
          label="Address"
          value={tenant.address}
          onSave={(value) => onUpdate('address', value)}
          validation={{
            required: true,
            message: 'Please enter an address'
          }}
        />

        <QuickEditField
          icon={FileText}
          label="ID Number"
          value={tenant.idNumber || ''}
          onSave={(value) => onUpdate('idNumber', value)}
          placeholder="Enter ID number (optional)"
        />

        <QuickEditField
          icon={CreditCard}
          label="Monthly Rent"
          value={tenant.monthlyRent?.toString() || ''}
          onSave={(value) => onUpdate('monthlyRent', parseFloat(value))}
          validation={{
            pattern: /^\d+(\.\d{1,2})?$/,
            message: 'Please enter a valid amount'
          }}
        />

        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Home className="h-4 w-4 mr-2" />
            <span>Rented Properties</span>
          </div>
          <PropertySelector
            tenantId={tenant.id}
            rentedPropertyIds={tenant.rentedProperties}
            onUpdate={(propertyIds) => onUpdate('rentedProperties', propertyIds)}
          />
        </div>

        <DatePickerField
          icon={Calendar}
          label="Lease Start Date"
          value={tenant?.leaseStartDate ? new Date(tenant.leaseStartDate) : null}
          onChange={(date) => onUpdate('leaseStartDate', date)}
          placeholder="Select lease start date"
        />

        <DatePickerField
          icon={Calendar}
          label="Lease End Date"
          value={tenant?.leaseEndDate ? new Date(tenant.leaseEndDate) : null}
          onChange={(date) => onUpdate('leaseEndDate', date)}
          placeholder="Select lease end date"
          minDate={tenant?.leaseStartDate ? new Date(tenant.leaseStartDate) : undefined}
        />

        <QuickEditField
          icon={FileText}
          label="Notes"
          value={tenant?.notes || ''}
          onSave={(value) => onUpdate('notes', value)}
          placeholder="Enter notes"
          multiline
        />
      </div>
    </div>
  );
}
