export interface Property {
  id: string;
  title: string;
  description: string;
  listingType: 'sale' | 'rental';
  type: 'residential' | 'commercial' | 'land';
  price: number;
  status: 'available' | 'sold' | 'rented' | 'pending';
  location: {
    address: string;
    city?: string;
    country?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  features: {
    bedrooms?: number;
    bathrooms?: number;
    parking?: boolean;
    area?: number;
  };
  photos: string[];
  listedAt: Date;
  updatedAt: Date;
  featured?: boolean;
}
