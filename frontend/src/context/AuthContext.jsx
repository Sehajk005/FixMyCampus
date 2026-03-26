import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

const SESSION_KEY = 'fmc_session';

export function AuthProvider({ children }) {
  // Initialise from sessionStorage so refresh doesn't log the user out
  const [user,  setUser]  = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY))?.user || null; } catch { return null; }
  });
  const [token, setToken] = useState(() => {
    try { return sessionStorage.getItem('fmc_token') || null; } catch { return null; }
  });

  // Re-attach axios header on mount if token already exists
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);

  const login = useCallback((userData, accessToken, refreshToken) => {
    setUser(userData);
    setToken(accessToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    // Persist to sessionStorage (cleared when browser tab closes — safer than localStorage)
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ user: userData }));
    sessionStorage.setItem('fmc_token', accessToken);
    sessionStorage.setItem('fmc_refresh', refreshToken);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    delete api.defaults.headers.common['Authorization'];
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem('fmc_token');
    sessionStorage.removeItem('fmc_refresh');
  }, []);

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