import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PropertyFormFields } from './PropertyFormFields';
import { Property } from '../../store/propertyStore';
import { PROPERTY_CATEGORIES, PROPERTY_TYPES } from "../../constants/propertyTypes";

interface PropertyFormProps {
  onSubmit: (data: Property) => Promise<void>;
  property?: Property | null;
  onCancel: () => void;
}

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  price: z.number().min(0, 'Price must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  type: z.string().min(1, 'Property type is required'),
  listingType: z.enum(['rental', 'sale'], { required_error: 'Listing type is required' }),
  mandateHolderId: z.string().optional(),
  ownerId: z.string().min(1, 'Owner is required'),
  features: z.object({
    bedrooms: z.number().min(0).default(0),
    bathrooms: z.number().min(0).default(0),
    area: z.number().min(0).default(0),
    landSize: z.number().min(0).default(0),
    furnished: z.boolean().default(false),
    parking: z.boolean().default(false),
    pool: z.boolean().default(false),
    garden: z.boolean().default(false),
    borehole: z.boolean().default(false),
    solarPower: z.boolean().default(false),
    security: z.boolean().default(false),
    generator: z.boolean().default(false),
    staffQuarters: z.boolean().default(false),
    waterTank: z.boolean().default(false),
    electricFence: z.boolean().default(false),
    cctv: z.boolean().default(false),
    garage: z.boolean().default(false),
    internet: z.boolean().default(false),
    airConditioning: z.boolean().default(false),
  }).default({
    bedrooms: 0,
    bathrooms: 0,
    area: 0,
    landSize: 0,
    furnished: false,
    parking: false,
    pool: false,
    garden: false,
    borehole: false,
    solarPower: false,
    security: false,
    generator: false,
    staffQuarters: false,
    waterTank: false,
    electricFence: false,
    cctv: false,
    garage: false,
    internet: false,
    airConditioning: false,
  }),
  status: z.enum(['available', 'rented', 'sold', 'maintenance']).default('available'),
  photos: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]), // Legacy field
  documents: z.array(z.string()).default([]),
  location: z.object({
    lat: z.number().default(-17.824858),
    lng: z.number().default(31.053028),
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().min(1, 'Country is required'),
    postalCode: z.string().optional(),
    markerIcon: z.string().optional()
  }).default({
    lat: -17.824858,
    lng: 31.053028,
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    markerIcon: undefined
  }),
  leaseTerms: z.preprocess(
    (val) => val === null ? undefined : val,
    z.object({
      deposit: z.preprocess((val) => val === null ? 0 : Number(val), z.number().min(0, 'Deposit must be 0 or greater')),
      durationMonths: z.preprocess((val) => val === null ? 0 : Number(val), z.number().min(0, 'Duration must be 0 or greater')),
      utilitiesIncluded: z.preprocess((val) => val === null ? false : Boolean(val), z.boolean())
    })
  ).nullable().default(null),
  saleTerms: z.preprocess(
    (val) => val === null ? undefined : val,
    z.object({
      priceNegotiable: z.preprocess((val) => val === null ? false : Boolean(val), z.boolean()),
      ownershipType: z.preprocess((val) => val === null ? 'freehold' : String(val), z.string().min(1, 'Ownership type is required')),
      titleDeedAvailable: z.preprocess((val) => val === null ? false : Boolean(val), z.boolean())
    })
  ).nullable().default(null),
});

