import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home       from './pages/Home';
import Rooms      from './pages/Rooms';
import Packages   from './pages/Packages';
import Restaurant from './pages/Restaurant';
import About      from './pages/About';
import Contact    from './pages/Contact';
import { Login, Register } from './pages/Auth';
import Profile    from './pages/Profile';
import './styles/global.css';

const NotFound = () => (
  <div style={{
    minHeight: '80vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 20
  }}>
    <p style={{ fontSize: '5rem' }}>🌊</p>
    <h2 style={{ fontSize: '2rem' }}>Page Not Found</h2>
    <p style={{ color: 'var(--text-mid)' }}>The page you're looking for doesn't exist.</p>
    <a href="/" className="btn btn-primary">Back to Home</a>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/"           element={<Home />} />
          <Route path="/rooms"      element={<Rooms />} />
          <Route path="/packages"   element={<Packages />} />
          <Route path="/restaurant" element={<Restaurant />} />
          <Route path="/about"      element={<About />} />
          <Route path="/contact"    element={<Contact />} />
          <Route path="/login"      element={<Login />} />
          <Route path="/register"   element={<Register />} />
          <Route path="/profile"    element={<Profile />} />
          <Route path="*"           element={<NotFound />} />
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
