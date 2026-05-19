/**
 * ============================================================
 * Axios API Client — Configured HTTP Client
 * ============================================================
 * Creates a pre-configured Axios instance for all API requests.
 * 
 * Features:
 *  - Base URL from environment variable (VITE_API_URL)
 *  - Automatic Bearer token injection from localStorage
 *  - Automatic token refresh on 401 (expired) responses
 *  - Redirect to /signin on refresh failure
 *  - Credentials (cookies) sent with every request
 * ============================================================
 */

import axios from 'axios';

// Create an Axios instance with base configuration
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // Send cookies with cross-origin requests
});

/**
 * Request Interceptor:
 * Attaches the JWT access token from localStorage to every
 * outgoing request's Authorization header.
 */
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * Response Interceptor:
 * Handles 401 (Unauthorized) responses with expired tokens.
 * Automatically attempts to refresh the access token using
 * the refresh token cookie. If refresh fails, clears auth
 * state and redirects to the sign-in page.
 */
API.interceptors.response.use(
  (response) => response, // Pass through successful responses
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh if the token is expired (not other 401 reasons)
    if (error.response?.status === 401 && error.response?.data?.expired && !originalRequest._retry) {
      originalRequest._retry = true; // Prevent infinite retry loops

      try {
        // Request a new access token using the refresh token cookie
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || '/api'}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // Store the new access token and retry the original request
        localStorage.setItem('accessToken', data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return API(originalRequest);
      } catch {
        // Refresh failed — clear auth and redirect to sign-in
        localStorage.removeItem('accessToken');
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
