import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../axiosConfig';
import { toRs, getImages } from '../utils';
import './Home.css';

const BACKEND = 'http://localhost:5000';

// ── Banner Slideshow Images ──────────────────────────────────
const BANNER_IMAGES = [
  'https://tse4.mm.bing.net/th/id/OIP.cC3kmdloZvsOp7FsajYTwQHaFJ?rs=1&pid=ImgDetMain&o=7&rm=3',
  'https://tse1.mm.bing.net/th/id/OIP.-MkhfGp5eawdIS4krtbqOQHaE8?rs=1&pid=ImgDetMain&o=7&rm=3',
  'https://www.bing.com/th/id/OIP.35lwSZF_u9cHODYhcKuzewHaEK?w=294&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
  'https://maraviyainfotech.com/projects/luxurious-html-v22/luxurious-html/assets/img/gallery/gallery_img_9.jpg'
];

const Home = () => {
  const [rooms,    setRooms]    = useState([]);
  const [packages, setPackages] = useState([]);
  const [bannerIdx, setBannerIdx] = useState(0);
  const [bannerImageLoaded, setBannerImageLoaded] = useState(false);

  // Auto-rotate banner images every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setBannerIdx(prev => (prev + 1) % BANNER_IMAGES.length);
      setBannerImageLoaded(false);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    axios.get('/api/rooms')
      .then(r => { const list = Array.isArray(r.data) ? r.data : (r.data?.data || []); setRooms(list.slice(0,3)); })
      .catch(() => setRooms([]));
    axios.get('/api/packages')
      .then(r => { const list = Array.isArray(r.data) ? r.data : (r.data?.data || []); setPackages(list.slice(0,3)); })
      .catch(() => setPackages([]));
  }, []);

  const handlePrevBanner = () => {
    setBannerIdx(prev => (prev - 1 + BANNER_IMAGES.length) % BANNER_IMAGES.length);
    setBannerImageLoaded(false);
  };

  const handleNextBanner = () => {
    setBannerIdx(prev => (prev + 1) % BANNER_IMAGES.length);
    setBannerImageLoaded(false);
  };

  const handleBannerDotClick = (idx) => {
    setBannerIdx(idx);
    setBannerImageLoaded(false);
  };

  return (
    <div className="home">
      {/* HERO BANNER SLIDESHOW */}
      <section className="hero">
        <div className="hero-banner">
          {/* Slideshow Images */}
          {BANNER_IMAGES.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`Banner ${idx + 1}`}
              className={`hero-banner-img ${idx === bannerIdx ? 'active' : ''}`}
              onLoad={() => idx === bannerIdx && setBannerImageLoaded(true)}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ))}
          {/* Fallback/Overlay */}
          <div className="hero-banner-overlay"/>
          
          {/* Navigation Arrows */}
          <button className="banner-nav banner-prev" onClick={handlePrevBanner} title="Previous image">‹</button>
          <button className="banner-nav banner-next" onClick={handleNextBanner} title="Next image">›</button>
          
          {/* Indicator Dots */}
          <div className="banner-indicators">
            {BANNER_IMAGES.map((_, idx) => (
              <button
                key={idx}
                className={`indicator-dot ${idx === bannerIdx ? 'active' : ''}`}
                onClick={() => handleBannerDotClick(idx)}
                title={`Go to image ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="hero-content container">
          <p className="hero-tagline">Welcome to Unawatuna, Sri Lanka</p>
          <h1 className="hero-title">Where You Meet<br/><em>The Sea All Year</em></h1>
          <p className="hero-desc">Nestled on a pristine white-sand beach, Araliya Beach Resort & Spa offers an unforgettable luxury escape with world-class dining, rejuvenating spa treatments, and breathtaking ocean views.</p>
          <div className="hero-actions">
            <Link to="/rooms"    className="btn btn-gold">Explore Rooms</Link>
            <Link to="/packages" className="btn btn-outline-white">View Packages</Link>
          </div>
          <div className="hero-stats">
            <div className="stat"><strong>★ 8.0</strong><span>Very Good</span></div>
            <div className="stat-divider"/>
            <div className="stat"><strong>35+</strong><span>Reviews</span></div>
            <div className="stat-divider"/>
            <div className="stat"><strong>20+</strong><span>Years Experience</span></div>
          </div>
        </div>
        <div className="hero-scroll-hint"><span>Scroll to explore</span><div className="scroll-line"/></div>
      </section>

      {/* QUICK BOOKING STRIP */}
      <section className="booking-strip">
        <div className="container">
          <form className="booking-form" onSubmit={e => { e.preventDefault(); window.location.href='/rooms'; }}>
            <div className="bf-group"><label>Check-In</label><input type="date" className="form-control" min={new Date().toISOString().split('T')[0]}/></div>
            <div className="bf-divider"/>
            <div className="bf-group"><label>Check-Out</label><input type="date" className="form-control" min={new Date().toISOString().split('T')[0]}/></div>
            <div className="bf-divider"/>
            <div className="bf-group"><label>Guests</label>
              <select className="form-control"><option>1 Guest</option><option>2 Guests</option><option>3 Guests</option><option>4 Guests</option></select>
            </div>
            <div className="bf-divider"/>
            <div className="bf-group"><label>Room Type</label>
              <select className="form-control"><option value="">Any</option><option>Standard</option><option>Deluxe</option><option>Premier</option><option>Suite</option></select>
            </div>
            <Link to="/rooms" className="btn btn-ocean bf-btn">Check Availability</Link>
          </form>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section features-section">
        <div className="container">
          <div className="features-grid">
            {[
              { icon:'🏖️', title:'Private Beach',    desc:'Step directly onto our exclusive white-sand beach with sun loungers and water sports.' },
              { icon:'🛁', title:'Luxury Spa',       desc:'Rejuvenate with Ayurvedic treatments, couples massages, and wellness rituals.' },
              { icon:'🍽️', title:'Fine Dining',      desc:'Savor exquisite cuisine at our beachfront restaurant with local and international flavors.' },
              { icon:'🏊', title:'Infinity Pools',   desc:'Two stunning outdoor pools blending seamlessly with the horizon.' },
              { icon:'💒', title:'Wedding Venue',    desc:'Celebrate your special day with a magical beachfront wedding ceremony.' },
              { icon:'🌅', title:'Sea View Rooms',   desc:'Wake up to panoramic ocean views from your private balcony.' },
            ].map((f,i) => (
              <div className="feature-card" key={i}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROOMS PREVIEW */}
      <section className="section rooms-preview">
        <div className="container">
          <div className="text-center">
            <p className="section-eyebrow">Accommodation</p>
            <h2 className="section-title">Our Rooms & Suites</h2>
            <p className="section-subtitle">Each room is thoughtfully designed for comfort, elegance, and spectacular sea views.</p>
          </div>
          <div className="rooms-grid">
            {rooms.length > 0 ? rooms.map(room => {
              const imgs = getImages(room);
              return (
                <div className="room-card card" key={room.id}>
                  <div style={{ position:'relative', height:220, overflow:'hidden', background:'linear-gradient(135deg,#4a9ab8,#a8d5c8)' }}>
                    {imgs.length > 0
                      ? <img src={`${BACKEND}${imgs[0]}`} alt={room.room_type}
                          style={{ width:'100%', height:'100%', objectFit:'cover' }}
                          onError={e => { e.target.style.display='none'; }}/>
                      : <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'3rem', opacity:0.4 }}>🏨</div>
                    }
                    <span className="room-type-badge badge badge-ocean">{room.room_type}</span>
                  </div>
                  <div className="room-card-body">
                    <div className="room-card-top">
                      <h3>{room.room_type} Room</h3>
                      <div className="room-price">
                        <span className="price-amt" style={{ fontSize:'1.1rem' }}>{toRs(room.price_per_night)}</span>
                        <span className="price-per">/night</span>
                      </div>
                    </div>
                    <p className="room-view">🌊 {room.view_type} · 👥 Up to {room.max_guests} guests</p>
                    <p className="room-desc">{room.description}</p>
                    <Link to="/rooms" className="btn btn-primary" style={{ width:'100%', justifyContent:'center', marginTop:16 }}>
                      View Rooms
                    </Link>
                  </div>
                </div>
              );
            }) : [1,2,3].map(i => (
              <div className="room-card card" key={i}>
                <div className="img-placeholder room" style={{ height:220 }}/>
                <div className="room-card-body skeleton">
                  <div className="skel-line skel-h"/><div className="skel-line skel-m"/><div className="skel-line skel-s"/>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center" style={{ marginTop:40 }}>
            <Link to="/rooms" className="btn btn-outline">View All Rooms →</Link>
          </div>
        </div>
      </section>

      {/* PACKAGES PREVIEW */}
      <section className="section packages-preview">
        <div className="container">
          <div className="text-center">
            <p className="section-eyebrow">Special Experiences</p>
            <h2 className="section-title">Curated Packages</h2>
            <p className="section-subtitle">From intimate honeymoons to grand weddings, we have the perfect package for every occasion.</p>
          </div>
          <div className="packages-grid">
            {packages.length > 0 ? packages.map(pkg => {
              const imgs = getImages(pkg);
              return (
                <div className="pkg-card card" key={pkg.id}>
                  <div style={{ position:'relative', height:200, overflow:'hidden', background:'linear-gradient(135deg,#4a9ab8,#a8d5c8)' }}>
                    {imgs.length > 0
                      ? <img src={`${BACKEND}${imgs[0]}`} alt={pkg.name}
                          style={{ width:'100%', height:'100%', objectFit:'cover' }}
                          onError={e => { e.target.style.display='none'; }}/>
                      : <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'3rem', opacity:0.4 }}>🎁</div>
                    }
                    <div className="pkg-type-label">{pkg.type.replace('-',' ').toUpperCase()}</div>
                  </div>
                  <div className="pkg-body">
                    <h3>{pkg.name}</h3>
                    <p>{pkg.description?.substring(0,90)}...</p>
                    <div className="pkg-footer">
                      <div className="pkg-price">
                        <span>From</span>
                        <strong style={{ fontSize:'1.1rem' }}>{toRs(pkg.price)}</strong>
                      </div>
                      <Link to="/packages" className="btn btn-gold btn-sm">Learn More</Link>
                    </div>
                  </div>
                </div>
              );
            }) : [1,2,3].map(i => (
              <div className="pkg-card card" key={i}>
                <div className="img-placeholder pkg" style={{ height:200 }}/>
                <div className="pkg-body skeleton"><div className="skel-line skel-h"/><div className="skel-line skel-m"/></div>
              </div>
            ))}
          </div>
          <div className="text-center" style={{ marginTop:40 }}>
            <Link to="/packages" className="btn btn-outline">View All Packages →</Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section testimonials-section">
        <div className="container">
          <div className="text-center">
            <p className="section-eyebrow">Guest Reviews</p>
            <h2 className="section-title">What Our Guests Say</h2>
          </div>
          <div className="testimonials-grid">
            {[
              { name:'Sarah & James', country:'🇬🇧 United Kingdom', rating:10, text:'Our honeymoon at Araliya was absolutely magical. The staff went above and beyond, the beach is stunning, and the food was incredible every single day.' },
              { name:'Priya Sharma',  country:'🇮🇳 India',          rating:9,  text:"The sea view room was breathtaking. Waking up to those ocean views every morning was something I'll never forget. The spa was world-class." },
              { name:'Marco Rossi',  country:'🇮🇹 Italy',          rating:10, text:'Perfect location in Unawatuna. The beach is right there, the pools are gorgeous, and the dinner buffet is outstanding. Will definitely return!' },
            ].map((t,i) => (
              <div className="testimonial-card" key={i}>
                <div className="testimonial-stars">{'★'.repeat(Math.min(5,Math.round(t.rating/2)))}</div>
                <p>"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">{t.name[0]}</div>
                  <div><strong>{t.name}</strong><span>{t.country}</span></div>
                  <div className="review-score">{t.rating}/10</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-banner">
        <div className="container text-center">
          <h2>Ready for Your Dream Getaway?</h2>
          <p>Book directly for the best rates. Fully refundable until 48 hours before check-in.</p>
          <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/rooms"   className="btn btn-gold">Book Your Stay</Link>
            <Link to="/about"   className="btn btn-outline-white">Learn More</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
