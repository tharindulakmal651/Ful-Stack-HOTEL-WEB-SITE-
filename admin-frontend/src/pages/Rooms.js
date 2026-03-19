import React, { useEffect, useState } from 'react';
import axios from '../axiosConfig';
import ImageUploader from '../components/ImageUploader';

const TYPES = ['Standard','Deluxe','Premier','Suite'];
const API = 'http://localhost:5000';

const RoomModal = ({ room, onClose, onSave }) => {
  const blank = { room_number:'', room_type:'Standard', view_type:'', price_per_night:'', max_guests:2, description:'', amenities:'', is_available:true };
  const [form, setForm] = useState(room
    ? { ...room, amenities: Array.isArray(room.amenities) ? room.amenities.join(', ') : (room.amenities||'') }
    : blank);
  const [images, setImages]   = useState(() => {
    if (!room) return [];
    try { return JSON.parse(room.image_urls||'[]'); } catch { return room.image_url ? [room.image_url] : []; }
  });
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState('');
  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  const handle = async (e) => {
    e.preventDefault(); setSaving(true); setErr('');
    try {
      const payload = { ...form,
        amenities: form.amenities.split(',').map(a=>a.trim()).filter(Boolean),
        price_per_night: parseFloat(form.price_per_night),
        max_guests: parseInt(form.max_guests),
      };
      if (room) await axios.put(`/api/rooms/${room.id}`, payload);
      else      await axios.post('/api/rooms', payload);
      onSave();
    } catch(e) { setErr(e.response?.data?.message||'Save failed.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e=>e.stopPropagation()} style={{maxWidth:600}}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h3>{room?'Edit Room':'Add New Room'}</h3>
        {err && <div className="alert alert-error">{err}</div>}
        <form onSubmit={handle}>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Room Number *</label>
              <input className="form-control" value={form.room_number} onChange={e=>f('room_number',e.target.value)} required/></div>
            <div className="form-group"><label className="form-label">Room Type *</label>
              <select className="form-control" value={form.room_type} onChange={e=>f('room_type',e.target.value)}>
                {TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">View Type</label>
              <input className="form-control" placeholder="Sea View" value={form.view_type} onChange={e=>f('view_type',e.target.value)}/></div>
            <div className="form-group"><label className="form-label">Price / Night (LKR) *</label>
              <input className="form-control" type="number" min="1" step="0.01" value={form.price_per_night} onChange={e=>f('price_per_night',e.target.value)} required/></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Max Guests</label>
              <input className="form-control" type="number" min="1" max="10" value={form.max_guests} onChange={e=>f('max_guests',e.target.value)}/></div>
            <div className="form-group"><label className="form-label">Available</label>
              <select className="form-control" value={form.is_available} onChange={e=>f('is_available',e.target.value==='true')}>
                <option value="true">Yes</option><option value="false">No</option></select></div>
          </div>
          <div className="form-group"><label className="form-label">Description</label>
            <textarea className="form-control" rows="2" value={form.description} onChange={e=>f('description',e.target.value)}/></div>
          <div className="form-group"><label className="form-label">Amenities (comma separated)</label>
            <input className="form-control" placeholder="WiFi, AC, TV, Mini Bar" value={form.amenities} onChange={e=>f('amenities',e.target.value)}/></div>

          <button type="submit" className="btn btn-primary" style={{width:'100%',justifyContent:'center',marginTop:8}} disabled={saving}>
            {saving?'Saving...':(room?'Update Room':'Add Room')}</button>
        </form>

        {/* Image upload — only shown after room is saved */}
        {room && (
          <ImageUploader
            label={`Room Photos (${images.length}/4)`}
            uploadUrl={`/api/upload/room/${room.id}`}
            deleteUrl={`/api/upload/room/${room.id}/image`}
            existingImages={images}
            multiple={true}
            maxFiles={4}
            onSuccess={updated => setImages(updated)}
          />
        )}
        {!room && (
          <p style={{fontSize:'0.8rem',color:'var(--text-light)',marginTop:12,textAlign:'center'}}>
            💡 Save the room first, then upload photos by editing it.
          </p>
        )}
      </div>
    </div>
  );
};

const Rooms = ({ showToast }) => {
  const [rooms,   setRooms]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null);
  const [filter,  setFilter]  = useState('');

  const load = () => {
    setLoading(true);
    axios.get('/api/rooms/all')
      .then(r=>setRooms(Array.isArray(r.data)?r.data:(r.data?.data||[])))
      .catch(console.error).finally(()=>setLoading(false));
  };
  useEffect(load, []);

  const toggleAvail = async (id, current) => {
    try {
      await axios.patch(`/api/rooms/${id}/availability`, { is_available: !current });
      setRooms(prev=>prev.map(r=>r.id===id?{...r,is_available:!current}:r));
      showToast(`Room ${!current?'enabled':'disabled'}.`);
    } catch { showToast('Update failed.'); }
  };

  const deleteRoom = async (id) => {
    if (!window.confirm('Delete this room?')) return;
    try {
      await axios.delete(`/api/rooms/${id}`);
      setRooms(prev=>prev.filter(r=>r.id!==id));
      showToast('Room deleted.');
    } catch(e) { showToast(e.response?.data?.message||'Cannot delete.'); }
  };

  const onSave = () => { setModal(null); load(); showToast('Room saved!'); };
  const filtered = filter?rooms.filter(r=>r.room_type===filter):rooms;

  const getImages = (room) => {
    try { return JSON.parse(room.image_urls||'[]'); } catch { return room.image_url?[room.image_url]:[]; }
  };

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20,flexWrap:'wrap',gap:12}}>
        <h2 style={{fontFamily:'Playfair Display,serif',color:'var(--ocean)',fontSize:'1.8rem'}}>Rooms ({rooms.length})</h2>
        <div style={{display:'flex',gap:8}}>
          <select className="status-select" value={filter} onChange={e=>setFilter(e.target.value)}>
            <option value="">All Types</option>{TYPES.map(t=><option key={t}>{t}</option>)}
          </select>
          <button className="btn btn-gold" onClick={()=>setModal({room:null})}>+ Add Room</button>
        </div>
      </div>

      {loading?<div className="loader"><div className="spinner"/></div>:(
        <div className="table-wrap">
          <table>
            <thead><tr><th>Photos</th><th>Room#</th><th>Type</th><th>View</th><th>Price/Night</th><th>Guests</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.length===0
                ?<tr><td colSpan="8" className="empty-msg">No rooms found.</td></tr>
                :filtered.map(r=>{
                  const imgs = getImages(r);
                  const amenities = Array.isArray(r.amenities)?r.amenities:(r.amenities?JSON.parse(r.amenities):[]);
                  return (
                    <tr key={r.id}>
                      <td>
                        <div style={{display:'flex',gap:4}}>
                          {imgs.length>0
                            ? imgs.slice(0,2).map((url,i)=>(
                              <img key={i} src={`${API}${url}`} alt="" style={{width:40,height:40,borderRadius:6,objectFit:'cover'}}
                                onError={e=>{e.target.style.display='none'}}/>
                            ))
                            : <div style={{width:40,height:40,borderRadius:6,background:'var(--sand)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2rem'}}>🏨</div>
                          }
                          {imgs.length>2&&<span style={{fontSize:'0.75rem',color:'var(--text-light)',alignSelf:'center'}}>+{imgs.length-2}</span>}
                        </div>
                      </td>
                      <td><strong>{r.room_number}</strong></td>
                      <td>{r.room_type}</td>
                      <td>{r.view_type||'—'}</td>
                      <td><strong>LKR {parseFloat(r.price_per_night).toFixed(2)}</strong></td>
                      <td>{r.max_guests}</td>
                      <td><span className={`badge ${r.is_available?'badge-green':'badge-red'}`}>{r.is_available?'Available':'Unavailable'}</span></td>
                      <td>
                        <div className="action-btns">
                          <button className="btn btn-ghost btn-sm" onClick={()=>setModal({room:r})}>✏️ Edit</button>
                          <button className="btn btn-sm" style={{background:r.is_available?'#e17055':'#00b894',color:'white'}}
                            onClick={()=>toggleAvail(r.id,r.is_available)}>{r.is_available?'🔒':'✅'}</button>
                          <button className="btn btn-danger btn-sm" onClick={()=>deleteRoom(r.id)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}

      {modal&&<RoomModal room={modal.room} onClose={()=>setModal(null)} onSave={onSave}/>}
    </div>
  );
};

export default Rooms;
