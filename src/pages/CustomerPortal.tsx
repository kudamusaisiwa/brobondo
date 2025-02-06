import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  Mail, 
  Lock, 
  AlertCircle, 
  LogOut, 
  MessageCircle, 
  Moon, 
  Sun, 
  FileText, 
  Download, 
  User,
  CreditCard,
  Building2,
  Phone,
  DollarSign
} from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useCustomerPortalStore } from '../store/customerPortalStore';
import { useCommunicationStore } from '../store/communicationStore';
import { usePaymentStore } from '../store/paymentStore';
import ServiceStages from '../components/portal/ServiceStages';
import OrderTimeline from '../components/portal/OrderTimeline';
import CommunicationLog from '../components/portal/CommunicationLog';
import Toast from '../components/ui/Toast';
import PaymentHistory from '../components/portal/PaymentHistory';

type TabType = 'tracking' | 'account' | 'payments';

export default function CustomerPortal() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('tracking');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const { isDarkMode, toggleTheme } = useThemeStore();
  const { 
    customer,
    orders,
    documents,
    communications,
    payments,
    authenticate,
    logout: portalLogout,
    loading: portalLoading,
    error: portalError 
  } = useCustomerPortalStore();

  const { initialize: initializeCommunications } = useCommunicationStore();
  const { initialize: initializePayments } = usePaymentStore();

  // Initialize stores when customer logs in
  React.useEffect(() => {
    if (customer) {
      const unsubPromises = [
        initializeCommunications(customer.id),
        initializePayments()
      ];

      return () => {
        unsubPromises.forEach(promise => {
          promise?.then(unsub => unsub?.());
        });
      };
    }
  }, [customer, initializeCommunications, initializePayments]);

  // Set initial selected order and tab when customer logs in
  useEffect(() => {
    if (customer && orders.length > 0 && !selectedOrderId) {
      setSelectedOrderId(orders[0].id);
      setActiveTab('tracking'); // Set default tab to tracking when orders are loaded
    }
  }, [customer, orders, selectedOrderId]);

  // Reset state when customer logs out
  useEffect(() => {
    if (!customer) {
      setSelectedOrderId(null);
      setActiveTab('tracking');
    }
  }, [customer]);

  // Get the currently selected order
  const selectedOrder = orders.find(order => order.id === selectedOrderId);

  const renderAccountInfo = () => {
    if (!customer || !selectedOrder) return null;

    // Filter payments for the selected order
    const orderPayments = payments.filter(payment => {
      console.log('Checking payment:', payment, 'against order:', selectedOrder.id);
      return payment.orderId === selectedOrder.id;
    });

    console.log('All payments:', payments);
    console.log('Filtered payments for order:', orderPayments);
    console.log('Selected order:', selectedOrder);

    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-gray-400 dark:text-gray-300" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.firstName} {customer.lastName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Full Name</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-400 dark:text-gray-300" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.email}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Email Address</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Building2 className="h-5 w-5 text-gray-400 dark:text-gray-300" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.companyName || 'Not provided'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Company Name</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-gray-400 dark:text-gray-300" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{customer.phone || 'Not provided'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Phone Number</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment History Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment History</h3>
            <DollarSign className="h-5 w-5 text-gray-400 dark:text-gray-300" />
          </div>
          <div className="space-y-3">
            {orderPayments && orderPayments.length > 0 ? (
              orderPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-5 w-5 text-gray-400 dark:text-gray-300" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {typeof payment.amount === 'number' 
                          ? payment.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
                          : payment.amount ? payment.amount.toString() : 'Amount not available'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {payment.createdAt && payment.createdAt.toDate ? payment.createdAt.toDate().toLocaleDateString() : 
                         payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : 
                         payment.date && payment.date.toDate ? payment.date.toDate().toLocaleDateString() :
                         payment.date ? new Date(payment.date).toLocaleDateString() : 'Date not available'}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    payment.status === 'completed' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                  }`}>
                    {payment.status ? payment.status.charAt(0).toUpperCase() + payment.status.slice(1) : 'Status unknown'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No payment history available for this order</p>
            )}
          </div>
        </div>

        {/* Documents Section - Always show the section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Documents</h2>
            <FileText className="h-5 w-5 text-gray-400 dark:text-gray-300" />
          </div>
          <div className="grid gap-2">
            {documents.length > 0 ? (
              documents.map((doc) => {
                console.log('Rendering document:', doc);
                return (
                  <div
                    key={doc.id}
                    onClick={() => {
                      console.log('Opening document URL:', doc.fileUrl);
                      if (doc.fileUrl) {
                        window.open(doc.fileUrl, '_blank', 'noopener,noreferrer');
                      }
                    }}
                    className={`flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg ${
                      doc.fileUrl ? 'hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer' : ''
                    } transition-colors`}
                  >
                    <div className="flex items-center space-x-3 flex-grow min-w-0">
                      <FileText className="h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-300" />
                      <div className="truncate">
                        <span className="text-sm font-medium text-gray-900 dark:text-white block truncate">
                          {doc.description || doc.name || doc.fileName || 'Untitled Document'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {doc.uploadedAt?.toDate?.() ? doc.uploadedAt.toDate().toLocaleDateString() :
                           doc.uploadedAt ? new Date(doc.uploadedAt.seconds * 1000).toLocaleDateString() :
                           doc.createdAt?.toDate?.() ? doc.createdAt.toDate().toLocaleDateString() :
                           doc.createdAt ? new Date(doc.createdAt.seconds * 1000).toLocaleDateString() :
                           'Date not available'}
                        </span>
                      </div>
                    </div>
                    {doc.fileUrl && <Download className="h-5 w-5 text-gray-400 dark:text-gray-300 ml-2" />}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">No documents available</p>
              </div>
            )}
          </div>
        </div>

        {/* Communications Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Communication History</h2>
            <MessageCircle className="h-5 w-5 text-gray-400 dark:text-gray-300" />
          </div>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {communications.length > 0 ? (
              communications.map((comm) => (
                <div 
                  key={comm.id} 
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {comm.type}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {comm.createdAt?.toDate ? comm.createdAt.toDate().toLocaleDateString() :
                       comm.createdAt ? new Date(comm.createdAt.seconds * 1000).toLocaleDateString() :
                       'Date not available'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                    {comm.summary}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                No communications yet
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderOrderSelect = () => {
    if (!customer || orders.length <= 1) return null;

    return (
      <div className="mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <label htmlFor="orderSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Order
          </label>
          <select
            id="orderSelect"
            value={selectedOrderId || ''}
            onChange={(e) => setSelectedOrderId(e.target.value)}
            className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-white"
          >
            {orders.map((order) => (
              <option key={order.id} value={order.id}>
                #{order.orderNumber} - {order.companyName} - {order.serviceType} (${order.totalAmount.toLocaleString()})
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  const renderOrderTracking = () => {
    if (!selectedOrder) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">No orders found.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <ServiceStages order={selectedOrder} />
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <OrderTimeline order={selectedOrder} />
          </div>
        </div>
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setShowToast(false);

    try {
      await authenticate(email, passportNumber);
      setToastMessage('Login successful');
      setToastType('success');
    } catch (error: any) {
      console.error('Login error:', error);
      setToastMessage(error.message || 'Login failed. Please check your credentials.');
      setToastType('error');
    } finally {
      setShowToast(true);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    portalLogout();
    navigate('/portal');
  };

  const renderLoginForm = () => {
    if (customer) return null;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-8">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 space-y-6 border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <img
              className="mx-auto h-16 w-auto mb-4"
              src={isDarkMode 
                ? "https://res.cloudinary.com/fresh-ideas/image/upload/v1732284592/w95dfo6gv7dckea8htsj.png"
                : "https://res.cloudinary.com/fresh-ideas/image/upload/v1732284592/rqo2kuav7gd3ntuciejw.png"
              }
              alt="MG Accountants"
            />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Customer Portal</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">Login to access your account details</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="passport" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Passport Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="text"
                  id="passport"
                  value={passportNumber}
                  onChange={(e) => setPassportNumber(e.target.value)}
                  required
                  placeholder="Enter your passport number"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full flex justify-center bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400"
            >
              {loading ? 'Authenticating...' : 'Login'}
            </button>
          </form>
          
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
              Need help? <a href="/contact" className="text-blue-600 hover:underline">Contact Support</a>
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (!customer) {
      return (
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Please log in to view your orders.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('tracking')}
                className={`py-4 px-1 inline-flex items-center border-b-2 ${
                  activeTab === 'tracking'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Order Tracking
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`py-4 px-1 inline-flex items-center border-b-2 ${
                  activeTab === 'account'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Account Information
              </button>
            </nav>
          </div>
        </div>
        {activeTab === 'tracking' && renderOrderTracking()}
        {activeTab === 'account' && renderAccountInfo()}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header with Theme Toggle and Logout */}
      {customer && (
        <div className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Welcome, {customer.firstName} {customer.lastName}
              </h1>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={toggleTheme} 
                  className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  aria-label="Toggle theme"
                >
                  {isDarkMode ? 
                    <Sun className="h-5 w-5 text-gray-900 dark:text-gray-100" /> : 
                    <Moon className="h-5 w-5 text-gray-900 dark:text-gray-100" />
                  }
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Render Login Form if not authenticated */}
      {renderLoginForm()}

      {/* Render Portal Content if authenticated */}
      {customer && (
        <div className="container mx-auto px-4 py-8">
          {/* Portal Tabs */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-white dark:bg-gray-800 rounded-lg shadow-md">
              {[
                { key: 'tracking', icon: MessageCircle, label: 'Order Tracking' },
                { key: 'account', icon: User, label: 'Account' },
              ].map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as TabType)}
                  className={`px-4 py-2 flex items-center space-x-2 text-sm font-medium transition-colors ${
                    activeTab === key 
                      ? 'bg-blue-500 text-white' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  } ${key === 'tracking' ? 'rounded-l-lg' : 'rounded-r-lg'}`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="hidden md:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Order Selection Dropdown */}
          {renderOrderSelect()}

          {/* Tab Content */}
          <div className="max-w-4xl mx-auto">
            {activeTab === 'tracking' && renderOrderTracking()}
            {activeTab === 'account' && renderAccountInfo()}
          </div>
        </div>
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