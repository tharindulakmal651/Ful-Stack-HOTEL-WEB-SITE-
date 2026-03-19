import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../axiosConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on page load
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) { setLoading(false); return; }

    axios.get('/api/auth/me')
      .then(res => {
        if (res.data.role !== 'admin') {
          localStorage.removeItem('adminToken');
          setUser(null);
        } else {
          setUser(res.data);
        }
      })
      .catch(() => {
        localStorage.removeItem('adminToken');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    if (res.data.user.role !== 'admin') {
      throw new Error('Access denied. This login is for admin accounts only.');
    }
    localStorage.setItem('adminToken', res.data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
