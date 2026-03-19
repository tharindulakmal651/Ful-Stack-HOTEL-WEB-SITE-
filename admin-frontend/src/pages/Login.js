import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const AdminLogin = () => {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Check your credentials.');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-card">

        {/* Brand */}
        <div className="login-brand">
          <span>🌊</span>
          <div>
            <div className="lb-name">Araliya Resort</div>
            <div className="lb-sub">Admin Dashboard</div>
          </div>
        </div>

        <h2>Admin Sign In</h2>
        <p className="login-sub">Restricted to authorised staff only</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handle}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email" className="form-control"
              placeholder="admin@araliya.com" required
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password" className="form-control"
              placeholder="••••••••" required
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            />
          </div>
          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? '⏳ Signing in...' : '🔐 Sign In to Dashboard'}
          </button>
        </form>

        {/* Divider */}
        <div className="auth-divider">
          <span>or</span>
        </div>

        {/* Sign Up Button */}
        <Link to="/register" className="btn btn-outline login-btn" style={{ textDecoration:'none', justifyContent:'center' }}>
          ➕ Create New Admin Account
        </Link>

        <div className="login-demo">
          <p>🔑 Default: admin@araliya.com / admin123</p>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;
