import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loader"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/signin" replace />;
  return children;
}
