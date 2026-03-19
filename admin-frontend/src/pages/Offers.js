import React, { useEffect, useState } from 'react';
import axios from 'axios';

const OfferModal = ({ offer, onClose, onSave }) => {
  const blank = { title:'', description:'', discount_percent:0, valid_from:'', valid_until:'', is_active:true };
  const [form, setForm] = useState(offer || blank);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const f = (k,v) => setForm(p => ({ ...p, [k]: v }));

  const handle = async (e) => {
    e.preventDefault(); setSaving(true); setErr('');
    try {
      const payload = { ...form, discount_percent: parseInt(form.discount_percent) || 0 };
      if (offer) await axios.put(`http://localhost:5000/api/restaurant/offers/${offer.id}`, payload);
      else       await axios.post('http://localhost:5000/api/restaurant/offers', payload);
      onSave();
    } catch(e) { setErr(e.response?.data?.message || 'Save failed.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h3>{offer ? 'Edit Offer' : 'Add Offer'}</h3>
        {err && <div className="alert alert-error">{err}</div>}
        <form onSubmit={handle}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className="form-control" value={form.title} onChange={e => f('title', e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-control" rows="2" value={form.description || ''} onChange={e => f('description', e.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Discount %</label>
              <input className="form-control" type="number" min="0" max="100" value={form.discount_percent} onChange={e => f('discount_percent', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-control" value={form.is_active} onChange={e => f('is_active', e.target.value === 'true')}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Valid From</label>
              <input className="form-control" type="date" value={form.valid_from || ''} onChange={e => f('valid_from', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Valid Until</label>
              <input className="form-control" type="date" value={form.valid_until || ''} onChange={e => f('valid_until', e.target.value)} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width:'100%', justifyContent:'center', marginTop:8 }} disabled={saving}>
            {saving ? 'Saving...' : offer ? 'Update Offer' : 'Add Offer'}
          </button>
        </form>
      </div>
    </div>
  );
};

const Offers = ({ showToast }) => {
  const [offers,  setOffers]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null);

  const load = () => {
    setLoading(true);
    axios.get('http://localhost:5000/api/restaurant/offers/all')
      .then(r => setOffers(Array.isArray(r.data) ? r.data : []))
      .catch(console.error).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const del = async (id) => {
    if (!window.confirm('Delete this offer?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/restaurant/offers/${id}`);
      setOffers(prev => prev.filter(o => o.id !== id));
      showToast('Offer deleted.');
    } catch { showToast('Delete failed.'); }
  };

  const onSave = () => { setModal(null); load(); showToast('Offer saved!'); };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h2 style={{ fontFamily:'Playfair Display,serif', color:'var(--ocean)', fontSize:'1.8rem' }}>Restaurant Offers ({offers.length})</h2>
        <button className="btn btn-gold" onClick={() => setModal({ offer: null })}>+ Add Offer</button>
      </div>

      {loading ? <div className="loader"><div className="spinner" /></div> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Title</th><th>Description</th><th>Discount</th><th>Valid From</th><th>Valid Until</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {offers.length === 0
                ? <tr><td colSpan="7" className="empty-msg">No offers found.</td></tr>
                : offers.map(o => (
                  <tr key={o.id}>
                    <td><strong>{o.title}</strong></td>
                    <td style={{ maxWidth:200, fontSize:'0.82rem', color:'var(--text-mid)' }}>{o.description || '—'}</td>
                    <td>{o.discount_percent > 0 ? <span className="badge badge-gold">{o.discount_percent}% OFF</span> : '—'}</td>
                    <td style={{ fontSize:'0.85rem' }}>{o.valid_from ? new Date(o.valid_from).toLocaleDateString() : '—'}</td>
                    <td style={{ fontSize:'0.85rem' }}>{o.valid_until ? new Date(o.valid_until).toLocaleDateString() : '—'}</td>
                    <td><span className={`badge ${o.is_active ? 'badge-green' : 'badge-gray'}`}>{o.is_active ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <div className="action-btns">
                        <button className="btn btn-ghost btn-sm" onClick={() => setModal({ offer: o })}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => del(o.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
      {modal && <OfferModal offer={modal.offer} onClose={() => setModal(null)} onSave={onSave} />}
    </div>
  );
};

export default Offers;
