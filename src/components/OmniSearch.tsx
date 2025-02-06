import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Users, 
  Home,
  Building,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  UserCheck,
  DollarSign
} from 'lucide-react';
import { usePropertyStore } from '../store/propertyStore';
import { useTenantStore } from '../store/tenantStore';
import { useOwnerStore } from '../store/ownerStore';
import { useBuyerStore } from '../store/buyerStore';

type SearchResult = {
  id: string;
  type: 'property' | 'tenant' | 'owner' | 'buyer';
  title: string;
  subtitle?: string;
  metadata?: string[];
  link: string;
  icon?: React.ReactNode;
};

export default function OmniSearch() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);

  const { properties } = usePropertyStore();
  const { tenants } = useTenantStore();
  const { owners } = useOwnerStore();
  const { buyers } = useBuyerStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTerm.length < 2) {
      setResults([]);
      return;
    }

    const searchResults: SearchResult[] = [];
    const term = searchTerm.toLowerCase();

    // Search properties
    properties.forEach(property => {
      if (
        property.title.toLowerCase().includes(term) ||
        property.description?.toLowerCase().includes(term) ||
        property.location.address.toLowerCase().includes(term)
      ) {
        searchResults.push({
          id: `property-${property.id}`,
          type: 'property',
          title: property.title,
          subtitle: `${property.listingType === 'sale' ? 'For Sale' : 'For Rent'} - ${property.location.address}`,
          metadata: [
            `$${property.price.toLocaleString()}`,
            `${property.features.bedrooms} beds, ${property.features.bathrooms} baths`,
            property.status
          ],
          link: `/admin/properties/${property.id}`,
          icon: <Home className="h-4 w-4" />
        });
      }
    });

    // Search tenants
    tenants.forEach(tenant => {
      const fullName = `${tenant.firstName || ''} ${tenant.lastName || ''}`.toLowerCase();
      if (
        fullName.includes(term) ||
        tenant.email?.toLowerCase().includes(term) ||
        tenant.phone?.includes(term)
      ) {
        searchResults.push({
          id: `tenant-${tenant.id}`,
          type: 'tenant',
          title: `${tenant.firstName} ${tenant.lastName}`,
          subtitle: 'Tenant',
          metadata: [
            tenant.email || '',
            tenant.phone || '',
            tenant.address || ''
          ].filter(Boolean),
          link: `/admin/tenants/${tenant.id}`,
          icon: <UserCheck className="h-4 w-4" />
        });
      }
    });

    // Search owners
    owners.forEach(owner => {
      const fullName = `${owner.firstName || ''} ${owner.lastName || ''}`.toLowerCase();
      if (
        fullName.includes(term) ||
        owner.email?.toLowerCase().includes(term) ||
        owner.phone?.includes(term)
      ) {
        searchResults.push({
          id: `owner-${owner.id}`,
          type: 'owner',
          title: `${owner.firstName} ${owner.lastName}`,
          subtitle: 'Property Owner',
          metadata: [
            owner.email || '',
            owner.phone || '',
            owner.address || ''
          ].filter(Boolean),
          link: `/admin/owners/${owner.id}`,
          icon: <Building className="h-4 w-4" />
        });
      }
    });

    // Search buyers
    buyers.forEach(buyer => {
      const fullName = `${buyer.firstName || ''} ${buyer.lastName || ''}`.toLowerCase();
      if (
        fullName.includes(term) ||
        buyer.email?.toLowerCase().includes(term) ||
        buyer.phone?.includes(term)
      ) {
        searchResults.push({
          id: `buyer-${buyer.id}`,
          type: 'buyer',
          title: `${buyer.firstName} ${buyer.lastName}`,
          subtitle: 'Potential Buyer',
          metadata: [
            buyer.email || '',
            buyer.phone || '',
            buyer.budget ? `Budget: $${buyer.budget.toLocaleString()}` : ''
          ].filter(Boolean),
          link: `/admin/buyers/${buyer.id}`,
          icon: <DollarSign className="h-4 w-4" />
        });
      }
    });

    setResults(searchResults);
  }, [searchTerm, properties, tenants, owners, buyers]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      navigate(results[selectedIndex].link);
      setIsOpen(false);
      setSearchTerm('');
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'property':
        return Home;
      case 'tenant':
        return UserCheck;
      case 'owner':
        return Building;
      case 'buyer':
        return DollarSign;
      case 'order':
        return ClipboardList;
      case 'product':
        return Package;
      default:
        return Search;
    }
  };

  const getMetadataIcon = (text: string | null | undefined) => {
    if (!text) return MapPin;
    if (text.includes('@')) return Mail;
    if (text.includes('+')) return Phone;
    if (text.includes('Status')) return Calendar;
    if (text.includes('Amount') || text.includes('Price')) return Building;
    return MapPin;
  };

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search properties, tenants, owners, buyers..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            setSelectedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full rounded-md border-0 bg-gray-50 dark:bg-gray-700 pl-10 pr-4 py-2.5 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          <div className="max-h-[60vh] overflow-y-auto">
            {results.map((result, index) => {
              const Icon = getIcon(result.type);
              return (
                <div
                  key={result.id}
                  onClick={() => {
                    navigate(result.link);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`px-4 py-3 cursor-pointer ${
                    index === selectedIndex
                      ? 'bg-blue-50 dark:bg-blue-900/50'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-start">
                    <Icon className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {result.title}
                        </p>
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                          {result.type}
                        </span>
                      </div>
                      {result.subtitle && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {result.subtitle}
                        </p>
                      )}
                      {result.metadata && (
                        <div className="mt-1 flex flex-wrap gap-2">
                          {result.metadata.map((meta, i) => {
                            const MetaIcon = getMetadataIcon(meta);
                            return (
                              <div
                                key={i}
                                className="flex items-center text-xs text-gray-500 dark:text-gray-400"
                              >
                                <MetaIcon className="h-3 w-3 mr-1" />
                                {meta}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}