/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */
/**
 * ============================================================
 * Auth Context — Global Authentication State Management
 * ============================================================
 * Provides authentication state and methods to the entire
 * application via React Context. Manages:
 *  - Current user object and doctor profile
 *  - Loading state during initial auth check
 *  - Login, register, logout, and user update functions
 *
 * On mount, checks for an existing access token in localStorage
 * and fetches the user profile from /api/auth/me.
 * ============================================================
 */

import { createContext, useState, useEffect, useCallback } from 'react';
import API from '../api/axios';

// Create the authentication context (consumed via useAuth hook)
export const AuthContext = createContext(null);

/**
 * AuthProvider — Wraps the app and provides auth state + methods.
 *
 * Exposed context values:
 *  - user:          Current authenticated user object (or null)
 *  - doctorProfile: Doctor profile data (if user is a doctor)
 *  - loading:       True while the initial auth check is in progress
 *  - login:         Function to authenticate with email/password
 *  - register:      Function to create a new account
 *  - logout:        Function to sign out and clear tokens
 *  - updateUser:    Function to update the local user state
 *  - fetchUser:     Function to re-fetch the current user from the API
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);              // Current authenticated user
  const [doctorProfile, setDoctorProfile] = useState(null); // Doctor profile (if applicable)
  const [loading, setLoading] = useState(true);        // Initial auth check loading state

  /**
   * Fetches the current user's profile from the API.
   * Called on mount and after login/register to sync state.
   */
  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await API.get('/auth/me');
      setUser(data.user);
      setDoctorProfile(data.doctorProfile);
    } catch {
      localStorage.removeItem('accessToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user on initial mount
  useEffect(() => { fetchUser(); }, [fetchUser]);

  /**
   * Logs in a user with email and password.
   * Stores the access token and fetches the user profile.
   * @returns {Object} The authenticated user object
   */
  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', data.accessToken);
    await fetchUser();
    return data.user;
  };

  /**
   * Registers a new user account.
   * Stores the access token and fetches the user profile.
   * @returns {Object} The newly created user object
   */
  const register = async (formData) => {
    const { data } = await API.post('/auth/register', formData);
    localStorage.setItem('accessToken', data.accessToken);
    await fetchUser();
    return data.user;
  };

  /**
   * Logs out the current user.
   * Clears the access token from localStorage and resets state.
   */
  const logout = async () => {
    try { await API.post('/auth/logout'); } catch { /* empty */ }
    localStorage.removeItem('accessToken');
    setUser(null);
    setDoctorProfile(null);
  };

  /** Updates the local user state (e.g., after profile edit) */
  const updateUser = (updated) => setUser(updated);

  return (
    <AuthContext.Provider value={{ user, doctorProfile, loading, login, register, logout, updateUser, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}
