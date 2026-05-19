/**
 * ============================================================
 * ProtectedRoute — Authentication Guard
 * ============================================================
 * Route wrapper that ensures the user is authenticated before
 * rendering children. If not authenticated, redirects to the
 * sign-in page with the current URL saved in state (for
 * post-login redirect back to the original page).
 * 
 * Shows a loading spinner while the auth check is in progress.
 * ============================================================
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show spinner while checking authentication status
  if (loading) return <div className="loader"><div className="spinner"></div></div>;

  // Redirect to sign-in if not authenticated (preserving the intended destination)
  if (!user) return <Navigate to="/signin" state={{ from: location.pathname + location.search }} replace />;
  
  return children;
}
