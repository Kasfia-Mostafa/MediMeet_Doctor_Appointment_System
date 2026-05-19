/**
 * ============================================================
 * useAuth Hook — Access Authentication Context
 * ============================================================
 * Custom hook that provides a convenient way to access the
 * AuthContext. Throws an error if used outside of AuthProvider.
 * 
 * Usage: const { user, login, logout } = useAuth();
 * ============================================================
 */

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
