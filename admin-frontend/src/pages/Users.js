import React, { useEffect, useState } from 'react';
import axios from 'axios';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString() : '—';

const Users = ({ showToast }) => {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [stats,   setStats]   = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      axios.get('http://localhost:5000/api/users?limit=200'),
      axios.get('http://localhost:5000/api/users/stats'),
    ]).then(([u, s]) => {
      setUsers(Array.isArray(u.data) ? u.data : (u.data?.data || []));
      setStats(s.data);
    }).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user account and all their data?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/users/${id}`);
      setUsers(prev => prev.filter(u => u.id !== id));
      showToast('User deleted.');
    } catch (e) { showToast(e.response?.data?.message || 'Delete failed.'); }
  };

  const filtered = search
    ? users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()))
    : users;

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <h2 style={{ fontFamily:'Playfair Display,serif', color:'var(--ocean)', fontSize:'1.8rem' }}>Guest Accounts ({users.length})</h2>
        <input className="form-control" style={{ width:240 }} placeholder="🔍 Search name or email..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Stats row */}
      {stats && (
        <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
          {[
            { label:'Total',      val: stats.total_users  },
            { label:'Guests',     val: stats.guests       },
            { label:'New Today',  val: stats.new_today    },
            { label:'This Week',  val: stats.new_this_week},
          ].map(s => (
            <div key={s.label} style={{ background:'white', borderRadius:10, padding:'12px 20px', boxShadow:'var(--shadow-sm)', textAlign:'center' }}>
              <div style={{ fontSize:'1.5rem', fontWeight:700, color:'var(--ocean)', fontFamily:'Jost,sans-serif' }}>{s.val}</div>
              <div style={{ fontSize:'0.78rem', color:'var(--text-light)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {loading ? <div className="loader"><div className="spinner" /></div> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th><th>Last Login</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan="8" className="empty-msg">No users found.</td></tr>
                : filtered.map(u => (
                  <tr key={u.id}>
                    <td>#{u.id}</td>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td>{u.phone || '—'}</td>
                    <td><span className={`badge ${u.role === 'admin' ? 'badge-ocean' : 'badge-gray'}`}>{u.role}</span></td>
                    <td>{fmtDate(u.created_at)}</td>
                    <td>{u.last_login ? fmtDate(u.last_login) : 'Never'}</td>
                    <td>
                      {u.role !== 'admin' && (
                        <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u.id)}>🗑️ Delete</button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Users;
