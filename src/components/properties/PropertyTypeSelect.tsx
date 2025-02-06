import React, { useState } from 'react';
import { PropertyTypeOption, propertyTypes } from '../../types/propertyTypes';

interface PropertyTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const PropertyTypeSelect: React.FC<PropertyTypeSelectProps> = ({
  value,
  onChange,
  error
}) => {
  const [selectedMainType, setSelectedMainType] = useState(() => {
    // Find the main type based on the current value
    const mainType = propertyTypes.find(type => 
      type.value === value || type.subTypes?.some(subType => subType.value === value)
    );
    return mainType?.value || '';
  });

  // Find the currently selected option (either main type or subtype)
  const getSelectedOption = (value: string): PropertyTypeOption | undefined => {
    for (const mainType of propertyTypes) {
      if (mainType.value === value) return mainType;
      const subType = mainType.subTypes?.find(sub => sub.value === value);
      if (subType) return subType;
    }
    return undefined;
  };

  const selectedOption = getSelectedOption(value);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
        Property Type
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {/* Main Type Select */}
        <select
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          value={selectedMainType}
          onChange={(e) => {
            const newMainType = e.target.value;
            setSelectedMainType(newMainType);
            // When main type is selected, set the value to the main type
            onChange(newMainType);
          }}
        >
          <option value="">Select Type</option>
          {propertyTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>

        {/* Sub Type Select */}
        {selectedMainType && (
          <select
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value={selectedMainType}>Any {propertyTypes.find(t => t.value === selectedMainType)?.label}</option>
            {propertyTypes
              .find(type => type.value === selectedMainType)
              ?.subTypes?.map((subType) => (
                <option key={subType.value} value={subType.value}>
                  {subType.label}
                </option>
              ))}
          </select>
        )}
      </div>
      {error && <span className="text-sm text-red-500">{error}</span>}
      
      {/* Show the full selection as a badge */}
      {selectedOption && (
        <div className="mt-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
            {selectedOption.label}
          </span>
        </div>
      )}
    </div>
  );
};
