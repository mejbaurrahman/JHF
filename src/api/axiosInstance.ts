
import axios from 'axios';

// Create axios instance
// Using 127.0.0.1 is often more reliable than localhost for Node.js backends
const api = axios.create({
  baseURL: 'http://127.0.0.1:5000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    console.error("API Error:", error.message);
    if (error.response) {
       // The request was made and the server responded with a status code
       // that falls out of the range of 2xx
       console.error("Status:", error.response.status);
       console.error("Data:", error.response.data);
       
       if (error.response.status === 401) {
        // Auto logout if 401 occurs (token expired)
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/#/login';
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received from server. Is the backend running?");
    }
    
    return Promise.reject(error);
  }
);

export default api;
