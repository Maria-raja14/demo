import { d365Service } from '../d365/D365Service';
import Customer from '../../models/Customer';
import Item from '../../models/Item';
import SalesOrder from '../../models/SalesOrder';
import SyncLog from '../../models/SyncLog';

export class SyncService {
  static async performFullSync(): Promise<void> {
    console.log('Starting full sync with D365 BC...');
    
    try {
      await this.syncCustomers();
      await this.syncItems();
      await this.syncPendingOrders();
      await this.syncPendingPayments();
      
      console.log('Full sync completed successfully');
    } catch (error) {
      console.error('Full sync failed:', error);
      throw error;
    }
  }

  static async syncCustomers(): Promise<void> {
    try {
      console.log('Syncing customers...');
      
      // Get all companies (this would be configured based on your setup)
      const companies = ['CRONUS']; // Example company
      
      for (const companyId of companies) {
        const d365Customers = await d365Service.getCustomers(companyId);
        
        for (const d365Customer of d365Customers) {
          await this.upsertCustomer(d365Customer, companyId);
        }
      }
      
      console.log('Customer sync completed');
    } catch (error) {
      console.error('Customer sync failed:', error);
      throw error;
    }
  }

  static async syncItems(): Promise<void> {
    try {
      console.log('Syncing items...');
      
      const companies = ['CRONUS'];
      
      for (const companyId of companies) {
        const d365Items = await d365Service.getItems(companyId);
        
        for (const d365Item of d365Items) {
          await this.upsertItem(d365Item, companyId);
        }
      }
      
      console.log('Item sync completed');
    } catch (error) {
      console.error('Item sync failed:', error);
      throw error;
    }
  }

  static async syncPendingOrders(): Promise<void> {
    try {
      console.log('Syncing pending orders...');
      
      const pendingOrders = await SalesOrder.find({ syncStatus: 'pending' });
      
      for (const order of pendingOrders) {
        try {
          const d365OrderData = this.mapOrderToD365Format(order);
          const d365Order = await d365Service.createSalesOrder(order.companyId, d365OrderData);
          
          order.bcOrderId = d365Order.id;
          order.syncStatus = 'synced';
          await order.save();
          
          await this.logSync('SalesOrder', 'create', order._id.toString(), 'success');
        } catch (error) {
          order.syncStatus = 'failed';
          await order.save();
          
          await this.logSync('SalesOrder', 'create', order._id.toString(), 'failed', error.message);
        }
      }
      
      console.log('Pending orders sync completed');
    } catch (error) {
      console.error('Pending orders sync failed:', error);
      throw error;
    }
  }

  static async syncPendingPayments(): Promise<void> {
    // Similar implementation for payments
    console.log('Syncing pending payments...');
    // Implementation would go here
  }

  private static async upsertCustomer(d365Customer: any, companyId: string): Promise<void> {
    try {
      const customerData = {
        bcCustomerId: d365Customer.id,
        code: d365Customer.number,
        name: d365Customer.displayName,
        address: d365Customer.address?.street || '',
        city: d365Customer.address?.city || '',
        region: d365Customer.address?.state || '',
        phone: d365Customer.phoneNumber || '',
        email: d365Customer.email || '',
        creditLimit: d365Customer.creditLimit || 0,
        currentBalance: d365Customer.balance || 0,
        isBlocked: d365Customer.blocked || false,
        paymentTerms: d365Customer.paymentTermsCode || 'NET30',
        priceGroupCode: d365Customer.customerPriceGroupCode || '',
        vatRegistrationNo: d365Customer.taxRegistrationNumber || '',
        companyId,
        divisionId: 'DEFAULT', // This would be mapped based on your setup
        location: {
          latitude: 0, // These would need to be set separately or from additional data
          longitude: 0
        }
      };

      await Customer.findOneAndUpdate(
        { bcCustomerId: d365Customer.id },
        customerData,
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error('Failed to upsert customer:', error);
      throw error;
    }
  }

  private static async upsertItem(d365Item: any, companyId: string): Promise<void> {
    try {
      const itemData = {
        bcItemId: d365Item.id,
        code: d365Item.number,
        description: d365Item.displayName,
        category: d365Item.itemCategoryCode || 'GENERAL',
        unitOfMeasure: d365Item.baseUnitOfMeasureCode || 'PCS',
        unitPrice: d365Item.unitPrice || 0,
        vatRate: this.getVatRate(d365Item.taxGroupCode),
        exciseRate: this.getExciseRate(d365Item.itemCategoryCode),
        isVanAllowed: this.isVanAllowedItem(d365Item.itemCategoryCode),
        isActive: !d365Item.blocked,
        companyId
      };

      await Item.findOneAndUpdate(
        { bcItemId: d365Item.id },
        itemData,
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error('Failed to upsert item:', error);
      throw error;
    }
  }

  private static mapOrderToD365Format(order: any): any {
    return {
      customerNumber: order.customerId,
      orderDate: order.orderDate,
      requestedDeliveryDate: order.deliveryDate,
      salesOrderLines: order.lines.map((line: any) => ({
        itemNumber: line.itemId,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        discountPercent: line.discountPercent
      }))
    };
  }

  private static async logSync(
    entityType: string,
    operation: 'create' | 'update' | 'delete',
    entityId: string,
    status: 'success' | 'failed',
    errorMessage?: string
  ): Promise<void> {
    await SyncLog.create({
      entityType,
      operation,
      entityId,
      status,
      errorMessage,
      attempts: 1,
      lastAttempt: new Date()
    });
  }

  private static getVatRate(taxGroupCode: string): number {
    // This would be configured based on your tax setup
    const region = process.env.DEFAULT_REGION || 'UAE';
    return region === 'UAE' ? 5 : 5; // 5% for both UAE and Oman
  }

  private static getExciseRate(itemCategoryCode: string): number {
    // This would be configured based on item category and region
    const excisableCategories = ['TOBACCO', 'ENERGY_DRINKS', 'CARBONATED_DRINKS'];
    if (excisableCategories.includes(itemCategoryCode)) {
      const region = process.env.DEFAULT_REGION || 'UAE';
      return region === 'UAE' ? 50 : 100;
    }
    return 0;
  }

  private static isVanAllowedItem(itemCategoryCode: string): boolean {
    // Configure which item categories are allowed in van sales
    const vanAllowedCategories = ['FMCG', 'BEVERAGES', 'SNACKS', 'GENERAL'];
    return vanAllowedCategories.includes(itemCategoryCode);
  }
}