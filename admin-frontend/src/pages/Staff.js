import React, { useEffect, useState } from 'react';
import axios from '../axiosConfig';
import ImageUploader from '../components/ImageUploader';

const API = 'http://localhost:5000';

const StaffModal = ({ member, onClose, onSave }) => {
  const blank = { name:'', position:'', department:'', email:'', phone:'', bio:'' };
  const [form,   setForm]   = useState(member||blank);
  const [imgUrl, setImgUrl] = useState(member?.image_url||null);
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState('');
  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  const handle = async (e) => {
    e.preventDefault(); setSaving(true); setErr('');
    try {
      if (member) await axios.put(`/api/staff/${member.id}`, form);
      else        await axios.post('/api/staff', form);
      onSave();
    } catch(e) { setErr(e.response?.data?.message||'Save failed.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e=>e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h3>{member?'Edit Staff Member':'Add Staff Member'}</h3>
        {err&&<div className="alert alert-error">{err}</div>}

        {/* Photo at top of modal */}
        <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:20,padding:16,background:'var(--sand)',borderRadius:12}}>
          {imgUrl
            ? <img src={`${API}${imgUrl}`} alt={form.name}
                style={{width:72,height:72,borderRadius:'50%',objectFit:'cover',border:'3px solid white',boxShadow:'0 2px 8px rgba(0,0,0,0.1)'}}
                onError={e=>{e.target.style.display='none'}}/>
            : <div style={{width:72,height:72,borderRadius:'50%',background:'var(--ocean)',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.8rem',fontWeight:700,flexShrink:0}}>
                {form.name?form.name[0].toUpperCase():'👤'}
              </div>
          }
          <div>
            <strong style={{display:'block'}}>{form.name||'New Staff Member'}</strong>
            <span style={{color:'var(--text-light)',fontSize:'0.85rem'}}>{form.position||'Position not set'}</span>
          </div>
        </div>

        <form onSubmit={handle}>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Full Name *</label>
              <input className="form-control" value={form.name} onChange={e=>f('name',e.target.value)} required/></div>
            <div className="form-group"><label className="form-label">Position *</label>
              <input className="form-control" value={form.position} onChange={e=>f('position',e.target.value)} required/></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Department *</label>
              <input className="form-control" value={form.department} onChange={e=>f('department',e.target.value)} required/></div>
            <div className="form-group"><label className="form-label">Email</label>
              <input className="form-control" type="email" value={form.email||''} onChange={e=>f('email',e.target.value)}/></div>
          </div>
          <div className="form-group"><label className="form-label">Phone</label>
            <input className="form-control" value={form.phone||''} onChange={e=>f('phone',e.target.value)}/></div>
          <div className="form-group"><label className="form-label">Bio</label>
            <textarea className="form-control" rows="3" value={form.bio||''} onChange={e=>f('bio',e.target.value)}/></div>
          <button type="submit" className="btn btn-primary" style={{width:'100%',justifyContent:'center',marginTop:8}} disabled={saving}>
            {saving?'Saving...':(member?'Update Staff':'Add Staff')}</button>
        </form>

        {/* Photo upload */}
        {member && (
          <ImageUploader
            label="Staff Photo (1 image)"
            uploadUrl={`/api/upload/staff/${member.id}`}
            deleteUrl={`/api/upload/staff/${member.id}/image`}
            existingImages={imgUrl?[imgUrl]:[]}
            multiple={false}
            maxFiles={1}
            onSuccess={updated => setImgUrl(updated[0]||null)}
          />
        )}
        {!member&&<p style={{fontSize:'0.8rem',color:'var(--text-light)',marginTop:12,textAlign:'center'}}>💡 Save staff member first, then upload photo.</p>}
      </div>
    </div>
  );
};

const Staff = ({ showToast }) => {
  const [staff,   setStaff]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null);

  const load = () => {
    setLoading(true);
    axios.get('/api/staff')
      .then(r=>setStaff(Array.isArray(r.data)?r.data:[]))
      .catch(console.error).finally(()=>setLoading(false));
  };
  useEffect(load, []);

  const del = async (id) => {
    if (!window.confirm('Remove this staff member?')) return;
    try {
      await axios.delete(`/api/staff/${id}`);
      setStaff(prev=>prev.filter(s=>s.id!==id));
      showToast('Staff removed.');
    } catch { showToast('Delete failed.'); }
  };

  const onSave = () => { setModal(null); load(); showToast('Staff saved!'); };

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <h2 style={{fontFamily:'Playfair Display,serif',color:'var(--ocean)',fontSize:'1.8rem'}}>Staff ({staff.length})</h2>
        <button className="btn btn-gold" onClick={()=>setModal({member:null})}>+ Add Staff</button>
      </div>

      {loading?<div className="loader"><div className="spinner"/></div>:(
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:20}}>
          {staff.length===0
            ?<p className="empty-msg">No staff members found.</p>
            :staff.map(s=>(
              <div key={s.id} className="card" style={{overflow:'hidden'}}>
                {/* Photo */}
                <div style={{height:160,background:'linear-gradient(135deg,var(--ocean),var(--ocean-light,#4a9ab8))',position:'relative',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  {s.image_url
                    ? <img src={`${API}${s.image_url}`} alt={s.name}
                        style={{width:'100%',height:'100%',objectFit:'cover',position:'absolute',inset:0}}
                        onError={e=>{e.target.style.display='none'}}/>
                    : <div style={{fontSize:'3.5rem',opacity:0.4}}>👤</div>
                  }
                </div>
                <div style={{padding:16}}>
                  <strong style={{fontSize:'1rem'}}>{s.name}</strong>
                  <p style={{color:'var(--ocean)',fontSize:'0.85rem',fontWeight:600,marginTop:4}}>{s.position}</p>
                  <p style={{color:'var(--text-light)',fontSize:'0.78rem'}}>{s.department}</p>
                  {s.email&&<p style={{color:'var(--text-mid)',fontSize:'0.78rem',marginTop:4}}>✉️ {s.email}</p>}
                  {s.phone&&<p style={{color:'var(--text-mid)',fontSize:'0.78rem'}}>📞 {s.phone}</p>}
                  {s.bio  &&<p style={{color:'var(--text-mid)',fontSize:'0.8rem',marginTop:6,lineHeight:1.5}}>{s.bio.substring(0,80)}{s.bio.length>80?'...':''}</p>}
                  <div className="action-btns" style={{marginTop:12}}>
                    <button className="btn btn-ghost btn-sm" onClick={()=>setModal({member:s})}>✏️ Edit & Photo</button>
                    <button className="btn btn-danger btn-sm" onClick={()=>del(s.id)}>🗑️</button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
      {modal&&<StaffModal member={modal.member} onClose={()=>setModal(null)} onSave={onSave}/>}
    </div>
  );
};

export default Staff;
