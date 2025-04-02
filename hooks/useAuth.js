"use client";

import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/utils/axios';

// Create auth context
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user from localStorage on initial mount
  useEffect(() => {
    const loadUser = () => {
      const token = localStorage.getItem('token');
      const userInfo = localStorage.getItem('user');

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      if (userInfo) {
        try {
          const userData = JSON.parse(userInfo);
          setUser(userData);
        } catch (error) {
          console.error('Error parsing user info:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      
      setLoading(false);
    };

    loadUser();
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      const response = await axiosInstance.post('/auth/login', { username, password });
      
      if (response.data && response.data.accessToken) {
        localStorage.setItem('token', response.data.accessToken);
        localStorage.setItem('user', JSON.stringify(response.data.userInfo));
        setUser(response.data.userInfo);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/auth/login');
  };

  // Check if user has a specific permission
  const hasPermission = (permissionId) => {
    if (!user) return false;
    // Check both permissions and authorization_ids for backward compatibility
    const userPermissions = user.permissions || user.authorization_ids || [];
    return userPermissions.includes(permissionId);
  };

  // Check if user is admin
  const isAdmin = () => {
    return hasPermission(0) || (user && user.authorization_rank >= 10);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      hasPermission, 
      isAdmin 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth(adminRequired = false) {
  const context = useContext(AuthContext);
  const router = useRouter();
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  const { user, loading, isAdmin } = context;

  // Redirect if admin access required but user is not admin
  useEffect(() => {
    if (!loading && adminRequired && !isAdmin()) {
      router.push('/dashboard');
    }
  }, [loading, adminRequired, isAdmin, router]);

  return context;
}