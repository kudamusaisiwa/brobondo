import React, { useState, useEffect } from 'react';
import { Building2, Search, Plus, X, ExternalLink } from 'lucide-react';
import { usePropertyStore } from '../../store/propertyStore';
import { Property } from '../../store/propertyStore';
import { useNavigate } from 'react-router-dom';
import { useTenantStore } from '../../store/tenantStore';

interface PropertySelectorProps {
  tenantId: string;
  rentedPropertyIds: string[];
  onUpdate: (propertyIds: string[]) => Promise<void>;
}

export default function PropertySelector({ tenantId, rentedPropertyIds, onUpdate }: PropertySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { properties, initialize, updateProperty } = usePropertyStore();
  const { updateTenantStatus } = useTenantStore();
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!properties.length) {
      initialize();
    }
  }, [initialize]);

  useEffect(() => {
    const filtered = properties.filter(property => 
      !rentedPropertyIds.includes(property.id) && 
      property.listingType === 'rental' &&
      (
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.address.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredProperties(filtered);
  }, [searchTerm, properties, rentedPropertyIds]);

  const rentedProperties = properties.filter(p => 
    rentedPropertyIds.includes(p.id) && 
    p.listingType === 'rental'
  );

  const handleRemoveProperty = async (propertyId: string) => {
    const newPropertyIds = rentedPropertyIds.filter(id => id !== propertyId);
    await onUpdate(newPropertyIds);
    
    // Update property status and rentedTo array
    const property = properties.find(p => p.id === propertyId);
    if (property) {
      const newRentedTo = (property.rentedTo || []).filter(id => id !== tenantId);
      console.log('Removing tenant from property:', {
        propertyId,
        tenantId,
        currentRentedTo: property.rentedTo,
        newRentedTo
      });
      
      await updateProperty(propertyId, {
        status: newRentedTo.length > 0 ? 'rented' : 'available',
        rentedTo: newRentedTo
      });
    }
    
    // If no properties are assigned, update tenant status to pending
    if (newPropertyIds.length === 0) {
      await updateTenantStatus(tenantId, 'pending');
    }
  };

  const handleAddProperty = async (propertyId: string) => {
    const newPropertyIds = [...rentedPropertyIds, propertyId];
    await onUpdate(newPropertyIds);
    
    // Update property status and rentedTo array
    const property = properties.find(p => p.id === propertyId);
    if (property) {
      const newRentedTo = [...(property.rentedTo || []), tenantId];
      console.log('Adding tenant to property:', {
        propertyId,
        tenantId,
        currentRentedTo: property.rentedTo,
        newRentedTo
      });
      
      await updateProperty(propertyId, {
        status: 'rented',
        rentedTo: newRentedTo
      });
    }
    
    // Update tenant status to active when a property is assigned
    await updateTenantStatus(tenantId, 'active');
    
    setIsOpen(false);
    setSearchTerm('');
  };

  const handlePropertyClick = (propertyId: string, e: React.MouseEvent) => {
    // Don't trigger if clicking the remove button
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    navigate(`/properties/${propertyId}`);
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
          <Building2 className="w-5 h-5" />
          <span>Rented Properties</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-2 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center space-x-1"
        >
          <Plus className="w-4 h-4" />
          <span>Add Property</span>
        </button>
      </div>
      
      <div className="mt-2 space-y-2">
        {rentedProperties.map((property) => (
          <div
            key={property.id}
            onClick={(e) => handlePropertyClick(property.id, e)}
            className="p-3 border-2 rounded-lg flex justify-between items-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer group"
          >
            <div className="flex-grow">
              <div className="font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                <span>{property.title}</span>
                <ExternalLink className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{property.location.address}</div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveProperty(property.id);
              }}
              className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        
        {rentedProperties.length === 0 && (
          <div className="text-gray-500 dark:text-gray-400 text-center py-2">
            No properties assigned
          </div>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl border-2 border-gray-200 dark:border-gray-600">
          <div className="p-3 border-b border-gray-200 dark:border-gray-600">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <input
                type="text"
                className="w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 
                dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400
                text-gray-900 placeholder-gray-500"
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filteredProperties.map((property) => (
              <div
                key={property.id}
                className="p-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-0"
                onClick={() => handleAddProperty(property.id)}
              >
                <div className="font-medium text-gray-900 dark:text-white">{property.title}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">{property.location.address}</div>
              </div>
            ))}
            
            {filteredProperties.length === 0 && (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">
                No available rental properties found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
