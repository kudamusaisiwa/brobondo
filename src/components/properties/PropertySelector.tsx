import React, { useState, useEffect } from 'react';
import { Building2, Search, Plus, X, ExternalLink } from 'lucide-react';
import { usePropertyStore } from '../../store/propertyStore';
import { Property } from '../../store/propertyStore';
import { useNavigate } from 'react-router-dom';

interface PropertySelectorProps {
  selectedPropertyIds: string[];
  onChange: (propertyIds: string[]) => void | Promise<void>;
  multiple?: boolean;
  filterType?: 'rental' | 'sale' | 'all';
}

export default function PropertySelector({ 
  selectedPropertyIds, 
  onChange,
  multiple = false,
  filterType = 'all'
}: PropertySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { properties, initialize } = usePropertyStore();
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!properties.length) {
      initialize();
    }
  }, [initialize]);

  useEffect(() => {
    const filtered = properties.filter(property => 
      !selectedPropertyIds.includes(property.id) && 
      (filterType === 'all' || property.listingType === filterType) &&
      (
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.address.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredProperties(filtered);
  }, [searchTerm, properties, selectedPropertyIds, filterType]);

  const selectedProperties = properties.filter(p => 
    selectedPropertyIds.includes(p.id) && 
    (filterType === 'all' || p.listingType === filterType)
  );

  const handleRemoveProperty = async (propertyId: string) => {
    const newPropertyIds = selectedPropertyIds.filter(id => id !== propertyId);
    await onChange(newPropertyIds);
  };

  const handleAddProperty = async (propertyId: string) => {
    const newPropertyIds = multiple 
      ? [...selectedPropertyIds, propertyId]
      : [propertyId];
    await onChange(newPropertyIds);
    if (!multiple) {
      setIsOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Selected Properties */}
      <div className="space-y-2">
        {selectedProperties.map(property => (
          <div
            key={property.id}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <Building2 className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {property.title}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {property.location.address}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate(`/properties/${property.id}`)}
                className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <ExternalLink className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleRemoveProperty(property.id)}
                className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Property Button */}
      {(multiple || selectedPropertyIds.length === 0) && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
        >
          <Plus className="h-5 w-5" />
          <span>Add Property</span>
        </button>
      )}

      {/* Property Selector Modal */}
      {isOpen && (
        <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {filteredProperties.length === 0 ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                No properties found
              </div>
            ) : (
              filteredProperties.map(property => (
                <div
                  key={property.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
                  onClick={() => handleAddProperty(property.id)}
                >
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {property.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {property.location.address}
                      </div>
                    </div>
                  </div>
                  <Plus className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
