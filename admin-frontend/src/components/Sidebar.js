import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';

const NAV = [
  { id:'overview',  icon:'📊', label:'Overview'     },
  { id:'bookings',  icon:'🛏️', label:'Bookings'     },
  { id:'orders',    icon:'🍽️', label:'Food Orders'  },
  { id:'rooms',     icon:'🏨', label:'Rooms'         },
  { id:'packages',  icon:'🎁', label:'Packages'      },
  { id:'menu',      icon:'📋', label:'Menu Items'    },
  { id:'offers',    icon:'🏷️', label:'Offers'        },
  { id:'staff',     icon:'👤', label:'Staff'         },
  { id:'users',     icon:'👥', label:'Guests'        },
  { id:'messages',  icon:'✉️', label:'Messages'      },
];

const Sidebar = ({ active, onChange, unread = 0 }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-wave">🌊</span>
        <div>
          <div className="brand-name">Araliya</div>
          <div className="brand-sub">Admin Panel</div>
        </div>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">{user?.name?.[0]?.toUpperCase() || 'A'}</div>
        <div>
          <div className="user-name">{user?.name || 'Admin'}</div>
          <div className="user-role">Administrator</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV.map(item => (
          <button
            key={item.id}
            className={`nav-item ${active === item.id ? 'active' : ''}`}
            onClick={() => onChange(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {item.id === 'messages' && unread > 0 && (
              <span className="nav-badge">{unread}</span>
            )}
          </button>
        ))}
      </nav>

      <div style={{ padding:'0 10px 10px' }}>
        <a href="/register"
          style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 12px', borderRadius:8,
            color:'rgba(255,255,255,0.55)', fontSize:'0.88rem', textDecoration:'none',
            border:'1px solid rgba(255,255,255,0.1)', marginBottom:8 }}>
          ➕ <span>Add Admin</span>
        </a>
        <button className="sidebar-logout" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
