import React, { useState, useEffect } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface PropertyImageProps {
  photos?: string[];
  title: string;
  className?: string;
  defaultImage?: string;
}

export const PropertyImage: React.FC<PropertyImageProps> = ({
  photos,
  title,
  className = '',
  defaultImage = '/property-placeholder.jpg'
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Log the photos array for debugging
  console.log('PropertyImage - photos:', photos);
  
  // Use current photo or default image
  const imageUrl = photos?.length ? photos[currentIndex] : defaultImage;

  useEffect(() => {
    if (photos?.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
      }, 3000); // Change image every 3 seconds

      return () => clearInterval(interval);
    }
  }, [photos]);
  console.log('PropertyImage - using URL:', imageUrl);

  const handleLoad = () => {
    console.log('Image loaded successfully:', imageUrl);
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    console.error('Error loading image:', imageUrl);
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="animate-pulse">
            <ImageIcon className="w-8 h-8 text-gray-400" />
          </div>
        </div>
      )}
      
      {hasError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="text-center">
            <ImageIcon className="w-8 h-8 mx-auto text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">Image not available</p>
          </div>
        </div>
      ) : (
        <>
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
            onLoad={handleLoad}
            onError={handleError}
          />
          {photos?.length > 1 && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
              {photos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${index === currentIndex ? 'bg-white w-3' : 'bg-white/60 hover:bg-white/80'}`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PropertyImage;
