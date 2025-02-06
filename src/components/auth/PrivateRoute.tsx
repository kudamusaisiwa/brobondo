import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  console.log('PrivateRoute check:', {
    isAuthenticated,
    user: user?.email,
    currentPath: location.pathname
  });

  // If not authenticated, redirect to appropriate login page
  if (!isAuthenticated || !user) {
    // Always redirect to the main login page
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}