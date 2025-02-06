import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SEO from '../components/SEO';
import {
  Plus,
  Search,
  Grid,
  List,
  Home,
  Bath,
  Bed,
  Square,
  Edit,
  Trash,
  Building2,
  MapPin,
  BedDouble,
  Car,
  DollarSign,
  SlidersHorizontal,
  MapIcon,
  Filter,
  ChevronDown,
  Maximize2,
} from 'lucide-react';
import { Property, usePropertyStore } from '../store/propertyStore';
import PropertyImage from '../components/properties/PropertyImage';
import { PropertyCategory, PROPERTY_CATEGORIES, PROPERTY_TYPES } from '../constants/propertyTypes';

import { useAuth } from '../hooks/useAuth';
import { formatCurrency } from '../utils/formatters';

import PropertyMap from '../components/properties/PropertyMap';
import PropertyFilters from '../components/properties/PropertyFilters';
import PropertyForm from '../components/properties/PropertyForm';

type ViewMode = 'grid' | 'list';
type SortOption = 'price-asc' | 'price-desc' | 'date-asc' | 'date-desc' | 'size-asc' | 'size-desc';

interface FilterState {
  priceRange: { min: number; max: number };
  propertyTypes: string[];
  listingTypes: string[];
  bedrooms: number | null;
  bathrooms: number | null;
  features: string[];
}

const initialFilters: FilterState = {
  priceRange: { min: 0, max: 10000000 },
  propertyTypes: [],
  listingTypes: [],
  bedrooms: null,
  bathrooms: null,
  features: [],
};

