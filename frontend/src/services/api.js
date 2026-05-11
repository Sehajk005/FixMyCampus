import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 10000,
  withCredentials: true, // Crucial for HttpOnly cookies
});

// Response interceptor to handle 401 token refreshes
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loops by checking _retry flag and ensure it's a 401 error
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/login' && originalRequest.url !== '/auth/refresh-token') {
      originalRequest._retry = true;
      try {
        const { data } = await api.post('/auth/refresh-token');
        const token = data.accessToken;
        
        // Update the header of the original request
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        
        // Dispatch a custom event to notify AuthContext to update the token state
        window.dispatchEvent(new CustomEvent('tokenRefreshed', { detail: token }));

        // Retry the original request
        return api(originalRequest);
      } catch (err) {
        // Refresh token failed -> force logout
        window.dispatchEvent(new Event('refreshTokenFailed'));
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
