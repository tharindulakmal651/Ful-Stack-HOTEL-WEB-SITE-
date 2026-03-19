import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Messages.css';

const Messages = ({ showToast, onUnreadChange }) => {
  const [messages, setMessages] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('all'); // all | unread | read

  const load = () => {
    setLoading(true);
    axios.get('http://localhost:5000/api/contact?limit=100')
      .then(r => {
        const list = Array.isArray(r.data) ? r.data : (r.data?.data || []);
        setMessages(list);
        onUnreadChange(list.filter(m => !m.is_read).length);
      })
      .catch(console.error).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const markRead = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/api/contact/${id}/read`);
      setMessages(prev => {
        const updated = prev.map(m => m.id === id ? { ...m, is_read: true } : m);
        onUnreadChange(updated.filter(m => !m.is_read).length);
        return updated;
      });
    } catch { showToast('Failed to mark as read.'); }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/contact/${id}`);
      setMessages(prev => {
        const updated = prev.filter(m => m.id !== id);
        onUnreadChange(updated.filter(m => !m.is_read).length);
        return updated;
      });
      showToast('Message deleted.');
    } catch { showToast('Delete failed.'); }
  };

  const filtered = messages.filter(m => {
    if (filter === 'unread') return !m.is_read;
    if (filter === 'read')   return  m.is_read;
    return true;
  });
  const unread = messages.filter(m => !m.is_read).length;

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <h2 style={{ fontFamily:'Playfair Display,serif', color:'var(--ocean)', fontSize:'1.8rem' }}>Messages</h2>
          {unread > 0 && <span className="badge badge-red">{unread} unread</span>}
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {['all','unread','read'].map(f => (
            <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilter(f)} style={{ textTransform:'capitalize' }}>{f}</button>
          ))}
        </div>
      </div>

      {loading ? <div className="loader"><div className="spinner" /></div> : (
        <div className="messages-list">
          {filtered.length === 0
            ? <p className="empty-msg">No messages found.</p>
            : filtered.map(m => (
              <div key={m.id} className={`message-card card ${!m.is_read ? 'unread' : ''}`}>
                <div className="msg-header">
                  <div className="msg-from">
                    <div className="msg-avatar">{m.name[0].toUpperCase()}</div>
                    <div>
                      <strong>{m.name}</strong>
                      <p>{m.email}{m.phone ? ` · ${m.phone}` : ''}</p>
                    </div>
                  </div>
                  <div className="msg-meta">
                    <span>{new Date(m.created_at).toLocaleString()}</span>
                    {!m.is_read && <span className="badge badge-red">New</span>}
                  </div>
                </div>
                <p className="msg-subject"><strong>Subject:</strong> {m.subject}</p>
                <p className="msg-body">{m.message}</p>
                <div className="action-btns" style={{ marginTop:12 }}>
                  {!m.is_read && (
                    <button className="btn btn-success btn-sm" onClick={() => markRead(m.id)}>✓ Mark Read</button>
                  )}
                  <a href={`mailto:${m.email}?subject=Re: ${m.subject}`} className="btn btn-ghost btn-sm">↩ Reply</a>
                  <button className="btn btn-danger btn-sm" onClick={() => del(m.id)}>🗑️</button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default Messages;
