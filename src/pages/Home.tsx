import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Property } from '../types/property';
import PropertyCard from '../components/PropertyCard';
import HeroCarousel from '../components/HeroCarousel';
import TawkToChat from '../components/TawkToChat';
import PublicHeader from '../components/PublicHeader';
import Logo from '../components/Logo';
import { usePublicProperties } from '../hooks/usePublicProperties';

export default function Home() {
  const description = 'Discover your dream home with Brobondo Real Estate. Explore a wide range of properties for sale and rent, including houses, apartments, commercial spaces, and land. Our experienced agents are here to guide you through every step of the real estate process.';
  const title = 'Brobondo Real Estate - Your Trusted Partner in Property';
  const url = 'https://brobondo.co.zw/';
  const imageUrl = 'https://brobondo.co.zw/images/meta-image.jpg'; // You should replace this with your actual meta image

  const [listingFilter, setListingFilter] = React.useState<'all' | 'sale' | 'rental'>('all');
  const { properties: featuredProperties, loading, error } = usePublicProperties();

  const filteredProperties = React.useMemo(() => {
    if (listingFilter === 'all') return featuredProperties;
    return featuredProperties.filter(property => 
      property?.listingType === listingFilter
    );
  }, [featuredProperties, listingFilter]);

  return (
    <>
      <Helmet>
        {/* Primary Meta Tags */}
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content="real estate, property, zimbabwe, harare, houses for sale, houses for rent, commercial property, land for sale" />
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
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "RealEstateAgent",
            "name": "Brobondo Real Estate",
            "description": description,
            "image": imageUrl,
            "url": url,
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "2 Allenby Road",
              "addressLocality": "Highlands",
              "addressRegion": "Harare",
              "addressCountry": "Zimbabwe"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "-17.8216",
              "longitude": "31.0521"
            },
            "openingHours": "Mo,Tu,We,Th,Fr 08:00-16:30",
            "telephone": "+263 (242) 752781-3",
            "sameAs": [
              "https://www.facebook.com/brobondo",
              "https://www.instagram.com/brobondo",
              "https://www.linkedin.com/company/brobondo"
            ]
          })}
        </script>
      </Helmet>
      <div className="min-h-screen bg-white dark:bg-gray-900 relative">
      <TawkToChat />
      <PublicHeader />
      {/* Hero Section */}
      <HeroCarousel>
        <div className="container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white">
          <h1 className="text-5xl font-bold mb-6">
            Invest in Your Dream Home Today
          </h1>
          <p className="text-xl mb-8 max-w-2xl">
            From modern residential properties and commercial spaces to large-scale land development projects, 
            our expertise ensures every investment is crafted to provide lasting value.
          </p>
          <Link
            to="/customerform"
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl text-lg font-medium hover:bg-indigo-700 transition duration-150"
          >
            Contact Us
          </Link>
        </div>
      </HeroCarousel>

      {/* Services Overview Section */}
      <div className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl font-bold text-indigo-600 mb-4">
                Zimbabwe's Trusted Partner<br />
                in Property Investment
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                From modern residential properties and commercial spaces to large-scale land development projects, 
                our expertise ensures every investment is crafted to provide lasting value. Whether you're looking to buy, rent, or invest, 
                Brobondo is your gateway to prime real estate opportunities across Zimbabwe.
              </p>
              
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Property Sales</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      As trusted real estate experts in Zimbabwe, we connect buyers and sellers with premium residential, 
                      commercial, and industrial properties, ensuring smooth transactions and maximum value.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Property Development</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      From innovative residential projects to modern commercial spaces, we create sustainable, high-quality 
                      developments designed to meet market demands and enhance communities.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Property Management</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      We handle tenant relations, property maintenance, and financial management, ensuring your real 
                      estate operates efficiently and delivers consistent returns.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <img 
                src="https://res.cloudinary.com/fresh-ideas/image/upload/v1738669826/kfducck151cluulu4nsr.jpg" 
                alt="Modern property interior" 
                className="w-full h-[600px] object-cover rounded-2xl shadow-2xl"
              />
              <div className="absolute bottom-6 right-6">
                <Link
                  to="/browse-properties"
                  className="inline-flex items-center space-x-2 bg-white/90 backdrop-blur-sm text-gray-900 px-6 py-3 rounded-xl text-sm font-medium hover:bg-white transition duration-150"
                >
                  <span>Learn More</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Properties Section */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Featured Properties
            </h2>
            <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 p-1 space-x-1">
              <button
                onClick={() => setListingFilter('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  listingFilter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setListingFilter('sale')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  listingFilter === 'sale'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                For Sale
              </button>
              <button
                onClick={() => setListingFilter('rental')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  listingFilter === 'rental'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                For Rent
              </button>
            </div>
          </div>
          {error ? (
            <div className="text-center text-red-600 dark:text-red-400">{error.message}</div>
          ) : loading ? (
            <div className="text-center text-gray-600 dark:text-gray-300">Loading properties...</div>
          ) : featuredProperties.length === 0 ? (
            <div className="text-center text-gray-600 dark:text-gray-300">No properties available at the moment.</div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center text-gray-600 dark:text-gray-300">
              No {listingFilter === 'all' ? 'properties' : listingFilter === 'sale' ? 'properties for sale' : 'properties for rent'} available at the moment.
            </div>
          ) : (
            <div className="relative overflow-hidden">
              <div className="flex overflow-x-auto pb-4 gap-6 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-indigo-600 scrollbar-track-gray-200 dark:scrollbar-track-gray-700 hover:scrollbar-thumb-indigo-700 transition-colors duration-200" style={{ WebkitOverflowScrolling: 'touch' }}>
                {filteredProperties.map((property) => (
                  <div key={property.id} className="flex-none w-[300px] snap-start">
                    <PropertyCard property={property} />
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="text-center mt-12">
            <Link
              to="/browse-properties"
              className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl text-lg font-medium hover:bg-indigo-700 transition duration-150"
            >
              View All Properties
            </Link>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
              Ready to Find Your Perfect Property?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Let's build your future together. Our team of experts is here to help you 
              every step of the way.
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                to="/customerform"
                className="bg-indigo-600 text-white px-8 py-3 rounded-xl text-lg font-medium hover:bg-indigo-700 transition duration-150"
              >
                Contact Us
              </Link>
              <Link
                to="/browse-properties"
                className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-8 py-3 rounded-xl text-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition duration-150"
              >
                Browse Properties
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <Logo width={180} className="mb-6" />
              <p className="text-gray-400">
                Your trusted partner in property investment, development, and management.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Contact Us</h3>
              <p className="text-gray-400">
                2 Allenby Road<br />
                Highlands, Harare<br />
                +263 (242) 752781-3<br />
                +263 717 017 379
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Working Hours</h3>
              <p className="text-gray-400">
                Monday – Friday<br />
                08:00 AM – 16:30 PM
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Brobondo Real Estate. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}
