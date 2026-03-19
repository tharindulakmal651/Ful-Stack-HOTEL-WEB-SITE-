import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Overview.css';

const safeNum = (v) => parseFloat(v || 0);
const fmtMoney = (v) => safeNum(v).toLocaleString('en-US', { minimumFractionDigits: 2 });
const fmtDate = (d) => d ? new Date(d).toLocaleDateString() : '—';

const StatCard = ({ icon, label, value, sub, accent }) => (
  <div className={`stat-card ${accent || ''}`}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-body">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  </div>
);

const STATUS_BADGE = {
  pending: 'badge-gray', confirmed: 'badge-green',
  completed: 'badge-ocean', cancelled: 'badge-red',
  preparing: 'badge-gold', ready: 'badge-green', delivered: 'badge-ocean',
};

const Overview = () => {
  const [summary,  setSummary]  = useState(null);
  const [bookings, setBookings] = useState([]);
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('http://localhost:5000/api/dashboard/summary'),
      axios.get('http://localhost:5000/api/dashboard/bookings/recent?limit=8'),
      axios.get('http://localhost:5000/api/dashboard/orders/recent?limit=6'),
    ]).then(([s, b, o]) => {
      setSummary(s.data);
      setBookings(Array.isArray(b.data) ? b.data : []);
      setOrders(Array.isArray(o.data) ? o.data : []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  const bk = summary?.bookings || {};
  const od = summary?.orders   || {};
  const us = summary?.users    || {};
  const rm = summary?.rooms    || {};

  return (
    <div className="overview-page">
      <div className="page-title">
        <h2>Dashboard Overview</h2>
        <p>Welcome back — here's what's happening today</p>
      </div>

      {/* STAT CARDS */}
      <div className="stats-grid">
        <StatCard icon="💰" label="Total Revenue"      value={`$${fmtMoney(bk.total_revenue)}`}     sub={`$${fmtMoney(bk.today_revenue)} today`} accent="accent-gold" />
        <StatCard icon="🛏️" label="Total Bookings"     value={bk.total_bookings || 0}               sub={`${bk.bookings_today || 0} today`} />
        <StatCard icon="⏳" label="Pending Bookings"   value={bk.pending_bookings || 0}             accent="accent-warn" />
        <StatCard icon="✅" label="Confirmed Bookings" value={bk.confirmed_bookings || 0}           accent="accent-ok" />
        <StatCard icon="🍽️" label="Food Orders"        value={od.total_orders || 0}                 sub={`${od.orders_today || 0} today`} />
        <StatCard icon="🔄" label="Pending Orders"     value={od.pending_orders || 0}               accent="accent-warn" />
        <StatCard icon="👥" label="Registered Guests"  value={us.total_users || 0}                  sub={`${us.new_this_week || 0} this week`} />
        <StatCard icon="🏨" label="Rooms Available"    value={`${rm.available_rooms || 0} / ${rm.total_rooms || 0}`} />
      </div>

      {/* RECENT BOOKINGS */}
      <div className="overview-section">
        <h3 className="section-heading">Recent Bookings</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>#</th><th>Guest</th><th>Room</th><th>Check-In</th><th>Check-Out</th><th>Total</th><th>Status</th></tr>
            </thead>
            <tbody>
              {bookings.length === 0
                ? <tr><td colSpan="7" className="empty-msg">No bookings yet</td></tr>
                : bookings.map(b => (
                  <tr key={b.id}>
                    <td>#{b.id}</td>
                    <td>{b.guest_name}</td>
                    <td>{b.room_type} #{b.room_number}</td>
                    <td>{fmtDate(b.check_in)}</td>
                    <td>{fmtDate(b.check_out)}</td>
                    <td>LKR {fmtMoney(b.total_price)}</td>
                    <td><span className={`badge ${STATUS_BADGE[b.status] || 'badge-gray'}`}>{b.status}</span></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECENT ORDERS */}
      <div className="overview-section">
        <h3 className="section-heading">Recent Food Orders</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>#</th><th>Guest</th><th>Room</th><th>Items</th><th>Total</th><th>Delivery</th><th>Status</th></tr>
            </thead>
            <tbody>
              {orders.length === 0
                ? <tr><td colSpan="7" className="empty-msg">No orders yet</td></tr>
                : orders.map(o => {
                  const items = typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || []);
                  return (
                    <tr key={o.id}>
                      <td>#{o.id}</td>
                      <td>{o.guest_name || '—'}</td>
                      <td>{o.room_number || '—'}</td>
                      <td className="items-cell">{items.map(i => `${i.name} ×${i.qty}`).join(', ')}</td>
                      <td>${fmtMoney(o.total_amount)}</td>
                      <td>{o.delivery_type}</td>
                      <td><span className={`badge ${STATUS_BADGE[o.status] || 'badge-gray'}`}>{o.status}</span></td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Overview;
