import React, { useEffect, useState } from 'react';
import axios from 'axios';

const STATUS_BADGE = {
  pending:'badge-gray', preparing:'badge-gold',
  ready:'badge-green', delivered:'badge-ocean', cancelled:'badge-red',
};
const fmtMoney = (v) => parseFloat(v || 0).toFixed(2);

const Orders = ({ showToast }) => {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('');

  const load = () => {
    setLoading(true);
    axios.get('http://localhost:5000/api/restaurant/orders?limit=200')
      .then(r => setOrders(Array.isArray(r.data) ? r.data : (r.data?.data || [])))
      .catch(console.error)
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/restaurant/orders/${id}`, { status });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      showToast('Order updated.');
    } catch { showToast('Update failed.'); }
  };

  const deleteOrder = async (id) => {
    if (!window.confirm('Delete this order?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/restaurant/orders/${id}`);
      setOrders(prev => prev.filter(o => o.id !== id));
      showToast('Order deleted.');
    } catch { showToast('Delete failed.'); }
  };

  const filtered = filter ? orders.filter(o => o.status === filter) : orders;

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <h2 style={{ fontFamily:'Playfair Display,serif', color:'var(--ocean)', fontSize:'1.8rem' }}>
          Food Orders ({filtered.length})
        </h2>
        <select className="status-select" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {['pending','preparing','ready','delivered','cancelled'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {loading ? <div className="loader"><div className="spinner" /></div> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>#</th><th>Guest</th><th>Room</th><th>Items</th><th>Delivery</th><th>Total</th><th>Time</th><th>Status</th><th>Update</th><th>Del</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan="10" className="empty-msg">No orders found.</td></tr>
                : filtered.map(o => {
                  const items = typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || []);
                  return (
                    <tr key={o.id}>
                      <td>#{o.id}</td>
                      <td>{o.guest_name || '—'}</td>
                      <td>{o.room_number || '—'}</td>
                      <td className="items-cell">{items.map(i => `${i.name} ×${i.qty}`).join(', ')}</td>
                      <td><span className={`badge ${o.delivery_type === 'room' ? 'badge-ocean' : 'badge-gray'}`}>{o.delivery_type}</span></td>
                      <td><strong>${fmtMoney(o.total_amount)}</strong></td>
                      <td style={{ fontSize:'0.8rem', color:'var(--text-light)' }}>{new Date(o.created_at).toLocaleTimeString()}</td>
                      <td><span className={`badge ${STATUS_BADGE[o.status] || 'badge-gray'}`}>{o.status}</span></td>
                      <td>
                        <select className="status-select" value={o.status}
                          onChange={e => updateStatus(o.id, e.target.value)}>
                          {['pending','preparing','ready','delivered','cancelled'].map(s =>
                            <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td><button className="btn btn-danger btn-sm" onClick={() => deleteOrder(o.id)}>🗑️</button></td>
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

export default Orders;
