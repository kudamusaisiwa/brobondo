import { useState, useEffect } from 'react';
import { collection, query, where, limit, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Property } from '../types';

export function usePublicProperties(limit_count = 6) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        // Query active properties
        const propertiesQuery = query(
          collection(db, 'properties'),
          where('status', '==', 'available'),
          limit(limit_count)
        );
        
        console.log('Fetching properties...');
        const querySnapshot = await getDocs(propertiesQuery);
        console.log('Got properties snapshot, size:', querySnapshot.size);

        // Log all raw property data
        querySnapshot.docs.forEach(doc => {
          const data = doc.data();
          console.log('Full property data from Firestore:', {
            id: doc.id,
            ...data
          });
        });
        
        const properties = querySnapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Raw property data:', {
            id: doc.id,
            listingType: data.listingType,
            type: data.type,
            status: data.status
          });
          
          // Get the raw listing type
          const rawListingType = data.listingType || data.type || '';
          console.log('Raw listing type:', rawListingType);
          
          // Normalize listing type
          let listingType = rawListingType.toLowerCase();
          if (listingType === 'for sale' || listingType === 'forsale' || listingType === 'for_sale') {
            listingType = 'sale';
          } else if (listingType === 'for rent' || listingType === 'forrent' || listingType === 'for_rent') {
            listingType = 'rental';
          }
          
          // Get property type
          const propertyType = data.propertyType || data.type || 'residential';
          
          console.log('Normalized values:', {
            rawListingType,
            normalizedListingType: listingType,
            propertyType
          });

          const property = {
            id: doc.id,
            title: data.title || '',
            description: data.description || '',
            listingType: listingType,
            type: propertyType.toLowerCase(),
            price: data.price || 0,
            status: data.status || 'available',
            location: data.location || { address: '' },
            features: data.features || {},
            images: data.images || [],
            listedAt: data.listedAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            featured: data.featured || false
          } as Property;

          console.log('Mapped property:', {
            id: property.id,
            listingType: property.listingType,
            type: property.type,
            status: property.status
          });

          return property;
        });

        setProperties(properties);
        setError(null);
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError('Failed to load properties');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [limit_count]);

  return { properties, loading, error };
}
