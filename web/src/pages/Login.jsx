import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to sign in. Please check your credentials.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setError(`Failed to sign in with Google: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="glass-panel auth-card">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <LogIn size={48} color="var(--primary-cyan)" style={{ marginBottom: '16px' }} />
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '600' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Log in to access your dashboard</p>
        </div>

        {error && <div className="error-message">{error}</div>}

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
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>Password</label>
            <input
              type="password"
              className="glass-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <Link to="/forgot-password" style={{ color: 'var(--primary-cyan)', textDecoration: 'none', fontSize: '14px' }}>
              Forgot Password?
            </Link>
          </div>

          <button disabled={loading} type="submit" className="glass-button" style={{ marginTop: '8px' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-glass)' }}></div>
          <span style={{ margin: '0 10px', color: 'var(--text-secondary)', fontSize: '14px' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-glass)' }}></div>
        </div>

        <button 
          disabled={loading} 
          onClick={handleGoogleLogin}
          className="glass-button" 
          style={{ background: 'transparent', border: '1px solid var(--primary-cyan)', color: 'var(--primary-cyan)' }}
        >
          Sign In with Google
        </button>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary-cyan)', textDecoration: 'none' }}>Sign up</Link>
        </div>
      </div>
    </div>
  );
}
