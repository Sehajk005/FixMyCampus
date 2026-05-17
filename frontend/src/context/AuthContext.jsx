import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const setTokenAndHeaders = useCallback((newToken) => {
    setToken(newToken);
    if (newToken) {
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, []);

  const login = useCallback((userData, accessToken) => {
    setUser(userData);
    setTokenAndHeaders(accessToken);
  }, [setTokenAndHeaders]);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Ignore if logout request fails locally
    }
    setUser(null);
    setTokenAndHeaders(null);
  }, [setTokenAndHeaders]);

  // Attempt silent refresh on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data } = await api.post('/auth/refresh-token');
        setTokenAndHeaders(data.accessToken);
        const userRes = await api.get('/auth/me'); // Fetch current user details with new token
        setUser(userRes.data);
      } catch (err) {
        console.log('No valid session found during initialization');
      } finally {
        setIsInitializing(false);
      }
    };
    initAuth();
  }, [setTokenAndHeaders]);

  // Handle token refreshes from the API interceptor
  useEffect(() => {
    const handleTokenRefreshed = (e) => setTokenAndHeaders(e.detail);
    const handleTokenFailed = () => {
      setUser(null);
      setTokenAndHeaders(null);
    };

    window.addEventListener('tokenRefreshed', handleTokenRefreshed);
    window.addEventListener('refreshTokenFailed', handleTokenFailed);

    return () => {
      window.removeEventListener('tokenRefreshed', handleTokenRefreshed);
      window.removeEventListener('refreshTokenFailed', handleTokenFailed);
    };
  }, [setTokenAndHeaders]);

  if (isInitializing) {
    return <div className="flex h-screen items-center justify-center">Loading session...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}