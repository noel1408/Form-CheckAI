import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setMessage('');
      setError('');
      setLoading(true);
      await resetPassword(email);
      setMessage('Check your inbox for further instructions.');
    } catch (err) {
      setError('Failed to reset password. ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="glass-panel auth-card">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <KeyRound size={48} color="var(--primary-cyan)" style={{ marginBottom: '16px' }} />
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '600' }}>Password Reset</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Enter your email to reset your password</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {message && (
          <div style={{ background: 'rgba(0, 229, 255, 0.1)', color: 'var(--primary-cyan)', padding: '12px', borderRadius: '8px', border: '1px solid var(--primary-cyan-dim)', marginBottom: '20px', textAlign: 'center', fontSize: '14px' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>Email Address</label>
            <input
              type="email"
              className="glass-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <button disabled={loading} type="submit" className="glass-button" style={{ marginTop: '8px' }}>
            {loading ? 'Sending...' : 'Reset Password'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Remember your password? <Link to="/login" style={{ color: 'var(--primary-cyan)', textDecoration: 'none' }}>Log in</Link>
        </div>
      </div>
    </div>
  );
}
