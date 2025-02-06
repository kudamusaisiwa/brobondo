import React, { useState } from 'react';
import { ChevronDown, CheckCircle2 } from 'lucide-react';
import { usePropertyStore } from '../../store/propertyStore';
import type { Property } from '../../store/propertyStore';

const statusColors = {
  available: 'bg-green-600 text-white',
  rented: 'bg-amber-600 text-white',
  sold: 'bg-purple-600 text-white',
  maintenance: 'bg-gray-600 text-white'
};

const statusLabels = {
  available: (listingType: 'sale' | 'rental') => listingType === 'rental' ? 'For Rent' : 'For Sale',
  rented: 'Currently Rented',
  sold: 'Sold',
  maintenance: 'Under Maintenance'
};

interface PropertyStatusDropdownProps {
  property: Property;
}

export default function PropertyStatusDropdown({ property }: PropertyStatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { updateProperty } = usePropertyStore();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: Property['status']) => {
    if (newStatus === property.status) {
      setIsOpen(false);
      return;
    }

    setIsUpdating(true);
    try {
      await updateProperty(property.id!, { status: newStatus });
    } catch (error) {
      console.error('Error updating property status:', error);
    } finally {
      setIsUpdating(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold uppercase tracking-wide ${
          statusColors[property.status]
        } hover:opacity-80 transition-opacity`}
      >
        {property.status === 'available' 
          ? statusLabels.available(property.listingType)
          : statusLabels[property.status]}
        <ChevronDown className={`ml-2 h-4 w-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {Object.keys(statusColors).map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status as Property['status'])}
                className={`w-full text-left px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center ${
                  property.status === status ? 'bg-gray-50 dark:bg-gray-700' : ''
                }`}
                role="menuitem"
              >
                {status === 'available' 
                  ? statusLabels.available(property.listingType)
                  : statusLabels[status as keyof typeof statusLabels]}
                {property.status === status && (
                  <CheckCircle2 className="ml-auto h-4 w-4 text-green-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
