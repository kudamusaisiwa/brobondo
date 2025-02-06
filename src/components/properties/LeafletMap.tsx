import React, { useEffect, useCallback, useState, lazy, Suspense } from 'react';
import { PropertyLocation } from '../../store/propertyStore';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';

// Create custom icon
const customIcon = new L.Icon({
  iconUrl: 'https://res.cloudinary.com/fresh-ideas/image/upload/v1738530487/rhcatgrkdrti8rgxphu9.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// Fix Leaflet marker icons
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/marker-icon-2x.png',
    iconUrl: '/marker-icon.png',
    shadowUrl: '/marker-shadow.png',
  });
}

// Function to get address from coordinates using OpenStreetMap Nominatim
const getAddressFromCoordinates = async (lat: number, lng: number): Promise<Partial<PropertyLocation>> => {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&email=kudamusasiwa@gmail.com`
    );

    const data = response.data;
    const address = data.address || {};
    
    // Extract the street address using multiple possible fields
    const streetAddress = address.road || 
                         address.street || 
                         address.pedestrian || 
                         address.footway || 
                         address.path || 
                         address.house_number || 
                         '';

    // Build a complete address string
    const addressParts = [
      streetAddress,
      address.suburb,
      address.neighbourhood,
      address.city_district
    ].filter(Boolean);

    return {
      lat,
      lng,
      address: addressParts.join(', ') || data.display_name || '',
      city: address.city || address.town || address.village || address.suburb || '',
      state: address.state || address.region || '',
      country: address.country || '',
      postalCode: address.postcode || '',
    };
  } catch (error) {
    console.error('Error fetching address:', error);
    // Return coordinates with empty address fields if geocoding fails
    return {
      lat,
      lng,
      address: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
    };
  }
};

interface LeafletMapProps {
  location: PropertyLocation;
  onChange: (location: PropertyLocation) => void;
  markerIcon?: string;
}

const DraggableMarker = ({ position, onChange }: { 
  position: [number, number], 
  onChange: (location: PropertyLocation) => void 
}) => {
  const eventHandlers = {
    dragend: async (e: L.DragEndEvent) => {
      const marker = e.target;
      const newPosition = marker.getLatLng();
      const addressInfo = await getAddressFromCoordinates(newPosition.lat, newPosition.lng);
      
      onChange({
        ...addressInfo,
        markerIcon: ''
      } as PropertyLocation);
    },
  };

  return (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={eventHandlers}
      icon={customIcon}
    />
  );
};

const MapEvents = ({ onChange }: { onChange: (loc: PropertyLocation) => void }) => {
  const handleClick = useCallback(async (e: L.LeafletMouseEvent) => {
    const addressInfo = await getAddressFromCoordinates(e.latlng.lat, e.latlng.lng);
    onChange({
      ...addressInfo,
      markerIcon: ''
    } as PropertyLocation);
  }, [onChange]);

  useMapEvents({
    click: handleClick,
  });
  return null;
};

export const LeafletMap = ({ location, onChange, markerIcon }: LeafletMapProps) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const position: [number, number] = [location.lat, location.lng];

  useEffect(() => {
    // Ensure map is initialized after component mount
    setMapLoaded(true);
    return () => {
      setMapLoaded(false);
    };
  }, []);

  if (!mapLoaded) {
    return <div className="relative h-[400px] w-full bg-gray-100 dark:bg-gray-800 animate-pulse" />;
  }

  return (
    <div className="relative h-[400px] w-full">
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        key={JSON.stringify(position)}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <DraggableMarker position={position} onChange={onChange} />
        <MapEvents onChange={onChange} />
      </MapContainer>
      <div className="absolute bottom-2 left-2 z-[1000] bg-white dark:bg-gray-800 p-2 rounded-md shadow-md text-sm">
        <div>Latitude: {location.lat.toFixed(6)}</div>
        <div>Longitude: {location.lng.toFixed(6)}</div>
      </div>
    </div>
  );
};
