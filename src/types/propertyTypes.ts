export interface PropertyTypeOption {
  label: string;
  value: string;
  subTypes?: PropertyTypeOption[];
}

export const propertyTypes: PropertyTypeOption[] = [
  {
    label: 'Residential',
    value: 'residential',
    subTypes: [
      { label: 'Single-Family Home', value: 'single-family-home' },
      { label: 'Townhouse', value: 'townhouse' },
      { label: 'Apartment/Flat', value: 'apartment-flat' },
      { label: 'Duplex/Triplex', value: 'duplex-triplex' },
      { label: 'Condominium (Condo)', value: 'condominium' },
      { label: 'Studio Apartment', value: 'studio-apartment' },
      { label: 'Serviced Apartment', value: 'serviced-apartment' },
      { label: 'Villa', value: 'villa' },
      { label: 'Mansion', value: 'mansion' },
      { label: 'Prefabricated Home', value: 'prefabricated-home' }
    ]
  },
  {
    label: 'Commercial',
    value: 'commercial',
    subTypes: [
      { label: 'Office Space', value: 'office-space' },
      { label: 'Retail Shop', value: 'retail-shop' },
      { label: 'Hotel/Lodge', value: 'hotel-lodge' },
      { label: 'Co-working Space', value: 'co-working-space' },
      { label: 'Restaurant/Café', value: 'restaurant-cafe' },
      { label: 'Showroom/Warehouse', value: 'showroom-warehouse' }
    ]
  },
  {
    label: 'Industrial',
    value: 'industrial',
    subTypes: [
      { label: 'Factory/Manufacturing Plant', value: 'factory-manufacturing' },
      { label: 'Warehouse', value: 'warehouse' },
      { label: 'Distribution Center', value: 'distribution-center' },
      { label: 'Cold Storage Facility', value: 'cold-storage' },
      { label: 'Workshop', value: 'workshop' }
    ]
  },
  {
    label: 'Agricultural',
    value: 'agricultural',
    subTypes: [
      { label: 'Farmland', value: 'farmland' },
      { label: 'Ranch', value: 'ranch' },
      { label: 'Plantation', value: 'plantation' },
      { label: 'Greenhouse', value: 'greenhouse' }
    ]
  },
  {
    label: 'Special Use',
    value: 'special-use',
    subTypes: [
      { label: 'School/Educational Institution', value: 'educational' },
      { label: 'Hospital/Medical Facility', value: 'medical' },
      { label: 'Religious Building', value: 'religious' },
      { label: 'Event Venue', value: 'event-venue' },
      { label: 'Parking Lot/Garage', value: 'parking' },
      { label: 'Recreational Facility', value: 'recreational' }
    ]
  }
];
