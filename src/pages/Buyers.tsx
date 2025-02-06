import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Users, Mail, Phone, DollarSign, Building2, Pencil, Trash2 } from 'lucide-react';
import { useBuyerStore } from '../store/buyerStore';
import { usePropertyStore } from '../store/propertyStore';
import { formatCurrency } from '../utils/formatters';
import ViewToggle from '../components/ui/ViewToggle';

export default function Buyers() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'grid' | 'table'>('table');
  const { buyers, loading, error, initialize, deleteBuyer } = useBuyerStore();
  const { properties, initialize: initializeProperties } = usePropertyStore();

  useEffect(() => {
    initialize();
    initializeProperties();
  }, [initialize, initializeProperties]);

  const filteredBuyers = buyers.filter(buyer =>
    buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    buyer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    buyer.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteBuyer = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this buyer?')) {
      await deleteBuyer(id);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading buyers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">Error: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Users className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Buyers</h1>
            <span className="px-3 py-1 text-sm rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              {filteredBuyers.length} {filteredBuyers.length === 1 ? 'buyer' : 'buyers'}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <ViewToggle view={view} onViewChange={setView} />
            <button
              onClick={() => navigate('/admin/buyers/new')}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Add Buyer</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search buyers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {view === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBuyers.map(buyer => {
            const interestedProperties = properties.filter(p => 
              buyer.interestedProperties?.includes(p.id)
            );

            return (
              <div
                key={buyer.id}
                onClick={() => navigate(`/admin/buyers/${buyer.id}`)}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {buyer.name}
                    </h3>
                    {buyer.company && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {buyer.company}
                      </div>
                    )}
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Mail className="h-4 w-4 mr-2" />
                        {buyer.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Phone className="h-4 w-4 mr-2" />
                        {buyer.phone}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Budget: {formatCurrency(buyer.budget)}
                      </div>
                    </div>
                  </div>

                  {/* Interested Properties */}
                  {interestedProperties.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Interested In:
                      </div>
                      <div className="space-y-2">
                        {interestedProperties.slice(0, 2).map(property => (
                          <div
                            key={property.id}
                            className="flex items-center text-sm text-gray-500 dark:text-gray-400"
                          >
                            <Building2 className="h-4 w-4 mr-2" />
                            {property.title}
                          </div>
                        ))}
                        {interestedProperties.length > 2 && (
                          <div className="text-sm text-gray-400">
                            +{interestedProperties.length - 2} more properties
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="flex justify-end">
                    <span className={`px-3 py-1 text-sm rounded-full ${
                      buyer.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                        : buyer.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {buyer.status.charAt(0).toUpperCase() + buyer.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Properties
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredBuyers.map(buyer => {
                  const interestedProperties = properties.filter(p => 
                    buyer.interestedProperties?.includes(p.id)
                  );

                  return (
                    <tr
                      key={buyer.id}
                      onClick={() => navigate(`/admin/buyers/${buyer.id}`)}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {buyer.name}
                        </div>
                        {buyer.company && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {buyer.company}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          <div>{buyer.email}</div>
                          <div>{buyer.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatCurrency(buyer.budget)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {interestedProperties.length > 0 ? (
                            <>
                              {interestedProperties[0].title}
                              {interestedProperties.length > 1 && (
                                <div className="text-xs text-gray-400">
                                  +{interestedProperties.length - 1} more
                                </div>
                              )}
                            </>
                          ) : (
                            'None'
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-sm rounded-full ${
                          buyer.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                            : buyer.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {buyer.status.charAt(0).toUpperCase() + buyer.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/buyers/${buyer.id}/edit`);
                            }}
                            className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                          >
                            <Pencil className="h-5 w-5" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteBuyer(e, buyer.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredBuyers.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No buyers found
        </div>
      )}
    </div>
  );
}
