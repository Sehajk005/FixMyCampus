import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function OtpVerification({ email }) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/otp/verify', { email, otp });
      login(data.user, data.accessToken);
      navigate('/dashboard'); // Verified successfully
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    try {
      await api.post('/auth/otp/resend', { email });
      setCountdown(60); // Reset timer
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend OTP.');
    }
  };

  return (
    <div className="text-center motion-auth-panel w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Check your email</h2>
        <p className="text-slate-300 text-sm">
          We've sent a 6-digit verification code to <br />
          <span className="font-semibold text-blue-400">{email}</span>
        </p>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl mb-6 text-sm motion-error-banner">
          {error}
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-6">
        <div>
          <input
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
            className="w-full text-center tracking-[0.5em] text-3xl font-bold px-4 py-4 rounded-xl bg-slate-800/50 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="000000"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || otp.length < 6}
          className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/30 transform hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>
      </form>

      <div className="mt-8">
        {countdown > 0 ? (
          <p className="text-slate-400 text-sm">
            Resend code in <span className="font-semibold text-white">{countdown}s</span>
          </p>
        ) : (
          <button
            onClick={handleResend}
            className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            Resend Verification Code
          </button>
        )}
      </div>
    </div>
  );
}
