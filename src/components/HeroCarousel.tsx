import React, { useEffect, useState } from 'react';

const images = [
  'https://res.cloudinary.com/fresh-ideas/image/upload/v1738669534/zng1rex2n0ztfj98cv4d.jpg',
  'https://res.cloudinary.com/fresh-ideas/image/upload/v1738669533/nwiqjh5hetcyujadmofp.jpg',
  'https://res.cloudinary.com/fresh-ideas/image/upload/v1738669534/nvmi6vchohhlszzbdhna.jpg',
  'https://res.cloudinary.com/fresh-ideas/image/upload/v1738669534/jqsoqqpwog00q6k2wge3.jpg',
  'https://res.cloudinary.com/fresh-ideas/image/upload/v1738669534/krqpdzrbux26bewfalml.jpg',
  'https://res.cloudinary.com/fresh-ideas/image/upload/v1738669534/ioy2pqsvch4sytocaztq.jpg'
];

interface HeroCarouselProps {
  children: React.ReactNode;
}

export default function HeroCarousel({ children }: HeroCarouselProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-[600px] overflow-hidden">
      {/* Background Images */}
      {images.map((image, index) => (
        <div
          key={image}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentImageIndex ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `url(${image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      ))}
      
      {/* Overlay with diagonal shapes */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50" />
      
      {/* Bottom diagonal shape */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-32 bg-white dark:bg-gray-900"
        style={{
          clipPath: 'polygon(0 100%, 100% 100%, 100% 0)',
          transform: 'translateY(50%)',
        }}
      />
      
      {/* Top diagonal shape */}
      <div 
        className="absolute top-0 left-0 right-0 h-32 bg-white dark:bg-gray-900"
        style={{
          clipPath: 'polygon(0 0, 100% 0, 0 100%)',
          transform: 'translateY(-50%)',
        }}
      />

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative z-10 container mx-auto px-4">
          {children}
        </div>
      </div>

      {/* Dots navigation */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {images.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentImageIndex 
                ? 'bg-white w-4' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
            onClick={() => setCurrentImageIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}