const PropertyForm: React.FC<PropertyFormProps> = ({ onSubmit, property, onCancel }) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue
  } = useForm<Property>({
    resolver: zodResolver(formSchema),
    defaultValues: property ? {
      title: property.title || '',
      description: property.description || '',
      price: property.price || 0,
      category: property.category || '',
      type: property.type || '',
      listingType: property.listingType || 'rental',
      ownerId: property.ownerId || '',
      mandateHolderId: property.mandateHolderId || '',
      status: property.status || 'available',
      features: {
        bedrooms: property.features?.bedrooms || 0,
        bathrooms: property.features?.bathrooms || 0,
        area: property.features?.area || 0,
        landSize: property.features?.landSize || 0,
        furnished: property.features?.furnished || false,
        parking: property.features?.parking || false,
        pool: property.features?.pool || false,
        garden: property.features?.garden || false,
        borehole: property.features?.borehole || false,
        solarPower: property.features?.solarPower || false,
        security: property.features?.security || false,
        generator: property.features?.generator || false,
        staffQuarters: property.features?.staffQuarters || false,
        waterTank: property.features?.waterTank || false,
        electricFence: property.features?.electricFence || false,
        cctv: property.features?.cctv || false,
        garage: property.features?.garage || false,
        internet: property.features?.internet || false,
        airConditioning: property.features?.airConditioning || false
      },
      location: {
        lat: property.location?.lat || -17.824858,
        lng: property.location?.lng || 31.053028,
        address: property.location?.address || '',
        city: property.location?.city || '',
        state: property.location?.state || '',
        country: property.location?.country || '',
        postalCode: property.location?.postalCode || '',
        markerIcon: property.location?.markerIcon || ''
      },
      leaseTerms: property.listingType === 'rental' ? {
        deposit: property.leaseTerms?.deposit || 0,
        durationMonths: property.leaseTerms?.durationMonths || 0,
        utilitiesIncluded: property.leaseTerms?.utilitiesIncluded || false
      } : null,
      saleTerms: property.listingType === 'sale' ? {
        priceNegotiable: property.saleTerms?.priceNegotiable || false,
        ownershipType: property.saleTerms?.ownershipType || 'freehold',
        titleDeedAvailable: property.saleTerms?.titleDeedAvailable || false
      } : null
    } : {
      title: '',
      description: '',
      price: 0,
      category: '',
      type: '',
      listingType: 'rental',
      mandateHolderId: '',
      ownerId: '',
      status: 'available',
      features: {
        bedrooms: 0,
        bathrooms: 0,
        area: 0,
        landSize: 0,
        furnished: false,
        parking: false,
        pool: false,
        garden: false,
        borehole: false,
        solarPower: false,
        security: false,
        generator: false,
        staffQuarters: false,
        waterTank: false,
        electricFence: false,
        cctv: false,
        garage: false,
        internet: false,
        airConditioning: false
      },
      location: {
        lat: -17.824858,
        lng: 31.053028,
        address: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
        markerIcon: ''
      },
      images: [],
      documents: [],
      leaseTerms: null,
      saleTerms: null,
    }
  });

  const listingType = watch('listingType');

  const onFormSubmit = async (data: Property) => {
    try {
      console.log('Form submission started');
      console.log('Form data before submission:', data);
      
      // Initialize the formatted data with the correct terms based on listing type
      const formattedData: Property = {
        ...data,
        features: {
          bedrooms: Number(data.features?.bedrooms) || 0,
          bathrooms: Number(data.features?.bathrooms) || 0,
          area: Number(data.features?.area) || 0,
          landSize: Number(data.features?.landSize) || 0,
          furnished: Boolean(data.features?.furnished),
          parking: Boolean(data.features?.parking),
          pool: Boolean(data.features?.pool),
          garden: Boolean(data.features?.garden),
          borehole: Boolean(data.features?.borehole),
          solarPower: Boolean(data.features?.solarPower),
          security: Boolean(data.features?.security),
          generator: Boolean(data.features?.generator),
          staffQuarters: Boolean(data.features?.staffQuarters),
          waterTank: Boolean(data.features?.waterTank),
          electricFence: Boolean(data.features?.electricFence),
          cctv: Boolean(data.features?.cctv),
          garage: Boolean(data.features?.garage),
          internet: Boolean(data.features?.internet),
          airConditioning: Boolean(data.features?.airConditioning)
        },
        price: Number(data.price) || 0,
        images: Array.isArray(data.images) ? data.images : [],
        documents: Array.isArray(data.documents) ? data.documents : [],
        leaseTerms: data.listingType === 'rental' ? {
          deposit: Number(data.leaseTerms?.deposit) || 0,
          durationMonths: Number(data.leaseTerms?.durationMonths) || 0,
          utilitiesIncluded: Boolean(data.leaseTerms?.utilitiesIncluded)
        } : null,
        saleTerms: data.listingType === 'sale' ? {
          priceNegotiable: Boolean(data.saleTerms?.priceNegotiable),
          ownershipType: data.saleTerms?.ownershipType || 'freehold',
          titleDeedAvailable: Boolean(data.saleTerms?.titleDeedAvailable)
        } : null
      };
      
      // Validate required fields based on listing type
      if (data.listingType === 'rental') {
        if (!formattedData.leaseTerms) {
          throw new Error('Lease terms are required for rental properties');
        }
      } else if (data.listingType === 'sale') {
        if (!formattedData.saleTerms) {
          throw new Error('Sale terms are required for properties for sale');
        }
      }
      
      console.log('Formatted data for submission:', formattedData);
      await onSubmit(formattedData);
    } catch (error) {
      console.error('Error submitting form:', error);
      throw error; // Re-throw to let the form handle the error
    }
  };

  return (
    <form 
      onSubmit={handleSubmit(onFormSubmit, (errors) => {
        console.error('Form validation errors:', errors);
      })} 
      className="space-y-8"
    >
      <PropertyFormFields control={control} errors={errors} setValue={setValue} />
      <div className="flex justify-end space-x-4 border-t pt-4 mt-8">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </span>
          ) : property && property.id ? 'Save Changes' : 'Add Property'}
        </button>
      </div>
    </form>
  );
};

export default PropertyForm;
