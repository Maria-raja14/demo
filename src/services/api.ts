import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
});

// Request interceptor
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

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API service functions
export const authService = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
  
  getProfile: () => api.get('/auth/me'),
  
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
};

export const customerService = {
  getCustomers: (params?: any) => api.get('/master-data/customers', { params }),
  getCustomer: (id: string) => api.get(`/master-data/customers/${id}`),
  getCustomerAging: (id: string) => api.get(`/reports/customer-aging/${id}`),
};

export const itemService = {
  getItems: (params?: any) => api.get('/master-data/items', { params }),
  getItem: (id: string) => api.get(`/master-data/items/${id}`),
};

export const visitService = {
  getVisits: (params?: any) => api.get('/visits', { params }),
  createVisit: (data: any) => api.post('/visits', data),
  checkIn: (id: string, location: { latitude: number; longitude: number }) =>
    api.post(`/visits/${id}/checkin`, location),
  checkOut: (id: string, data: any) => api.post(`/visits/${id}/checkout`, data),
};

export const salesService = {
  getOrders: (params?: any) => api.get('/sales/orders', { params }),
  getOrder: (id: string) => api.get(`/sales/orders/${id}`),
  createOrder: (data: any) => api.post('/sales/orders', data),
  updateOrderStatus: (id: string, status: string) =>
    api.patch(`/sales/orders/${id}/status`, { status }),
};

export const inventoryService = {
  getVanInventory: () => api.get('/inventory'),
  requestReplenishment: (items: any[]) =>
    api.post('/inventory/replenishment', { items }),
  updateInventory: (itemId: string, data: any) =>
    api.patch(`/inventory/items/${itemId}`, data),
};

export const reportService = {
  getSalesSummary: (params?: any) => api.get('/reports/sales-summary', { params }),
  getVisitCompliance: (params?: any) => api.get('/reports/visit-compliance', { params }),
};

export const syncService = {
  triggerSync: () => api.post('/sync/trigger'),
  getSyncStatus: () => api.get('/sync/status'),
  getSyncLogs: (params?: any) => api.get('/sync/logs', { params }),
};