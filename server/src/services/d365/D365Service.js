const axios = require('axios');

class D365Service {
  constructor(config) {
    this.config = config;
    this.accessToken = null;
    this.tokenExpiry = null;
    
    this.axiosInstance = axios.create({
      baseURL: config.baseUrl,
      timeout: 30000,
    });

    this.axiosInstance.interceptors.request.use(async (config) => {
      const token = await this.getAccessToken();
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }

  async getAccessToken() {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(
        `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/token`,
        new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          scope: this.config.scope,
          grant_type: 'client_credentials',
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = new Date(Date.now() + (response.data.expires_in * 1000) - 60000);

      return this.accessToken;
    } catch (error) {
      console.error('Failed to get D365 access token:', error);
      throw new Error('Authentication failed');
    }
  }

  // Customer operations
  async getCustomers(companyId) {
    try {
      const response = await this.axiosInstance.get(`/${companyId}/customers`);
      return response.data.value || [];
    } catch (error) {
      console.error('Failed to fetch customers from D365:', error);
      throw error;
    }
  }

  async getCustomer(companyId, customerId) {
    try {
      const response = await this.axiosInstance.get(`/${companyId}/customers(${customerId})`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch customer from D365:', error);
      throw error;
    }
  }

  // Item operations
  async getItems(companyId) {
    try {
      const response = await this.axiosInstance.get(`/${companyId}/items`);
      return response.data.value || [];
    } catch (error) {
      console.error('Failed to fetch items from D365:', error);
      throw error;
    }
  }

  // Sales Order operations
  async createSalesOrder(companyId, orderData) {
    try {
      const response = await this.axiosInstance.post(`/${companyId}/salesOrders`, orderData);
      return response.data;
    } catch (error) {
      console.error('Failed to create sales order in D365:', error);
      throw error;
    }
  }

  async updateSalesOrder(companyId, orderId, orderData) {
    try {
      const response = await this.axiosInstance.patch(`/${companyId}/salesOrders(${orderId})`, orderData);
      return response.data;
    } catch (error) {
      console.error('Failed to update sales order in D365:', error);
      throw error;
    }
  }

  // Invoice operations
  async createSalesInvoice(companyId, invoiceData) {
    try {
      const response = await this.axiosInstance.post(`/${companyId}/salesInvoices`, invoiceData);
      return response.data;
    } catch (error) {
      console.error('Failed to create sales invoice in D365:', error);
      throw error;
    }
  }

  // Payment operations
  async createPayment(companyId, paymentData) {
    try {
      const response = await this.axiosInstance.post(`/${companyId}/customerPayments`, paymentData);
      return response.data;
    } catch (error) {
      console.error('Failed to create payment in D365:', error);
      throw error;
    }
  }

  // Customer Ledger Entries
  async getCustomerLedgerEntries(companyId, customerId) {
    try {
      const response = await this.axiosInstance.get(
        `/${companyId}/customerLedgerEntries?$filter=customerNo eq '${customerId}'`
      );
      return response.data.value || [];
    } catch (error) {
      console.error('Failed to fetch customer ledger entries from D365:', error);
      throw error;
    }
  }

  // Price List operations
  async getPriceLists(companyId) {
    try {
      const response = await this.axiosInstance.get(`/${companyId}/salesPrices`);
      return response.data.value || [];
    } catch (error) {
      console.error('Failed to fetch price lists from D365:', error);
      throw error;
    }
  }

  // Sales Return operations
  async createSalesReturn(companyId, returnData) {
    try {
      const response = await this.axiosInstance.post(`/${companyId}/salesCreditMemos`, returnData);
      return response.data;
    } catch (error) {
      console.error('Failed to create sales return in D365:', error);
      throw error;
    }
  }
}

// Singleton instance
const d365Config = {
  baseUrl: process.env.D365_BASE_URL || '',
  clientId: process.env.D365_CLIENT_ID || '',
  clientSecret: process.env.D365_CLIENT_SECRET || '',
  tenantId: process.env.D365_TENANT_ID || '',
  scope: process.env.D365_SCOPE || 'https://api.businesscentral.dynamics.com/.default',
};

const d365Service = new D365Service(d365Config);

module.exports = { D365Service, d365Service };