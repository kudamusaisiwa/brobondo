import React from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import * as Slider from '@radix-ui/react-slider';

interface PropertyFiltersProps {
  filters: {
    priceRange: { min: number; max: number };
    propertyTypes: string[];
    listingTypes: string[];
    bedrooms: number | null;
    bathrooms: number | null;
    features: string[];
  };
  onFilterChange: (filters: PropertyFiltersProps['filters']) => void;
  buttonClassName?: string;
}

const propertyTypeOptions = ['residential', 'commercial', 'land'];
const listingTypeOptions = ['For Sale', 'For Rent'];
const featureOptions = ['furnished', 'petFriendly', 'garden', 'pool', 'parking', 'security'];

// Price ranges based on listing type
const PRICE_RANGES = {
  sale: {
    min: 0,
    max: 10000000, // $10M for sale properties
    step: 50000,
    format: (value: number) => `$${(value / 1000000).toFixed(1)}M`
  },
  rental: {
    min: 0,
    max: 50000, // $50k for rental properties
    step: 100,
    format: (value: number) => `$${value.toLocaleString()}/mo`
  }
};

const PropertyFilters = ({ filters, onFilterChange, buttonClassName }: PropertyFiltersProps) => {
  // Get the active price range based on listing type
  const getPriceRange = () => {
    if (filters.listingTypes.includes('rental')) {
      return PRICE_RANGES.rental;
    }
    return PRICE_RANGES.sale;
  };

  const handlePriceChange = (value: number[]) => {
    onFilterChange({
      ...filters,
      priceRange: { min: value[0], max: value[1] }
    });
  };

  const priceRange = getPriceRange();
  
  // Reset price range when switching between sale and rental
  const toggleListingType = (type: string) => {
    // Convert display text to database value
    const typeMap = {
      'For Sale': 'sale',
      'For Rent': 'rental'
    };
    const dbType = typeMap[type as keyof typeof typeMap];
    
    const newTypes = filters.listingTypes.includes(dbType)
      ? filters.listingTypes.filter(t => t !== dbType)
      : [dbType]; // Only allow one listing type at a time
    
    // Reset price range based on new listing type
    const newPriceRange = newTypes.includes('rental') ? PRICE_RANGES.rental : PRICE_RANGES.sale;
    
    onFilterChange({
      ...filters,
      listingTypes: newTypes,
      priceRange: { min: newPriceRange.min, max: newPriceRange.max }
    });
  };

  const togglePropertyType = (type: string) => {
    const newTypes = filters.propertyTypes.includes(type)
      ? filters.propertyTypes.filter(t => t !== type)
      : [...filters.propertyTypes, type];
    onFilterChange({ ...filters, propertyTypes: newTypes });
  };

  const toggleFeature = (feature: string) => {
    const newFeatures = filters.features.includes(feature)
      ? filters.features.filter(f => f !== feature)
      : [...filters.features, feature];
    onFilterChange({ ...filters, features: newFeatures });
  };

  const clearFilters = () => {
    onFilterChange({
      priceRange: { min: 0, max: 1000000 },
      propertyTypes: [],
      listingTypes: [],
      bedrooms: null,
      bathrooms: null,
      features: []
    });
  };

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className={buttonClassName}>
          <Filter className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm font-medium">Filters</span>
          <ChevronDown className="h-4 w-4 flex-shrink-0" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="w-80 p-4 bg-gray-800 rounded-lg shadow-lg border border-gray-700 text-gray-200" sideOffset={8}>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-gray-200">Price Range</h3>
                <span className="text-sm text-gray-400">
                  {priceRange.format(filters.priceRange.min)} - {priceRange.format(filters.priceRange.max)}
                </span>
              </div>
              <Slider.Root
                className="relative flex items-center select-none touch-none w-full h-5"
                value={[filters.priceRange.min, filters.priceRange.max]}
                onValueChange={handlePriceChange}
                min={priceRange.min}
                max={priceRange.max}
                step={priceRange.step}
              >
                <Slider.Track className="bg-gray-700 relative grow rounded-full h-1">
                  <Slider.Range className="absolute bg-primary-500 rounded-full h-full" />
                </Slider.Track>
                <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-primary-500 rounded-full hover:bg-primary-50 focus:outline-none" />
                <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-primary-500 rounded-full hover:bg-primary-50 focus:outline-none" />
              </Slider.Root>
            </div>

            <div>
              <h3 className="font-medium text-gray-200 mb-2">Property Type</h3>
              <div className="flex flex-wrap gap-2">
                {propertyTypeOptions.map(type => (
                  <button
                    key={type}
                    onClick={() => togglePropertyType(type)}
                    className={`px-3 py-1 text-sm rounded-full ${
                      filters.propertyTypes.includes(type)
                        ? 'bg-indigo-700 text-white'
                        : 'bg-gray-700 text-gray-300 hover:text-white'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-200 mb-2">Listing Type</h3>
              <div className="flex flex-wrap gap-2">
                {listingTypeOptions.map(type => (
                  <button
                    key={type}
                    onClick={() => toggleListingType(type)}
                    className={`px-3 py-1 text-sm rounded-full ${
                      filters.listingTypes.includes(type)
                        ? 'bg-indigo-700 text-white'
                        : 'bg-gray-700 text-gray-300 hover:text-white'
                    }`}
                  >
                    For {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-200 mb-2">Bedrooms</h3>
              <div className="flex gap-2">
                {[null, 1, 2, 3, 4, '5+'].map((num, index) => (
                  <button
                    key={index}
                    onClick={() => onFilterChange({ ...filters, bedrooms: num === '5+' ? 5 : num })}
                    className={`px-3 py-1 text-sm rounded-full ${
                      filters.bedrooms === (num === '5+' ? 5 : num)
                        ? 'bg-indigo-700 text-white'
                        : 'bg-gray-700 text-gray-300 hover:text-white'
                    }`}
                  >
                    {num === null ? 'Any' : num}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-200 mb-2">Bathrooms</h3>
              <div className="flex gap-2">
                {[null, 1, 2, 3, '4+'].map((num, index) => (
                  <button
                    key={index}
                    onClick={() => onFilterChange({ ...filters, bathrooms: num === '4+' ? 4 : num })}
                    className={`px-3 py-1 text-sm rounded-full ${
                      filters.bathrooms === (num === '4+' ? 4 : num)
                        ? 'bg-indigo-700 text-white'
                        : 'bg-gray-700 text-gray-300 hover:text-white'
                    }`}
                  >
                    {num === null ? 'Any' : num}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-200 mb-2">Features</h3>
              <div className="flex flex-wrap gap-2">
                {featureOptions.map(feature => (
                  <button
                    key={feature}
                    onClick={() => toggleFeature(feature)}
                    className={`px-3 py-1 text-sm rounded-full ${
                      filters.features.includes(feature)
                        ? 'bg-indigo-700 text-white'
                        : 'bg-gray-700 text-gray-300 hover:text-white'
                    }`}
                  >
                    {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-700">
              <button
                onClick={clearFilters}
                className="flex items-center text-sm text-gray-400 hover:text-gray-300 dark:text-gray-500 dark:hover:text-gray-400"
              >
                <X className="w-4 h-4 mr-1" />
                Clear Filters
              </button>
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>

      {/* Active filter chips */}
      <div className="flex flex-wrap gap-2">
        {filters.propertyTypes.map(type => (
          <div
            key={type}
            className="inline-flex items-center px-2 py-1 text-sm bg-indigo-700 text-white rounded-full"
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
            <button
              onClick={() => togglePropertyType(type)}
              className="ml-1 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        {filters.listingTypes.map(type => (
          <div
            key={type}
            className="inline-flex items-center px-2 py-1 text-sm bg-indigo-700 text-white rounded-full"
          >
            For {type.charAt(0).toUpperCase() + type.slice(1)}
            <button
              onClick={() => toggleListingType(type)}
              className="ml-1 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        {filters.features.map(feature => (
          <div
            key={feature}
            className="inline-flex items-center px-2 py-1 text-sm bg-indigo-700 text-white rounded-full"
          >
            {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            <button
              onClick={() => toggleFeature(feature)}
              className="ml-1 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        {(filters.bedrooms !== null || filters.bathrooms !== null) && (
          <div className="inline-flex items-center px-2 py-1 text-sm bg-indigo-700 text-white rounded-full">
            {filters.bedrooms !== null && `${filters.bedrooms}+ beds`}
            {filters.bedrooms !== null && filters.bathrooms !== null && ' · '}
            {filters.bathrooms !== null && `${filters.bathrooms}+ baths`}
            <button
              onClick={() => onFilterChange({ ...filters, bedrooms: null, bathrooms: null })}
              className="ml-1 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        {(filters.priceRange.min > 0 || filters.priceRange.max < 1000000) && (
          <div className="inline-flex items-center px-2 py-1 text-sm bg-indigo-700 text-white rounded-full">
            ${filters.priceRange.min.toLocaleString()} - ${filters.priceRange.max.toLocaleString()}
            <button
              onClick={() => onFilterChange({ ...filters, priceRange: { min: 0, max: 1000000 } })}
              className="ml-1 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </Popover.Root>
  );
};

export default PropertyFilters;
