import React, { useEffect, useState } from 'react';
import axios from 'axios';

const STATUS_BADGE = {
  pending: 'badge-gray', confirmed: 'badge-green',
  completed: 'badge-ocean', cancelled: 'badge-red',
};
const fmtDate  = (d) => d ? new Date(d).toLocaleDateString() : '—';
const fmtMoney = (v) => parseFloat(v || 0).toFixed(2);

const Bookings = ({ showToast }) => {
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('');
  const [search,   setSearch]   = useState('');

  const load = () => {
    setLoading(true);
    axios.get('http://localhost:5000/api/bookings?limit=200')
      .then(r => setBookings(Array.isArray(r.data) ? r.data : (r.data?.data || [])))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/bookings/${id}`, { status });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
      showToast('Booking status updated.');
    } catch { showToast('Update failed.'); }
  };

  const cancelBooking = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/bookings/${id}`);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
      showToast('Booking cancelled.');
    } catch (e) { showToast(e.response?.data?.message || 'Failed.'); }
  };

  const filtered = bookings.filter(b => {
    const matchStatus = !filter || b.status === filter;
    const matchSearch = !search ||
      b.guest_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.guest_email?.toLowerCase().includes(search.toLowerCase()) ||
      b.room_number?.includes(search);
    return matchStatus && matchSearch;
  });

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <h2 style={{ fontFamily:'Playfair Display,serif', color:'var(--ocean)', fontSize:'1.8rem' }}>
          Bookings ({filtered.length})
        </h2>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <input className="form-control" style={{ width:200 }} placeholder="🔍 Search guest / room..."
            value={search} onChange={e => setSearch(e.target.value)} />
          <select className="status-select" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {['pending','confirmed','completed','cancelled'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {loading ? <div className="loader"><div className="spinner" /></div> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th><th>Guest</th><th>Email</th><th>Phone</th>
                <th>Room</th><th>Check-In</th><th>Check-Out</th>
                <th>Nights</th><th>Guests</th><th>Meals</th>
                <th>Total</th><th>Status</th><th>Update</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan="14" className="empty-msg">No bookings found.</td></tr>
                : filtered.map(b => {
                  const nights = Math.ceil((new Date(b.check_out) - new Date(b.check_in)) / 86400000);
                  return (
                    <tr key={b.id}>
                      <td>#{b.id}</td>
                      <td><strong>{b.guest_name}</strong></td>
                      <td style={{ fontSize:'0.8rem' }}>{b.guest_email}</td>
                      <td>{b.guest_phone || '—'}</td>
                      <td><strong>{b.room_type}</strong> #{b.room_number}</td>
                      <td>{fmtDate(b.check_in)}</td>
                      <td>{fmtDate(b.check_out)}</td>
                      <td>{nights}</td>
                      <td>{b.guests}</td>
                      <td>{b.extras === 'none' ? '—' : b.extras}</td>
                      <td><strong>LKR {fmtMoney(b.total_price)}</strong></td>
                      <td><span className={`badge ${STATUS_BADGE[b.status] || 'badge-gray'}`}>{b.status}</span></td>
                      <td>
                        <select className="status-select" value={b.status}
                          onChange={e => updateStatus(b.id, e.target.value)}>
                          {['pending','confirmed','completed','cancelled'].map(s =>
                            <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td>
                        {b.status !== 'cancelled' && b.status !== 'completed' && (
                          <button className="btn btn-danger btn-sm" onClick={() => cancelBooking(b.id)}>Cancel</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Bookings;
