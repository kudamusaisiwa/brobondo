import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { db } from '../lib/firebase';
import { Property } from '../types/property';

type FirestoreErrorCode = 
  | 'permission-denied'
  | 'not-found'
  | 'already-exists'
  | 'failed-precondition'
  | 'aborted'
  | 'out-of-range'
  | 'unimplemented'
  | 'internal'
  | 'unavailable'
  | 'data-loss'
  | 'unauthenticated';

export function usePublicProperties(limitCount: number = 50) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      console.log('Fetching public properties...');
      try {
        setLoading(true);
        setError(null);

        // Query using existing index (listingType, status, listedAt)
        console.log('Creating Firestore query with limit:', limitCount);
        const propertiesQuery = query(
          collection(db, 'properties'),
          where('listingType', 'in', ['sale', 'rental']),
          where('status', '==', 'available'),
          orderBy('listedAt', 'desc'),
          limit(limitCount)
        );
        console.log('Executing Firestore query...');

        const querySnapshot = await getDocs(propertiesQuery);
        console.log('Query snapshot:', querySnapshot.size, 'documents found');
        
        if (querySnapshot.size === 0) {
          console.log('No properties found in Firestore');
        } else {
          querySnapshot.docs.forEach((doc, index) => {
            const data = doc.data();
            console.log(`Property ${index + 1}:`, {
              id: doc.id,
              data: {
                ...data,
                category: data.category,
                type: data.type
              },
              propertyDetails: {
                hasTitle: !!data.title,
                hasLocation: !!data.location,
                hasListingType: !!data.listingType,
                hasImages: Array.isArray(data.images),
                hasPrice: typeof data.price === 'number',
                hasCategory: !!data.category,
                hasType: !!data.type
              }
            });
          });
        }

        const propertiesData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || '',
            description: data.description || '',
            listingType: data.listingType || 'sale',
            type: data.category || 'residential',
            price: data.price || 0,
            status: data.status || 'available',
            location: data.location || { address: '' },
            features: data.features || {},
            photos: data.photos || data.images || [],
            listedAt: data.listedAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            featured: data.featured || false
          } as Property;
        });

        console.log('Processed property data:', JSON.stringify(propertiesData, null, 2));
        setProperties(propertiesData);
      } catch (err) {
        console.error('Error fetching public properties:', err);
        if (err instanceof FirebaseError) {
          switch(err.code as FirestoreErrorCode) {
            case 'permission-denied':
              setError(new Error('You do not have permission to view these properties'));
              break;
            case 'not-found':
              setError(new Error('The requested properties could not be found'));
              break;
            case 'failed-precondition':
              setError(new Error('Unable to sort properties at this time'));
              break;
            default:
              setError(new Error('Failed to fetch properties. Please try again later.'));
          }
        } else {
          setError(err instanceof Error ? err : new Error('An unexpected error occurred'));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [limitCount]);

  return { properties, loading, error };
}
