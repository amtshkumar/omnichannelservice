import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
};

// Provider Config API
export const providerAPI = {
  getAll: () => api.get('/admin/provider-configs'),
  getOne: (id: number) => api.get(`/admin/provider-configs/${id}`),
  create: (data: any) => api.post('/admin/provider-configs', data),
  update: (id: number, data: any) => api.patch(`/admin/provider-configs/${id}`, data),
  delete: (id: number) => api.delete(`/admin/provider-configs/${id}`),
};

// Template API
export const templateAPI = {
  getAll: (channel?: string) => api.get('/admin/templates', { params: { channel } }),
  getOne: (id: number) => api.get(`/admin/templates/${id}`),
  create: (data: any) => api.post('/admin/templates', data),
  update: (id: number, data: any) => api.patch(`/admin/templates/${id}`, data),
  delete: (id: number) => api.delete(`/admin/templates/${id}`),
};

// Header API
export const headerAPI = {
  getAll: () => api.get('/admin/headers'),
  getOne: (id: number) => api.get(`/admin/headers/${id}`),
  create: (data: any) => api.post('/admin/headers', data),
  update: (id: number, data: any) => api.patch(`/admin/headers/${id}`, data),
  delete: (id: number) => api.delete(`/admin/headers/${id}`),
};

// Footer API
export const footerAPI = {
  getAll: () => api.get('/admin/footers'),
  getOne: (id: number) => api.get(`/admin/footers/${id}`),
  create: (data: any) => api.post('/admin/footers', data),
  update: (id: number, data: any) => api.patch(`/admin/footers/${id}`, data),
  delete: (id: number) => api.delete(`/admin/footers/${id}`),
};

// Outbox API
export const outboxAPI = {
  getAll: (params?: any) => api.get('/admin/outbox', { params }),
  getOne: (id: number) => api.get(`/admin/outbox/${id}`),
};

// Notification API
export const notificationAPI = {
  sendEmail: (data: any) => api.post('/v1/notifications/email', data),
  sendSms: (data: any) => api.post('/v1/notifications/sms', data),
  sendBulkEmail: (data: any) => api.post('/v1/notifications/bulk/email', data),
  sendBulkSms: (data: any) => api.post('/v1/notifications/bulk/sms', data),
  scheduleEmail: (data: any) => api.post('/v1/notifications/schedule/email', data),
  scheduleSms: (data: any) => api.post('/v1/notifications/schedule/sms', data),
  getScheduled: (params?: any) => api.get('/admin/outbox', { params: { status: 'QUEUED', ...params } }),
  updateScheduled: (id: number, data: any) => api.patch(`/v1/notifications/schedule/${id}`, data),
  deleteScheduled: (id: number) => api.delete(`/v1/notifications/schedule/${id}`),
};
