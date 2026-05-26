import axios from 'axios';

const api = axios.create({
  // 🛠 CHECK: If your backend is running on port 6000, make sure this string ends with ':6000/api'
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
});

// 📤 Request Interceptor
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('admin_token');
    if (token && config.headers) {
      // 🛠 FIXED: Added the template literal backticks (``) so JavaScript compiles the token string correctly
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}); 

// 📥 Response Interceptor (Handles Active Expiry / 401 Errors)
api.interceptors.response.use(
  (response) => response, // Directly pass through successful responses
  (error) => {
    // Check if the backend middleware rejected the token with a 401 status code
    if (error.response && error.response.status === 401) {
      console.warn("🔒 Session expired or token invalid. Redirecting to login...");

      if (typeof window !== 'undefined') {
        // 1. Clear out the expired localStorage token cleanly
        localStorage.removeItem('admin_token');
        
        // 2. Force-redirect the browser back to the login page if not already there
        if (window.location.pathname !== '/admin') {
          window.location.href = '/admin';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;