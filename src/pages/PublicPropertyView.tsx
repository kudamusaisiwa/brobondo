import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Property } from '../types';
import { MapPin, Bath, BedDouble, Move, Car, Phone, Mail } from 'lucide-react';
import Logo from '../components/Logo';
import { extractIdFromSlug } from '../utils/slugify';

export default function PublicPropertyView() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!slug) return;
      try {
        const propertyId = extractIdFromSlug(slug);
        const docRef = doc(db, 'properties', propertyId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          const convertedData = {
            id: docSnap.id,
            title: data.title || '',
            description: data.description || '',
            listingType: data.listingType || 'sale',
            type: data.type || 'residential',
            price: data.price || 0,
            status: data.status || 'available',
            location: data.location || { address: '' },
            features: data.features || {},
            photos: data.photos || [],
            listedAt: data.listedAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            featured: data.featured || false
          };
          setProperty(convertedData as Property);
        }
      } catch (error) {
        console.error('Error fetching property:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-300">Loading property details...</div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Property Not Found</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">The property you're looking for doesn't exist or has been removed.</p>
        <Link
          to="/home"
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition duration-150"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  const nextImage = () => {
    if (property.photos) {
      setCurrentImageIndex((prev) => (prev + 1) % property.photos!.length);
    }
  };

  const previousImage = () => {
    if (property.photos) {
      setCurrentImageIndex((prev) => (prev - 1 + property.photos!.length) % property.photos!.length);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link to="/home">
            <Logo width={140} className="mx-auto md:mx-0" />
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Property Images */}
        <div className="relative bg-gray-900 rounded-2xl overflow-hidden mb-8 aspect-[16/9]">
          {property.photos && property.photos.length > 0 && (
            <>
              <img
                src={property.photos[currentImageIndex]}
                alt={`${property.title} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
              {property.photos.length > 1 && (
                <>
                  <button
                    onClick={previousImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    ←
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    →
                  </button>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
                    {currentImageIndex + 1} / {property.photos.length}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Property Details */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {property.title}
                  </h1>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>{property.location.address}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    ${property.price?.toLocaleString()}
                  </div>
                  {property.type === 'rent' && (
                    <span className="text-gray-600 dark:text-gray-400">/month</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-t border-b border-gray-200 dark:border-gray-700">
                {property.features?.bedrooms && (
                  <div className="flex items-center">
                    <BedDouble className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
                    <span className="text-gray-600 dark:text-gray-400">{property.features.bedrooms} Bedrooms</span>
                  </div>
                )}
                {property.features?.bathrooms && (
                  <div className="flex items-center">
                    <Bath className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
                    <span className="text-gray-600 dark:text-gray-400">{property.features.bathrooms} Bathrooms</span>
                  </div>
                )}
                {property.features?.parking && (
                  <div className="flex items-center">
                    <Car className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
                    <span className="text-gray-600 dark:text-gray-400">Parking Available</span>
                  </div>
                )}
                {property.features?.area && (
                  <div className="flex items-center">
                    <Move className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
                    <span className="text-gray-600 dark:text-gray-400">{property.features.area}m²</span>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Features & Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.features?.borehole && (
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Borehole</span>
                    </div>
                  )}
                  {property.features?.solarPower && (
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Solar Power</span>
                    </div>
                  )}
                  {property.features?.security && (
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Security</span>
                    </div>
                  )}
                  {property.features?.generator && (
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Generator</span>
                    </div>
                  )}
                  {property.features?.staffQuarters && (
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Staff Quarters</span>
                    </div>
                  )}
                  {property.features?.waterTank && (
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Water Tank</span>
                    </div>
                  )}
                  {property.features?.electricFence && (
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Electric Fence</span>
                    </div>
                  )}
                  {property.features?.cctv && (
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>CCTV</span>
                    </div>
                  )}
                  {property.features?.garage && (
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Garage</span>
                    </div>
                  )}
                  {property.features?.internet && (
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Internet</span>
                    </div>
                  )}
                  {property.features?.airConditioning && (
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Air Conditioning</span>
                    </div>
                  )}
                  {property.features?.furnished && (
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Furnished</span>
                    </div>
                  )}
                  {property.features?.pool && (
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Swimming Pool</span>
                    </div>
                  )}
                  {property.features?.garden && (
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Garden</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Description</h2>
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
                  {property.description}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Interested in this property?</h2>
              <Link
                to={`/customerform?propertyDetails=${encodeURIComponent(
                  `I am interested in the ${property.title} - ${property.listingType === 'rental' ? 'For Rent' : 'For Sale'} at ${property.location.address}. ` +
                  `This property has ${property.features?.bedrooms || 0} bedrooms, ${property.features?.bathrooms || 0} bathrooms, ` +
                  `and is ${property.features?.area || 0}m². Price: $${property.price?.toLocaleString()}`
                )}`}
                className="block w-full bg-indigo-600 text-white text-center px-6 py-3 rounded-xl hover:bg-indigo-700 transition duration-150 mb-4"
              >
                Contact Us
              </Link>
              <div className="space-y-4 text-gray-600 dark:text-gray-300">
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-2" />
                  <span>+263 (242) 752781-3</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  <span>info@brobondo.co.zw</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
