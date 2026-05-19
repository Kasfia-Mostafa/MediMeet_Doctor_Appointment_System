/**
 * ============================================================
 * RoleRoute — Role-Based Authorization Guard
 * ============================================================
 * Route wrapper that restricts access based on the user's role.
 * Checks authentication first, then verifies the user's role
 * is included in the allowed roles array.
 * 
 * Behavior:
 *  - Not authenticated → Redirect to /signin
 *  - Authenticated but wrong role → Redirect to home (/)
 *  - Authenticated with correct role → Render children
 * 
 * Usage: <RoleRoute roles={['admin', 'doctor']}><Component /></RoleRoute>
 * ============================================================
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function RoleRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show spinner while checking authentication status
  if (loading) return <div className="loader"><div className="spinner"></div></div>;

  // Redirect to sign-in if not authenticated
  if (!user) return <Navigate to="/signin" state={{ from: location.pathname + location.search }} replace />;

  // Redirect to home if user's role is not authorized
  if (!roles.includes(user.role)) return <Navigate to="/" replace />;
  
  return children;
}
