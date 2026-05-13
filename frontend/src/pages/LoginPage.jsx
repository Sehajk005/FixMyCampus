import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { signInWithGoogle } from '../services/googleAuth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data.user, data.accessToken);
      // Route based on role
      if (data.user.role === 'admin') navigate('/admin');
      else if (data.user.role === 'technician') navigate('/staff');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await signInWithGoogle();
      login(data.user, data.accessToken);
      if (data.user.role === 'admin') navigate('/admin');
      else if (data.user.role === 'technician') navigate('/staff');
      else navigate('/dashboard');
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        // User dismissed — show nothing
      } else if (err.code === 'auth/popup-blocked') {
        setError('Please allow popups for this site to use Google sign-in.');
      } else {
        setError(err.response?.data?.error || 'Google sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card motion-auth-panel motion-chart-panel">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold" style={{ color: 'var(--text-strong)' }}>FixMyCampus</h1>
          <p className="mt-3 font-medium" style={{ color: 'var(--text-muted)' }}>Welcome back.</p>
        </div>

        {error && (
          <div className="p-4 rounded-xl mb-6 text-sm flex items-center motion-error-banner" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.32)', color: '#fca5a5' }}>
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="label">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="you@campus.edu"
              required
            />
          </div>

          <div>
            <label className="label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="flex items-center gap-3 mt-8 mb-4">
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>or</span>
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: '#ffffff', color: '#1f1f1f', border: '1px solid var(--border)' }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>
          Continue with Google
        </button>

        <div className="mt-6 text-center">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" className="text-link">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
