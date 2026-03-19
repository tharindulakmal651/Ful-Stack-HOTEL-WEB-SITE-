import React, { useEffect, useState } from 'react';
import axios from '../axiosConfig';
import ImageUploader from '../components/ImageUploader';

const TYPES = ['day-out','wedding','honeymoon'];
const API = 'http://localhost:5000';

const PkgModal = ({ pkg, onClose, onSave }) => {
  const blank = { name:'', type:'day-out', price:'', description:'', includes:'', duration:'' };
  const [form,   setForm]   = useState(pkg
    ? {...pkg, includes: Array.isArray(pkg.includes)?pkg.includes.join('\n'):(pkg.includes||'')}
    : blank);
  const [images, setImages] = useState(() => {
    if (!pkg) return [];
    try { return JSON.parse(pkg.image_urls||'[]'); } catch { return pkg.image_url?[pkg.image_url]:[]; }
  });
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState('');
  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  const handle = async (e) => {
    e.preventDefault(); setSaving(true); setErr('');
    try {
      const payload = {...form,
        includes: form.includes.split('\n').map(s=>s.trim()).filter(Boolean),
        price: parseFloat(form.price),
      };
      if (pkg) await axios.put(`/api/packages/${pkg.id}`, payload);
      else     await axios.post('/api/packages', payload);
      onSave();
    } catch(e) { setErr(e.response?.data?.message||'Save failed.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e=>e.stopPropagation()} style={{maxWidth:600}}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h3>{pkg?'Edit Package':'Add Package'}</h3>
        {err&&<div className="alert alert-error">{err}</div>}

        <form onSubmit={handle}>
          <div className="form-group"><label className="form-label">Package Name *</label>
            <input className="form-control" value={form.name} onChange={e=>f('name',e.target.value)} required/></div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Type *</label>
              <select className="form-control" value={form.type} onChange={e=>f('type',e.target.value)}>
                {TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Price (LKR) *</label>
              <input className="form-control" type="number" min="0" step="0.01" value={form.price} onChange={e=>f('price',e.target.value)} required/></div>
          </div>
          <div className="form-group"><label className="form-label">Duration</label>
            <input className="form-control" placeholder="e.g. 3 nights" value={form.duration} onChange={e=>f('duration',e.target.value)}/></div>
          <div className="form-group"><label className="form-label">Description *</label>
            <textarea className="form-control" rows="2" value={form.description} onChange={e=>f('description',e.target.value)} required/></div>
          <div className="form-group"><label className="form-label">Includes (one per line)</label>
            <textarea className="form-control" rows="5" placeholder="Beach Access&#10;Lunch Buffet" value={form.includes} onChange={e=>f('includes',e.target.value)}/></div>
          <button type="submit" className="btn btn-primary" style={{width:'100%',justifyContent:'center',marginTop:8}} disabled={saving}>
            {saving?'Saving...':(pkg?'Update Package':'Add Package')}</button>
        </form>

        {/* Image upload section */}
        {pkg && (
          <ImageUploader
            label={`Package Photos (${images.length}/4)`}
            uploadUrl={`/api/upload/package/${pkg.id}`}
            deleteUrl={`/api/upload/package/${pkg.id}/image`}
            existingImages={images}
            multiple={true}
            maxFiles={4}
            onSuccess={updated => setImages(updated)}
          />
        )}
        {!pkg&&<p style={{fontSize:'0.8rem',color:'var(--text-light)',marginTop:12,textAlign:'center'}}>💡 Save the package first, then upload photos.</p>}
      </div>
    </div>
  );
};

const Packages = ({ showToast }) => {
  const [packages, setPackages] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(null);
  const [filter,   setFilter]   = useState('');

  const load = () => {
    setLoading(true);
    axios.get('/api/packages/all')
      .then(r=>setPackages(Array.isArray(r.data)?r.data:(r.data?.data||[])))
      .catch(console.error).finally(()=>setLoading(false));
  };
  useEffect(load, []);

  const toggle = async (id) => {
    try {
      await axios.patch(`/api/packages/${id}/toggle`);
      setPackages(prev=>prev.map(p=>p.id===id?{...p,is_active:!p.is_active}:p));
      showToast('Package status toggled.');
    } catch { showToast('Toggle failed.'); }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this package?')) return;
    try {
      await axios.delete(`/api/packages/${id}`);
      setPackages(prev=>prev.filter(p=>p.id!==id));
      showToast('Package deleted.');
    } catch { showToast('Delete failed.'); }
  };

  const onSave = () => { setModal(null); load(); showToast('Package saved!'); };
  const filtered = filter?packages.filter(p=>p.type===filter):packages;

  const getImages = (p) => {
    try { return JSON.parse(p.image_urls||'[]'); } catch { return p.image_url?[p.image_url]:[]; }
  };

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,flexWrap:'wrap',gap:12}}>
        <h2 style={{fontFamily:'Playfair Display,serif',color:'var(--ocean)',fontSize:'1.8rem'}}>Packages ({packages.length})</h2>
        <div style={{display:'flex',gap:8}}>
          <select className="status-select" value={filter} onChange={e=>setFilter(e.target.value)}>
            <option value="">All Types</option>{TYPES.map(t=><option key={t}>{t}</option>)}
          </select>
          <button className="btn btn-gold" onClick={()=>setModal({pkg:null})}>+ Add Package</button>
        </div>
      </div>

      {loading?<div className="loader"><div className="spinner"/></div>:(
        <div className="table-wrap">
          <table>
            <thead><tr><th>Photos</th><th>Name</th><th>Type</th><th>Price</th><th>Duration</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.length===0
                ?<tr><td colSpan="7" className="empty-msg">No packages found.</td></tr>
                :filtered.map(p=>{
                  const imgs = getImages(p);
                  const includes = Array.isArray(p.includes)?p.includes:(p.includes?JSON.parse(p.includes):[]);
                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{display:'flex',gap:4}}>
                          {imgs.length>0
                            ? imgs.slice(0,2).map((url,i)=>(
                              <img key={i} src={`${API}${url}`} alt="" style={{width:40,height:40,borderRadius:6,objectFit:'cover'}}
                                onError={e=>{e.target.style.display='none'}}/>
                            ))
                            : <div style={{width:40,height:40,borderRadius:6,background:'var(--sand)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2rem'}}>🎁</div>
                          }
                          {imgs.length>2&&<span style={{fontSize:'0.75rem',color:'var(--text-light)',alignSelf:'center'}}>+{imgs.length-2}</span>}
                        </div>
                      </td>
                      <td><strong>{p.name}</strong><div style={{fontSize:'0.75rem',color:'var(--text-light)'}}>{includes.slice(0,2).join(', ')}</div></td>
                      <td><span className="badge badge-ocean">{p.type}</span></td>
                      <td><strong>LKR {parseFloat(p.price).toFixed(2)}</strong></td>
                      <td>{p.duration||'—'}</td>
                      <td><span className={`badge ${p.is_active?'badge-green':'badge-gray'}`}>{p.is_active?'Active':'Inactive'}</span></td>
                      <td>
                        <div className="action-btns">
                          <button className="btn btn-ghost btn-sm" onClick={()=>setModal({pkg:p})}>✏️ Edit</button>
                          <button className="btn btn-sm" style={{background:p.is_active?'#636e72':'#00b894',color:'white'}} onClick={()=>toggle(p.id)}>
                            {p.is_active?'Disable':'Enable'}</button>
                          <button className="btn btn-danger btn-sm" onClick={()=>del(p.id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}
      {modal&&<PkgModal pkg={modal.pkg} onClose={()=>setModal(null)} onSave={onSave}/>}
    </div>
  );
};

export default Packages;
