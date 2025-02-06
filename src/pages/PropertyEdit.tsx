import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PropertyForm from '../components/properties/PropertyForm';
import { usePropertyStore } from '../store/propertyStore';
import { Property } from '../store/propertyStore';

export default function PropertyEdit() {
  console.log('PropertyEdit component rendered');
  const navigate = useNavigate();
  const { id } = useParams();
  const { properties, addProperty, updateProperty } = usePropertyStore();
  
  console.log('PropertyEdit params:', { id });
  
  const selectedProperty = id ? properties.find(p => p.id === id) : null;
  console.log('Selected property:', selectedProperty);

  const handleSubmit = async (data: Omit<Property, 'id'>) => {
    try {
      console.log('Submitting property data:', data);
      if (id) {
        console.log('Updating existing property:', id);
        await updateProperty(id, data);
        console.log('Property updated successfully');
      } else {
        console.log('Adding new property');
        const newPropertyId = await addProperty(data);
        console.log('Property added successfully with ID:', newPropertyId);
      }
      navigate('/admin/properties');
    } catch (error) {
      console.error('Error saving property:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleCancel = () => {
    navigate('/admin/properties');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
        {id ? 'Edit Property' : 'Add New Property'}
      </h1>
      <PropertyForm
        onSubmit={handleSubmit}
        property={selectedProperty}
        onCancel={handleCancel}
      />
    </div>
  );
}
