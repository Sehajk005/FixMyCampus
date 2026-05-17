import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageLoading from './PageLoading';

export default function ProtectedRoute({ children, roles = [] }) {
  const { isAuthenticated, user, isInitializing } = useAuth();

  if (isInitializing) {
    return <PageLoading label="Restoring session…" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(user?.role)) {
    // Redirect to root which will route them to their correct dashboard
    return <Navigate to="/" replace />;
  }

  return children;
}
