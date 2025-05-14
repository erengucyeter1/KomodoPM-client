import { User } from './UserInterface';

/**
 * Describes the expected payload structure of the JWT.
 * Adjust fields according to your actual JWT content.
 */
export interface JwtPayload {
  user: User; // Assumes the JWT directly contains a 'user' object
  exp?: number; // Standard expiration time claim
  iat?: number; // Standard issued at time claim
  // Add other relevant JWT claims if any (e.g., sub, iss)
}

/**
 * Defines the shape of the authentication context provided to components.
 */
export interface AuthContextType {
  user: User | null;
  isLoading: boolean; // Renamed from 'loading' for clarity
  isAuthenticated: boolean; // Derived from user presence
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>; // Making logout async in case of async operations
  hasPermission: (permissionId: string | number) => boolean;
  isAdmin: () => boolean; // Assuming admin check is based on permissions
  getToken: () => string | null; // Expose getToken if needed elsewhere, though usually managed internally
} 