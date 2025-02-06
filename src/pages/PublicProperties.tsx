import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { usePublicProperties } from '../hooks/usePublicProperties';
import PropertyCard from '../components/PropertyCard';
import Logo from '../components/Logo';
import { Search, Home, Building2, MapPin } from 'lucide-react';

export default function PublicProperties() {
  const description = 'Browse our extensive collection of properties for sale and rent in Zimbabwe. Find houses, apartments, commercial spaces, and land with detailed information and high-quality images.';
  const title = 'Properties - Brobondo Real Estate';
  const url = 'https://brobondo.co.zw/browse-properties';
  const imageUrl = 'https://brobondo.co.zw/images/meta-image.jpg';
  const { properties, loading, error } = usePublicProperties(50);
  const [searchTerm, setSearchTerm] = useState('');
  const [listingType, setListingType] = useState<'all' | 'sale' | 'rental'>('all');
  const [propertyType, setPropertyType] = useState<'all' | 'residential' | 'commercial' | 'land'>('all');

  // Filter properties based on search and filters
  const filteredProperties = properties.filter(property => {
    // Search filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || [
      property.title,
      property.description,
      property.location?.address,
      property.location?.city,
      property.location?.country
    ].some(field => field?.toLowerCase().includes(searchLower));

    // Listing type filter - exact match
    const matchesListingType = listingType === 'all' || property?.listingType === listingType;

    // Property type filter - exact match
    const matchesPropertyType = propertyType === 'all' || property?.type?.toLowerCase() === propertyType;

    console.log('Property filter check:', {
      id: property.id,
      propertyType: property.type,
      propertyTypeLower: property.type?.toLowerCase(),
      filterType: propertyType,
      matchesPropertyType,
      listingType: property.listingType,
      filterListingType: listingType,
      matchesListingType
    });

    // Only show available properties
    const isAvailable = property.status === 'available';

    // Debug logging
    console.log('Filtering property:', {
      id: property.id,
      property: {
        listingType: property.listingType,
        type: property.type,
        status: property.status
      },
      filters: {
        listingType,
        propertyType
      },
      matches: {
        search: matchesSearch,
        listingType: matchesListingType,
        propertyType: matchesPropertyType,
        available: isAvailable
      }
    });

    return matchesSearch && matchesListingType && matchesPropertyType && isAvailable;
  });

  // Create schema markup for property listings
  const createPropertyListingSchema = () => {
    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      'itemListElement': filteredProperties.map((property, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'item': {
          '@type': 'RealEstateListing',
          'name': property.title,
          'description': property.description,
          'url': `${url}/property/${property.id}`,
          'image': property.photos[0],
          'price': property.price,
          'priceCurrency': 'USD',
          'category': property.type,
          'numberOfRooms': property.features?.bedrooms,
          'floorSize': {
            '@type': 'QuantitativeValue',
            'value': property.features?.area,
            'unitCode': 'MTK' // Square meters
          },
          'address': {
            '@type': 'PostalAddress',
            'addressCountry': 'Zimbabwe',
            'addressLocality': property.location?.city || 'Harare'
          }
        }
      }))
    };
  };

  return (
    <>
      <Helmet>
        {/* Primary Meta Tags */}
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content="zimbabwe properties, houses for sale, houses for rent, commercial property, land for sale, real estate listings" />
        <meta name="author" content="Brobondo Real Estate" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={url} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:site_name" content="Brobondo Real Estate" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={url} />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
        <meta property="twitter:image" content={imageUrl} />

        {/* Robots */}
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <link rel="canonical" href={url} />

        {/* Schema.org markup */}
        <script type="application/ld+json">
          {JSON.stringify(createPropertyListingSchema())}
        </script>
      </Helmet>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/">
              <Logo width={140} />
            </Link>
            <Link
              to="/customerform"
              className="bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 transition duration-150"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by location, title, or description..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setListingType('all')}
                  className={`px-4 py-2 rounded-lg ${
                    listingType === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setListingType('sale')}
                  className={`px-4 py-2 rounded-lg ${
                    listingType === 'sale'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  For Sale
                </button>
                <button
                  onClick={() => setListingType('rental')}
                  className={`px-4 py-2 rounded-lg ${
                    listingType === 'rental'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  For Rent
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setPropertyType('all')}
                  className={`px-4 py-2 rounded-lg ${
                    propertyType === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setPropertyType('residential')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    propertyType === 'residential'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  Residential
                </button>
                <button
                  onClick={() => setPropertyType('commercial')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    propertyType === 'commercial'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  Commercial
                </button>
                <button
                  onClick={() => setPropertyType('land')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    propertyType === 'land'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  Land
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        {error ? (
          <div className="text-center text-red-600 dark:text-red-400">{error}</div>
        ) : loading ? (
          <div className="text-center text-gray-600 dark:text-gray-300">Loading properties...</div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center text-gray-600 dark:text-gray-300">
            {searchTerm || listingType !== 'all' || propertyType !== 'all'
              ? 'No properties match your search criteria.'
              : 'No properties available at the moment.'}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Brobondo. All rights reserved.</p>
        </div>
      </footer>
    </div>
    </>
  );
}