export default function Properties() {
  // Router hooks
  const navigate = useNavigate();
  const location = useLocation();

  // Auth hook
  const { user, loading: authLoading } = useAuth();

  // Property store
  const { properties, addProperty, updateProperty, loading: propertiesLoading, error: propertiesError, initialize } = usePropertyStore();

  // Initialize properties
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Property handlers
  const handleAddProperty = () => {
    console.log('Add Property button clicked');
    try {
      navigate('/admin/properties/add', { replace: false });
      console.log('Navigation successful');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleEditProperty = (property: Property) => {
    navigate(`/admin/properties/edit/${property.id}`);
  };

  // State hooks
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: { min: 0, max: 10000000 },
    propertyTypes: [],
    listingTypes: [],
    bedrooms: null,
    bathrooms: null,
    features: []
  });
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');

  // Log state changes
  useEffect(() => {
    console.log('Properties state changed:', { 
      count: properties?.length || 0, 
      loading: propertiesLoading, 
      error: propertiesError 
    });
  }, [properties, propertiesLoading, propertiesError]);

  if (propertiesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (propertiesError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold">Error loading properties</p>
          <p>{propertiesError.message}</p>
        </div>
      </div>
    );
  }

  // Properties are loaded automatically by usePublicProperties

  const handleEditClick = async (e: React.MouseEvent, property: Property) => {
    e.stopPropagation(); // Prevent event bubbling
    e.preventDefault();
    
    try {
      // Get fresh property data from Firestore
      const freshProperty = await getPropertyById(property.id!);
      if (!freshProperty) {
        console.error('Property not found');
        return;
      }
      
      console.log('Fresh property data:', freshProperty);
      
      // Ensure all required fields are included and set selectedProperty before opening modal
      const propertyToEdit = {
        ...freshProperty,
        type: freshProperty.type || 'residential',
        status: freshProperty.status || 'available',
        listingType: freshProperty.listingType || 'rental',
        features: {
          bedrooms: freshProperty.features?.bedrooms ?? 0,
          bathrooms: freshProperty.features?.bathrooms ?? 0,
          area: freshProperty.features?.area ?? 0,
          furnished: freshProperty.features?.furnished ?? false,
          parking: freshProperty.features?.parking ?? false,
          pool: freshProperty.features?.pool ?? false,
          garden: freshProperty.features?.garden ?? false,
          borehole: freshProperty.features?.borehole ?? false,
          solarPower: freshProperty.features?.solarPower ?? false,
          security: freshProperty.features?.security ?? false,
          generator: freshProperty.features?.generator ?? false,
          staffQuarters: freshProperty.features?.staffQuarters ?? false,
          waterTank: freshProperty.features?.waterTank ?? false,
          electricFence: freshProperty.features?.electricFence ?? false,
          cctv: freshProperty.features?.cctv ?? false,
          garage: freshProperty.features?.garage ?? false,
          internet: freshProperty.features?.internet ?? false,
          airConditioning: freshProperty.features?.airConditioning ?? false,
        },
        location: {
          lat: freshProperty.location?.lat ?? -17.824858,
          lng: freshProperty.location?.lng ?? 31.053028,
          address: freshProperty.location?.address ?? '',
          city: freshProperty.location?.city ?? '',
          state: freshProperty.location?.state ?? '',
          country: freshProperty.location?.country ?? '',
          postalCode: freshProperty.location?.postalCode ?? '',
          markerIcon: freshProperty.location?.markerIcon ?? '',
        },
        leaseTerms: freshProperty.listingType === 'rental' ? {
          deposit: freshProperty.leaseTerms?.deposit ?? 0,
          durationMonths: freshProperty.leaseTerms?.durationMonths ?? 0,
          utilitiesIncluded: freshProperty.leaseTerms?.utilitiesIncluded ?? false,
        } : null,
        saleTerms: freshProperty.listingType === 'sale' ? {
          priceNegotiable: freshProperty.saleTerms?.priceNegotiable ?? false,
          ownershipType: freshProperty.saleTerms?.ownershipType ?? 'freehold',
          titleDeedAvailable: freshProperty.saleTerms?.titleDeedAvailable ?? false,
        } : null,
      };

      console.log('Property to edit:', propertyToEdit);
      setSelectedProperty(propertyToEdit);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error preparing property for edit:', error);
    }
  };

  const handlePropertyClick = (property: Property) => {
    navigate(`/admin/properties/${property.id}`);
  };

  // Properties are loaded automatically by usePublicProperties

  const propertyTypes = ['residential', 'commercial', 'land'];
  const listingTypes = ['sale', 'rental'];
  const featureOptions = [
    'furnished',
    'parking',
    'pool',
    'garden',
    'borehole',
    'solarPower',
    'security',
    'generator',
    'staffQuarters',
    'waterTank',
    'electricFence',
    'cctv',
    'garage',
    'internet',
    'airConditioning'
  ];

  const filteredProperties = properties.filter(property => {
    try {
      // Text search
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = [
          property.title,
          property.description,
          property.location?.address,
          property.location?.city,
          property.location?.state
        ].some(field => field?.toLowerCase().includes(searchLower));
        
        if (!matchesSearch) return false;
      }

      // Price range
      const price = property.price || 0;
      if (price < filters.priceRange.min || price > filters.priceRange.max) {
        return false;
      }

      // Property type
      if (filters.propertyTypes.length > 0 && !filters.propertyTypes.includes(property.type || '')) {
        return false;
      }

      // Listing type
      if (filters.listingTypes.length > 0 && !filters.listingTypes.includes(property.listingType || '')) {
        return false;
      }

      // Bedrooms
      if (filters.bedrooms !== null) {
        const bedrooms = property.features?.bedrooms || 0;
        if (bedrooms < filters.bedrooms) return false;
      }

      // Bathrooms
      if (filters.bathrooms !== null) {
        const bathrooms = property.features?.bathrooms || 0;
        if (bathrooms < filters.bathrooms) return false;
      }

      // Features
      if (filters.features.length > 0) {
        const hasAllFeatures = filters.features.every(feature => 
          property.features?.[feature as keyof typeof property.features] === true
        );
        if (!hasAllFeatures) return false;
      }

      return true;
    } catch (error) {
      console.error('Error filtering property:', error, property);
      return false;
    }
  });

  const formatTimeOnMarket = (listedAt: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - listedAt.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Listed today';
    if (diffInDays === 1) return 'Listed yesterday';
    if (diffInDays < 7) return `Listed ${diffInDays} days ago`;
    if (diffInDays < 30) return `Listed ${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `Listed ${Math.floor(diffInDays / 30)} months ago`;
    return `Listed ${Math.floor(diffInDays / 365)} years ago`;
  };

  const renderPropertyCard = (property: Property) => {
    console.log('Rendering property:', { 
      id: property.id, 
      title: property.title,
      photos: property.photos,
      hasPhotos: property.photos && property.photos.length > 0
    });
    
    const formattedPrice = property.price?.toLocaleString() || '0';
    const formattedArea = property.features?.area?.toLocaleString() || '0';
    
    return (
      <div 
        key={property.id} 
        className={`group bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer flex flex-col h-full ${
          viewMode === 'list' ? 'sm:flex-row' : ''
        }`}
        onClick={() => handlePropertyClick(property)}
      >
        <div className="relative">
          <div className={`${viewMode === 'list' ? 'w-40 h-40' : 'h-40'} bg-gray-100 dark:bg-gray-700`}>
            <PropertyImage
              photos={property.photos}
              title={property.title}
              className="transition-transform duration-200 group-hover:scale-105"
            />
          </div>
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full shadow-sm ${property.status === 'available' 
              ? property.listingType === 'rental' 
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/90 dark:text-blue-100'
                : 'bg-green-100 text-green-800 dark:bg-green-900/90 dark:text-green-100'
              : property.status === 'rented'
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/90 dark:text-amber-100'
                : property.status === 'sold'
                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/90 dark:text-purple-100'
                : property.status === 'maintenance'
                ? 'bg-gray-100 text-gray-800 dark:bg-gray-700/90 dark:text-gray-300'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700/90 dark:text-gray-300'
            }`}>
              {property.status === 'available' 
                ? property.listingType === 'rental' ? 'For Rent' : 'For Sale'
                : property.status === 'rented' ? 'Currently Rented'
                : property.status === 'sold' ? 'Sold'
                : property.status === 'maintenance' ? 'Under Maintenance'
                : property.status?.charAt(0).toUpperCase() + property.status?.slice(1)
              }
            </span>
          </div>
          <div className="absolute bottom-2 left-2">
            <span className="text-xs text-gray-100 dark:text-gray-300 whitespace-nowrap px-2 py-0.5 bg-gray-900/60 rounded-full">
              {formatTimeOnMarket(property.listedAt)}
            </span>
          </div>
        </div>

        <div className="flex-1 p-3 flex flex-col">
          <div className="flex justify-between items-start gap-2 mb-1.5">
            <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
              {property.title}
            </h3>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 mb-2">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <p className="truncate text-gray-600 dark:text-gray-300">{property.location?.address}</p>
          </div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-primary-600 dark:text-primary-400">
                ${formattedPrice}
              </span>
              <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                {property.listingType === 'rental' ? '/month' : ''}
              </span>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${property.status === 'available' 
                ? property.listingType === 'rental' 
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/90 dark:text-blue-100'
                  : 'bg-green-100 text-green-800 dark:bg-green-900/90 dark:text-green-100'
                : property.status === 'rented'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/90 dark:text-amber-100'
                  : property.status === 'sold'
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/90 dark:text-purple-100'
                  : property.status === 'maintenance'
                  ? 'bg-gray-100 text-gray-800 dark:bg-gray-700/90 dark:text-gray-300'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700/90 dark:text-gray-300'
              }`}>
                {property.status === 'available' 
                  ? property.listingType === 'rental' ? 'For Rent' : 'For Sale'
                  : property.status === 'rented' ? 'Currently Rented'
                  : property.status === 'sold' ? 'Sold'
                  : property.status === 'maintenance' ? 'Under Maintenance'
                  : property.status?.charAt(0).toUpperCase() + property.status?.slice(1)
                }
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-white">
            {property.features?.bedrooms != null && (
              <div className="flex items-center gap-1 text-gray-600 dark:text-white">
                <BedDouble className="h-3.5 w-3.5 flex-shrink-0 text-gray-600 dark:text-white" />
                <span>{property.features.bedrooms} beds</span>
              </div>
            )}
            {property.features?.bathrooms != null && (
              <div className="flex items-center gap-1 text-gray-600 dark:text-white">
                <Bath className="h-3.5 w-3.5 flex-shrink-0 text-gray-600 dark:text-white" />
                <span>{property.features.bathrooms} baths</span>
              </div>
            )}
            {property.features?.area != null && (
              <div className="flex items-center gap-1 text-gray-600 dark:text-white">
                <Square className="h-3.5 w-3.5 flex-shrink-0 text-gray-600 dark:text-white" />
                <span>{formattedArea} m²</span>
              </div>
            )}
          </div>
          <div className="mt-auto pt-3 text-center">
            <span className="text-primary-600 dark:text-primary-400 text-sm hover:underline">
              View Details
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderPropertyDetails = (property: Property) => {
    // Find tenants who have this property in their rentedProperties array
    const propertyTenants = tenants.filter(tenant => 
      tenant.rentedProperties.includes(property.id)
    );

    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Property Details</h3>
          {/* ... */}
        </div>

        {/* Tenants Section */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Current Tenants</h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {propertyTenants.length} {propertyTenants.length === 1 ? 'tenant' : 'tenants'}
            </span>
          </div>

          <div className="space-y-4">
            {propertyTenants.length > 0 ? (
              propertyTenants.map(tenant => (
                <TenantCard key={tenant.id} tenant={tenant} />
              ))
            ) : (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                No tenants currently assigned to this property
              </div>
            )}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Property Features</h3>
          <div className="flex flex-wrap gap-4 mt-2">
            <span className="flex items-center text-sm text-gray-600 dark:text-white">
              <BedDouble className="w-4 h-4 mr-1 text-gray-600 dark:text-white" />
              {property.features?.bedrooms} Bedrooms
            </span>
            <span className="flex items-center text-sm text-gray-600 dark:text-white">
              <Bath className="w-4 h-4 mr-1 text-gray-600 dark:text-white" />
              {property.features?.bathrooms} Bathrooms
            </span>
            <span className="flex items-center text-sm text-gray-600 dark:text-white">
              <Square className="w-4 h-4 mr-1 text-gray-600 dark:text-white" />
              {property.features?.area?.toLocaleString()} m² Built
            </span>
          </div>
        </div>
      </div>
    );
  };

  const handleSubmit = async (updatedProperty: Property) => {
    try {
      const { id, editField, ...updates } = updatedProperty;
      
      // Ensure all nested objects are properly structured
      const updateData = {
        ...updates,
        features: {
          bedrooms: updates.features?.bedrooms || 0,
          bathrooms: updates.features?.bathrooms || 0,
          area: updates.features?.area || 0,
          furnished: updates.features?.furnished || false,
          parking: updates.features?.parking || false,
          pool: updates.features?.pool || false,
          garden: updates.features?.garden || false,
        },
        location: {
          lat: updates.location?.lat || -17.824858,
          lng: updates.location?.lng || 31.053028,
          address: updates.location?.address || '',
          city: updates.location?.city || '',
          state: updates.location?.state || '',
          country: updates.location?.country || '',
          postalCode: updates.location?.postalCode || '',
          markerIcon: updates.location?.markerIcon || '',
        },
        leaseTerms: updates.listingType === 'rental' ? {
          deposit: updates.leaseTerms?.deposit || 0,
          durationMonths: updates.leaseTerms?.durationMonths || 0,
          utilitiesIncluded: updates.leaseTerms?.utilitiesIncluded || false,
        } : null,
        saleTerms: updates.listingType === 'sale' ? {
          priceNegotiable: updates.saleTerms?.priceNegotiable || false,
          ownershipType: updates.saleTerms?.ownershipType || 'freehold',
          titleDeedAvailable: updates.saleTerms?.titleDeedAvailable || false,
        } : null,
        amenities: updates.amenities || [],
      };

      console.log('Saving property updates:', updateData);
      await updateProperty(id, updateData);
      setSelectedProperty(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating property:', error);
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('An error occurred while updating the property');
      }
    }
  };





  // Show loading state
  if (authLoading || propertiesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <div className="text-gray-600">
            {authLoading && <div>Checking authentication...</div>}
            {propertiesLoading && <div>Loading properties...</div>}
          </div>
        </div>
      </div>
    );
  }

  // Show error state if needed
  if (propertiesError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold mb-2">Error Loading Properties</p>
          <p>{propertiesError.message}</p>
        </div>
      </div>
    );
  }

  // Require authentication
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-xl font-semibold mb-2">Access Denied</p>
          <p className="text-gray-600">Please sign in to view properties</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">




      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search properties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full pl-9 pr-3 text-sm bg-gray-700 border border-gray-600 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-400"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle group */}
          <div className="h-10 flex bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`w-10 flex items-center justify-center ${
                viewMode === 'grid'
                  ? 'bg-indigo-700 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Grid view"
            >
              <Grid className="h-4 w-4 flex-shrink-0" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`w-10 flex items-center justify-center ${
                viewMode === 'list'
                  ? 'bg-indigo-700 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="List view"
            >
              <List className="h-4 w-4 flex-shrink-0" />
            </button>
          </div>

          <div className="h-10">
            <PropertyFilters
              filters={filters}
              onFilterChange={setFilters}
              buttonClassName="h-10 px-3 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg border border-gray-700"
            />
          </div>

          <button
            onClick={handleAddProperty}
            className="h-10 px-4 flex items-center justify-center gap-2 bg-indigo-700 hover:bg-indigo-600 text-white rounded-lg"
          >
            <Plus className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm font-medium">Add Property</span>
          </button>
        </div>
      </div>

      {(filters.propertyTypes.length > 0 || filters.listingTypes.length > 0 || 
        filters.features.length > 0 || filters.bedrooms !== null || 
        filters.bathrooms !== null || filters.priceRange.min > 0 || 
        filters.priceRange.max < 10000000) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {/* ... filter chips ... */}
        </div>
      )}

      <div className="space-y-4">
        {filteredProperties.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 space-y-2">
            <div className="text-sm text-gray-600 dark:text-gray-400">No properties found</div>
            <div className="flex gap-2">
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
              >
                Clear search
              </button>
              {(filters.propertyTypes.length > 0 || filters.listingTypes.length > 0 || 
                filters.features.length > 0 || filters.bedrooms !== null || 
                filters.bathrooms !== null || filters.priceRange.min > 0 || 
                filters.priceRange.max < 10000000) && (
                <button
                  onClick={() => setFilters({
                    priceRange: { min: 0, max: 10000000 },
                    propertyTypes: [],
                    listingTypes: [],
                    bedrooms: null,
                    bathrooms: null,
                    features: []
                  })}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className={`w-full ${
            viewMode === 'grid' 
              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3'
              : 'flex flex-col space-y-3'
          }`}>
            {filteredProperties.map((property) => (
              <div 
                key={property.id} 
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden ${
                  viewMode === 'list' ? 'flex' : 'flex-col'
                }`}
                onClick={() => handlePropertyClick(property)}
              >
                <div className={`relative ${viewMode === 'list' ? 'w-40' : 'h-40'} bg-gray-100 dark:bg-gray-700`}>
                  <PropertyImage
                    photos={property.photos}
                    title={property.title}
                    className={`w-full h-full object-cover transition-transform duration-200 ${viewMode === 'list' ? '' : 'group-hover:scale-105'}`}
                  />
                  <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
                    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${property.status === 'available' 
                      ? property.listingType === 'rental' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/90 dark:text-blue-100'
                        : 'bg-green-100 text-green-800 dark:bg-green-900/90 dark:text-green-100'
                      : property.status === 'rented'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/90 dark:text-amber-100'
                        : property.status === 'sold'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/90 dark:text-purple-100'
                        : property.status === 'maintenance'
                        ? 'bg-gray-100 text-gray-800 dark:bg-gray-700/90 dark:text-gray-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700/90 dark:text-gray-300'
                    }`}>
                      {property.status === 'available' 
                        ? property.listingType === 'rental' ? 'For Rent' : 'For Sale'
                        : property.status === 'rented' ? 'Currently Rented'
                        : property.status === 'sold' ? 'Sold'
                        : property.status === 'maintenance' ? 'Under Maintenance'
                        : property.status?.charAt(0).toUpperCase() + property.status?.slice(1)
                      }
                    </span>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <span className="text-xs text-gray-100 dark:text-gray-300 whitespace-nowrap px-2 py-0.5 bg-gray-900/60 rounded-full">
                      {formatTimeOnMarket(property.listedAt)}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleEditProperty(property);
                    }}
                    className="absolute top-1.5 right-1.5 p-1 bg-gray-800/70 hover:bg-gray-700/70 text-white rounded-full"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex-1 flex flex-col">
                  <div className="p-3 flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-medium text-gray-900 dark:text-white truncate">
                          {property.title}
                        </h3>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 truncate">
                      {property.location.address}
                    </p>
                    <div className={`flex items-center justify-between mt-2.5 ${viewMode === 'list' ? '' : 'flex-wrap'}`}>
                      <div className="text-base font-semibold text-primary-600 dark:text-primary-400">
                        US${property.price.toLocaleString()}
                        {property.listingType === 'rental' ? '/month' : ''}
                      </div>
                      <div className="flex items-center space-x-3 text-sm">
                        {property.bedrooms != null && (
                          <div className="flex items-center text-gray-500 dark:text-gray-400">
                            <BedDouble className="h-4 w-4 mr-1" />
                            <span>{property.bedrooms}</span>
                          </div>
                        )}
                        {property.bathrooms != null && (
                          <div className="flex items-center text-gray-500 dark:text-gray-400">
                            <Bath className="h-4 w-4 mr-1" />
                            <span>{property.bathrooms}</span>
                          </div>
                        )}
                        {property.squareFootage != null && (
                          <div className="flex items-center text-gray-500 dark:text-gray-400">
                            <Square className="h-4 w-4 mr-1" />
                            <span>{property.squareFootage.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Property Features */}
                    <div className="flex flex-wrap gap-4 mt-2">
                      {property.features.bedrooms > 0 && (
                        <span className="flex items-center text-sm text-gray-600 dark:text-white">
                          <Bed className="w-4 h-4 mr-1 text-gray-600 dark:text-white" />
                          {property.features.bedrooms} {property.features.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}
                        </span>
                      )}
                      {property.features.bathrooms > 0 && (
                        <span className="flex items-center text-sm text-gray-600 dark:text-white">
                          <Bath className="w-4 h-4 mr-1 text-gray-600 dark:text-white" />
                          {property.features.bathrooms} {property.features.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}
                        </span>
                      )}
                      {property.features.area > 0 && (
                        <span className="flex items-center text-sm text-gray-600 dark:text-white">
                          <Square className="w-4 h-4 mr-1 text-gray-600 dark:text-white" />
                          {property.features.area} m² Built
                        </span>
                      )}
                      {property.features.landSize > 0 && (
                        <span className="flex items-center text-sm text-gray-600 dark:text-white">
                          <Maximize2 className="w-4 h-4 mr-1 text-gray-600 dark:text-white" />
                          {property.features.landSize} m² Land
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <button
                      onClick={() => navigate(`/admin/properties/${property.id}`)}
                      className="w-full text-center text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>





    </div>
  );
}
