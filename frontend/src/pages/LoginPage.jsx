import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { connectSocket } from '../services/socket';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || null;
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); }

  async function handleLogin() {
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/login', form);
      const { user, accessToken, refreshToken } = res.data;
      login(user, accessToken, refreshToken);
      connectSocket(accessToken);
      const dest = from || (user.role === 'admin' ? '/admin' : user.role === 'technician' ? '/staff' : '/dashboard');
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
      {/* Animated background orbs */}
      <div style={{ position: 'fixed', top: '-20%', left: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', animation: 'float 8s ease-in-out infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-20%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', animation: 'float 10s ease-in-out infinite reverse', pointerEvents: 'none' }} />

      <div className="animate-fade-up" style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div className="animate-float" style={{ width: 72, height: 72, borderRadius: 20, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 1.25rem', boxShadow: '0 0 40px rgba(99,102,241,0.5)' }}>🏫</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>Fix My Campus</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Chitkara University · Campus Issue Tracker</p>
        </div>

        <div style={{ background: 'rgba(15,22,41,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1.25rem', padding: '2rem', boxShadow: '0 25px 60px rgba(0,0,0,0.4)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '1.5rem' }}>Sign in to continue</h2>

          {error && <div className="alert-error animate-fade-in" style={{ marginBottom: '1rem' }}>⚠ {error}</div>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="label">Email address</label>
              <input name="email" type="email" className="input-field" placeholder="yourname@chitkara.edu" value={form.email} onChange={handleChange} onKeyDown={e => e.key === 'Enter' && handleLogin()} autoFocus />
            </div>
            <div>
              <label className="label">Password</label>
              <input name="password" type="password" className="input-field" placeholder="Enter your password" value={form.password} onChange={handleChange} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            </div>
            <button onClick={handleLogin} disabled={!form.email || !form.password || loading} className="btn-primary" style={{ marginTop: '0.5rem', padding: '0.75rem', fontSize: '0.9rem', width: '100%' }}>
              {loading ? <span className="dot-loader"><span/><span/><span/></span> : 'Sign In →'}
            </button>
          </div>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#64748b' }}>
            No account?{' '}
            <Link to="/register" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
