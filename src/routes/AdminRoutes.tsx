import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';
import Layout from '../components/Layout';
import Dashboard from '../pages/Dashboard';
import Customers from '../pages/Customers';
import CustomerDetails from '../pages/CustomerDetails';
import Orders from '../pages/Orders';
import AllOrders from '../pages/AllOrders';
import OrderDetails from '../pages/OrderDetails';
import EditOrder from '../pages/EditOrder';
import Products from '../pages/Products';
import AddProduct from '../pages/AddProduct';
import Activities from '../pages/Activities';
import Users from '../pages/Users';
import AddUser from '../pages/AddUser';
import Reports from '../pages/Reports';
import DeliveryCalendar from '../pages/DeliveryCalendar';
import DeliveryDayView from '../pages/DeliveryDayView';
import PaymentManagement from '../pages/PaymentManagement';
import Tasks from '../pages/Tasks';
import Expenses from '../pages/Expenses';
import Help from '../pages/Help';
import Chat from '../pages/Chat';
import PrivateRoute from '../components/auth/PrivateRoute';
import Tenants from '../pages/Tenants';
import TenantDetails from '../pages/TenantDetails';
import Owners from '../pages/Owners';
import OwnerDetails from '../pages/OwnerDetails';
import Properties from '../pages/Properties';
import Leads from '../pages/Leads';
import PropertyDetails from '../pages/PropertyDetails';
import PropertyEdit from '../pages/PropertyEdit';
import Buyers from '../pages/Buyers';
import BuyerDetails from '../pages/BuyerDetails';
import BuyerEdit from '../pages/BuyerEdit';
import Rentals from '../pages/Rentals';
import BlogManager from '../pages/BlogManager';
import BlogEditor from '../pages/BlogEditor';

export const adminRoutes = {
  element: <PrivateRoute><Layout /></PrivateRoute>,
  children: [
    { index: true, element: <Navigate to="/admin/dashboard" replace /> },
    { path: "dashboard", element: <Dashboard /> },
    { path: "customers", element: <Customers /> },
    { path: "customers/:id", element: <CustomerDetails /> },
    { path: "orders", element: <Orders /> },
    { path: "orders/all", element: <AllOrders /> },
    { path: "orders/:id", element: <OrderDetails /> },
    { path: "orders/:id/edit", element: <EditOrder /> },
    { path: "products", element: <Products /> },
    { path: "products/add", element: <AddProduct /> },
    { path: "leads", element: <Leads /> },
    {
      path: "properties",
      children: [
        { index: true, element: <Properties /> },
        { path: "add", element: <PropertyEdit /> },
        { path: ":id/edit", element: <PropertyEdit /> },
        { path: ":id", element: <PropertyDetails /> }
      ]
    },
    { path: "activities", element: <Activities /> },
    { path: "deliveries", element: <DeliveryCalendar /> },
    { path: "deliveries/:date", element: <DeliveryDayView /> },
    { path: "payments", element: <PaymentManagement /> },
    { path: "tasks", element: <Tasks /> },
    { path: "expenses", element: <Expenses /> },
    { path: "chat", element: <Chat /> },
    { path: "help", element: <Help /> },
    {
      path: "users",
      children: [
        { index: true, element: <Users /> },
        { path: "add", element: <AddUser /> }
      ]
    },
    {
      path: "tenants",
      children: [
        { index: true, element: <Tenants /> },
        { path: ":id", element: <TenantDetails /> }
      ]
    },
    {
      path: "owners",
      children: [
        { index: true, element: <Owners /> },
        { path: ":id", element: <OwnerDetails /> }
      ]
    },
    {
      path: "buyers",
      children: [
        { index: true, element: <Buyers /> },
        { path: ":id", element: <BuyerDetails /> },
        { path: ":id/edit", element: <BuyerEdit /> }
      ]
    },
    { path: "reports", element: <Reports /> },
    { path: "rentals", element: <Rentals /> },
    {
      path: "blog",
      children: [
        { index: true, element: <BlogManager /> },
        { path: "new", element: <BlogEditor /> },
        { path: ":id/edit", element: <BlogEditor /> }
      ]
    }
  ]
};

export function AdminRoutes() {
  const { canViewUsers } = usePermissions();

  const routes = {
    ...adminRoutes,
    children: [
      ...adminRoutes.children,
      ...(canViewUsers ? [
        { path: "users", element: <Users /> },
        { path: "users/add", element: <AddUser /> }
      ] : [
        { path: "users/*", element: <Navigate to="/admin" replace /> }
      ])
    ]
  };

  return routes;
}
