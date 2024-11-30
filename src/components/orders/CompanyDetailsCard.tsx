import React from 'react';
import { Building2, Phone, CreditCard } from 'lucide-react';
import QuickEditField from '../orders/QuickEditField';
import type { Order } from '../../types';

interface CompanyDetailsCardProps {
  order: Order;
  onUpdate: (field: keyof Order, value: string) => Promise<void>;
}

export default function CompanyDetailsCard({ order, onUpdate }: CompanyDetailsCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Company Details</h3>
      
      <div className="space-y-6">
        <QuickEditField
          icon={Building2}
          label="Registered Company Name"
          value={order.registeredCompanyName}
          onSave={(value) => onUpdate('registeredCompanyName', value)}
          placeholder="Enter registered company name"
          validation={{
            pattern: /^.{2,}$/,
            message: 'Company name must be at least 2 characters long'
          }}
        />

        <QuickEditField
          icon={Phone}
          label="South African Phone Number"
          value={order.rsaPhoneNumber}
          onSave={(value) => onUpdate('rsaPhoneNumber', value)}
          placeholder="+27 XX XXX XXXX"
          validation={{
            pattern: /^(\+27|0)[1-9][0-9]{8}$/,
            message: 'Please enter a valid South African phone number (+27 or 0 prefix)'
          }}
        />

        <QuickEditField
          icon={CreditCard}
          label="Bank Account Number"
          value={order.bankAccountNumber}
          onSave={(value) => onUpdate('bankAccountNumber', value)}
          placeholder="Enter bank account number"
          validation={{
            pattern: /^\d{5,}$/,
            message: 'Please enter a valid bank account number (minimum 5 digits)'
          }}
        />
      </div>
    </div>
  );
}