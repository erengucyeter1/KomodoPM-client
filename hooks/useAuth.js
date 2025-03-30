"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth(adminRequired = false) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kullanıcı giriş durumu kontrolü
    const token = localStorage.getItem('token');
    const userInfo = localStorage.getItem('user');

    if (!token) {
      router.push('/auth/login');
      return;
    }

    if (userInfo) {
      try {
        const userData = JSON.parse(userInfo);
        setUser(userData);

        // Admin yetkisi kontrolü
        if (adminRequired &&
          (!userData.authorization_ids ||
            !userData.authorization_ids.includes(0))) {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error parsing user info:', error);
        router.push('/auth/login');
      }
    }

    setLoading(false);
  }, [router, adminRequired]);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

  return { user, loading, logout };
}