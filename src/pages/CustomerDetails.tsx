import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Phone, Mail, MapPin, Building, Calendar, Clock, FileText, ArrowLeft, Edit, MessageSquare } from 'lucide-react';
import { useCustomerStore } from '../store/customerStore';
import { useOrderStore } from '../store/orderStore';
import { useCommunicationStore } from '../store/communicationStore';
import { useAuthStore } from '../store/authStore';
import { usePaymentStore } from '../store/paymentStore'; // Import the payment store
import type { Customer, CommunicationType } from '../types';
import CommunicationLog from '../components/CommunicationLog';
import CompanyDetailsCard from '../components/customers/CompanyDetailsCard';
import CustomerDocuments from '../components/customers/CustomerDocuments';
import AddCommunicationModal from '../components/AddCommunicationModal';
import EditCustomerModal from '../components/modals/EditCustomerModal';
import SendMessageModal from '../components/modals/SendMessageModal';
import Toast from '../components/ui/Toast';

export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    customers, 
    getCustomerById, 
    updateCustomer, 
    initialize: initCustomers, 
    loading: customerLoading 
  } = useCustomerStore();
  const { orders, initialize: initOrders } = useOrderStore();
  const { addCommunication, initialize: initCommunications } = useCommunicationStore();
  const { user } = useAuthStore();
  const { payments, initialize: initPayments } = usePaymentStore();

  // Initialize all required stores
  useEffect(() => {
    const init = async () => {
      await Promise.all([
        initCustomers(),
        initOrders(),
        initCommunications(),
        initPayments()
      ]);
    };
    init();
  }, [initCustomers, initOrders, initCommunications, initPayments]);

  // Force immediate logging on component mount
  React.useEffect(() => {
    console.error(' CUSTOMER DETAILS COMPONENT MOUNT', {
      routeId: id,
      customers: customers.length,
      customerIds: customers.map(c => c.id),
      stackTrace: new Error().stack
    });

    // Immediate customer matching attempt
    const immediateMatch = id ? customers.find(c => c.id === id) : null;
    console.error(' IMMEDIATE CUSTOMER MATCHING', {
      searchId: id,
      immediateMatch: !!immediateMatch,
      matchedCustomer: immediateMatch
    });
  }, []);

  // Extremely verbose customer matching function
  const findMatchingCustomer = React.useCallback((customerId: string) => {
    console.error('🔍 EXTREME CUSTOMER MATCHING PROCESS 🔍');
    console.error('Search ID:', customerId);
    console.error('Search ID Type:', typeof customerId);
    console.error('Search ID Length:', customerId.length);
    console.error('Total Customers:', customers.length);
    
    // Detailed type and comparison logging
    const detailedMatches = customers.map((customer, index) => ({
      index,
      id: customer.id,
      idType: typeof customer.id,
      idLength: customer.id?.length,
      exactMatch: customer.id === customerId,
      typeMatch: typeof customer.id === typeof customerId,
      lengthMatch: customer.id?.length === customerId.length
    }));

    // Find the first exact match with detailed logging
    const exactMatches = detailedMatches.filter(match => match.exactMatch);
    
    console.error('Exact Matches:', exactMatches);
    console.error('First 10 Detailed Matches:', detailedMatches.slice(0, 10));

    // If exact matches found, return the first one
    if (exactMatches.length > 0) {
      const matchedCustomer = customers[exactMatches[0].index];
      console.error('✅ EXACT MATCH FOUND:', {
        id: matchedCustomer.id,
        matchIndex: exactMatches[0].index,
        name: `${matchedCustomer.firstName} ${matchedCustomer.lastName}`.trim()
      });
      return matchedCustomer;
    }

    // Fallback strategies with logging
    const caseInsensitiveMatch = customers.find(
      c => c.id?.toLowerCase() === customerId.toLowerCase()
    );
    if (caseInsensitiveMatch) {
      console.error('✅ CASE-INSENSITIVE MATCH FOUND:', {
        id: caseInsensitiveMatch.id,
        name: `${caseInsensitiveMatch.firstName} ${caseInsensitiveMatch.lastName}`.trim()
      });
      return caseInsensitiveMatch;
    }

    const partialMatch = customers.find(
      c => c.id?.includes(customerId)
    );
    if (partialMatch) {
      console.error('✅ PARTIAL MATCH FOUND:', {
        id: partialMatch.id,
        name: `${partialMatch.firstName} ${partialMatch.lastName}`.trim()
      });
      return partialMatch;
    }

    console.error('❌ NO CUSTOMER MATCH FOUND');
    return null;
  }, [customers]);

  // Get customer from store or load if needed
  const customer = id ? getCustomerById(id) : null;

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000;

    const loadData = async () => {
      if (!id) {
        setError('No customer ID provided');
        setLoading(false);
        return;
      }

      // If customer already exists in store, don't reload
      if (customer) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Only initialize if needed
        if (!customers.length) {
          await initCustomers();
        }
        
        // Load orders and communications
        await Promise.all([
          initOrders(),
          initCommunications(id, user)
        ]);

        console.log('Communication Initialization Details:', {
          customerId: id,
          customerObject: customer,
          customerStoreLength: customers.length,
          user: user ? { id: user.id, name: user.name } : null
        });

        if (mounted) {
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading customer data:', err);
        if (mounted && retryCount < MAX_RETRIES) {
          retryCount++;
          setTimeout(loadData, RETRY_DELAY);
        } else if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load customer data');
          setLoading(false);
        }
      }
    };

    loadData();
    return () => {
      mounted = false;
    };
  }, [id]); // Only depend on the ID changing

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSendMessageModal, setShowSendMessageModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prefilledMessage, setPrefilledMessage] = useState('');

  // Add state for customer orders summary
  const [customerOrderStats, setCustomerOrderStats] = useState({
    totalOrders: 0,
    revenue: 0,
    outstanding: 0
  });

  // Calculate customer-specific order stats
  const calculateCustomerOrderStats = useCallback(() => {
    if (!id) return;

    const currentCustomer = customers.find(c => c.id === id);
    if (!currentCustomer) {
      console.error('No customer found with ID:', id);
      return;
    }

    // Filter orders for this specific customer using ID only
    const customerOrders = orders.filter(order => order.customerId === id);

    // Calculate total orders and payments
    const stats = {
      totalOrders: customerOrders.length,
      revenue: customerOrders.reduce((total, order) => {
        // Get all payments for this order
        const orderPayments = payments.filter(payment => payment.orderId === order.id);
        const paidAmount = orderPayments.reduce((sum, payment) => 
          sum + Number(payment.amount || 0), 
          0
        );
        return total + paidAmount;
      }, 0),
      outstanding: customerOrders.reduce((total, order) => {
        // Calculate total amount for the order
        const totalAmount = Number(order.totalAmount || 0);
        
        // Get all payments for this order
        const orderPayments = payments.filter(payment => payment.orderId === order.id);
        const paidAmount = orderPayments.reduce((sum, payment) => 
          sum + Number(payment.amount || 0), 
          0
        );
        
        return total + (totalAmount - paidAmount);
      }, 0)
    };

    console.log('Customer Order Stats:', {
      customerId: id,
      totalOrders: stats.totalOrders,
      paidRevenue: stats.revenue,
      outstanding: stats.outstanding,
      orderIds: customerOrders.map(o => o.id),
      payments: payments.filter(p => customerOrders.some(o => o.id === p.orderId))
    });

    setCustomerOrderStats(stats);
  }, [id, customers, orders, payments]);

  // Recalculate stats when orders, payments, or customer ID changes
  useEffect(() => {
    calculateCustomerOrderStats();
  }, [calculateCustomerOrderStats]);

  const handleAddCommunication = async ({ type, summary }: { type: CommunicationType; summary: string }) => {
    try {
      await addCommunication({
        customerId: id!,
        type,
        summary
      });
      setToastMessage('Communication added successfully');
      setToastType('success');
      setShowToast(true);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding communication:', error);
      setToastMessage('Failed to add communication');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleEditCustomer = async (customerData: Partial<Customer>) => {
    try {
      await updateCustomer(id!, customerData);
      setToastMessage('Customer updated successfully');
      setToastType('success');
      setShowToast(true);
      setShowEditModal(false);
    } catch (error) {
    console.error('Error updating customer:', error);
      setToastMessage('Failed to update customer');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleUpdateField = async (field: keyof Customer, value: string) => {
    if (!id) return;
    
    try {
      let processedValue = value;

      // Special handling for different field types
      if (field === 'dateOfBirth') {
        processedValue = new Date(value).toISOString();
      } else if (field === 'companyNames') {
        processedValue = JSON.stringify(value.split('\n').map(v => v.trim()).filter(Boolean));
      }

      await updateCustomer(id, { [field]: processedValue });
      
      setToastMessage(`${field.replace(/([A-Z])/g, ' $1').toLowerCase()} updated successfully`);
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      console.error('Error updating field:', error);
      setToastMessage('Failed to update field');
      setToastType('error');
      setShowToast(true);
    }
  };

  const renderCustomerDetail = (label: string, value: string | undefined, icon: React.ReactNode) => (
    value ? (
      <div className="flex items-center space-x-3">
        {icon}
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-sm text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    ) : null
  );

  const customerOrders = orders?.filter(order => order?.customerId === id) || [];

  // Early return if no customer found
  if (!customer && !loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <p className="text-gray-500 dark:text-gray-400">Customer not found</p>
          </div>
        </div>
      </div>
    );
  }

  // Ensure all customer fields have default values
  const customerData = customer ? {
    id: customer.id || '',
    firstName: customer.firstName || '',
    lastName: customer.lastName || '',
    name: customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Unnamed Customer',
    email: customer.email || '',
    phone: customer.phone || '',
    address: customer.address || '',
    city: customer.city || '',
    state: customer.state || '',
    zip: customer.zip || '',
    country: customer.country || '',
    companyName: customer.companyName || '',
    passportNumber: customer.passportNumber || '',
    dateOfBirth: customer.dateOfBirth || null,
    homeAddress: customer.homeAddress || '',
    companyNames: Array.isArray(customer.companyNames) ? customer.companyNames : 
                 customer.companyNames ? JSON.parse(String(customer.companyNames)) : [],
    cardDeliveryAddress: customer.cardDeliveryAddress || '',
    notes: Array.isArray(customer.notes) ? customer.notes : 
           customer.notes ? [String(customer.notes)] : [],
    createdAt: customer.createdAt || new Date(),
    updatedAt: customer.updatedAt || new Date(),
    status: customer.status || 'active',
    type: customer.type || 'individual',
    communications: Array.isArray(customer.communications) ? customer.communications : [],
    documents: Array.isArray(customer.documents) ? customer.documents : [],
    orders: Array.isArray(customer.orders) ? customer.orders : []
  } : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <p className="text-gray-500 dark:text-gray-400">Loading customer details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">Customer Not Found</h2>
          <p className="text-gray-600">
            The customer with ID {id} could not be located. 
            This might be due to a data synchronization issue.
          </p>
          <div className="mt-4 space-x-2">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Reload Page
            </button>
            <button 
              onClick={() => navigate('/customers')}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Back to Customers
            </button>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            <p>Debug Info:</p>
            <pre>{JSON.stringify({
              routeId: id,
              totalCustomers: customers.length,
              customerIds: customers.map(c => c.id)
            }, null, 2)}</pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/customers"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Customers
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {customerData?.name}
          </h1>
        </div>
        <button
          onClick={() => setShowEditModal(true)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Customer
        </button>
        <button
          onClick={() => {
            if (!customerData?.phone) {
              toast.error('Please add a phone number for this customer first');
              return;
            }
            setShowSendMessageModal(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Send Message
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Basic Information</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {renderCustomerDetail('Company Name', customerData?.companyName, <Building className="h-5 w-5 text-gray-400" />)}
              
              {/* Explicitly handle customer phone */}
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone Number</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {customerData?.phone || 'No phone number'}
                  </p>
                </div>
              </div>

              {renderCustomerDetail('Email', customerData?.email, <Mail className="h-5 w-5 text-gray-400" />)}
              {renderCustomerDetail('Address', customerData?.address, <MapPin className="h-5 w-5 text-gray-400" />)}
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Customer Since</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {customerData?.createdAt ? new Date(customerData.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            {customerData?.notes && customerData.notes.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Notes</h3>
                {customerData.notes.map((note, index) => (
                  <p key={index} className="text-sm text-gray-900 dark:text-white">{note}</p>
                ))}
              </div>
            )}
            {customerData?.notes && !Array.isArray(customerData.notes) && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Notes</h3>
                <p className="text-sm text-gray-900 dark:text-white">{String(customerData.notes)}</p>
              </div>
            )}
          </div>

          {/* Company Details Card */}
          <CompanyDetailsCard 
            customer={customerData}
            onUpdate={handleUpdateField}
          />

          {/* Order History */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Order History</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Order Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {customerOrders.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    customerOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            to={`/orders/${order.id}`}
                            className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                          >
                            {order.orderNumber ? `#${order.orderNumber}` : `Order ${order.id}`}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {order.createdAt.toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            order.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                            order.status === 'paid' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' :
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          ${order.totalAmount.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Customer Order Stats */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center shadow-sm">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Total Orders</h3>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{customerOrderStats.totalOrders}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center shadow-sm">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Total Revenue</h3>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${customerOrderStats.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center shadow-sm">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Outstanding Balance</h3>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                ${customerOrderStats.outstanding.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Communications and Documents */}
        <div className="lg:col-span-1 space-y-6">
          <CommunicationLog
            customerId={id!}
            onAddClick={() => setIsModalOpen(true)}
          />
          
          <CustomerDocuments customerId={id!} />
        </div>
      </div>

      <AddCommunicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddCommunication}
      />

      {showEditModal && (
        <EditCustomerModal
          customer={customerData}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditCustomer}
        />
      )}

      {showSendMessageModal && customerData && customerData.phone && (
        <SendMessageModal
          isOpen={showSendMessageModal}
          onClose={() => setShowSendMessageModal(false)}
          recipient={customerData}
          messageTemplate={`Hi ${customerData.firstName}

You can now log in and get real time updates & documents on your Company and Account order.
go to https://admin.mgaccountants.co.za/portal

Username: ${customerData.email}
${customerData.passportNumber ? `Passport number: ${customerData.passportNumber}` : ''}

For aftercare you can send me a WhatsApp +447462252406

Thank you for choosing MG Accountants.`}
        />
      )}

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}