import React, { useState } from 'react';
import { Owner } from '../../store/ownerStore';
import { Edit2, Check, X, Building2 } from 'lucide-react';

interface OwnerDetailsCardProps {
  owner: Owner;
  onUpdate: (field: keyof Owner, value: any) => Promise<void>;
}

export default function OwnerDetailsCard({ owner, onUpdate }: OwnerDetailsCardProps) {
  const [editingField, setEditingField] = useState<keyof Owner | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleEdit = (field: keyof Owner) => {
    setEditingField(field);
    setEditValue(owner[field] as string);
  };

  const handleSave = async () => {
    if (!editingField) return;
    
    try {
      await onUpdate(editingField, editValue);
      setEditingField(null);
    } catch (error) {
      console.error('Error updating field:', error);
    }
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValue('');
  };

  const renderField = (label: string, field: keyof Owner) => {
    const isEditing = editingField === field;
    const value = owner[field];

    return (
      <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {label}
        </span>
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                autoFocus
              />
              <button
                onClick={handleSave}
                className="p-1 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={handleCancel}
                className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <span className="text-sm text-gray-900 dark:text-gray-100">{value}</span>
              <button
                onClick={() => handleEdit(field)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Owner Details
      </h2>
      <div className="space-y-1">
        {renderField('First Name', 'firstName')}
        {renderField('Last Name', 'lastName')}
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Building2 className="h-4 w-4 mr-2" />
            <span>Company</span>
          </div>
          {renderField('Company', 'company')}
        </div>
        {renderField('Email', 'email')}
        {renderField('Phone', 'phone')}
        {renderField('Address', 'address')}
        {renderField('Status', 'status')}
      </div>
    </div>
  );
}
