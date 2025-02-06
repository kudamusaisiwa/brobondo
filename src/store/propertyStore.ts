import { create } from 'zustand';
import { auth } from '../lib/firebase';
import {
  collection,
  query,
  getDocs,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  where,
  Timestamp,
  writeBatch,
  getDoc,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { createProtectedStore } from './baseStore';
import { PropertyCategory } from '../constants/propertyTypes';

export interface PropertyLocation {
  lat: number;
  lng: number;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  markerIcon?: string;
}

export interface Property {
  id?: string;
  title: string;
  description?: string;
  listingType: 'rental' | 'sale';
  category: PropertyCategory;
  type: string;
  price: number;
  ownerId: string;
  mandateHolderId?: string;
  location: PropertyLocation;
  status: 'available' | 'rented' | 'sold' | 'maintenance';
  features: {
    bedrooms: number;
    bathrooms: number;
    area: number; // in square meters
    landSize: number; // in square meters
    furnished: boolean;
    parking: boolean;
    pool: boolean;
    garden: boolean;
    borehole: boolean;
    solarPower: boolean;
    security: boolean;
    generator: boolean;
    staffQuarters: boolean;
    waterTank: boolean;
    electricFence: boolean;
    cctv: boolean;
    garage: boolean;
    internet: boolean;
    airConditioning: boolean;
  };
  photos: string[]; // Array of property photos
  images?: string[]; // Legacy field, use photos instead
  documents?: string[];
  listedAt: Date;
  updatedAt: Date;
  rentedTo?: string[];
  interestedBuyers?: string[];
  leaseTerms?: {
    deposit: number;
    durationMonths: number;
    utilitiesIncluded: boolean;
  };
  saleTerms?: {
    priceNegotiable: boolean;
    ownershipType: string;
    titleDeedAvailable: boolean;
  };
}

interface PropertyStore {
  properties: Property[];
  loading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  addProperty: (property: Omit<Property, 'id' | 'listedAt' | 'updatedAt'>) => Promise<string>;
  updateProperty: (id: string, updates: Partial<Omit<Property, 'id' | 'listedAt'>>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  getPropertiesByOwner: (ownerId: string) => Promise<Property[]>;
  getPropertiesByTenant: (tenantId: string) => Promise<Property[]>;
  getPropertyById: (id: string) => Promise<Property | null>;
}

let unsubscribe: (() => void) | null = null;

export const usePropertyStore = create(
  createProtectedStore<PropertyStore>(
    (set, get) => ({
      // Initial state
      properties: [],
      loading: false,
      error: null,

      initialize: async () => {
        console.log('Property store initialization started');
        set({ loading: true, error: null });
      
        try {
          // Wait for auth to be ready
          if (!auth.currentUser) {
            console.log('No authenticated user, skipping property initialization');
            set({ loading: false });
            return;
          }

          console.log('Fetching user document...');
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (!userDoc.exists()) {
            console.error('User document not found');
            set({ loading: false, error: 'User profile not found' });
            return;
          }

          const userData = userDoc.data();
          console.log('User role:', userData?.role);
          
          console.log('Fetching properties...');
          const propertiesRef = collection(db, 'properties');
          console.log('Properties collection path:', propertiesRef.path);
          
          // Create query with real-time updates
          const propertiesQuery = query(
            propertiesRef,
            orderBy('listedAt', 'desc')
          );
          
          console.log('Setting up real-time properties query...');
          
          // Clean up any existing subscription
          if (unsubscribe) {
            unsubscribe();
          }
          
          // Set up real-time listener
          unsubscribe = onSnapshot(propertiesQuery, (querySnapshot) => {
            console.log('Received real-time property update');
            console.log('Query results:', {
              size: querySnapshot.size,
              empty: querySnapshot.empty,
              metadata: querySnapshot.metadata,
              docs: querySnapshot.docs.map(doc => ({ id: doc.id }))
            });
            
            if (querySnapshot.empty) {
              console.log('No properties found');
              set({ properties: [], loading: false });
              return;
            }

            const propertiesData = querySnapshot.docs.map(doc => {
              console.log('Processing property document:', doc.id);
              const data = doc.data();
              console.log('Raw property data:', { 
                id: doc.id, 
                photos: data.photos,
                images: data.images,
                ...data 
              });

              // Convert Firestore Timestamps to Dates
              const listedAt = data.listedAt?.toDate() || new Date();
              const updatedAt = data.updatedAt?.toDate() || new Date();

            // Ensure all nested objects have proper structure
            console.log('Raw data photos:', data.photos);
            console.log('Raw data images:', data.images);
            
            const property: Property = {
              id: doc.id,
              title: data.title || '',
              description: data.description || '',
              listingType: data.listingType || 'rental',
              category: data.category || 'residential',
              type: data.type || 'house',
              price: data.price || 0,
              ownerId: data.ownerId || '',
              mandateHolderId: data.mandateHolderId,
              status: data.status || 'available',
              features: {
                bedrooms: data.features?.bedrooms || 0,
                bathrooms: data.features?.bathrooms || 0,
                area: data.features?.area || 0,
                landSize: data.features?.landSize || 0,
                furnished: data.features?.furnished || false,
                parking: data.features?.parking || false,
                pool: data.features?.pool || false,
                garden: data.features?.garden || false,
                borehole: data.features?.borehole || false,
                solarPower: data.features?.solarPower || false,
                security: data.features?.security || false,
                generator: data.features?.generator || false,
                staffQuarters: data.features?.staffQuarters || false,
                waterTank: data.features?.waterTank || false,
                electricFence: data.features?.electricFence || false,
                cctv: data.features?.cctv || false,
                garage: data.features?.garage || false,
                internet: data.features?.internet || false,
                airConditioning: data.features?.airConditioning || false,
              },
              location: {
                lat: data.location?.lat || -17.824858,
                lng: data.location?.lng || 31.053028,
                address: data.location?.address || '',
                city: data.location?.city || '',
                state: data.location?.state || '',
                country: data.location?.country || '',
                postalCode: data.location?.postalCode || '',
                markerIcon: data.location?.markerIcon || '',
              },
              photos: Array.isArray(data.photos) ? data.photos : 
                     Array.isArray(data.images) ? data.images : [],  // Ensure photos are properly assigned
              documents: data.documents || [],
              listedAt,
              updatedAt,
              rentedTo: data.rentedTo || [],
              interestedBuyers: data.interestedBuyers || [],
              leaseTerms: data.listingType === 'rental' ? {
                deposit: data.leaseTerms?.deposit || 0,
                durationMonths: data.leaseTerms?.durationMonths || 0,
                utilitiesIncluded: data.leaseTerms?.utilitiesIncluded || false,
              } : null,
              saleTerms: data.listingType === 'sale' ? {
                priceNegotiable: data.saleTerms?.priceNegotiable || false,
                ownershipType: data.saleTerms?.ownershipType || 'freehold',
                titleDeedAvailable: data.saleTerms?.titleDeedAvailable || false,
              } : null,
            };

            console.log('Processed property:', property);
            return property;
          });

          set({ properties: propertiesData, loading: false, error: null });
        });

        // Set loading to false after setting up the listener
        set({ loading: false });
        } catch (error) {
          console.error('Error initializing properties:', error);
          set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
        
        // Clean up subscription on error
        if (unsubscribe) {
          unsubscribe();
          unsubscribe = null;
        }
      }
    },

    addProperty: async (property) => {
      try {
        set({ loading: true, error: null });
        
        // Ensure all nested objects have correct structure before saving
        const propertyToSave = {
          ...property,
          features: {
            bedrooms: property.features?.bedrooms ?? 0,
            bathrooms: property.features?.bathrooms ?? 0,
            area: property.features?.area ?? 0,
            landSize: property.features?.landSize ?? 0,
            furnished: property.features?.furnished ?? false,
            parking: property.features?.parking ?? false,
            pool: property.features?.pool ?? false,
            garden: property.features?.garden ?? false,
            borehole: property.features?.borehole ?? false,
            solarPower: property.features?.solarPower ?? false,
            security: property.features?.security ?? false,
            generator: property.features?.generator ?? false,
            staffQuarters: property.features?.staffQuarters ?? false,
            waterTank: property.features?.waterTank ?? false,
            electricFence: property.features?.electricFence ?? false,
            cctv: property.features?.cctv ?? false,
            garage: property.features?.garage ?? false,
            internet: property.features?.internet ?? false,
            airConditioning: property.features?.airConditioning ?? false,
          },
          location: {
            lat: property.location?.lat ?? -17.824858,
            lng: property.location?.lng ?? 31.053028,
            address: property.location?.address ?? '',
            city: property.location?.city ?? '',
            state: property.location?.state ?? '',
            country: property.location?.country ?? '',
            postalCode: property.location?.postalCode ?? '',
            markerIcon: property.location?.markerIcon ?? '',
          },
          leaseTerms: property.listingType === 'rental' ? {
            deposit: property.leaseTerms?.deposit ?? 0,
            durationMonths: property.leaseTerms?.durationMonths ?? 0,
            utilitiesIncluded: property.leaseTerms?.utilitiesIncluded ?? false,
          } : null,
          saleTerms: property.listingType === 'sale' ? {
            priceNegotiable: property.saleTerms?.priceNegotiable ?? false,
            ownershipType: property.saleTerms?.ownershipType ?? 'freehold',
            titleDeedAvailable: property.saleTerms?.titleDeedAvailable ?? false,
          } : null,
          photos: property.photos ?? property.images ?? [],
          documents: property.documents ?? [],
          listedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          status: property.status ?? 'available',
        };

        console.log('Saving new property:', propertyToSave);

        // Attempt to save with retry logic
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
          try {
            const docRef = await addDoc(collection(db, 'properties'), propertyToSave);
            console.log('Property added successfully with ID:', docRef.id);
            set({ loading: false, error: null });
            return docRef.id;
          } catch (error) {
            console.error(`Add attempt ${retryCount + 1} failed:`, error);
            retryCount++;
            if (retryCount === maxRetries) {
              throw error;
            }
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
          }
        }
      } catch (error) {
        console.error('Error adding property:', error);
        set({ loading: false, error: error.message });
        throw error;
      }
    },

    updateProperty: async (id: string, updates: Partial<Omit<Property, 'id' | 'listedAt'>>) => {
      try {
        set({ loading: true, error: null });
        const propertyRef = doc(db, 'properties', id);
        
        // Get the current property data
        const propertyDoc = await getDoc(propertyRef);
        if (!propertyDoc.exists()) {
          throw new Error('Property not found');
        }
        
        const currentProperty = propertyDoc.data();
        
        // Remove any undefined values from the updates object
        const cleanUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
          if (value !== undefined) {
            acc[key] = value;
          }
          return acc;
        }, {} as Record<string, any>);
        
        // Ensure nested objects have correct structure before updating
        // Ensure photos array is properly handled
        const photos = cleanUpdates.photos || currentProperty.photos || [];
        console.log('Processing photos update:', { current: currentProperty.photos, new: cleanUpdates.photos, final: photos });

        const processedUpdates = {
          ...cleanUpdates,
          features: cleanUpdates.features ? {
            bedrooms: cleanUpdates.features?.bedrooms ?? currentProperty.features?.bedrooms ?? 0,
            bathrooms: cleanUpdates.features?.bathrooms ?? currentProperty.features?.bathrooms ?? 0,
            area: cleanUpdates.features?.area ?? currentProperty.features?.area ?? 0,
            landSize: cleanUpdates.features?.landSize ?? currentProperty.features?.landSize ?? 0,
            furnished: cleanUpdates.features?.furnished ?? currentProperty.features?.furnished ?? false,
            parking: cleanUpdates.features?.parking ?? currentProperty.features?.parking ?? false,
            pool: cleanUpdates.features?.pool ?? currentProperty.features?.pool ?? false,
            garden: cleanUpdates.features?.garden ?? currentProperty.features?.garden ?? false,
            borehole: cleanUpdates.features?.borehole ?? currentProperty.features?.borehole ?? false,
            solarPower: cleanUpdates.features?.solarPower ?? currentProperty.features?.solarPower ?? false,
            security: cleanUpdates.features?.security ?? currentProperty.features?.security ?? false,
            generator: cleanUpdates.features?.generator ?? currentProperty.features?.generator ?? false,
            staffQuarters: cleanUpdates.features?.staffQuarters ?? currentProperty.features?.staffQuarters ?? false,
            waterTank: cleanUpdates.features?.waterTank ?? currentProperty.features?.waterTank ?? false,
            electricFence: cleanUpdates.features?.electricFence ?? currentProperty.features?.electricFence ?? false,
            cctv: cleanUpdates.features?.cctv ?? currentProperty.features?.cctv ?? false,
            garage: cleanUpdates.features?.garage ?? currentProperty.features?.garage ?? false,
            internet: cleanUpdates.features?.internet ?? currentProperty.features?.internet ?? false,
            airConditioning: cleanUpdates.features?.airConditioning ?? currentProperty.features?.airConditioning ?? false,
          } : currentProperty.features,
          location: cleanUpdates.location ? {
            lat: cleanUpdates.location?.lat ?? currentProperty.location?.lat ?? -17.824858,
            lng: cleanUpdates.location?.lng ?? currentProperty.location?.lng ?? 31.053028,
            address: cleanUpdates.location?.address ?? currentProperty.location?.address ?? '',
            city: cleanUpdates.location?.city ?? currentProperty.location?.city ?? '',
            state: cleanUpdates.location?.state ?? currentProperty.location?.state ?? '',
            country: cleanUpdates.location?.country ?? currentProperty.location?.country ?? '',
            postalCode: cleanUpdates.location?.postalCode ?? currentProperty.location?.postalCode ?? '',
            markerIcon: cleanUpdates.location?.markerIcon ?? currentProperty.location?.markerIcon ?? '',
          } : currentProperty.location,
          leaseTerms: cleanUpdates.listingType === 'rental' ? {
            deposit: cleanUpdates.leaseTerms?.deposit ?? currentProperty.leaseTerms?.deposit ?? 0,
            durationMonths: cleanUpdates.leaseTerms?.durationMonths ?? currentProperty.leaseTerms?.durationMonths ?? 0,
            utilitiesIncluded: cleanUpdates.leaseTerms?.utilitiesIncluded ?? currentProperty.leaseTerms?.utilitiesIncluded ?? false,
          } : null,
          saleTerms: cleanUpdates.listingType === 'sale' ? {
            priceNegotiable: cleanUpdates.saleTerms?.priceNegotiable ?? currentProperty.saleTerms?.priceNegotiable ?? false,
            ownershipType: cleanUpdates.saleTerms?.ownershipType ?? currentProperty.saleTerms?.ownershipType ?? 'freehold',
            titleDeedAvailable: cleanUpdates.saleTerms?.titleDeedAvailable ?? currentProperty.saleTerms?.titleDeedAvailable ?? false,
          } : null,
          updatedAt: serverTimestamp(),
        };

        console.log('Current property:', currentProperty);
        console.log('Updates:', updates);
        console.log('Processed updates:', processedUpdates);

        // Attempt to update with retry logic
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
          try {
            const finalUpdates = {
          ...processedUpdates,
          photos: photos,  // Ensure photos are included
        };
        console.log('Final updates being applied:', finalUpdates);
        await updateDoc(propertyRef, finalUpdates);
            console.log('Property updated successfully');
            set({ loading: false, error: null });
            return;
          } catch (error) {
            console.error(`Update attempt ${retryCount + 1} failed:`, error);
            retryCount++;
            if (retryCount === maxRetries) {
              throw error;
            }
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
          }
        }
      } catch (error) {
        console.error('Error updating property:', error);
        set({ loading: false, error: error.message });
        throw error;
      }
    },

      deleteProperty: async (id) => {
        try {
        const propertyRef = doc(db, 'properties', id);
        await deleteDoc(propertyRef);
      } catch (error) {
        console.error('Error deleting property:', error);
        throw error;
      }
    },

    getPropertiesByOwner: async (ownerId) => {
      const q = query(
        collection(db, 'properties'),
        where('ownerId', '==', ownerId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));
    },

    getPropertiesByTenant: async (tenantId) => {
      const q = query(
        collection(db, 'properties'),
        where('rentedTo', 'array-contains', tenantId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));
    },

    getPropertyById: async (id: string) => {
      try {
        set({ loading: true, error: null });
        const propertyRef = doc(db, 'properties', id);
        const propertyDoc = await getDoc(propertyRef);
        
        if (!propertyDoc.exists()) {
          set({ loading: false, error: 'Property not found' });
          return null;
        }

        const propertyData = propertyDoc.data();
        const property = {
          id: propertyDoc.id,
          ...propertyData,
          features: {
            bedrooms: propertyData.features?.bedrooms ?? 0,
            bathrooms: propertyData.features?.bathrooms ?? 0,
            area: propertyData.features?.area ?? 0,
            landSize: propertyData.features?.landSize ?? 0,
            furnished: propertyData.features?.furnished ?? false,
            parking: propertyData.features?.parking ?? false,
            pool: propertyData.features?.pool ?? false,
            garden: propertyData.features?.garden ?? false,
            borehole: propertyData.features?.borehole ?? false,
            solarPower: propertyData.features?.solarPower ?? false,
            security: propertyData.features?.security ?? false,
            generator: propertyData.features?.generator ?? false,
            staffQuarters: propertyData.features?.staffQuarters ?? false,
            waterTank: propertyData.features?.waterTank ?? false,
            electricFence: propertyData.features?.electricFence ?? false,
            cctv: propertyData.features?.cctv ?? false,
            garage: propertyData.features?.garage ?? false,
            internet: propertyData.features?.internet ?? false,
            airConditioning: propertyData.features?.airConditioning ?? false,
          },
          location: {
            lat: propertyData.location?.lat ?? -17.824858,
            lng: propertyData.location?.lng ?? 31.053028,
            address: propertyData.location?.address ?? '',
            city: propertyData.location?.city ?? '',
            state: propertyData.location?.state ?? '',
            country: propertyData.location?.country ?? '',
            postalCode: propertyData.location?.postalCode ?? '',
            markerIcon: propertyData.location?.markerIcon ?? '',
          },
          leaseTerms: propertyData.listingType === 'rental' ? {
            deposit: propertyData.leaseTerms?.deposit ?? 0,
            durationMonths: propertyData.leaseTerms?.durationMonths ?? 0,
            utilitiesIncluded: propertyData.leaseTerms?.utilitiesIncluded ?? false,
          } : null,
          saleTerms: propertyData.listingType === 'sale' ? {
            priceNegotiable: propertyData.saleTerms?.priceNegotiable ?? false,
            ownershipType: propertyData.saleTerms?.ownershipType ?? 'freehold',
            titleDeedAvailable: propertyData.saleTerms?.titleDeedAvailable ?? false,
          } : null,
        } as Property;

        set({ loading: false, error: null });
        return property;
      } catch (error) {
        console.error('Error fetching property:', error);
        set({ loading: false, error: error.message });
        return null;
      }
    }
    }),
    // Cleanup function
    () => {
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
    }
  )
);
