import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toRs, toRsNum, imgUrl, getImages, parseJSON } from '../utils';
import PaymentModal from './PaymentModal';
import './Rooms.css';

const BACKEND = 'http://localhost:5000';

const EXTRAS = [
  { value:'none',         label:'No meals',            costUsd:0  },
  { value:'breakfast',    label:'Breakfast',            costUsd:40 },
  { value:'lunch_dinner', label:'Lunch + Dinner',       costUsd:87 },
];

// ── Rooms Banner Slideshow ───────────────────────────────────
const RoomsBannerSlideshow = () => {
  const [bannerIdx, setBannerIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBannerIdx(prev => (prev + 1) % ROOM_BANNER_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handlePrevBanner = () => {
    setBannerIdx(prev => (prev - 1 + ROOM_BANNER_IMAGES.length) % ROOM_BANNER_IMAGES.length);
  };

  const handleNextBanner = () => {
    setBannerIdx(prev => (prev + 1) % ROOM_BANNER_IMAGES.length);
  };

  const handleBannerDotClick = (idx) => {
    setBannerIdx(idx);
  };

  return (
    <div className="rooms-banner">
      {/* Slideshow Images */}
      {ROOM_BANNER_IMAGES.map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt={`Room Banner ${idx + 1}`}
          className={`rooms-banner-img ${idx === bannerIdx ? 'active' : ''}`}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      ))}
      {/* Overlay */}
      <div className="rooms-banner-overlay"/>
      
      {/* Navigation Arrows */}
      <button className="rooms-banner-nav rooms-banner-prev" onClick={handlePrevBanner} title="Previous image">‹</button>
      <button className="rooms-banner-nav rooms-banner-next" onClick={handleNextBanner} title="Next image">›</button>
      
      {/* Indicator Dots */}
      <div className="rooms-banner-indicators">
        {ROOM_BANNER_IMAGES.map((_, idx) => (
          <button
            key={idx}
            className={`rooms-indicator-dot ${idx === bannerIdx ? 'active' : ''}`}
            onClick={() => handleBannerDotClick(idx)}
            title={`Go to image ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

// ── Room Card Image Slideshow ────────────────────────────────
const RoomCardSlideshow = ({ images, roomType }) => {
  const [idx, setIdx] = useState(0);
  const imgs = images.filter(Boolean);
  
  if (!imgs.length) return (
    <div className="img-placeholder room rl-img" style={{minHeight:260}}/>
  );
  
  return (
    <div className="room-slideshow-wrapper">
      <img 
        src={`${BACKEND}${imgs[idx]}`} 
        alt={roomType} 
        className="rl-img-photo"
        onError={e=>{e.target.onerror=null;e.target.parentElement.innerHTML='<div class="img-placeholder room rl-img" style="min-height:260px"></div>';}}
      />
      {imgs.length > 1 && (
        <>
          <button 
            className="slideshow-nav slideshow-prev" 
            onClick={(e)=>{e.stopPropagation();setIdx((idx-1+imgs.length)%imgs.length)}}
            title="Previous image"
          >
            ‹
          </button>
          <button 
            className="slideshow-nav slideshow-next" 
            onClick={(e)=>{e.stopPropagation();setIdx((idx+1)%imgs.length)}}
            title="Next image"
          >
            ›
          </button>
          <div className="slideshow-indicators">
            {imgs.map((_,i)=>(
              <button 
                key={i} 
                className={`indicator ${i===idx?'active':''}`} 
                onClick={(e)=>{e.stopPropagation();setIdx(i);}}
                title={`Image ${i+1}`}
              />
            ))}
          </div>
          <span className="img-count-badge">{idx+1}/{imgs.length}</span>
        </>
      )}
    </div>
  );
};

// ── Image Gallery for Detail Modal ──────────────────────────
const Gallery = ({ images, fallback='🏨' }) => {
  const [idx, setIdx] = useState(0);
  const imgs = images.filter(Boolean);
  if (!imgs.length) return (
    <div className="gallery-placeholder">{fallback}</div>
  );
  return (
    <div className="gallery">
      <img src={`${BACKEND}${imgs[idx]}`} alt="Room" className="gallery-main"
        onError={e=>{e.target.onerror=null; e.target.src='';e.target.parentElement.innerHTML=`<div class="gallery-placeholder">${fallback}</div>`;}}/>
      {imgs.length>1 && (
        <>
          <button className="gal-prev" onClick={()=>setIdx((idx-1+imgs.length)%imgs.length)}>‹</button>
          <button className="gal-next" onClick={()=>setIdx((idx+1)%imgs.length)}>›</button>
          <div className="gal-dots">
            {imgs.map((_,i)=><button key={i} className={`gal-dot ${i===idx?'active':''}`} onClick={()=>setIdx(i)}/>)}
          </div>
        </>
      )}
    </div>
  );
};

// ── Room Detail Modal ─────────────────────────────────────────
const RoomDetailModal = ({ room, onClose, onBook }) => {
  const images = getImages(room);
  const amenities = parseJSON(room.amenities);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="detail-modal" onClick={e=>e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <Gallery images={images} fallback="🏨"/>
        <div className="detail-body">
          <div className="detail-header">
            <div>
              <span className="badge badge-ocean">{room.room_type}</span>
              <h2>{room.room_type} Room — {room.view_type}</h2>
              <p className="detail-meta">Room {room.room_number} · Up to {room.max_guests} guests</p>
            </div>
            <div className="detail-price">
              <div className="price-lkr">{toRs(room.price_per_night)}</div>
              <div className="price-per">per night</div>
            </div>
          </div>
          <p className="detail-desc">{room.description}</p>
          {amenities.length>0 && (
            <div className="detail-amenities">
              <h4>Room Amenities</h4>
              <div className="amenity-grid">
                {amenities.map((a,i)=>(
                  <div key={i} className="amenity-item">
                    <span className="amenity-icon">✓</span> {a}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="detail-features">
            <div className="df-item">🌊 {room.view_type||'Beautiful View'}</div>
            <div className="df-item">👥 Max {room.max_guests} Guests</div>
            <div className="df-item">✅ Free Cancellation</div>
            <div className="df-item">📶 Free WiFi</div>
          </div>
          <button className="btn btn-gold detail-book-btn" onClick={()=>{onClose();onBook(room);}}>
            Book This Room — {toRs(room.price_per_night)}/night
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Booking Modal ─────────────────────────────────────────────
const BookingModal = ({ room, onClose, onBooked }) => {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const today      = new Date().toISOString().split('T')[0];
  const tomorrow   = new Date(Date.now()+86400000).toISOString().split('T')[0];
  const [form, setForm]     = useState({ check_in:today, check_out:tomorrow, guests:1, extras:'none', special_requests:'' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [booking, setBooking] = useState(null); // created booking for payment
  const [showPay, setShowPay] = useState(false);

  const nights    = Math.max(1,Math.ceil((new Date(form.check_out)-new Date(form.check_in))/86400000));
  const extraUsd  = EXTRAS.find(e=>e.value===form.extras)?.costUsd||0;
  const totalUsd  = parseFloat(room.price_per_night)*nights + extraUsd*nights;
  const totalLkr  = toRs(totalUsd);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setLoading(true); setError('');
    try {
      const res = await axios.post('/api/bookings', { room_id:room.id, ...form });
      // Create booking object for payment
      setBooking({
        id: res.data.id,
        room_type: room.room_type,
        room_number: room.room_number,
        check_in: form.check_in,
        check_out: form.check_out,
        total_price: totalUsd,
      });
      setShowPay(true);
    } catch(err) {
      setError(err.response?.data?.message||'Booking failed. Please try again.');
    } finally { setLoading(false); }
  };

  if (showPay && booking) return (
    <PaymentModal booking={booking} onClose={()=>{setShowPay(false);onBooked();}} onPaid={onBooked}/>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e=>e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>Book {room.room_type} Room</h2>
        <p className="modal-room-info">🌊 {room.view_type} · Room {room.room_number} · {toRs(room.price_per_night)}/night</p>
        {error&&<div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Check-In Date</label>
              <input type="date" className="form-control" value={form.check_in} min={today} required
                onChange={e=>setForm(p=>({...p,check_in:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Check-Out Date</label>
              <input type="date" className="form-control" value={form.check_out} min={form.check_in} required
                onChange={e=>setForm(p=>({...p,check_out:e.target.value}))}/></div>
          </div>
          <div className="form-group"><label className="form-label">Number of Guests</label>
            <select className="form-control" value={form.guests} onChange={e=>setForm(p=>({...p,guests:e.target.value}))}>
              {Array.from({length:room.max_guests||4},(_,i)=><option key={i+1} value={i+1}>{i+1} Guest{i>0?'s':''}</option>)}
            </select></div>
          <div className="form-group"><label className="form-label">Meal Package</label>
            <div className="extras-options">
              {EXTRAS.map(ext=>(
                <label key={ext.value} className={`extra-opt ${form.extras===ext.value?'selected':''}`}>
                  <input type="radio" name="extras" value={ext.value} checked={form.extras===ext.value}
                    onChange={e=>setForm(p=>({...p,extras:e.target.value}))}/>
                  <span>{ext.label}</span>
                  <span className="extra-cost">{ext.costUsd===0?'Free':toRs(ext.costUsd)+'/night'}</span>
                </label>
              ))}
            </div></div>
          <div className="form-group"><label className="form-label">Special Requests</label>
            <textarea className="form-control" rows="2" placeholder="Any special requests..."
              value={form.special_requests} onChange={e=>setForm(p=>({...p,special_requests:e.target.value}))}/></div>
          <div className="booking-summary">
            <div className="bs-row"><span>{nights} night{nights>1?'s':''} × {toRs(room.price_per_night)}</span><span>{toRs(parseFloat(room.price_per_night)*nights)}</span></div>
            {extraUsd>0&&<div className="bs-row"><span>Meals × {nights} nights</span><span>{toRs(extraUsd*nights)}</span></div>}
            <div className="bs-row total"><span>Total</span><strong>{totalLkr}</strong></div>
          </div>
          <button type="submit" className="btn btn-gold" style={{width:'100%',justifyContent:'center',marginTop:16}} disabled={loading}>
            {loading?'⏳ Processing...':user?`Proceed to Payment — ${totalLkr}`:'Login to Book'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ── Main Rooms Page ───────────────────────────────────────────
const Rooms = () => {
  const [rooms,        setRooms]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState('');
  const [viewRoom,     setViewRoom]     = useState(null);
  const [bookRoom,     setBookRoom]     = useState(null);
  const [success,      setSuccess]      = useState(false);

  useEffect(() => {
    axios.get('/api/rooms')
      .then(r=>setRooms(Array.isArray(r.data)?r.data:(r.data?.data||[])))
      .catch(()=>setRooms([]))
      .finally(()=>setLoading(false));
  }, []);

  const filtered = filter?rooms.filter(r=>r.room_type===filter):rooms;
  const handleBooked = () => { setBookRoom(null); setSuccess(true); setTimeout(()=>setSuccess(false),6000); };

  return (
    <div className="rooms-page">
      <div className="page-header">
        <div className="page-header-bg"/>
        <div className="container page-header-content">
          <p className="section-eyebrow">Accommodation</p>
          <h1>Rooms & Suites</h1>
          <p>Luxuriously appointed rooms with breathtaking views of the Indian Ocean</p>
        </div>
      </div>

      <div className="container" style={{padding:'48px 24px'}}>
        {success&&<div className="alert alert-success">🎉 Booking confirmed! Check your profile to view your reservation.</div>}

        <div className="rooms-filters">
          {['','Standard','Deluxe','Premier','Suite'].map(type=>(
            <button key={type} className={`filter-btn ${filter===type?'active':''}`} onClick={()=>setFilter(type)}>
              {type||'All Rooms'}
            </button>
          ))}
        </div>

        {loading?<div className="loader"><div className="spinner"/><p>Loading rooms...</p></div>:(
          <div className="rooms-list">
            {filtered.length===0
              ?<div style={{textAlign:'center',padding:60}}><p style={{fontSize:'2rem'}}>🔍</p><p>No rooms available.</p></div>
              :filtered.map(room=>{
                const images = getImages(room);
                const amenities = parseJSON(room.amenities);
                return (
                  <div className="room-listing-card card" key={room.id}>
                    {/* Image Slideshow */}
                    <div className="rl-img-wrap">
                      <RoomCardSlideshow images={images} roomType={room.room_type} />
                      <span className="room-type-badge badge badge-ocean">{room.room_type}</span>
                    </div>

                    {/* Details */}
                    <div className="rl-body">
                      <div className="rl-header">
                        <div>
                          <h2>{room.room_type} Room — {room.view_type}</h2>
                          <p className="rl-meta">Room {room.room_number} · Up to {room.max_guests} guests</p>
                        </div>
                        <div className="rl-price-box">
                          <div className="rl-price">{toRs(room.price_per_night)}</div>
                          <div className="rl-per">per night</div>
                        </div>
                      </div>

                      <p className="rl-desc">{room.description}</p>

                      <div className="rl-amenities">
                        {amenities.slice(0,4).map((a,i)=><span key={i} className="amenity-tag">✓ {a}</span>)}
                        {amenities.length>4&&<span className="amenity-tag">+{amenities.length-4} more</span>}
                      </div>

                      <div className="rl-footer">
                        <div className="rl-features">
                          <span>🌊 {room.view_type}</span>
                          <span>👥 Max {room.max_guests}</span>
                          <span>✅ Free cancellation</span>
                        </div>
                        <div style={{display:'flex',gap:10}}>
                          <button className="btn btn-outline" onClick={()=>setViewRoom(room)}>
                            🔍 View More
                          </button>
                          <button className="btn btn-gold" onClick={()=>setBookRoom(room)}>
                            Book Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {viewRoom&&<RoomDetailModal room={viewRoom} onClose={()=>setViewRoom(null)} onBook={r=>{setViewRoom(null);setBookRoom(r);}}/>}
      {bookRoom&&<BookingModal room={bookRoom} onClose={()=>setBookRoom(null)} onBooked={handleBooked}/>}
    </div>
  );
};

export default Rooms;
