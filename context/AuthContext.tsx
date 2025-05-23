"use client";

import React, { createContext, useState, useEffect, ReactNode, useCallback, useContext, useMemo } from 'react';
import { useRouter } from 'next/navigation'; // Or 'next/router' for older Next.js versions
import { User } from '@/types/UserInfoInterfaces';
import { AuthContextType } from '@/types/auth';
import { authService } from '@/services/authService';

// Create the context with a default undefined value, consumers must be within a provider.
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Effect to load user on initial mount
  useEffect(() => {
    const attemptLoadUser = async () => {
      setIsLoading(true);
      try {
        const currentUser = authService.getCurrentUser();
        if (currentUser && !authService.isTokenExpired()) {
          setUser(currentUser);
          setToken(authService.getToken());
        } else {
          authService.logout();
          router.push('/auth/login');
        }
      } catch (error) {
        console.error("Error loading current user:", error);
        // Optionally clear token if user loading fails critically
        // authService.logout(); // This would also call removeToken()
      }
      setIsLoading(false);
    };
    attemptLoadUser();
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const loggedInUser = await authService.login(username, password);
      if (loggedInUser) {
        setUser(loggedInUser);
        setToken(authService.getToken());
        setIsLoading(false);
        return true;
      }
      setUser(null); // Ensure user is null on failed login
      setToken(null);
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login failed in AuthProvider:', error);
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return false;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setToken(null);
      // Redirect to login page after logout
      // Ensure router is available and correctly imported for your Next.js version
      router.push('/auth/login'); // Adjust path as needed
    } catch (error) {
      console.error('Logout failed in AuthProvider:', error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const hasPermission = useCallback((permissionId: string | number): boolean => {
    if (!user) return false;
    const userPermissions = user.permissions || user.authorization_ids || [];
    return userPermissions.includes(permissionId);
  }, [user]);

  const isAdmin = useCallback((): boolean => {
    // Example: Check for a specific admin role/permission
    // Adjust this logic based on how admin status is determined in your system
    return user ? hasPermission('admin') || hasPermission(1) : false; // Example: permission 'admin' or ID 1
  }, [user, hasPermission]);
  
  const getToken = useCallback((): string | null => {
    return token;
  }, [token]);

  const contextValue = useMemo(() => ({
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    hasPermission,
    isAdmin,
    getToken,
  }), [user, token, isLoading, login, logout, hasPermission, isAdmin, getToken]);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 