"use client";

import { useState, useEffect, useCallback, useContext } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/utils/axios';
import { User } from '@/types/UserInterface';
import { AuthContext, AuthContextType } from '@/context/AuthContext';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const parseJwt = useCallback((token: string): any | null => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Token parse edilirken hata:", e);
      return null;
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = parseJwt(token);
      if (decoded && typeof decoded.user === 'object' && decoded.user !== null) {
        setUser(decoded.user as User);
      } else {
        console.error("Token'dan kullanıcı bilgisi okunamadı veya format hatalı.");
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, [parseJwt]);

  const login = useCallback(async (usernameOrEmail: string, password_hash: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/login', { username: usernameOrEmail, password: password_hash });
      if (response.data && response.data.accessToken) {
        const token = response.data.accessToken;
        localStorage.setItem('token', token);
        const decoded = parseJwt(token);
        if (decoded && typeof decoded.user === 'object' && decoded.user !== null) {
          setUser(decoded.user as User);
          setLoading(false);
          return true;
        } else {
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
      return false;
    } catch (error) {
      console.error('Giriş hatası AuthProvider içinde:', error);
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
      return false;
    }
  }, [parseJwt, router]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/auth/login');
  }, [router]);

  const hasPermission = useCallback((permissionId: string): boolean => {
    if (!user) return false;
    const userPermissions = user.permissions || (user as any).authorization_ids || [];
    return userPermissions.includes(permissionId);
  }, [user]);

  const contextValue: AuthContextType = {
    user,
    loading,
    login,
    logout,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function getToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

export function useAuth(adminRequired = false) {
  const context = useContext(AuthContext);
  const router = useRouter();

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}