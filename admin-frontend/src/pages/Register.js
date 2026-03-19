import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import './Login.css';
import './Register.css';

const AdminRegister = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', password:'', confirmPassword:'' });
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');
  const [showPass, setShowPass] = useState(false);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  // Password strength checker
  const getStrength = (pwd) => {
    if (!pwd)            return { label:'',          color:'#ddd',    width:'0%'   };
    if (pwd.length < 4)  return { label:'Too Short', color:'#d63031', width:'20%'  };
    if (pwd.length < 6)  return { label:'Weak',      color:'#e17055', width:'40%'  };
    if (pwd.length < 10) return { label:'Fair',      color:'#f0a500', width:'65%'  };
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd))
                         return { label:'Strong',    color:'#00b894', width:'100%' };
    return               { label:'Good',             color:'#00cec9', width:'80%'  };
  };

  const strength    = getStrength(form.password);
  const passMatch   = form.confirmPassword !== '' && form.password === form.confirmPassword;
  const passMismatch = form.confirmPassword !== '' && form.password !== form.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (!form.name.trim())        { setError('Full name is required.');               return; }
    if (!form.email.trim())       { setError('Email address is required.');           return; }
    if (form.password.length < 6) { setError('Password must be at least 6 chars.');  return; }
    if (passMismatch)             { setError('Passwords do not match.');              return; }

    setLoading(true);
    try {
      const res = await axios.post('/api/setup/create-admin', {
        name:            form.name.trim(),
        email:           form.email.trim().toLowerCase(),
        password:        form.password,
        confirmPassword: form.confirmPassword,
      });

      setSuccess(res.data.message || 'Admin account created!');

      if (res.data.token) {
        localStorage.setItem('adminToken', res.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        setTimeout(() => navigate('/'), 1500);
      } else {
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-card register-card">

        {/* Brand */}
        <div className="login-brand">
          <span>🌊</span>
          <div>
            <div className="lb-name">Araliya Resort</div>
            <div className="lb-sub">Admin Registration</div>
          </div>
        </div>

        <h2>Create Admin Account</h2>
        <p className="login-sub">Register a new administrator for the hotel system.</p>

        {error   && <div className="alert alert-error">❌ {error}</div>}
        {success && <div className="alert alert-success">✅ {success} Redirecting...</div>}

        <form onSubmit={handleSubmit} noValidate>

          {/* Full Name */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-control" placeholder="e.g. John Smith"
              value={form.name} onChange={e => set('name', e.target.value)}
              required autoFocus />
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-control" placeholder="admin@araliya.com"
              value={form.email} onChange={e => set('email', e.target.value)}
              required />
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="pass-wrap">
              <input
                type={showPass ? 'text' : 'password'}
                className="form-control" placeholder="Minimum 6 characters"
                value={form.password} onChange={e => set('password', e.target.value)}
                required
              />
              <button type="button" className="pass-toggle"
                onClick={() => setShowPass(p => !p)}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
            {form.password && (
              <div className="strength-bar-wrap">
                <div className="strength-track">
                  <div className="strength-bar"
                    style={{ width: strength.width, background: strength.color }} />
                </div>
                <span className="strength-label" style={{ color: strength.color }}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type={showPass ? 'text' : 'password'}
              className="form-control" placeholder="Re-enter your password"
              value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)}
              required
              style={{ borderColor: passMatch ? '#00b894' : passMismatch ? '#d63031' : undefined }}
            />
            {passMatch    && <small className="match-ok">✅ Passwords match</small>}
            {passMismatch && <small className="match-err">⚠️ Passwords do not match</small>}
          </div>

          {/* Submit */}
          <button type="submit" className="btn btn-primary login-btn"
            disabled={loading || !!passMismatch}>
            {loading ? '⏳ Creating Account...' : '✅ Create Admin Account'}
          </button>

        </form>

        <div className="auth-divider"><span>already have an account?</span></div>
        <Link to="/login" className="btn btn-outline login-btn"
          style={{ textDecoration:'none', justifyContent:'center' }}>
          ← Back to Sign In
        </Link>

      </div>
    </div>
  );
};

export default AdminRegister;
