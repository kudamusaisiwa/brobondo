export type PropertyCategory = 'Residential' | 'Commercial' | 'Industrial' | 'Agricultural' | 'Special Use' | 'Land';

export const PROPERTY_CATEGORIES: PropertyCategory[] = [
  'Residential',
  'Commercial',
  'Industrial',
  'Agricultural',
  'Special Use',
  'Land'
];

interface PropertyType {
  value: string;
  label: string;
  category: PropertyCategory;
  hasRooms: boolean;
  amenities: string[];
}

export const PROPERTY_TYPES: PropertyType[] = [
  // Land Properties
  {
    value: 'residential-stand',
    label: 'Residential Stand',
    category: 'Land',
    hasRooms: false,
    amenities: [
      'Serviced',
      'Road Access',
      'Water Connection',
      'Electricity Connection',
      'Sewer Connection',
      'Title Deeds'
    ]
  },
  {
    value: 'commercial-stand',
    label: 'Commercial Stand',
    category: 'Land',
    hasRooms: false,
    amenities: [
      'Serviced',
      'Road Access',
      'Water Connection',
      'Electricity Connection',
      'Sewer Connection',
      'Title Deeds',
      'Zoning Approval'
    ]
  },
  {
    value: 'industrial-stand',
    label: 'Industrial Stand',
    category: 'Land',
    hasRooms: false,
    amenities: [
      'Serviced',
      'Road Access',
      'Water Connection',
      'Electricity Connection',
      'Sewer Connection',
      'Title Deeds',
      'Zoning Approval',
      'Heavy Vehicle Access'
    ]
  },
  {
    value: 'agricultural-land',
    label: 'Agricultural Land',
    category: 'Agricultural',
    hasRooms: false,
    amenities: [
      'Water Rights',
      'Road Access',
      'Irrigation Infrastructure',
      'Fencing',
      'Farm Buildings',
      'Power Connection',
      'Borehole'
    ]
  },
  {
    value: 'residential-plot',
    label: 'Residential Plot',
    category: 'Land',
    hasRooms: false,
    amenities: [
      'Road Access',
      'Surveyed',
      'Title Deeds',
      'Zoning Approval'
    ]
  },
  {
    value: 'development-land',
    label: 'Development Land',
    category: 'Land',
    hasRooms: false,
    amenities: [
      'Road Access',
      'Surveyed',
      'Title Deeds',
      'Zoning Approval',
      'Environmental Impact Assessment',
      'Development Permits'
    ]
  },
  // Residential Properties
  {
    value: 'single-family',
    label: 'Single-Family Home',
    category: 'Residential',
    hasRooms: true,
    amenities: [
      'Garage',
      'Garden',
      'Swimming Pool',
      'Security System',
      'Air Conditioning',
      'Central Heating',
      'Fireplace',
      'Solar Panels'
    ]
  },
  {
    value: 'apartment',
    label: 'Apartment/Flat',
    category: 'Residential',
    hasRooms: true,
    amenities: [
      'Elevator',
      'Parking',
      'Security',
      'Gym',
      'Swimming Pool',
      'Balcony',
      'Air Conditioning',
      'Storage'
    ]
  },
  {
    value: 'townhouse',
    label: 'Townhouse',
    category: 'Residential',
    hasRooms: true,
    amenities: [
      'Parking',
      'Garden',
      'Security',
      'Air Conditioning',
      'Central Heating',
      'Storage'
    ]
  },

  // Commercial Properties
  {
    value: 'office',
    label: 'Office Space',
    category: 'Commercial',
    hasRooms: false,
    amenities: [
      'Reception',
      'Meeting Rooms',
      'Kitchen',
      'Parking',
      'Security',
      'Air Conditioning',
      'Internet',
      'Elevator'
    ]
  },
  {
    value: 'retail',
    label: 'Retail Shop',
    category: 'Commercial',
    hasRooms: false,
    amenities: [
      'Storage',
      'Display Windows',
      'Security System',
      'Loading Area',
      'Air Conditioning',
      'Signage Space'
    ]
  },
  {
    value: 'restaurant',
    label: 'Restaurant',
    category: 'Commercial',
    hasRooms: false,
    amenities: [
      'Kitchen',
      'Storage',
      'Ventilation System',
      'Outdoor Seating',
      'Parking',
      'Delivery Area'
    ]
  },

  // Industrial Properties
  {
    value: 'warehouse',
    label: 'Warehouse',
    category: 'Industrial',
    hasRooms: false,
    amenities: [
      'Loading Docks',
      'High Ceilings',
      'Security System',
      'Climate Control',
      'Office Space',
      'Parking'
    ]
  },
  {
    value: 'factory',
    label: 'Factory',
    category: 'Industrial',
    hasRooms: false,
    amenities: [
      'Loading Area',
      'Heavy Power Supply',
      'Ventilation System',
      'Water Supply',
      'Waste Management',
      'Security'
    ]
  },

  // Agricultural Properties
  {
    value: 'farmland',
    label: 'Farmland',
    category: 'Agricultural',
    hasRooms: false,
    amenities: [
      'Irrigation System',
      'Storage Facilities',
      'Water Source',
      'Fencing',
      'Access Road',
      'Power Supply'
    ]
  },
  {
    value: 'ranch',
    label: 'Ranch',
    category: 'Agricultural',
    hasRooms: true,
    amenities: [
      'Barn',
      'Stables',
      'Fencing',
      'Water Source',
      'Storage',
      'Living Quarters'
    ]
  },

  // Special Use Properties
  {
    value: 'school',
    label: 'School',
    category: 'Special Use',
    hasRooms: true,
    amenities: [
      'Classrooms',
      'Playground',
      'Cafeteria',
      'Library',
      'Sports Facilities',
      'Parking',
      'Security'
    ]
  },
  {
    value: 'hospital',
    label: 'Hospital/Medical',
    category: 'Special Use',
    hasRooms: true,
    amenities: [
      'Emergency Room',
      'Operating Rooms',
      'Patient Rooms',
      'Parking',
      'Cafeteria',
      'Laboratory',
      'Pharmacy'
    ]
  }
];
