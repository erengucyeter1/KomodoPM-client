import axiosInstance from '@/utils/axios';
import { User } from '@/types/UserInfoInterfaces';
import { JwtPayload } from '@/types/auth';

const TOKEN_KEY = 'token';

/**
 * Parses a JWT string to extract its payload.
 * @param token The JWT string.
 * @returns The decoded payload as JwtPayload, or null if parsing fails.
 */
const parseJwt = (token: string): JwtPayload | null => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) {
      console.error('Invalid JWT: No payload section.');
      return null;
    }
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload) as JwtPayload;
    // Basic validation: check if user exists and has an id
    if (parsed && parsed.user && typeof parsed.user.id !== 'undefined') {
      return parsed;
    }
    console.error('Invalid JWT payload structure:', parsed);
    return null;
  } catch (error) {
    console.error('Error parsing JWT:', error);
    return null;
  }
};

/**
 * Stores the authentication token in localStorage.
 * @param token The token string.
 */
const storeToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Retrieves the authentication token from localStorage.
 * @returns The token string, or null if not found.
 */
const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Removes the authentication token from localStorage.
 */
const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Attempts to log in a user with the provided credentials.
 * @param username The user's username.
 * @param password The user's password.
 * @returns A Promise resolving to the User object if login is successful, otherwise null.
 */
const login = async (username: string, password: string): Promise<User | null> => {
  try {
    const response = await axiosInstance.post<{ accessToken: string }>('/auth/login', {
      username,
      password,
    });

    if (response.data && response.data.accessToken) {
      const { accessToken } = response.data;
      storeToken(accessToken);
      const decodedPayload = parseJwt(accessToken);
      return decodedPayload?.user || null;
    }
    return null;
  } catch (error) {
    console.error('Login API error:', error);
    return null;
  }
};

/**
 * Logs out the current user by removing their token.
 */
const logout = async (): Promise<void> => {
  removeToken();
  // Potentially notify the backend about logout if needed
  // await axiosInstance.post('/auth/logout');
  return Promise.resolve();
};

/**
 * Retrieves the current user from the stored token.
 * Useful for initial app load.
 * @returns The User object if a valid token exists, otherwise null.
 */
const getCurrentUser = (): User | null => {
  const token = getToken();
  if (token) {
    const decodedPayload = parseJwt(token);
    if (decodedPayload && decodedPayload.exp && decodedPayload.exp * 1000 > Date.now()) {
      return decodedPayload.user;
    }
    // Token expired or invalid
    removeToken();
  }
  return null;
};

const isTokenExpired = (): boolean => {
  const token = getToken();
  if (!token) return true;
  const decodedPayload = parseJwt(token);
  if (decodedPayload && decodedPayload.exp && decodedPayload.exp * 1000 > Date.now()) {
    return false;
  }
  return true;
};


export const authService = {
  login,
  logout,
  getToken,
  getCurrentUser,
  isTokenExpired,

}; 