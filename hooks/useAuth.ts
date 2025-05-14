import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext'; // Adjusted path
import { AuthContextType } from '@/types/auth';

/**
 * Custom hook to access the authentication context.
 * Throws an error if used outside of an AuthProvider.
 * @returns The authentication context.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 