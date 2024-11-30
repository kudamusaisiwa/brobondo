import React from 'react';
import { Building2, Phone, CreditCard, Home, Calendar, FileText, Truck } from 'lucide-react';
import QuickEditField from './QuickEditField';
import type { Customer } from '../../types';

interface CompanyDetailsCardProps {
  customer: Customer;
  onUpdate: (field: keyof Customer, value: string) => Promise<void>;
}

export default function CompanyDetailsCard({ customer, onUpdate }: CompanyDetailsCardProps) {
  // Debug log to check customer data
  React.useEffect(() => {
    console.log('CompanyDetailsCard customer:', customer);
  }, [customer]);

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
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Additional Information</h3>
      
      <div className="space-y-6">
        <QuickEditField
          icon={FileText}
          label="Passport Number"
          value={customer?.passportNumber || ''}
          onSave={(value) => onUpdate('passportNumber', value)}
          placeholder="Enter passport number"
          validation={{
            pattern: /^[A-Z0-9]{6,12}$/,
            message: 'Please enter a valid passport number (6-12 characters, letters and numbers only)'
          }}
        />

        <QuickEditField
          icon={Calendar}
          label="Date of Birth"
          value={formatDate(customer?.dateOfBirth)}
          onSave={async (value) => {
            try {
              const date = new Date(value);
              if (isNaN(date.getTime())) {
                throw new Error('Invalid date');
              }
              await onUpdate('dateOfBirth', value);
            } catch (e) {
              console.error('Error saving date:', e);
              throw new Error('Please enter a valid date');
            }
          }}
          type="date"
          validation={{
            required: true,
            message: 'Please enter a valid date'
          }}
        />

        <QuickEditField
          icon={Home}
          label="Home Address"
          value={customer?.homeAddress || ''}
          onSave={(value) => onUpdate('homeAddress', value)}
          placeholder="Enter home address"
          validation={{
            required: true,
            pattern: /^.{5,}$/,
            message: 'Address must be at least 5 characters long'
          }}
        />

        <QuickEditField
          icon={Building2}
          label="Company Names"
          value={Array.isArray(customer?.companyNames) ? 
            customer.companyNames.join('\n') : 
            typeof customer?.companyNames === 'string' ?
            customer.companyNames :
            ''}
          onSave={async (value) => {
            try {
              const companies = value
                .split('\n')
                .map(c => c.trim())
                .filter(Boolean);
              await onUpdate('companyNames', JSON.stringify(companies));
            } catch (e) {
              console.error('Error saving company names:', e);
              throw new Error('Please enter valid company names');
            }
          }}
          multiline
          placeholder="Enter company names (one per line)"
        />

        <QuickEditField
          icon={Truck}
          label="Card Delivery Address"
          value={customer?.cardDeliveryAddress || ''}
          onSave={(value) => onUpdate('cardDeliveryAddress', value)}
          placeholder="Enter card delivery address"
          validation={{
            pattern: /^.{5,}$/,
            message: 'Address must be at least 5 characters long'
          }}
        />
      </div>
    </div>
  );
}