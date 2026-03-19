import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-wave">
        <svg viewBox="0 0 1200 80" preserveAspectRatio="none">
          <path d="M0,40 C300,80 900,0 1200,40 L1200,80 L0,80 Z" fill="#1a4a5e"/>
        </svg>
      </div>
      <div className="footer-body">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">
                <span>🌊</span>
                <div>
                  <div className="footer-brand-name">Araliya</div>
                  <div className="footer-brand-sub">Beach Resort & Spa</div>
                </div>
              </div>
              <p>Where you meet the sea all year. Experience luxury, tranquility, and world-class hospitality on the shores of Unawatuna.</p>
              <div className="footer-socials">
                <a href="#!" aria-label="Facebook">📘</a>
                <a href="#!" aria-label="Instagram">📷</a>
                <a href="#!" aria-label="Twitter">🐦</a>
              </div>
            </div>

            <div className="footer-col">
              <h4>Quick Links</h4>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/rooms">Rooms & Suites</Link></li>
                <li><Link to="/packages">Packages</Link></li>
                <li><Link to="/restaurant">Restaurant</Link></li>
                <li><Link to="/about">About Us</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Packages</h4>
              <ul>
                <li><Link to="/packages?type=day-out">Day Out</Link></li>
                <li><Link to="/packages?type=wedding">Wedding</Link></li>
                <li><Link to="/packages?type=honeymoon">Honeymoon</Link></li>
              </ul>
              <h4 style={{marginTop:'24px'}}>Dining</h4>
              <ul>
                <li><Link to="/restaurant?cat=breakfast">Breakfast</Link></li>
                <li><Link to="/restaurant?cat=lunch">Lunch Buffet</Link></li>
                <li><Link to="/restaurant?cat=dinner">Dinner</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Contact Us</h4>
              <div className="footer-contact">
                <div className="contact-item">
                  <span>📍</span>
                  <span>Welledewala Road, Yaddehimulla, Unawatuna 80000, Sri Lanka</span>
                </div>
                <div className="contact-item">
                  <span>📞</span>
                  <span>+94 91 222 3456</span>
                </div>
                <div className="contact-item">
                  <span>✉️</span>
                  <span>info@araliyaresort.lk</span>
                </div>
                <div className="contact-item">
                  <span>🕐</span>
                  <span>Check-in: 2:00 PM | Check-out: 12:00 PM</span>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} Araliya Beach Resort & Spa Unawatuna. All rights reserved.</p>
            <div className="footer-bottom-links">
              <a href="#!">Privacy Policy</a>
              <a href="#!">Terms of Service</a>
              <a href="#!">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
