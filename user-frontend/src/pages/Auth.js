import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const user = await login(form.email, form.password);
      if (user.role === 'admin') { window.location.href = 'http://localhost:3001'; } else { navigate('/profile'); }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-card">
        <div className="auth-brand">
          <span>🌊</span>
          <div>
            <div className="auth-brand-name">Araliya</div>
            <div className="auth-brand-sub">Beach Resort & Spa</div>
          </div>
        </div>
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Sign in to manage your bookings and orders</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-control" placeholder="your@email.com" required
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" placeholder="••••••••" required
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <p className="auth-switch">
          Don't have an account? <Link to="/register">Create one →</Link>
        </p>
        <div className="auth-demo">
          <p>Demo Admin: admin@araliya.com / admin123</p>
        </div>
      </div>
    </div>
  );
};

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await register(form);
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-card">
        <div className="auth-brand">
          <span>🌊</span>
          <div>
            <div className="auth-brand-name">Araliya</div>
            <div className="auth-brand-sub">Beach Resort & Spa</div>
          </div>
        </div>
        <h2>Create Account</h2>
        <p className="auth-subtitle">Join us for exclusive benefits and easy booking</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-control" placeholder="John Smith" required
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-control" placeholder="your@email.com" required
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input type="tel" className="form-control" placeholder="+1 234 567 8900"
              value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" placeholder="Min. 6 characters" required minLength={6}
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-gold auth-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in →</Link>
        </p>
      </div>
    </div>
  );
};
