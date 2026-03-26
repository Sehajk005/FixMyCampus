import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { connectSocket } from '../services/socket';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name:'', email:'', password:'', otp:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSendOtp() {
    setLoading(true); setError('');
    try { await api.post('/auth/send-otp', { email: form.email }); setSuccess(`OTP sent to ${form.email}`); setStep(2); }
    catch (err) { setError(err.response?.data?.error || 'Failed to send OTP'); }
    finally { setLoading(false); }
  }

  async function handleRegister() {
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/register', form);
      const { user, accessToken, refreshToken } = res.data;
      login(user, accessToken, refreshToken); connectSocket(accessToken); navigate('/dashboard');
    } catch (err) { setError(err.response?.data?.error || 'Registration failed'); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', position: 'relative' }}>
      <div style={{ position: 'fixed', top: '10%', right: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="animate-fade-up" style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 1rem', boxShadow: '0 0 30px rgba(99,102,241,0.4)' }}>🏫</div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>Create Account</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>Join Fix My Campus</p>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {['Verify Email', 'Set Password'].map((label, i) => (
            <div key={label} style={{ flex: 1, height: 4, borderRadius: 99, background: step > i ? 'linear-gradient(90deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.08)', transition: 'background 0.4s' }} />
          ))}
        </div>

        <div style={{ background: 'rgba(15,22,41,0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1.25rem', padding: '2rem' }}>
          {error && <div className="alert-error animate-fade-in" style={{ marginBottom: '1rem' }}>⚠ {error}</div>}
          {success && <div className="alert-success animate-fade-in" style={{ marginBottom: '1rem' }}>✓ {success}</div>}

          {step === 1 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div><label className="label">University Email</label>
                <input name="email" type="email" className="input-field" placeholder="yourname@chitkara.edu" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} autoFocus />
              </div>
              <button onClick={handleSendOtp} disabled={!form.email || loading} className="btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
                {loading ? <span className="dot-loader"><span/><span/><span/></span> : 'Send OTP →'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div><label className="label">Your Name</label>
                <input type="text" className="input-field" placeholder="Full name" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} autoFocus />
              </div>
              <div><label className="label">OTP Code</label>
                <input type="text" maxLength={6} className="input-field" placeholder="6-digit code" value={form.otp} onChange={e => setForm(f=>({...f,otp:e.target.value}))} style={{ textAlign: 'center', letterSpacing: '0.3em', fontSize: '1.25rem', fontFamily: 'JetBrains Mono, monospace' }} />
              </div>
              <div><label className="label">Password</label>
                <input type="password" className="input-field" placeholder="Min 8 characters" value={form.password} onChange={e => setForm(f=>({...f,password:e.target.value}))} />
              </div>
              <button onClick={handleRegister} disabled={!form.name || !form.otp || !form.password || loading} className="btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
                {loading ? <span className="dot-loader"><span/><span/><span/></span> : '🎉 Create Account'}
              </button>
              <button onClick={() => { setStep(1); setError(''); setSuccess(''); }} className="btn-secondary" style={{ width: '100%' }}>← Change email</button>
            </div>
          )}

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#64748b' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
