import './lib/leaflet-config';
import React, { useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import CustomerForm from './pages/CustomerForm';
import Home from './pages/Home';
import PublicPropertyView from './pages/PublicPropertyView';
import PublicProperties from './pages/PublicProperties';
import About from './pages/About';
import Contact from './pages/Contact';
import { useThemeStore } from './store/themeStore';
import { useAuthStore } from './store/authStore';
import { useCustomerStore } from './store/customerStore';
import { useOrderStore } from './store/orderStore';
import { useProductStore } from './store/productStore';
import { useActivityStore } from './store/activityStore';
import { useUserStore } from './store/userStore';
import { useLeadStore } from './store/leadStore';
import { usePaymentStore } from './store/paymentStore';
import { useTenantStore } from './store/tenantStore';
import { useNotificationStore } from './store/notificationStore';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CustomerPortal from './pages/CustomerPortal';
import Toast from './components/ui/Toast';
import CustomerLogin from './pages/CustomerLogin';
import { Toaster } from 'react-hot-toast';
import { AdminRoutes } from './routes/AdminRoutes';
import { usePermissions } from './hooks/usePermissions';

export default function App() {
  const helmetContext = {};

  const { isDarkMode } = useThemeStore();
  const { canViewUsers } = usePermissions();
  const { isAuthenticated, initialize: initAuth } = useAuthStore();
  const { error: authError, clearError: clearAuthError } = useAuthStore();
  const { initialize: initCustomers } = useCustomerStore();
  const { initialize: initOrders } = useOrderStore();
  const { initialize: initProducts } = useProductStore();
  const { initialize: initActivities } = useActivityStore();
  const { initialize: initUsers } = useUserStore();
  const { initialize: initPayments } = usePaymentStore();
  const { initialize: initLeads } = useLeadStore();
  const { initialize: initTenants } = useTenantStore();
  const { initialize: initializeNotifications, requestPermission } = useNotificationStore();

  // Initialize auth
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Handle dark mode
  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Initialize stores when authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      const initializeStores = async () => {
        try {
          await Promise.all([
            initCustomers(),
            initOrders(),
            initProducts(),
            initActivities(),
            initUsers(),
            initPayments(),
            initLeads(),
            initTenants()
          ]);
        } catch (error) {
          console.error('Error initializing stores:', error);
        }
      };

      initializeStores();
    }
  }, [isAuthenticated, initCustomers, initOrders, initProducts, initActivities, initUsers, initPayments, initLeads]);

  useEffect(() => {
    // Initialize notifications
    initializeNotifications().then(() => {
      // Request permission when the app starts
      requestPermission();
    });
  }, [initializeNotifications, requestPermission]);

  // Create router configuration
  console.log('Creating router configuration');
  const adminRoute = AdminRoutes();
  console.log('Admin routes:', adminRoute);
  
  const router = createBrowserRouter([
    // Public Routes
    { path: "/", element: <Home /> },
    { path: "/property/:slug", element: <PublicPropertyView /> },
    { path: "/browse-properties", element: <PublicProperties /> },
    { path: "/customerform", element: <CustomerForm /> },
    { path: "/about", element: <About /> },
    { path: "/contact", element: <Contact /> },
    
    // Auth Routes
    { path: "/login", element: <Login /> },
    { path: "/forgot-password", element: <ForgotPassword /> },
    { path: "/reset-password", element: <ResetPassword /> },
    { path: "/portal", element: <CustomerPortal /> },
    { path: "/customer/login", element: <CustomerLogin /> },
    
    // Admin Routes
    {
      path: "/admin",
      ...adminRoute
    },
    
    // Redirects
    { path: "/home", element: <Navigate to="/" replace /> },
    { path: "/admin", element: <Navigate to="/admin/dashboard" replace /> },
    { path: "/properties", element: <Navigate to="/admin/properties" replace /> },
    { path: "/properties/*", element: <Navigate to="/admin/properties" replace /> }
  ]);

  return (
    <HelmetProvider context={helmetContext}>
      <div className={isDarkMode ? 'dark' : ''}>
        <Toaster 
          position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            duration: 5000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <RouterProvider 
        router={router}
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      />

      {authError && (
        <Toast
          message={authError}
          type="error"
          onClose={clearAuthError}
        />
      )}
      </div>
    </HelmetProvider>
  );
}
