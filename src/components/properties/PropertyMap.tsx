import React, { Suspense } from 'react';
import { PropertyLocation } from '../../store/propertyStore';

interface PropertyMapProps {
  location: PropertyLocation;
  onLocationChange: (location: PropertyLocation) => void;
  markerIcon?: string;
  height?: string;
}

const LazyMap = React.lazy(
  () => import('./LeafletMap').then((module) => ({
    default: module.LeafletMap
  }))
);

const PropertyMap: React.FC<PropertyMapProps> = (props) => {
  return (
    <div style={{ height: props.height || '400px', width: '100%' }}>
      <Suspense fallback={<div className="flex items-center justify-center h-full bg-gray-50">Loading map...</div>}>
        <LazyMap {...props} />
      </Suspense>
    </div>
  );
};

export default PropertyMap;
