import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './About.css';

const About = () => {
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/staff').then(r => setStaff(Array.isArray(r.data) ? r.data : (r.data?.data || []))).catch(() => setStaff([]));
  }, []);

  return (
    <div className="about-page">
      <div className="page-header">
        <div className="page-header-bg" />
        <div className="container page-header-content">
          <p className="section-eyebrow">Our Story</p>
          <h1>About Araliya Resort</h1>
          <p>A legacy of luxury hospitality on the shores of Unawatuna since 2003</p>
        </div>
      </div>

      {/* ABOUT STORY */}
      <section className="section about-story">
        <div className="container">
          <div className="story-grid">
            <div className="story-text">
              <p className="section-eyebrow">Who We Are</p>
              <h2 className="section-title">A Paradise by the Sea</h2>
              <p>Nestled along the pristine shores of Unawatuna in Sri Lanka's southern coast, Araliya Beach Resort & Spa stands as one of the region's finest luxury beach resorts. Our name, "Araliya," means <em>frangipani flower</em> in Sinhala — a symbol of beauty, warmth, and hospitality.</p>
              <p>Since opening our doors in 2003, we have welcomed guests from around the world seeking a perfect blend of authentic Sri Lankan culture and international luxury. With our direct beach access, two spectacular infinity pools, award-winning spa, and world-class dining, every stay becomes a cherished memory.</p>
              <p>We hold a proud Booking.com score of <strong>8.0 (Very Good)</strong> with multiple couples rating us 10/10 for the intimate, personalized service our dedicated team provides.</p>
              <div className="about-highlights">
                <div className="ah-item"><strong>20+</strong><span>Years of Excellence</span></div>
                <div className="ah-item"><strong>5★</strong><span>Rated Property</span></div>
                <div className="ah-item"><strong>35+</strong><span>Verified Reviews</span></div>
                <div className="ah-item"><strong>2</strong><span>Outdoor Pools</span></div>
              </div>
            </div>
            <div className="story-visuals">
              <div className="story-img-main img-placeholder" style={{ height: '340px', borderRadius: '20px' }} />
              <div className="story-img-grid">
                <div className="img-placeholder" style={{ height: '160px', borderRadius: '12px' }} />
                <div className="img-placeholder" style={{ height: '160px', borderRadius: '12px' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROPERTY HIGHLIGHTS */}
      <section className="section amenities-section">
        <div className="container">
          <div className="text-center">
            <p className="section-eyebrow">Property Features</p>
            <h2 className="section-title">What Makes Us Special</h2>
          </div>
          <div className="amenities-grid">
            {[
              { icon: '🏖️', title: 'On-Beach Location', desc: 'Direct access to Unawatuna\'s famous white-sand beach — voted one of the best in Asia.' },
              { icon: '🏊', title: '2 Outdoor Pools', desc: 'Two stunning infinity pools including an adults-only retreat with ocean views.' },
              { icon: '💆', title: 'Full-Service Spa', desc: 'Hot tub, steam room, and Ayurvedic treatments by certified therapists.' },
              { icon: '🛎️', title: 'Butler Service', desc: 'Premier and Suite guests enjoy dedicated butler service 24 hours a day.' },
              { icon: '🍽️', title: 'Beachfront Dining', desc: 'Multiple dining venues with local and international cuisine, served with ocean views.' },
              { icon: '🤿', title: 'Water Sports', desc: 'Snorkeling, scuba diving, kayaking, and boat tours organized from our beach.' },
              { icon: '💒', title: 'Event Venues', desc: 'Stunning beachfront and garden venues for weddings, ceremonies, and celebrations.' },
              { icon: '🚗', title: 'Free Parking', desc: 'Complimentary self-parking for all hotel guests on site.' },
            ].map((a, i) => (
              <div className="amenity-feature" key={i}>
                <div className="af-icon">{a.icon}</div>
                <h4>{a.title}</h4>
                <p>{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEARBY ATTRACTIONS */}
      <section className="section nearby-section">
        <div className="container">
          <div className="text-center">
            <p className="section-eyebrow">Explore the Area</p>
            <h2 className="section-title">Nearby Attractions</h2>
          </div>
          <div className="nearby-grid">
            {[
              { place: 'Unawatuna Beach', time: '11 min walk', icon: '🏖️', desc: 'Famous crescent-shaped beach with turquoise waters' },
              { place: 'Japanese Peace Pagoda', time: '13 min walk', icon: '⛩️', desc: 'Stunning hilltop Buddhist stupa with panoramic views' },
              { place: 'Jungle Beach', time: '18 min walk', icon: '🌴', desc: 'Secluded beach tucked between cliffs and jungle' },
              { place: 'Galle Fort', time: '15 min drive', icon: '🏰', desc: 'UNESCO World Heritage colonial Dutch fort' },
              { place: 'Rumassala Hill', time: '10 min walk', icon: '🌿', desc: 'Legendary hill mentioned in the Ramayana epic' },
              { place: 'Galle Lighthouse', time: '10 min drive', icon: '🗼', desc: 'Iconic 19th century lighthouse at Galle harbour' },
            ].map((n, i) => (
              <div className="nearby-card" key={i}>
                <div className="nearby-icon">{n.icon}</div>
                <div>
                  <strong>{n.place}</strong>
                  <span className="nearby-time">🚶 {n.time}</span>
                  <p>{n.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MAP SECTION */}
      <section className="section map-section">
        <div className="container">
          <div className="text-center">
            <p className="section-eyebrow">Location</p>
            <h2 className="section-title">Find Us</h2>
            <p className="section-subtitle">Welledewala Road, Yaddehimulla, Unawatuna 80000, Sri Lanka</p>
          </div>
          <div className="map-wrapper">
            <iframe
              title="Araliya Beach Resort Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3967.8097374!2d80.24!3d6.0078!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae173ea7e1ba2eb%3A0x3a5f98b9b8b8b8b8!2sUnawatuna%2C%20Sri%20Lanka!5e0!3m2!1sen!2sus!4v1234567890"
              width="100%" height="450" style={{ border: 0, borderRadius: '20px' }}
              allowFullScreen loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="map-info-card">
              <h4>🏖️ Araliya Beach Resort & Spa</h4>
              <p>📍 Welledewala Road, Yaddehimulla<br />Unawatuna, Galle 80000<br />Sri Lanka</p>
              <p>📞 +94 91 222 3456</p>
              <p>✉️ info@araliyaresort.lk</p>
              <a href="https://maps.google.com/?q=Unawatuna,Sri+Lanka" target="_blank" rel="noreferrer" className="btn btn-ocean btn-sm" style={{ marginTop: '12px' }}>
                Open in Maps
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* STAFF */}
      {staff.length > 0 && (
        <section className="section staff-section">
          <div className="container">
            <div className="text-center">
              <p className="section-eyebrow">Our People</p>
              <h2 className="section-title">Meet Our Team</h2>
              <p className="section-subtitle">Our dedicated team is committed to making your stay exceptional.</p>
            </div>
            <div className="staff-grid">
              {staff.map(member => (
                <div className="staff-card card" key={member.id}>
                  <div className="img-placeholder staff staff-photo" />
                  <div className="staff-info">
                    <h4>{member.name}</h4>
                    <span className="badge badge-ocean">{member.position}</span>
                    {member.department && <p className="staff-dept">📌 {member.department}</p>}
                    {member.bio && <p className="staff-bio">{member.bio}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default About;
