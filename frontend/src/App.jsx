import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import TechStackFooter from './components/TechStackFooter';
import PageLoading from './components/PageLoading';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TicketsPage from './pages/TicketsPage';
import NewTicketPage from './pages/NewTicketPage';
import ProfilePage from './pages/ProfilePage';

// Lazy-loaded pages
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const TicketDetailPage = React.lazy(() => import('./pages/TicketDetailPage'));
const PublicFeed = React.lazy(() => import('./pages/PublicFeed'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const AdminTickets = React.lazy(() => import('./pages/AdminTickets'));
const AdminUsers = React.lazy(() => import('./pages/AdminUsers'));
const StaffDashboard = React.lazy(() => import('./pages/StaffDashboard'));
const StaffHistory = React.lazy(() => import('./pages/StaffHistory'));

function RootRedirect() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  if (user?.role === 'technician') return <Navigate to="/staff" replace />;
  return <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  const location = useLocation();
  return (
    <div key={location.pathname} className="page-route-enter">
      <Routes location={location}>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/feed" element={<PublicFeed />} />

        {/* Student */}
        <Route path="/dashboard" element={<ProtectedRoute roles={['student']}><DashboardPage /></ProtectedRoute>} />
        <Route path="/tickets" element={<ProtectedRoute roles={['student']}><TicketsPage /></ProtectedRoute>} />
        <Route path="/tickets/new" element={<ProtectedRoute roles={['student']}><NewTicketPage /></ProtectedRoute>} />
        <Route path="/tickets/:id" element={<ProtectedRoute><TicketDetailPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/tickets" element={<ProtectedRoute roles={['admin']}><AdminTickets /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />

        {/* Staff */}
        <Route path="/staff" element={<ProtectedRoute roles={['technician']}><StaffDashboard /></ProtectedRoute>} />
        <Route path="/staff/history" element={<ProtectedRoute roles={['technician']}><StaffHistory /></ProtectedRoute>} />

        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main className="main-content-shell">
          <Suspense fallback={<PageLoading />}>
            <AppRoutes />
          </Suspense>
        </main>
        <TechStackFooter />
      </BrowserRouter>
    </AuthProvider>
  );
}
