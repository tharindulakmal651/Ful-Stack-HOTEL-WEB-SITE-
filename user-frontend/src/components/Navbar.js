import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const handleLogout = () => { logout(); navigate('/'); };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/rooms', label: 'Rooms' },
    { to: '/packages', label: 'Packages' },
    { to: '/restaurant', label: 'Restaurant' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-inner">
        <Link to="/" className="nav-brand">
          <span className="brand-icon">🌊</span>
          <div>
            <div className="brand-name">Araliya</div>
            <div className="brand-sub">Beach Resort & Spa</div>
          </div>
        </Link>

        <button className="nav-hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
          <span className={menuOpen ? 'open' : ''} />
          <span className={menuOpen ? 'open' : ''} />
          <span className={menuOpen ? 'open' : ''} />
        </button>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}

          <div className="nav-auth">
            {user ? (
              <div className="nav-user">
                <a href={user.role === 'admin' ? 'http://localhost:3001' : '/profile'} className="nav-user-name">
                  {user.role === 'admin' ? '⚙️ Dashboard' : `👤 ${user.name.split(' ')[0]}`}
                </a>
                <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
              </div>
            ) : (
              <div className="nav-auth-btns">
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="btn btn-gold btn-sm">Book Now</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
