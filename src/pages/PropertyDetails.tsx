import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit2, 
  MapPin, 
  BedDouble, 
  Bath, 
  Square,
  DollarSign,
  Calendar,
  Tag,
  Home,
  CheckCircle2,
  User,
  Phone,
  Mail,
  Users,
  Trash2
} from 'lucide-react';
import { usePropertyStore } from '../store/propertyStore';
import { useOwnerStore } from '../store/ownerStore';
import { useTenantStore } from '../store/tenantStore';
import { useUserStore } from '../store/userStore';
import { Property } from '../store/propertyStore';
import { LeafletMap } from '../components/properties/LeafletMap';
import TenantCard from '../components/properties/TenantCard';
import InterestedBuyersCard from '../components/properties/InterestedBuyersCard';
import MandateHolderCard from '../components/properties/MandateHolderCard';
import PropertyStatusDropdown from '../components/properties/PropertyStatusDropdown';
import PropertyPhotos from '../components/properties/PropertyPhotos';

export default function PropertyDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { properties, loading: propertiesLoading, initialize } = usePropertyStore();
  const { owners, loading: ownersLoading, initialize: initializeOwners } = useOwnerStore();
  const { tenants, loading: tenantsLoading, initialize: initializeTenants } = useTenantStore();
  const { users, loading: usersLoading, initialize: initializeUsers } = useUserStore();

  useEffect(() => {
    initialize();
    initializeOwners();
    initializeTenants();
    initializeUsers();
  }, [initialize, initializeOwners, initializeTenants, initializeUsers]);

  const property = id ? properties.find(p => p.id === id) : null;
  const owner = property?.ownerId ? owners.find(o => o.id === property.ownerId) : null;
  const propertyTenants = property ? tenants.filter(tenant => 
    tenant.rentedProperties?.includes(property.id)
  ) : [];
  const mandateHolder = property?.mandateHolderId ? users.find(user => user.id === property.mandateHolderId) : null;

  // Debug logs
  console.log('Property:', property);
  console.log('Property Mandate Holder ID:', property?.mandateHolderId);
  console.log('Available Users:', users);
  console.log('Found Mandate Holder:', mandateHolder);

  if (propertiesLoading || ownersLoading || tenantsLoading || usersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading property details...</div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Property not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin/properties', { replace: true })}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {property.title}
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <MapPin className="h-4 w-4 mr-2" />
                  {property.location.address}, {property.location.city}
                </div>
                <PropertyStatusDropdown property={property} />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/admin/properties/${property.id}/edit`)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Property
            </button>
            <button
              onClick={() => {
                const confirmed = window.confirm('Are you sure you want to delete this property? This action cannot be undone.');
                if (confirmed) {
                  usePropertyStore.getState().deleteProperty(property.id!)
                    .then(() => {
                      navigate('/admin/properties', { replace: true });
                    })
                    .catch((error) => {
                      console.error('Error deleting property:', error);
                      alert('Failed to delete property. Please try again.');
                    });
                }
              }}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Property
            </button>
          </div>
        </div>
        
        {/* Quick Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <div className="flex items-center text-gray-500 dark:text-gray-300 mb-1">
              <DollarSign className="h-4 w-4 mr-2" />
              Price
            </div>
            <div className="text-xl font-semibold text-gray-900 dark:text-white">
              ${property.price.toLocaleString()}
              {property.listingType === 'rental' && <span className="text-sm text-gray-500 dark:text-gray-400">/month</span>}
            </div>
          </div>
          {property.bedrooms && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="flex items-center text-gray-500 dark:text-gray-300 mb-1">
                <BedDouble className="h-4 w-4 mr-2" />
                Bedrooms
              </div>
              <div className="text-xl font-semibold text-gray-900 dark:text-white">
                {property.bedrooms}
              </div>
            </div>
          )}
          {property.bathrooms && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="flex items-center text-gray-500 dark:text-gray-300 mb-1">
                <Bath className="h-4 w-4 mr-2" />
                Bathrooms
              </div>
              <div className="text-xl font-semibold text-gray-900 dark:text-white">
                {property.bathrooms}
              </div>
            </div>
          )}
          {property.squareFootage && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="flex items-center text-gray-500 dark:text-gray-300 mb-1">
                <Square className="h-4 w-4 mr-2" />
                Area
              </div>
              <div className="text-xl font-semibold text-gray-900 dark:text-white">
                {property.squareFootage.toLocaleString()} sqft
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Property Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Photos */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <PropertyPhotos
              propertyId={property.id!}
              photos={property.photos || []}
              onPhotosChange={(photos) => {
                // Local state update for immediate UI feedback
                const updatedProperties = properties.map(p =>
                  p.id === property.id ? { ...p, photos } : p
                );
                usePropertyStore.setState({ properties: updatedProperties });
              }}
            />
          </div>

          {/* Description */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Description</h2>
            <p className="text-gray-600 dark:text-gray-300">
              {property.description || 'No description available.'}
            </p>
          </div>

          {/* Features */}
          {property.features && property.features.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Features</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-gray-600 dark:text-gray-300">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-primary-500" />
                    <span className="capitalize">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Property Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Property Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-gray-500 dark:text-gray-300">Property Type</div>
                <div className="font-medium text-gray-900 dark:text-white capitalize">{property.type}</div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-300">Status</div>
                <div className="font-medium text-gray-900 dark:text-white capitalize">{property.status}</div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-300">Listed Date</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {new Date(property.listedAt).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-gray-500 dark:text-gray-300">Last Updated</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {new Date(property.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Tenants Section - Only show for rental properties */}
          {property.listingType === 'rental' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Current Tenants
                  </h2>
                </div>
                <span className="px-3 py-1 text-sm rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  {propertyTenants.length} {propertyTenants.length === 1 ? 'tenant' : 'tenants'}
                </span>
              </div>

              <div className="space-y-4">
                {propertyTenants.length > 0 ? (
                  propertyTenants.map(tenant => (
                    <TenantCard key={tenant.id} tenant={tenant} />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No tenants currently assigned to this property
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Interested Buyers Section - Only show for properties for sale */}
          {property.listingType === 'sale' && (
            <>
              <InterestedBuyersCard propertyId={property.id} />
              <MandateHolderCard mandateHolderId={property.mandateHolderId} />
            </>
          )}
        </div>

        {/* Right Column - Map and Additional Info */}
        <div className="space-y-8">
          {/* Owner Information */}
          {owner && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Property Owner</h2>
              <div className="space-y-4">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <User className="h-4 w-4 mr-2" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {owner.firstName} {owner.lastName}
                  </span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Phone className="h-4 w-4 mr-2" />
                  <a 
                    href={`tel:${owner.phone}`}
                    className="hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    {owner.phone}
                  </a>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Mail className="h-4 w-4 mr-2" />
                  <a 
                    href={`mailto:${owner.email}`}
                    className="hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    {owner.email}
                  </a>
                </div>
                {owner.address && (
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <MapPin className="h-4 w-4 mr-2" />
                    {owner.address}
                  </div>
                )}
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Home className="h-4 w-4 mr-2" />
                  <span>{owner.propertyCount} {owner.propertyCount === 1 ? 'property' : 'properties'} owned</span>
                </div>
              </div>
            </div>
          )}

          {/* Map */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Location</h2>
            <div className="h-[400px] rounded-lg overflow-hidden">
              <LeafletMap
                location={property.location}
                onLocationChange={() => {}}
              />
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <MapPin className="h-4 w-4 mr-2" />
                {property.location.address}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-500 dark:text-gray-300">City</div>
                  <div className="font-medium text-gray-900 dark:text-white">{property.location.city}</div>
                </div>
                <div>
                  <div className="text-gray-500 dark:text-gray-300">State</div>
                  <div className="font-medium text-gray-900 dark:text-white">{property.location.state}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
