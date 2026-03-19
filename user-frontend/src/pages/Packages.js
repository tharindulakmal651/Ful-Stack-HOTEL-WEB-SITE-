import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { useLocation } from 'react-router-dom';
import { toRs, imgUrl, getImages, parseJSON } from '../utils';
import './Packages.css';

const BACKEND = 'http://localhost:5000';
const TYPE_LABELS = { 'day-out':'Day Out', wedding:'Wedding', honeymoon:'Honeymoon' };
const TYPE_ICONS  = { 'day-out':'🌅', wedding:'💒', honeymoon:'🌹' };

// ── Image Gallery (same as Rooms) ─────────────────────────────
const Gallery = ({ images, fallback='🎁' }) => {
  const [idx, setIdx] = useState(0);
  const imgs = images.filter(Boolean);
  if (!imgs.length) return <div className="pkg-gallery-placeholder">{fallback}</div>;
  return (
    <div className="pkg-gallery">
      <img src={`${BACKEND}${imgs[idx]}`} alt="Package"
        onError={e=>{e.target.onerror=null;e.target.parentElement.innerHTML=`<div class="pkg-gallery-placeholder">${fallback}</div>`;}}/>
      {imgs.length>1&&(
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

// ── Package Detail Modal ──────────────────────────────────────
const PackageDetailModal = ({ pkg, onClose }) => {
  const images   = getImages(pkg);
  const includes = parseJSON(pkg.includes);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="detail-modal" onClick={e=>e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <Gallery images={images} fallback={TYPE_ICONS[pkg.type]||'🎁'}/>
        <div className="detail-body">
          <div className="detail-header">
            <div>
              <span className="badge badge-ocean">{pkg.type}</span>
              {pkg.duration&&<span className="pkg-duration" style={{marginLeft:8}}>⏱ {pkg.duration}</span>}
              <h2 style={{marginTop:8}}>{pkg.name}</h2>
            </div>
            <div className="detail-price">
              <div className="price-lkr">{toRs(pkg.price)}</div>
              <div className="price-per">{pkg.type==='day-out'?'per person':'per package'}</div>
            </div>
          </div>
          <p className="detail-desc">{pkg.description}</p>
          {includes.length>0&&(
            <div className="detail-amenities">
              <h4>What's Included</h4>
              <div className="includes-grid">
                {includes.map((item,i)=>(
                  <div key={i} className="include-item">
                    <span style={{color:'#00b894',fontWeight:700}}>✓</span> {item}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{marginTop:20,display:'flex',gap:12}}>
            <a href="/contact" className="btn btn-gold" style={{flex:1,justifyContent:'center',textDecoration:'none'}}>
              📞 Enquire Now
            </a>
            <a href="tel:+94912223456" className="btn btn-outline" style={{flex:1,justifyContent:'center',textDecoration:'none'}}>
              Call Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Packages Page ────────────────────────────────────────
const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [viewPkg,  setViewPkg]  = useState(null);
  const location = useLocation();
  const params   = new URLSearchParams(location.search);
  const [activeType, setActiveType] = useState(params.get('type')||'');

  useEffect(()=>{
    axios.get('/api/packages')
      .then(r=>setPackages(Array.isArray(r.data)?r.data:(r.data?.data||[])))
      .catch(()=>setPackages([]))
      .finally(()=>setLoading(false));
  },[]);

  const filtered = activeType?packages.filter(p=>p.type===activeType):packages;

  return (
    <div className="packages-page">
      <div className="page-header">
        <div className="page-header-bg"/>
        <div className="container page-header-content">
          <p className="section-eyebrow">Special Experiences</p>
          <h1>Hotel Packages & Offers</h1>
          <p>Curated experiences designed to make your stay truly unforgettable</p>
        </div>
      </div>

      <div className="container" style={{padding:'48px 24px'}}>
        <div className="pkg-type-tabs">
          <button className={`pkg-tab ${activeType===''?'active':''}`} onClick={()=>setActiveType('')}>🏖️ All Packages</button>
          {['day-out','wedding','honeymoon'].map(type=>(
            <button key={type} className={`pkg-tab ${activeType===type?'active':''}`} onClick={()=>setActiveType(type)}>
              {TYPE_ICONS[type]} {TYPE_LABELS[type]}
            </button>
          ))}
        </div>

        {loading?<div className="loader"><div className="spinner"/></div>:
          filtered.length===0?<div style={{textAlign:'center',padding:80}}><p style={{fontSize:'3rem'}}>📦</p><p>No packages found.</p></div>:(
          <>
            {['day-out','wedding','honeymoon'].map(type=>{
              const items = filtered.filter(p=>p.type===type);
              if (!items.length) return null;
              return (
                <div className="pkg-section" key={type}>
                  <div className="pkg-section-header">
                    <span className="pkg-section-icon">{TYPE_ICONS[type]}</span>
                    <div>
                      <h2>{TYPE_LABELS[type]} Packages</h2>
                      <p>{type==='day-out'&&'Perfect for day visitors wanting a taste of resort life'}
                         {type==='wedding'&&'Say your vows against the backdrop of the Indian Ocean'}
                         {type==='honeymoon'&&'Begin your forever together in paradise'}</p>
                    </div>
                  </div>

                  <div className="pkg-cards-grid">
                    {items.map(pkg=>{
                      const images   = getImages(pkg);
                      const includes = parseJSON(pkg.includes);
                      const mainImg  = images[0];
                      return (
                        <div className="pkg-detail-card card" key={pkg.id}>
                          {/* Image */}
                          <div className="pkg-card-img-wrap">
                            {mainImg
                              ?<img src={`${BACKEND}${mainImg}`} alt={pkg.name} className="pkg-card-img"
                                  onError={e=>{e.target.onerror=null;e.target.parentElement.innerHTML=`<div class="img-placeholder pkg pkg-img"></div>`;}}/>
                              :<div className="img-placeholder pkg pkg-img"/>
                            }
                            <div className="pkg-overlay">
                              <div className="pkg-overlay-type">{TYPE_ICONS[pkg.type]} {TYPE_LABELS[pkg.type]}</div>
                            </div>
                            {images.length>1&&<span className="img-count">📷 {images.length}</span>}
                          </div>

                          {/* Body */}
                          <div className="pkg-detail-body">
                            <div className="pkg-detail-header">
                              <h3>{pkg.name}</h3>
                              {pkg.duration&&<span className="pkg-duration">⏱ {pkg.duration}</span>}
                            </div>
                            <p>{pkg.description?.substring(0,100)}{pkg.description?.length>100?'...':''}</p>

                            {includes.length>0&&(
                              <div className="pkg-includes">
                                <strong>Includes:</strong>
                                <ul>{includes.slice(0,4).map((item,i)=><li key={i}>✓ {item}</li>)}</ul>
                                {includes.length>4&&<p style={{fontSize:'0.78rem',color:'var(--text-light)',marginTop:4}}>+{includes.length-4} more inclusions</p>}
                              </div>
                            )}

                            <div className="pkg-card-footer">
                              <div className="pkg-price-display">
                                <span>Starting from</span>
                                <strong>{toRs(pkg.price)}</strong>
                                <small>{pkg.type==='day-out'?'per person':'per package'}</small>
                              </div>
                              <button className="btn btn-gold" onClick={()=>setViewPkg(pkg)}>
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      <div className="pkg-enquiry-banner">
        <div className="container text-center">
          <h2>Looking for Something Custom?</h2>
          <p>Our team can create a bespoke package tailored exactly to your needs.</p>
          <div style={{display:'flex',gap:16,justifyContent:'center',flexWrap:'wrap'}}>
            <a href="tel:+94912223456" className="btn btn-gold">📞 Call Us</a>
            <a href="/contact"         className="btn btn-outline-white">✉️ Email Us</a>
          </div>
        </div>
      </div>

      {viewPkg&&<PackageDetailModal pkg={viewPkg} onClose={()=>setViewPkg(null)}/>}
    </div>
  );
};

export default Packages;
