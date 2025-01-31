import { useState, useEffect } from 'react';
import { customerAuthService } from '../services/authService';
import { useNavigate } from 'react-router-dom';

export const useCustomerAuth = () => {
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if customer is already logged in from local storage
    const storedSession = localStorage.getItem('customerSession');
    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession);
        setCustomer(parsedSession);
      } catch (error) {
        console.error('Error parsing stored session:', error);
      }
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, passportNumber: string) => {
    try {
      setLoading(true);
      const customerData = await customerAuthService.loginWithEmailAndPassport(email, passportNumber);
      
      // Store session in local storage
      localStorage.setItem('customerSession', JSON.stringify(customerData));
      
      setCustomer(customerData);
      navigate('/customer/dashboard');
      return customerData;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await customerAuthService.logout();
      setCustomer(null);
      localStorage.removeItem('customerSession');
      navigate('/customer/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return {
    customer,
    loading,
    login,
    logout,
    isAuthenticated: !!customer
  };
};
