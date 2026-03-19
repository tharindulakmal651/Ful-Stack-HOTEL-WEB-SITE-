import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const STATUS_BADGE = {
  pending:   'badge-gray',  confirmed: 'badge-green',
  completed: 'badge-ocean', cancelled: 'badge-red',
  preparing: 'badge-gold',  ready:     'badge-green',
  delivered: 'badge-ocean',
};
const fmt    = (n) => parseFloat(n || 0).toFixed(2);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString() : '—';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate          = useNavigate();
  const [tab, setTab]     = useState('bookings');

  const [bookings, setBookings] = useState([]);
  const [orders,   setOrders]   = useState([]);
  const [summary,  setSummary]  = useState(null);
  const [loading,  setLoading]  = useState(true);

  // profile form
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  const [profileMsg,  setProfileMsg]  = useState('');
  const [profileErr,  setProfileErr]  = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // password form
  const [pwForm, setPwForm]  = useState({ currentPassword:'', newPassword:'', confirmNew:'' });
  const [pwMsg,  setPwMsg]   = useState('');
  const [pwErr,  setPwErr]   = useState('');
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    setProfileForm({ name: user.name || '', phone: user.phone || '' });
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [b, o, s] = await Promise.all([
        axios.get('http://localhost:5000/api/bookings/my'),
        axios.get('http://localhost:5000/api/restaurant/orders/my'),
        axios.get('http://localhost:5000/api/bookings/my/summary'),
      ]);
      setBookings(Array.isArray(b.data) ? b.data : (b.data?.data || []));
      const orderList = Array.isArray(o.data) ? o.data : (o.data?.data || []);
      setOrders(orderList.map(order => ({
        ...order,
        items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items
      })));
      setSummary(s.data);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const cancelBooking = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/bookings/${id}`);
      setBookings(prev => prev.map(b => b.id===id ? {...b, status:'cancelled'} : b));
    } catch(e) {
      alert(e.response?.data?.message || 'Failed to cancel.');
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault(); setSavingProfile(true); setProfileMsg(''); setProfileErr('');
    try {
      await axios.put('http://localhost:5000/api/auth/profile', profileForm);
      setProfileMsg('Profile updated successfully.');
    } catch(e) {
      setProfileErr(e.response?.data?.message || 'Update failed.');
    } finally { setSavingProfile(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault(); setSavingPw(true); setPwMsg(''); setPwErr('');
    if (pwForm.newPassword !== pwForm.confirmNew) {
      setPwErr('New passwords do not match.'); setSavingPw(false); return;
    }
    try {
      await axios.put('http://localhost:5000/api/auth/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword:     pwForm.newPassword
      });
      setPwMsg('Password changed successfully.');
      setPwForm({ currentPassword:'', newPassword:'', confirmNew:'' });
    } catch(e) {
      setPwErr(e.response?.data?.message || 'Change failed.');
    } finally { setSavingPw(false); }
  };

  const TABS = [
    { id:'bookings', label:'🛏️ Bookings' },
    { id:'orders',   label:'🍽️ Orders' },
    { id:'account',  label:'👤 Account' },
    { id:'security', label:'🔒 Security' },
  ];

  return (
    <div className="profile-page">
      <div className="page-header">
        <div className="page-header-bg"/>
        <div className="container page-header-content">
          <p className="section-eyebrow">My Account</p>
          <h1>Welcome, {user?.name?.split(' ')[0]}</h1>
          <p>Manage your bookings, orders and account settings</p>
        </div>
      </div>

      <div className="container profile-layout">
        {/* SIDEBAR */}
        <aside className="profile-sidebar">
          <div className="profile-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <h3>{user?.name}</h3>
          <p className="profile-email">{user?.email}</p>
          {user?.phone && <p className="profile-phone">📞 {user.phone}</p>}

          {summary && (
            <div className="profile-stats">
              <div className="ps-item"><strong>{summary.total_bookings||0}</strong><span>Bookings</span></div>
              <div className="ps-item"><strong>${fmt(summary.total_spent||0)}</strong><span>Spent</span></div>
            </div>
          )}

          <nav className="profile-nav">
            {TABS.map(t => (
              <button key={t.id} className={tab===t.id?'active':''} onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </nav>
          <button className="btn btn-outline btn-sm logout-btn"
            onClick={() => { logout(); navigate('/'); }}>
            Logout
          </button>
        </aside>

        {/* MAIN */}
        <main className="profile-main">
          {loading ? (
            <div className="loader"><div className="spinner"/></div>
          ) : (

          /* ── BOOKINGS ── */
          tab==='bookings' ? (
            <div>
              <h2 className="profile-section-title">My Bookings</h2>
              {summary && (
                <div className="booking-summary-row">
                  {[
                    {label:'Pending',   val: summary.pending   || 0, c:'badge-gray'},
                    {label:'Confirmed', val: summary.confirmed || 0, c:'badge-green'},
                    {label:'Completed', val: summary.completed || 0, c:'badge-ocean'},
                    {label:'Cancelled', val: summary.cancelled || 0, c:'badge-red'},
                  ].map(s => (
                    <div key={s.label} className="bsr-item">
                      <span className={`badge ${s.c}`}>{s.label}</span>
                      <strong>{s.val}</strong>
                    </div>
                  ))}
                </div>
              )}
              {bookings.length===0 ? (
                <div className="empty-state">
                  <span>🏨</span>
                  <p>No bookings yet.</p>
                  <a href="/rooms" className="btn btn-primary btn-sm">Browse Rooms →</a>
                </div>
              ) : (
                <div className="bookings-list">
                  {bookings.map(b => (
                    <div className="booking-item card" key={b.id}>
                      <div className="bi-header">
                        <div>
                          <h4>{b.room_type} — {b.view_type}</h4>
                          <p className="bi-meta">Room {b.room_number} · Booked {fmtDate(b.created_at)}</p>
                        </div>
                        <span className={`badge ${STATUS_BADGE[b.status]||'badge-gray'}`}>{b.status}</span>
                      </div>
                      <div className="bi-details">
                        <div className="bi-detail"><span>📅 Check-In</span><strong>{fmtDate(b.check_in)}</strong></div>
                        <div className="bi-detail"><span>📅 Check-Out</span><strong>{fmtDate(b.check_out)}</strong></div>
                        <div className="bi-detail"><span>👥 Guests</span><strong>{b.guests}</strong></div>
                        <div className="bi-detail"><span>🍽️ Meals</span><strong>{b.extras==='none'?'None':b.extras}</strong></div>
                        <div className="bi-detail bi-total"><span>💰 Total</span><strong>Rs {fmt(b.total_price)}</strong></div>
                      </div>
                      {b.special_requests && <p className="bi-note">📝 {b.special_requests}</p>}
                      {(b.status==='pending' || b.status==='confirmed') && (
                        <button className="btn btn-danger btn-sm" onClick={() => cancelBooking(b.id)}>
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          /* ── ORDERS ── */
          ) : tab==='orders' ? (
            <div>
              <h2 className="profile-section-title">Food Orders</h2>
              {orders.length===0 ? (
                <div className="empty-state">
                  <span>🍽️</span>
                  <p>No orders yet.</p>
                  <a href="/restaurant" className="btn btn-primary btn-sm">Visit Restaurant →</a>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map(o => (
                    <div className="order-item card" key={o.id}>
                      <div className="bi-header">
                        <div>
                          <h4>Order #{o.id}</h4>
                          <p className="bi-meta">
                            {new Date(o.created_at).toLocaleString()} &nbsp;·&nbsp;
                            {o.delivery_type==='room' ? '🛏️ Room Delivery' : '🍽️ Dine In'}
                            {o.room_number && ` · Room ${o.room_number}`}
                          </p>
                        </div>
                        <span className={`badge ${STATUS_BADGE[o.status]||'badge-gray'}`}>{o.status}</span>
                      </div>
                      <div className="order-items-list">
                        {(o.items||[]).map((item,i) => (
                          <span key={i}>{item.name} ×{item.qty} — Rs {(item.price*item.qty).toFixed(2)}</span>
                        ))}
                      </div>
                      {o.special_instructions && <p className="bi-note">📝 {o.special_instructions}</p>}
                      <div className="bi-detail bi-total" style={{marginTop:8}}><span>💰 Total</span><strong>${fmt(o.total_amount)}</strong></div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          /* ── ACCOUNT ── */
          ) : tab==='account' ? (
            <div>
              <h2 className="profile-section-title">Account Details</h2>
              {profileMsg && <div className="alert alert-success">{profileMsg}</div>}
              {profileErr && <div className="alert alert-error">{profileErr}</div>}
              <div className="card" style={{padding:28}}>
                <form onSubmit={saveProfile}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-control" value={profileForm.name}
                      onChange={e => setProfileForm(p=>({...p, name:e.target.value}))} required/>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input className="form-control" value={user?.email} disabled
                      style={{background:'var(--sand)', cursor:'not-allowed'}}/>
                    <small style={{color:'var(--text-light)',fontSize:'0.8rem'}}>Email cannot be changed. Contact support if needed.</small>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input className="form-control" value={profileForm.phone}
                      onChange={e => setProfileForm(p=>({...p, phone:e.target.value}))}
                      placeholder="+94 77 123 4567"/>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Member Since</label>
                    <input className="form-control" value={fmtDate(user?.created_at)} disabled
                      style={{background:'var(--sand)', cursor:'not-allowed'}}/>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                    {savingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            </div>

          /* ── SECURITY ── */
          ) : tab==='security' ? (
            <div>
              <h2 className="profile-section-title">Change Password</h2>
              {pwMsg && <div className="alert alert-success">{pwMsg}</div>}
              {pwErr && <div className="alert alert-error">{pwErr}</div>}
              <div className="card" style={{padding:28, maxWidth:480}}>
                <form onSubmit={changePassword}>
                  <div className="form-group">
                    <label className="form-label">Current Password</label>
                    <input type="password" className="form-control" value={pwForm.currentPassword}
                      onChange={e => setPwForm(p=>({...p, currentPassword:e.target.value}))} required/>
                  </div>
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input type="password" className="form-control" value={pwForm.newPassword}
                      onChange={e => setPwForm(p=>({...p, newPassword:e.target.value}))}
                      minLength={6} required/>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <input type="password" className="form-control" value={pwForm.confirmNew}
                      onChange={e => setPwForm(p=>({...p, confirmNew:e.target.value}))}
                      minLength={6} required/>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={savingPw}>
                    {savingPw ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>
            </div>
          ) : null
          )}
        </main>
      </div>
    </div>
  );
};

export default Profile;
