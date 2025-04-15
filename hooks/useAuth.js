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

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      if (token) {
        try {
          const parsedToken = parseJwt(token);
          setUser(parsedToken.user);
        } catch (error) {
          console.error('Error parsing user info:', error);
          localStorage.removeItem('token');
        }
      }
      
      setLoading(false);
    };

    loadUser();
  }, []);

  function parseJwt(token) {
    try {
      // JWT'nin payload kısmını al
      const base64Url = token.split('.')[1];
      
      // Base64 URL karakter düzeltmeleri
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      
      // Base64'ü çözümle (UTF-8 desteği ile)
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('JWT parsing error:', error);
      return null;
    }
  }
  
  // Login function
  const login = async (username, password) => {
    try {
      
      const response = await axiosInstance.post('/auth/login', { username, password });

      console.log('status:', response.status);
      console.log('Login response:', response);

      
      if (response.data && response.data.accessToken) {
        const token = response.data.accessToken;
        localStorage.setItem('token', token);

        const parsedToken =  parseJwt(token);
        setUser(parsedToken.user);
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
    return hasPermission(4);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      hasPermission, 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function getToken(){
  const token = localStorage.getItem('token');
  return token ? token : null;
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