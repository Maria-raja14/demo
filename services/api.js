import axios from 'axios'
import toast from 'react-hot-toast'

export const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://your-api-domain.com/api' 
    : 'http://localhost:5000/api',
  timeout: 10000,
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    
    // Show error toast for non-401 errors
    if (error.response?.status !== 401) {
      const message = error.response?.data?.message || 'An error occurred'
      toast.error(message)
    }
    
    return Promise.reject(error)
  }
)

// API service functions
export const authService = {
  login: (username, password) =>
    api.post('/auth/login', { username, password }),
  
  getProfile: () => api.get('/auth/me'),
  
  changePassword: (currentPassword, newPassword) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
}

export const customerService = {
  getCustomers: (params) => api.get('/master-data/customers', { params }),
  getCustomer: (id) => api.get(`/master-data/customers/${id}`),
  getCustomerAging: (id) => api.get(`/reports/customer-aging/${id}`),
}

export const itemService = {
  getItems: (params) => api.get('/master-data/items', { params }),
  getItem: (id) => api.get(`/master-data/items/${id}`),
}

export const visitService = {
  getVisits: (params) => api.get('/visits', { params }),
  createVisit: (data) => api.post('/visits', data),
  updateVisit: (id, data) => api.put(`/visits/${id}`, data),
  checkIn: (id, location) => api.post(`/visits/${id}/checkin`, location),
  checkOut: (id, data) => api.post(`/visits/${id}/checkout`, data),
}

export const salesService = {
  getOrders: (params) => api.get('/sales/orders', { params }),
  getOrder: (id) => api.get(`/sales/orders/${id}`),
  createOrder: (data) => api.post('/sales/orders', data),
  updateOrder: (id, data) => api.put(`/sales/orders/${id}`, data),
  updateOrderStatus: (id, status) => api.patch(`/sales/orders/${id}/status`, { status }),
}

export const invoiceService = {
  getInvoices: (params) => api.get('/invoices', { params }),
  getInvoice: (id) => api.get(`/invoices/${id}`),
  createInvoice: (data) => api.post('/invoices', data),
  updateInvoice: (id, data) => api.put(`/invoices/${id}`, data),
  printInvoice: (id) => api.post(`/invoices/${id}/print`),
}

export const paymentService = {
  getPayments: (params) => api.get('/payments', { params }),
  getPayment: (id) => api.get(`/payments/${id}`),
  createPayment: (data) => api.post('/payments', data),
  getOpenInvoices: (customerId) => api.get(`/payments/open-invoices/${customerId}`),
  allocatePayment: (id, allocations) => api.post(`/payments/${id}/allocate`, { allocations }),
}

export const inventoryService = {
  getVanInventory: () => api.get('/inventory'),
  updateInventory: (itemId, data) => api.patch(`/inventory/items/${itemId}`, data),
  requestReplenishment: (items) => api.post('/inventory/replenishment', { items }),
  getReplenishmentRequests: (params) => api.get('/inventory/replenishment', { params }),
}

export const returnService = {
  getReturns: (params) => api.get('/returns', { params }),
  getReturn: (id) => api.get(`/returns/${id}`),
  createReturn: (data) => api.post('/returns', data),
  updateReturnStatus: (id, status) => api.patch(`/returns/${id}/status`, { status }),
}

export const transferService = {
  getTransfers: (params) => api.get('/transfers', { params }),
  createTransfer: (data) => api.post('/transfers', data),
  updateTransferStatus: (id, status) => api.patch(`/transfers/${id}/status`, { status }),
}

export const reportService = {
  getSalesSummary: (params) => api.get('/reports/sales-summary', { params }),
  getVisitCompliance: (params) => api.get('/reports/visit-compliance', { params }),
  getInventoryReport: (params) => api.get('/reports/inventory', { params }),
  getCollectionReport: (params) => api.get('/reports/collection', { params }),
}

export const syncService = {
  triggerSync: () => api.post('/sync/trigger'),
  getSyncStatus: () => api.get('/sync/status'),
  getSyncLogs: (params) => api.get('/sync/logs', { params }),
}

export const surveyService = {
  getSurveys: (params) => api.get('/surveys', { params }),
  createSurvey: (data) => api.post('/surveys', data),
  getSurveyTemplates: (type) => api.get(`/surveys/templates/${type}`),
}