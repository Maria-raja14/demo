import axios, { AxiosInstance } from 'axios';
import { D365Config } from '../../types';

export class D365Service {
  private axiosInstance: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(private config: D365Config) {
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

  private async getAccessToken(): Promise<string> {
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
      this.tokenExpiry = new Date(Date.now() + (response.data.expires_in * 1000) - 60000); // 1 minute buffer

      return this.accessToken;
    } catch (error) {
      console.error('Failed to get D365 access token:', error);
      throw new Error('Authentication failed');
    }
  }

  // Customer operations
  async getCustomers(companyId: string): Promise<any[]> {
    try {
      const response = await this.axiosInstance.get(`/${companyId}/customers`);
      return response.data.value || [];
    } catch (error) {
      console.error('Failed to fetch customers from D365:', error);
      throw error;
    }
  }

  async getCustomer(companyId: string, customerId: string): Promise<any> {
    try {
      const response = await this.axiosInstance.get(`/${companyId}/customers(${customerId})`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch customer from D365:', error);
      throw error;
    }
  }

  // Item operations
  async getItems(companyId: string): Promise<any[]> {
    try {
      const response = await this.axiosInstance.get(`/${companyId}/items`);
      return response.data.value || [];
    } catch (error) {
      console.error('Failed to fetch items from D365:', error);
      throw error;
    }
  }

  // Sales Order operations
  async createSalesOrder(companyId: string, orderData: any): Promise<any> {
    try {
      const response = await this.axiosInstance.post(`/${companyId}/salesOrders`, orderData);
      return response.data;
    } catch (error) {
      console.error('Failed to create sales order in D365:', error);
      throw error;
    }
  }

  async updateSalesOrder(companyId: string, orderId: string, orderData: any): Promise<any> {
    try {
      const response = await this.axiosInstance.patch(`/${companyId}/salesOrders(${orderId})`, orderData);
      return response.data;
    } catch (error) {
      console.error('Failed to update sales order in D365:', error);
      throw error;
    }
  }

  // Invoice operations
  async createSalesInvoice(companyId: string, invoiceData: any): Promise<any> {
    try {
      const response = await this.axiosInstance.post(`/${companyId}/salesInvoices`, invoiceData);
      return response.data;
    } catch (error) {
      console.error('Failed to create sales invoice in D365:', error);
      throw error;
    }
  }

  // Payment operations
  async createPayment(companyId: string, paymentData: any): Promise<any> {
    try {
      const response = await this.axiosInstance.post(`/${companyId}/customerPayments`, paymentData);
      return response.data;
    } catch (error) {
      console.error('Failed to create payment in D365:', error);
      throw error;
    }
  }

  // Customer Ledger Entries (for aging analysis)
  async getCustomerLedgerEntries(companyId: string, customerId: string): Promise<any[]> {
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
  async getPriceLists(companyId: string): Promise<any[]> {
    try {
      const response = await this.axiosInstance.get(`/${companyId}/salesPrices`);
      return response.data.value || [];
    } catch (error) {
      console.error('Failed to fetch price lists from D365:', error);
      throw error;
    }
  }

  // Discount operations
  async getDiscounts(companyId: string): Promise<any[]> {
    try {
      const response = await this.axiosInstance.get(`/${companyId}/salesLineDiscounts`);
      return response.data.value || [];
    } catch (error) {
      console.error('Failed to fetch discounts from D365:', error);
      throw error;
    }
  }
}

// Singleton instance
const d365Config: D365Config = {
  baseUrl: process.env.D365_BASE_URL || '',
  clientId: process.env.D365_CLIENT_ID || '',
  clientSecret: process.env.D365_CLIENT_SECRET || '',
  tenantId: process.env.D365_TENANT_ID || '',
  scope: process.env.D365_SCOPE || 'https://api.businesscentral.dynamics.com/.default',
};

export const d365Service = new D365Service(d365Config);