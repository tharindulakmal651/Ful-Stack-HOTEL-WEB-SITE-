import axios from 'axios';

// User frontend runs on port 3000 - call backend directly on port 5000
axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Restore saved token
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Handle errors globally
axios.interceptors.response.use(
  res => res,
  err => {
    if (!err.response) {
      err.message = 'Cannot connect to backend server. Make sure backend is running on port 5000.';
    } else if (err.response.status === 401) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    }
    return Promise.reject(err);
  }
);

export default axios;
