'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { UserDoc, CustomerDoc } from '@/src/hooks/api/auth/auth.api-types';

interface UserContextType {
  user: UserDoc | null;
  customerData: CustomerDoc | null;
  token: string | null;
  setUserData: (user: UserDoc, customerData: CustomerDoc, token: string) => void;
  clearUserData: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDoc | null>(null);
  const [customerData, setCustomerData] = useState<CustomerDoc | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load user data from localStorage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedCustomerData = localStorage.getItem('customerData');
      const storedToken = localStorage.getItem('token');

      if (storedUser && storedCustomerData && storedToken) {
        setUser(JSON.parse(storedUser));
        setCustomerData(JSON.parse(storedCustomerData));
        setToken(storedToken);
      }
    } catch (error) {
      console.error('Error loading user data from localStorage:', error);
      // Clear corrupted data
      localStorage.removeItem('user');
      localStorage.removeItem('customerData');
      localStorage.removeItem('token');
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const setUserData = (userData: UserDoc, customerData: CustomerDoc, token: string) => {
    setUser(userData);
    setCustomerData(customerData);
    setToken(token);
    // Store in localStorage for persistence
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('customerData', JSON.stringify(customerData));
    localStorage.setItem('token', token);
  };

  const clearUserData = () => {
    setUser(null);
    setCustomerData(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('customerData');
    localStorage.removeItem('token');
  };

  if (!isLoaded) {
    // Optionally, you can return a loading indicator here
    return null;
  }

  return (
    <UserContext.Provider
      value={{
        user,
        customerData,
        token,
        setUserData,
        clearUserData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
