import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar  from './components/Sidebar';
import Overview from './pages/Overview';
import Bookings from './pages/Bookings';
import Orders   from './pages/Orders';
import Rooms    from './pages/Rooms';
import Packages from './pages/Packages';
import Menu     from './pages/Menu';
import Staff    from './pages/Staff';
import Users    from './pages/Users';
import Messages from './pages/Messages';
import Offers   from './pages/Offers';
import Login    from './pages/Login';
import Register from './pages/Register';
import './styles/global.css';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loader"><div className="spinner"/></div>;
  if (!user || user.role !== 'admin') return <Navigate to="/login" replace />;
  return children;
};

const Dashboard = () => {
  const [tab,    setTab]    = useState('overview');
  const [toast,  setToast]  = useState('');
  const [unread, setUnread] = useState(0);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const renderPage = () => {
    const props = { showToast };
    switch (tab) {
      case 'overview':  return <Overview {...props} />;
      case 'bookings':  return <Bookings {...props} />;
      case 'orders':    return <Orders   {...props} />;
      case 'rooms':     return <Rooms    {...props} />;
      case 'packages':  return <Packages {...props} />;
      case 'menu':      return <Menu     {...props} />;
      case 'staff':     return <Staff    {...props} />;
      case 'users':     return <Users    {...props} />;
      case 'messages':  return <Messages {...props} onUnreadChange={setUnread} />;
      case 'offers':    return <Offers   {...props} />;
      default:          return <Overview {...props} />;
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar active={tab} onChange={setTab} unread={unread} />
      <main className="dashboard-main">
        <div className="dashboard-content">{renderPage()}</div>
      </main>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/*" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
