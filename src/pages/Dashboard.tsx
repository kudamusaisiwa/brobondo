import React, { useState, useEffect, useMemo } from 'react';
import { usePropertyStore } from '../store/propertyStore';
import { useLeadStore } from '../store/leadStore';
import { useAuthStore } from '../store/authStore';
import DateRangePicker from '../components/DateRangePicker';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import { Building2, Home, DollarSign, Wallet, UserPlus } from 'lucide-react';
import StatCardWithDateRange from '../components/dashboard/StatCardWithDateRange';
import { formatCurrency } from '../utils/formatters';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const timeRanges = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'custom', label: 'Custom Range' }
];

// Create custom icon
const customIcon = new L.Icon({
  iconUrl: 'https://res.cloudinary.com/fresh-ideas/image/upload/v1738530487/rhcatgrkdrti8rgxphu9.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// Fix Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/marker-icon-2x.png',
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
});

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState('7d');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { properties, initialize: initProperties, loading: storeLoading, error: storeError } = usePropertyStore();
  const { initialize: initLeads, getNewLeadsCount } = useLeadStore();
  const { user } = useAuthStore();

  useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      if (mounted) setIsLoading(true);
      
      try {
        const unsubscribeProps = await initProperties();
        const unsubscribeLeads = await initLeads();
        if (mounted) setIsLoading(false);
        
        return () => {
          unsubscribeProps?.();
          unsubscribeLeads?.();
        };
      } catch (error: any) {
        console.error('Error loading dashboard data:', error);
        if (mounted) {
          setError(error.message);
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [initProperties]);

  const getDateRange = () => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    switch (timeRange) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      case 'yesterday':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
        break;
      case '7d':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      case '30d':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          // Set start to beginning of day
          start = new Date(customStartDate.getFullYear(), customStartDate.getMonth(), customStartDate.getDate(), 0, 0, 0);
          // Set end to end of day
          end = new Date(customEndDate.getFullYear(), customEndDate.getMonth(), customEndDate.getDate(), 23, 59, 59, 999);
        }
        break;
    }

    return { start, end };
  };

  const getPreviousDateRange = () => {
    const { start, end } = getDateRange();
    const duration = end.getTime() - start.getTime();
    return {
      start: new Date(start.getTime() - duration),
      end: new Date(end.getTime() - duration)
    };
  };

  const stats = useMemo(() => {
    const { start, end } = getDateRange();
    const { start: prevStart, end: prevEnd } = getPreviousDateRange();

    if (!properties.length) {
      return {
        propertiesForSale: 0,
        propertiesForRent: 0,
        salesRevenue: 0,
        rentalRevenue: 0,
        newLeads: 0,
        prevNewLeads: 0,
      };
    }

    // Filter properties within the current date range
    const currentProperties = properties.filter(p => {
      if (!p.listedAt) return false;
      
      // Convert Firestore Timestamp to Date if needed
      try {
        const date = p.listedAt instanceof Timestamp ? p.listedAt.toDate() : p.listedAt;
        if (!(date instanceof Date)) return false;
        
        const dateTime = date.getTime();
        return dateTime >= start.getTime() && dateTime <= end.getTime();
      } catch (error) {
        console.error('Error processing date:', error);
        return false;
      }
    });

    // Filter properties within the previous date range
    const prevProperties = properties.filter(p => {
      if (!p.listedAt) return false;
      
      // Convert Firestore Timestamp to Date if needed
      try {
        const date = p.listedAt instanceof Timestamp ? p.listedAt.toDate() : p.listedAt;
        if (!(date instanceof Date)) return false;
        
        const dateTime = date.getTime();
        return dateTime >= prevStart.getTime() && dateTime <= prevEnd.getTime();
      } catch (error) {
        console.error('Error processing date:', error);
        return false;
      }
    });

    return {
      propertiesForSale: currentProperties.filter(p => p.listingType === 'sale' && p.status === 'available').length,
      propertiesForRent: currentProperties.filter(p => p.listingType === 'rental' && p.status === 'available').length,
      salesRevenue: currentProperties
        .filter(p => p.listingType === 'sale' && p.status === 'sold')
        .reduce((total, p) => total + p.price, 0),
      rentalRevenue: currentProperties
        .filter(p => p.listingType === 'rental' && p.status === 'rented')
        .reduce((total, p) => total + p.price, 0),
      prevSalesRevenue: prevProperties
        .filter(p => p.listingType === 'sale' && p.status === 'sold')
        .reduce((total, p) => total + p.price, 0),
      prevRentalRevenue: prevProperties
        .filter(p => p.listingType === 'rental' && p.status === 'rented')
        .reduce((total, p) => total + p.price, 0),
      newLeads: getNewLeadsCount(start, end),
      prevNewLeads: getNewLeadsCount(prevStart, prevEnd),
    };
  }, [properties, timeRange, customStartDate, customEndDate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="animate-pulse text-gray-600 dark:text-gray-300">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="text-red-500 dark:text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            {timeRanges.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
          
          {showDatePicker && (
            <DateRangePicker
              onSelect={(start, end) => {
                setCustomStartDate(start);
                setCustomEndDate(end);
                setTimeRange('custom');
                setShowDatePicker(false);
              }}
              onClose={() => setShowDatePicker(false)}
            />
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCardWithDateRange
          title="New Leads"
          value={stats.newLeads}
          icon={UserPlus}
          iconColor="text-blue-500"
          startDate={getDateRange().start}
          endDate={getDateRange().end}
          previousValue={stats.prevNewLeads}
        />

        <StatCardWithDateRange
          title="Properties for Sale"
          value={stats.propertiesForSale}
          icon={Building2}
          iconColor="text-blue-500"
          startDate={getDateRange().start}
          endDate={getDateRange().end}
        />

        <StatCardWithDateRange
          title="Properties for Rent"
          value={stats.propertiesForRent}
          icon={Home}
          iconColor="text-green-500"
          startDate={getDateRange().start}
          endDate={getDateRange().end}
        />

        <StatCardWithDateRange
          title="Sales Revenue"
          value={formatCurrency(stats.salesRevenue)}
          icon={DollarSign}
          iconColor="text-yellow-500"
          startDate={getDateRange().start}
          endDate={getDateRange().end}
          previousValue={stats.prevSalesRevenue}
        />

        <StatCardWithDateRange
          title="Rental Revenue"
          value={formatCurrency(stats.rentalRevenue)}
          icon={Wallet}
          iconColor="text-purple-500"
          startDate={getDateRange().start}
          endDate={getDateRange().end}
          previousValue={stats.prevRentalRevenue}
        />
      </div>

      {/* Property Map */}
      <div className="mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Property Locations</h2>
          </div>
          <div className="h-[600px] w-full">
            <MapContainer
              center={[-17.824858, 31.053028]}  // Center on Harare by default
              zoom={12}
              style={{ height: '100%', width: '100%' }}
              whenCreated={(map) => {
                // Fit bounds to all markers if there are properties
                const validProperties = properties.filter(p => p.location?.lat && p.location?.lng);
                if (validProperties.length > 0) {
                  const bounds = L.latLngBounds(
                    validProperties.map(p => [p.location.lat, p.location.lng] as L.LatLngTuple)
                  );
                  // Add minimal padding and set min/max zoom for tight fit
                  map.fitBounds(bounds, { 
                    padding: [30, 30],  // Reduced padding
                    maxZoom: 16,  // Allow closer zoom
                    animate: true
                  });
                }
              }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {properties.map((property) => (
                property.location?.lat && property.location?.lng && (
                  <Marker
                    key={property.id}
                    position={[property.location.lat, property.location.lng]}
                    icon={customIcon}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-medium text-gray-900">{property.title}</h3>
                        <p className="text-sm text-gray-600">{property.location.address}</p>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {formatCurrency(property.price)}
                          {property.listingType === 'rental' && '/month'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {property.features.bedrooms} beds • {property.features.bathrooms} baths • {property.features.area}m²
                        </p>
                        <div className="mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            property.listingType === 'sale' 
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {property.listingType === 'sale' ? 'For Sale' : 'For Rent'}
                          </span>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                )
              ))}
            </MapContainer>
          </div>
        </div>
      </div>

      {/* Charts will go here */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Add charts later */}
      </div>
    </div>
  );
}