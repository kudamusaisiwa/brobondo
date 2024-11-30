import React, { useState } from 'react';
import { Edit2, Check, X, Loader2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface QuickEditFieldProps {
  icon: LucideIcon;
  label: string;
  value?: string;
  onSave: (value: string) => Promise<void>;
  placeholder?: string;
  validation?: {
    required?: boolean;
    pattern?: RegExp;
    message: string;
  };
  formatValue?: (value: string) => string;
}

export default function QuickEditField({
  icon: Icon,
  label,
  value,
  onSave,
  placeholder,
  validation,
  formatValue
}: QuickEditFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const validate = (value: string): boolean => {
    if (!validation) return true;

    if (validation.required && !value.trim()) {
      setError('This field is required');
      return false;
    }

    if (validation.pattern && !validation.pattern.test(value)) {
      setError(validation.message);
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validate(editValue)) return;

    setIsSaving(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
      setError('');
    } catch (error) {
      setError('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value || '');
    setIsEditing(false);
    setError('');
  };

  const displayValue = formatValue ? formatValue(value || '') : value;

  return (
    <div className="relative group">
      <div className="flex items-start space-x-3">
        <Icon className={`h-5 w-5 mt-0.5 ${error ? 'text-red-400' : 'text-gray-400'}`} />
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
            {label}
          </label>
          {isEditing ? (
            <div className="mt-1 space-y-2">
              <input
                type="text"
                value={editValue}
                onChange={(e) => {
                  setEditValue(e.target.value);
                  setError('');
                }}
                className={`modern-input py-1 text-sm ${
                  error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                }`}
                placeholder={placeholder}
                autoFocus
              />
              {error && (
                <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
              )}
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-white bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300"
                >
                  {isSaving ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <Check className="h-3 w-3 mr-1" />
                  )}
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-1 flex items-center group">
              <p className="text-sm text-gray-900 dark:text-white">
                {displayValue || <span className="text-gray-400 dark:text-gray-500">Not set</span>}
              </p>
              <button
                onClick={() => setIsEditing(true)}
                className="ml-2 p-1 rounded-full text-gray-400 opacity-0 group-hover:opacity-100 hover:text-gray-500 dark:hover:text-gray-300 transition-opacity"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}