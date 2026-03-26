import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function StaffRoute({ children }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'technician') return <Navigate to="/dashboard" replace />;
  return children;
}
