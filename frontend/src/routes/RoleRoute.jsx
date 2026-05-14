import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function RoleRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="loader"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/signin" state={{ from: location.pathname + location.search }} replace />;
  if (!roles.includes(user.role)) return <Navigate to="/" replace />;
  
  return children;
}
