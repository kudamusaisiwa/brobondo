import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useThemeStore } from './store/themeStore';
import { usePermissions } from './hooks/usePermissions';
import { useAuthStore } from './store/authStore';
import { useCustomerStore } from './store/customerStore';
import { useOrderStore } from './store/orderStore';
import { useProductStore } from './store/productStore';
import { useActivityStore } from './store/activityStore';
import { useUserStore } from './store/userStore';
import { usePaymentStore } from './store/paymentStore';
import { useNotificationStore } from './store/notificationStore';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerDetails from './pages/CustomerDetails';
import Orders from './pages/Orders';
import AllOrders from './pages/AllOrders';
import OrderDetails from './pages/OrderDetails';
import EditOrder from './pages/EditOrder';
import Products from './pages/Products';
import AddProduct from './pages/AddProduct';
import Activities from './pages/Activities';
import Users from './pages/Users';
import AddUser from './pages/AddUser';
import Reports from './pages/Reports';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import DeliveryCalendar from './pages/DeliveryCalendar';
import DeliveryDayView from './pages/DeliveryDayView';
import PaymentManagement from './pages/PaymentManagement';
import Tasks from './pages/Tasks';
import Expenses from './pages/Expenses';
import Help from './pages/Help';
import Chat from './pages/Chat';
import Leads from './pages/Leads';
import CustomerPortal from './pages/CustomerPortal';
import PrivateRoute from './components/auth/PrivateRoute';
import Toast from './components/ui/Toast';

export default function App() {
  const { isDarkMode } = useThemeStore();
  const { canViewUsers } = usePermissions();
  const { isAuthenticated } = useAuthStore();
  const { error: authError, clearError: clearAuthError } = useAuthStore();
  const { initialize: initCustomers } = useCustomerStore();
  const { initialize: initOrders } = useOrderStore();
  const { initialize: initProducts } = useProductStore();
  const { initialize: initActivities } = useActivityStore();
  const { initialize: initUsers } = useUserStore();
  const { initialize: initPayments } = usePaymentStore();
  const { initialize: initializeNotifications, requestPermission } = useNotificationStore();

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
            initPayments()
          ]);
        } catch (error) {
          console.error('Error initializing stores:', error);
        }
      };

      initializeStores();
    }
  }, [isAuthenticated, initCustomers, initOrders, initProducts, initActivities, initUsers, initPayments]);

  useEffect(() => {
    // Initialize notifications
    initializeNotifications().then(() => {
      // Request permission when the app starts
      requestPermission();
    });
  }, [initializeNotifications, requestPermission]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/portal" element={<CustomerPortal />} />
        
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="leads" element={<Leads />} />
          <Route path="customers/:id" element={<CustomerDetails />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/all" element={<AllOrders />} />
          <Route path="orders/:id" element={<OrderDetails />} />
          <Route path="orders/:id/edit" element={<EditOrder />} />
          <Route path="products" element={<Products />} />
          <Route path="products/add" element={<AddProduct />} />
          <Route path="activities" element={<Activities />} />
          <Route path="deliveries" element={<DeliveryCalendar />} />
          <Route path="deliveries/:date" element={<DeliveryDayView />} />
          <Route path="payments" element={<PaymentManagement />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="chat" element={<Chat />} />
          <Route path="help" element={<Help />} />
          {canViewUsers ? (
            <>
              <Route path="users" element={<Users />} />
              <Route path="users/add" element={<AddUser />} />
            </>
          ) : (
            <Route path="users/*" element={<Navigate to="/" replace />} />
          )}
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>

      {authError && (
        <Toast
          message={authError}
          type="error"
          onClose={clearAuthError}
        />
      )}
    </BrowserRouter>
  );
}