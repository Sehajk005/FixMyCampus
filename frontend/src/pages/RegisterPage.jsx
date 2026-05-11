import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import OtpVerification from '../components/OtpVerification';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setLoading(false);
      return;
    }

    try {
      await api.post('/auth/register', { name, email, password });
      setStep(2); // Proceed to OTP view
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card motion-auth-panel motion-chart-panel">
        
        {step === 1 ? (
          <div className="animate-fade-up">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-extrabold" style={{ color: 'var(--text-strong)' }}>Join FixMyCampus</h1>
              <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>Report and track campus issues with ease.</p>
            </div>

            {error && (
              <div className="p-3 rounded-xl mb-6 text-sm flex items-center motion-error-banner" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.32)', color: '#fca5a5' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  placeholder="Jane Doe"
                  required
                />
              </div>

              <div>
                <label className="label">Campus Email</label>
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
                  placeholder="Minimum 8 characters"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-4"
              >
                {loading ? 'Setting up account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-8 text-center pt-6" style={{ borderTop: '1px solid var(--border)' }}>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Already have an account?{' '}
                <Link to="/login" className="text-link">
                  Log in here
                </Link>
              </p>
            </div>
          </div>
        ) : (
          <div className="animate-slide-right flex items-center justify-center h-full">
            <OtpVerification email={email} />
          </div>
        )}
      </div>
    </div>
  );
}
