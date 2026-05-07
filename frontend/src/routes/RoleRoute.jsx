import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function RoleRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loader"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/signin" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
