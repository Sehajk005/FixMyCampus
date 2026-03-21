import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import StaffRoute from './components/StaffRoute';
import Navbar from './components/Navbar';
import TechStackFooter from './components/TechStackFooter';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Student
import DashboardPage from './pages/DashboardPage';
import TicketsPage from './pages/TicketsPage';
import NewTicketPage from './pages/NewTicketPage';
import TicketDetailPage from './pages/TicketDetailPage';
import ProfilePage from './pages/ProfilePage';

// Admin
import AdminDashboard from './pages/AdminDashboard';
import AdminTickets from './pages/AdminTickets';

// Staff
import StaffDashboard from './pages/StaffDashboard';
import StaffHistory from './pages/StaffHistory';

function RootRedirect() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  if (user?.role === 'technician') return <Navigate to="/staff" replace />;
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Student */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/tickets" element={<ProtectedRoute><TicketsPage /></ProtectedRoute>} />
          <Route path="/tickets/new" element={<ProtectedRoute><NewTicketPage /></ProtectedRoute>} />
          <Route path="/tickets/:id" element={<ProtectedRoute><TicketDetailPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/tickets" element={<AdminRoute><AdminTickets /></AdminRoute>} />

          {/* Staff */}
          <Route path="/staff" element={<StaffRoute><StaffDashboard /></StaffRoute>} />
          <Route path="/staff/history" element={<StaffRoute><StaffHistory /></StaffRoute>} />

          <Route path="*" element={<RootRedirect />} />
        </Routes>
        <TechStackFooter />
      </BrowserRouter>
    </AuthProvider>
  );
}
