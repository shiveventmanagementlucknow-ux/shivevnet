import axios from 'axios';

// Main API client for authenticated requests
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api` || 'http://localhost:5000/api',
  timeout: 15000, // 15s default for normal requests
});

// Request interceptor — attach token + set timeout per request type
api.interceptors.request.use(config => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Only set JSON header if not FormData (let browser set multipart boundary)
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }

  // File uploads: 70s timeout (backend uses 60s + buffer)
  // so the server's error message reaches the client before axios cuts the connection
  if (config.data instanceof FormData) {
    config.timeout = 70000;
  }

  return config;
});

// Response interceptor — handle 401 + show clearer upload errors
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('adminToken');
      if (
        window.location.pathname.startsWith('/admin') &&
        window.location.pathname !== '/admin/login'
      ) {
        window.location.href = '/admin/login';
      }
    }

    // Replace generic axios timeout message with actionable text
    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      err.message = 'Request timed out. Check your internet connection or server status.';
    }

    return Promise.reject(err);
  }
);

export default api;

// ---- Named API helpers ----

export const bookingAPI = {
  create: (data) => api.post('/bookings', data),
  getAll: (params) => api.get('/bookings', { params }),
  getOne: (id) => api.get(`/bookings/${id}`),
  update: (id, data) => api.patch(`/bookings/${id}`, data),
  delete: (id) => api.delete(`/bookings/${id}`),
  getStats: () => api.get('/bookings/stats'),
  checkAvailability: (params) => api.get('/bookings/check-availability', { params }),
  getMy: () => {
    const token = localStorage.getItem('userToken');
    return api.get('/bookings/my', { headers: { Authorization: `Bearer ${token}` } });
  },
};

export const contactAPI = {
  create: (data) => api.post('/contact', data),
  getAll: (params) => api.get('/contact', { params }),
  markRead: (id) => api.patch(`/contact/${id}/read`),
  delete: (id) => api.delete(`/contact/${id}`),
};

export const blogAPI = {
  getAll: (params) => api.get('/blogs', { params }),
  getAllAdmin: () => api.get('/blogs/admin'),
  getOne: (slug) => api.get(`/blogs/${slug}`),
  create: (data) => api.post('/blogs', data),
  update: (id, data) => api.put(`/blogs/${id}`, data),
  delete: (id) => api.delete(`/blogs/${id}`),
};

export const galleryAPI = {
  getAll: (params) => api.get('/gallery', { params }),
  upload: (formData) => api.post('/gallery', formData),
  update: (id, data) => api.patch(`/gallery/${id}`, data),
  delete: (id) => api.delete(`/gallery/${id}`),
};

export const serviceAPI = {
  getAll: () => api.get('/services'),
  getAllAdmin: () => api.get('/services/admin'),
  getOne: (slug) => api.get(`/services/${slug}`),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
};

export const paymentAPI = {
  createOrder: (data) => api.post('/payments/create-order', data),
  verify: (data) => api.post('/payments/verify', data),
};

export const testimonialAPI = {
  getAll: () => api.get('/testimonials'),
  getAllAdmin: () => api.get('/testimonials/admin'),
  create: (data) => api.post('/testimonials', data),
  update: (id, data) => api.put(`/testimonials/${id}`, data),
  delete: (id) => api.delete(`/testimonials/${id}`),
};

export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
};

export const pricingAPI = {
  getAll: () => api.get('/pricing'),
  getAllAdmin: () => api.get('/pricing/admin'),
  create: (data) => api.post('/pricing', data),
  update: (id, data) => api.put(`/pricing/${id}`, data),
  delete: (id) => api.delete(`/pricing/${id}`),
};

// ---- User Auth API ----
export const userAuthAPI = {
  register: (data) => api.post('/users/register', data),
  login: (data) => api.post('/users/login', data),
  getProfile: () => {
    const token = localStorage.getItem('userToken');
    return api.get('/users/me', { headers: { Authorization: `Bearer ${token}` } });
  },
  updateProfile: (data) => {
    const token = localStorage.getItem('userToken');
    return api.put('/users/me', data, { headers: { Authorization: `Bearer ${token}` } });
  },
  changePassword: (data) => {
    const token = localStorage.getItem('userToken');
    return api.patch('/users/change-password', data, { headers: { Authorization: `Bearer ${token}` } });
  },
};

// ---- Admin Users API ----
export const adminUsersAPI = {
  getAll: (params) => api.get('/users/admin/all', { params }),
  getStats: () => api.get('/users/admin/stats'),
  getOne: (id) => api.get(`/users/admin/${id}`),
  toggle: (id) => api.patch(`/users/admin/${id}/toggle`),
  delete: (id) => api.delete(`/users/admin/${id}`),
};