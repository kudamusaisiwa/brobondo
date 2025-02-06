import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bath, BedDouble, Move, Car } from 'lucide-react';
import { Property } from '../types/property';
import PropertyImageCarousel from './PropertyImageCarousel';
import { generatePropertySlug } from '../utils/slugify';

interface PropertyCardProps {
  property: Property;
}

const getStatusBadgeColor = (status: string, listingType: string) => {
  if (status === 'available') {
    return listingType === 'rental' ? 'bg-blue-600' : 'bg-green-600';
  }
  switch (status) {
    case 'rented': return 'bg-amber-600';
    case 'sold': return 'bg-purple-600';
    case 'maintenance': return 'bg-gray-600';
    default: return 'bg-gray-600';
  }
};

const getStatusText = (status: string, listingType: string) => {
  if (status === 'available') {
    return listingType === 'rental' ? 'For Rent' : 'For Sale';
  }
  switch (status) {
    case 'rented': return 'Currently Rented';
    case 'sold': return 'Sold';
    case 'maintenance': return 'Under Maintenance';
    default: return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

export default function PropertyCard({ property }: PropertyCardProps) {
  const propertySlug = generatePropertySlug(property.title, property.location.address, property.id);
  const statusBadgeColor = getStatusBadgeColor(property.status, property.listingType);
  const statusText = getStatusText(property.status, property.listingType);

  return (
    <Link to={`/property/${propertySlug}`} className="block group">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden group-hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1">
        <div className="relative">
          {/* Image Section */}
          <div className="h-48 bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
            <PropertyImageCarousel
              images={property.photos}
              title={property.title}
              defaultImage="/property-placeholder.jpg"
            />
            {/* Status Badge */}
            <div className={`absolute top-4 right-4 px-4 py-2 rounded-xl text-sm font-semibold uppercase tracking-wide ${statusBadgeColor} text-white shadow-lg`}>
              {statusText}
            </div>
            {/* Featured Badge */}
            {property.featured && (
              <div className="absolute top-4 left-4 bg-yellow-500 text-white px-4 py-2 rounded-xl text-sm font-semibold uppercase tracking-wide shadow-lg">
                Featured
              </div>
            )}
          </div>

          {/* Title and Location */}
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
              {property.title}
            </h3>
            <div className="flex items-center text-gray-600 dark:text-gray-300 mt-2">
              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="text-sm truncate">{property.location.address}</span>
            </div>
          </div>

          {/* Features */}
          <div className="px-6">
            <div className="border-t border-b border-gray-200 dark:border-gray-700 py-4">
              <div className="grid grid-cols-4 gap-4">
                {property.features?.bedrooms > 0 && (
                  <div className="flex flex-col items-center">
                    <BedDouble className="h-5 w-5 text-gray-600 dark:text-gray-400 mb-1" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{property.features.bedrooms} Beds</span>
                  </div>
                )}
                {property.features?.bathrooms > 0 && (
                  <div className="flex flex-col items-center">
                    <Bath className="h-5 w-5 text-gray-600 dark:text-gray-400 mb-1" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{property.features.bathrooms} Baths</span>
                  </div>
                )}
                {property.features?.garage === true && (
                  <div className="flex flex-col items-center">
                    <Car className="h-5 w-5 text-gray-600 dark:text-gray-400 mb-1" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Garage</span>
                  </div>
                )}
                {property.features?.area > 0 && (
                  <div className="flex flex-col items-center">
                    <Move className="h-5 w-5 text-gray-600 dark:text-gray-400 mb-1" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{property.features.area}m²</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Price and CTA */}
          <div className="p-6 pt-4 flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ${property.price?.toLocaleString()}
              </span>
              {property.listingType === 'rental' && (
                <span className="text-sm text-gray-600 dark:text-gray-400">/month</span>
              )}
            </div>
            <span className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors duration-300 shadow-md hover:shadow-lg">
              View Details
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
