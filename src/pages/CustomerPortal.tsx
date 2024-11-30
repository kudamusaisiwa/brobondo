import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
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
  Phone
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useOrderStore } from '../store/orderStore';
import { useThemeStore } from '../store/themeStore';
import { useCustomerDocumentStore } from '../store/customerDocumentStore';
import { useCommunicationStore } from '../store/communicationStore';
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

  const { authenticateCustomer, user, logout } = useAuthStore();
  const { orders = [], initialize: initOrders } = useOrderStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { getDocumentsByCustomer, initialize: initDocuments } = useCustomerDocumentStore();
  const { initialize: initCommunications } = useCommunicationStore();

  // Get all orders for the authenticated customer
  const customerOrders = user ? orders.filter(o => o?.customerId === user.id) : [];
  const selectedOrder = selectedOrderId 
    ? customerOrders.find(o => o.id === selectedOrderId)
    : customerOrders[0];
  const documents = user ? getDocumentsByCustomer(user.id) : [];

  useEffect(() => {
    if (user) {
      Promise.all([
        initDocuments(),
        initOrders(),
        initCommunications()
      ]).catch(error => {
        console.error('Error initializing data:', error);
      });
    }
  }, [user, initDocuments, initOrders, initCommunications]);

  useEffect(() => {
    if (customerOrders.length > 0 && !selectedOrderId) {
      setSelectedOrderId(customerOrders[0].id);
    }
  }, [customerOrders]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authenticateCustomer(email, passportNumber);
      setToastMessage('Authentication successful');
      setToastType('success');
      setShowToast(true);
    } catch (error: any) {
      setToastMessage(error.message || 'Authentication failed');
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/portal');
    } catch (error: any) {
      setToastMessage(error.message || 'Failed to logout');
      setToastType('error');
      setShowToast(true);
    }
  };

  const renderAccountInfo = () => {
    if (!user || !selectedOrder) return null;

    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Details</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-gray-400 dark:text-gray-300" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Full Name</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-gray-400 dark:text-gray-300" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user.email}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Email Address</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Building2 className="h-5 w-5 text-gray-400 dark:text-gray-300" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedOrder.companyName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Company Name</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-gray-400 dark:text-gray-300" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user.phone || 'Not provided'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Phone Number</p>
              </div>
            </div>
          </div>
        </div>

        {documents.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Documents</h2>
              <FileText className="h-5 w-5 text-gray-400 dark:text-gray-300" />
            </div>
            <div className="grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => window.open(doc.fileUrl, '_blank', 'noopener,noreferrer')}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-3 flex-grow min-w-0">
                    <FileText className="h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-300" />
                    <div className="truncate">
                      <span className="text-sm font-medium text-gray-900 dark:text-white block truncate">
                        {doc.fileName}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Click to view
                      </span>
                    </div>
                  </div>
                  <Download className="h-5 w-5 text-gray-400 dark:text-gray-300 ml-2" />
                </div>
              ))}
            </div>
          </div>
        )}
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
        {user && customerOrders.length > 1 && (
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
            <label htmlFor="orderSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Order
            </label>
            <select
              id="orderSelect"
              value={selectedOrderId || ''}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              className="block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-white"
            >
              {customerOrders.map((order) => (
                <option key={order.id} value={order.id}>
                  #{order.orderNumber} - {order.companyName} - {order.serviceType} (${order.totalAmount.toLocaleString()}) - {new Date(order.createdAt).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
        )}
        <ServiceStages order={selectedOrder} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <OrderTimeline order={selectedOrder} />
          <CommunicationLog />
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (!user) {
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
                onClick={() => setActiveTab('payments')}
                className={`py-4 px-1 inline-flex items-center border-b-2 ${
                  activeTab === 'payments'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Payment History
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
        {activeTab === 'payments' && selectedOrder && (
          <PaymentHistory orderId={selectedOrder.id} />
        )}
        {activeTab === 'account' && renderAccountInfo()}
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {user ? (
          <>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Welcome, {user.name}
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Track your order status and manage your account
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200"
                  aria-label="Toggle theme"
                >
                  {isDarkMode ? (
                    <Sun className="h-5 w-5 text-white" />
                  ) : (
                    <Moon className="h-5 w-5 text-gray-600" />
                  )}
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200 text-red-500"
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8">
              {renderContent()}
            </div>

            {/* Sticky WhatsApp Button */}
            <div className="fixed bottom-6 right-6">
              <a
                href="https://wa.me/447462252406"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-12 h-12 bg-green-500 hover:bg-green-600 rounded-full shadow-lg transition-colors duration-200"
              >
                <MessageCircle className="h-6 w-6 text-white" />
              </a>
            </div>
          </>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <img
                src="https://res.cloudinary.com/fresh-ideas/image/upload/v1732284592/rqo2kuav7gd3ntuciejw.png"
                alt="MG Accountants"
                className="h-12"
              />
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200"
                aria-label="Toggle theme"
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5 text-white" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-600" />
                )}
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <div className="mt-1 relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="modern-input pl-10"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="passport" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Passport Number
                </label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    id="passport"
                    type="text"
                    required
                    value={passportNumber}
                    onChange={(e) => setPassportNumber(e.target.value.toUpperCase())}
                    className="modern-input pl-10"
                    placeholder="Enter your passport number"
                    pattern="[A-Z0-9]+"
                  />
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/50 rounded-md p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-yellow-400 dark:text-yellow-300 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Important Note
                    </h3>
                    <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                      Please use your registered email address and passport number to access your account.
                      Contact support if you need assistance.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Authenticating...' : 'Login'}
              </button>
            </form>
          </div>
        )}
      </div>

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