import React from 'react';

// Admins page - placeholder (admin creation handled via /register page)
const Admins = () => (
  <div>
    <h2 style={{ fontFamily:'Playfair Display,serif', color:'var(--ocean)', fontSize:'1.8rem', marginBottom:20 }}>
      Admin Accounts
    </h2>
    <div className="card" style={{ padding:32, textAlign:'center' }}>
      <div style={{ fontSize:'3rem', marginBottom:16 }}>🔐</div>
      <h3 style={{ marginBottom:12 }}>Create Admin Accounts</h3>
      <p style={{ color:'var(--text-mid)', marginBottom:20 }}>
        To create a new admin account, use the registration page.
      </p>
      <a href="/register" className="btn btn-primary" style={{ textDecoration:'none', display:'inline-flex' }}>
        ➕ Go to Admin Register
      </a>
    </div>
  </div>
);

export default Admins;
