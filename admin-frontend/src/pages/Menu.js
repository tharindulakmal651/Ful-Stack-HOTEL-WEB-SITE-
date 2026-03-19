import React, { useEffect, useState } from 'react';
import axios from '../axiosConfig';
import ImageUploader from '../components/ImageUploader';

const CATEGORIES = ['breakfast','lunch','dinner','beverage','dessert'];
const CAT_ICON   = { breakfast:'🍳', lunch:'🥗', dinner:'🌙', beverage:'🍹', dessert:'🍰' };
const API = 'http://localhost:5000';

const MenuModal = ({ item, onClose, onSave }) => {
  const blank = { name:'', category:'breakfast', price:'', description:'', is_vegetarian:false, is_available:true };
  const [form,    setForm]    = useState(item||blank);
  const [imgUrl,  setImgUrl]  = useState(item?.image_url||null);
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState('');
  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  const handle = async (e) => {
    e.preventDefault(); setSaving(true); setErr('');
    try {
      const payload = {...form, price: parseFloat(form.price)};
      if (item) await axios.put(`/api/restaurant/menu/${item.id}`, payload);
      else      await axios.post('/api/restaurant/menu', payload);
      onSave();
    } catch(e) { setErr(e.response?.data?.message||'Save failed.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e=>e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h3>{item?'Edit Menu Item':'Add Menu Item'}</h3>
        {err&&<div className="alert alert-error">{err}</div>}

        <form onSubmit={handle}>
          <div className="form-group"><label className="form-label">Item Name *</label>
            <input className="form-control" value={form.name} onChange={e=>f('name',e.target.value)} required/></div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Category *</label>
              <select className="form-control" value={form.category} onChange={e=>f('category',e.target.value)}>
                {CATEGORIES.map(c=><option key={c} value={c}>{CAT_ICON[c]} {c}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Price ($) *</label>
              <input className="form-control" type="number" min="0" step="0.01" value={form.price} onChange={e=>f('price',e.target.value)} required/></div>
          </div>
          <div className="form-group"><label className="form-label">Description</label>
            <textarea className="form-control" rows="2" value={form.description||''} onChange={e=>f('description',e.target.value)}/></div>
          <div style={{display:'flex',gap:24,marginBottom:16}}>
            <label style={{display:'flex',gap:8,alignItems:'center',cursor:'pointer'}}>
              <input type="checkbox" checked={!!form.is_vegetarian} onChange={e=>f('is_vegetarian',e.target.checked)}/>🌿 Vegetarian</label>
            <label style={{display:'flex',gap:8,alignItems:'center',cursor:'pointer'}}>
              <input type="checkbox" checked={!!form.is_available} onChange={e=>f('is_available',e.target.checked)}/>✅ Available</label>
          </div>
          <button type="submit" className="btn btn-primary" style={{width:'100%',justifyContent:'center'}} disabled={saving}>
            {saving?'Saving...':(item?'Update Item':'Add Item')}</button>
        </form>

        {/* Image upload — only after item saved */}
        {item && (
          <ImageUploader
            label="Item Photo (1 image)"
            uploadUrl={`/api/upload/menu/${item.id}`}
            deleteUrl={`/api/upload/menu/${item.id}/image`}
            existingImages={imgUrl ? [imgUrl] : []}
            multiple={false}
            maxFiles={1}
            onSuccess={updated => setImgUrl(updated[0]||null)}
          />
        )}
        {!item&&<p style={{fontSize:'0.8rem',color:'var(--text-light)',marginTop:12,textAlign:'center'}}>💡 Save the item first, then upload a photo.</p>}
      </div>
    </div>
  );
};

const Menu = ({ showToast }) => {
  const [menu,    setMenu]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null);
  const [activeCat, setActiveCat] = useState('');

  const load = () => {
    setLoading(true);
    axios.get('/api/restaurant/menu/all')
      .then(r=>setMenu(Array.isArray(r.data)?r.data:[]))
      .catch(console.error).finally(()=>setLoading(false));
  };
  useEffect(load, []);

  const del = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await axios.delete(`/api/restaurant/menu/${id}`);
      setMenu(prev=>prev.filter(m=>m.id!==id));
      showToast('Item deleted.');
    } catch { showToast('Delete failed.'); }
  };

  const onSave = () => { setModal(null); load(); showToast('Menu item saved!'); };
  const filtered = activeCat?menu.filter(m=>m.category===activeCat):menu;

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,flexWrap:'wrap',gap:12}}>
        <h2 style={{fontFamily:'Playfair Display,serif',color:'var(--ocean)',fontSize:'1.8rem'}}>Menu Items ({menu.length})</h2>
        <div style={{display:'flex',gap:8}}>
          <select className="status-select" value={activeCat} onChange={e=>setActiveCat(e.target.value)}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c=><option key={c} value={c}>{CAT_ICON[c]} {c}</option>)}
          </select>
          <button className="btn btn-gold" onClick={()=>setModal({item:null})}>+ Add Item</button>
        </div>
      </div>

      {loading?<div className="loader"><div className="spinner"/></div>:(
        <div className="table-wrap">
          <table>
            <thead><tr><th>Photo</th><th>Name</th><th>Category</th><th>Price</th><th>Veg</th><th>Available</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.length===0
                ?<tr><td colSpan="7" className="empty-msg">No items found.</td></tr>
                :filtered.map(m=>(
                  <tr key={m.id}>
                    <td>
                      {m.image_url
                        ? <img src={`${API}${m.image_url}`} alt="" style={{width:44,height:44,borderRadius:8,objectFit:'cover'}}
                            onError={e=>{e.target.style.display='none'}}/>
                        : <div style={{width:44,height:44,borderRadius:8,background:'var(--sand)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.4rem'}}>{CAT_ICON[m.category]}</div>
                      }
                    </td>
                    <td>
                      <strong>{m.name}</strong>
                      <div style={{fontSize:'0.75rem',color:'var(--text-light)',marginTop:2}}>{m.description?.substring(0,50)}{m.description?.length>50?'...':''}</div>
                    </td>
                    <td><span className="badge badge-ocean">{CAT_ICON[m.category]} {m.category}</span></td>
                    <td><strong>${parseFloat(m.price).toFixed(2)}</strong></td>
                    <td>{m.is_vegetarian?'🌿 Yes':'—'}</td>
                    <td><span className={`badge ${m.is_available?'badge-green':'badge-red'}`}>{m.is_available?'Yes':'No'}</span></td>
                    <td>
                      <div className="action-btns">
                        <button className="btn btn-ghost btn-sm" onClick={()=>setModal({item:m})}>✏️ Edit & Photo</button>
                        <button className="btn btn-danger btn-sm" onClick={()=>del(m.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
      {modal&&<MenuModal item={modal.item} onClose={()=>setModal(null)} onSave={onSave}/>}
    </div>
  );
};

export default Menu;
