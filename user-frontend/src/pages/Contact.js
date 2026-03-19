import React, { useState } from 'react';
import axios from 'axios';
import './Contact.css';

const Contact = () => {
  const [form, setForm] = useState({ name:'', email:'', phone:'', subject:'', message:'' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error,   setError]   = useState('');

  const handle = async (e) => {
    e.preventDefault(); setLoading(true); setSuccess(''); setError('');
    try {
      await axios.post('http://localhost:5000/api/contact', form);
      setSuccess("Thank you! Your message has been sent. We'll get back to you within 24 hours.");
      setForm({ name:'', email:'', phone:'', subject:'', message:'' });
    } catch(e) {
      setError(e.response?.data?.message || 'Failed to send message. Please try again.');
    } finally { setLoading(false); }
  };

  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  return (
    <div className="contact-page">
      <div className="page-header">
        <div className="page-header-bg"/>
        <div className="container page-header-content">
          <p className="section-eyebrow">Get in Touch</p>
          <h1>Contact Us</h1>
          <p>We'd love to hear from you — reservations, enquiries, or just to say hello</p>
        </div>
      </div>

      <div className="container contact-layout">
        {/* INFO */}
        <div className="contact-info">
          <h2>How to Reach Us</h2>
          {[
            { icon:'📍', title:'Address', lines:['Welledewala Road, Yaddehimulla','Unawatuna, Galle 80000','Sri Lanka'] },
            { icon:'📞', title:'Phone',   lines:['+94 91 222 3456', '+94 77 888 9900 (WhatsApp)'] },
            { icon:'✉️', title:'Email',   lines:['info@araliyaresort.lk','reservations@araliyaresort.lk'] },
            { icon:'🕐', title:'Hours',   lines:['Check-in: 2:00 PM','Check-out: 12:00 PM','Front Desk: 24/7'] },
          ].map((c,i) => (
            <div className="ci-item" key={i}>
              <div className="ci-icon">{c.icon}</div>
              <div>
                <strong>{c.title}</strong>
                {c.lines.map((l,j) => <p key={j}>{l}</p>)}
              </div>
            </div>
          ))}

          <div className="contact-map">
            <iframe
              title="Hotel Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3967.8!2d80.24!3d6.0078!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMDAnMjguMSJOIDgwwrAxNCcyNC4wIkU!5e0!3m2!1sen!2slk!4v1234567890"
              width="100%" height="220" style={{border:0,borderRadius:12}} allowFullScreen loading="lazy"
            />
          </div>
        </div>

        {/* FORM */}
        <div className="contact-form-wrap card">
          <h2>Send Us a Message</h2>
          {success && <div className="alert alert-success">{success}</div>}
          {error   && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handle}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-control" value={form.name} onChange={e=>f('name',e.target.value)} required placeholder="John Smith"/>
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input type="email" className="form-control" value={form.email} onChange={e=>f('email',e.target.value)} required placeholder="your@email.com"/>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-control" value={form.phone} onChange={e=>f('phone',e.target.value)} placeholder="+1 234 567 8900"/>
              </div>
              <div className="form-group">
                <label className="form-label">Subject *</label>
                <select className="form-control" value={form.subject} onChange={e=>f('subject',e.target.value)} required>
                  <option value="">Select a subject...</option>
                  <option>Room Reservation Enquiry</option>
                  <option>Wedding Package Enquiry</option>
                  <option>Honeymoon Package Enquiry</option>
                  <option>Restaurant Reservation</option>
                  <option>Group Booking</option>
                  <option>Spa & Wellness</option>
                  <option>Feedback & Reviews</option>
                  <option>General Enquiry</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Message *</label>
              <textarea className="form-control" rows="5" value={form.message}
                onChange={e=>f('message',e.target.value)} required
                placeholder="Tell us how we can help you..."/>
            </div>
            <button type="submit" className="btn btn-gold" style={{width:'100%',justifyContent:'center'}} disabled={loading}>
              {loading ? 'Sending...' : '✉️ Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
