import axios from 'axios';

// Admin frontend runs on port 3001
// React proxy only works on port 3000
// So we MUST call backend directly on port 5000
axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Restore saved token on every page load
const token = localStorage.getItem('adminToken');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Handle errors globally
axios.interceptors.response.use(
  res => res,
  err => {
    if (!err.response) {
      // Network error - backend not running
      err.message = 'Cannot connect to backend server. Make sure backend is running on port 5000.';
    } else if (err.response.status === 401) {
      localStorage.removeItem('adminToken');
      delete axios.defaults.headers.common['Authorization'];
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default axios;
