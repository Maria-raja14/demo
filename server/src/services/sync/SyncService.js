const { d365Service } = require('../d365/D365Service');
const Customer = require('../../models/Customer');
const Item = require('../../models/Item');
const SalesOrder = require('../../models/SalesOrder');
const Invoice = require('../../models/Invoice');
const Payment = require('../../models/Payment');
const SalesReturn = require('../../models/SalesReturn');
const SyncLog = require('../../models/SyncLog');

class SyncService {
  static async performFullSync() {
    console.log('Starting full sync with D365 BC...');
    
    try {
      await this.syncCustomers();
      await this.syncItems();
      await this.syncPriceLists();
      await this.syncPendingOrders();
      await this.syncPendingInvoices();
      await this.syncPendingPayments();
      await this.syncPendingReturns();
      
      console.log('Full sync completed successfully');
    } catch (error) {
      console.error('Full sync failed:', error);
      throw error;
    }
  }

  static async syncCustomers() {
    try {
      console.log('Syncing customers...');
      
      const companies = ['CRONUS']; // Configure based on your setup
      
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

  static async syncItems() {
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

  static async syncPriceLists() {
    try {
      console.log('Syncing price lists...');
      
      const companies = ['CRONUS'];
      
      for (const companyId of companies) {
        const priceLists = await d365Service.getPriceLists(companyId);
        
        // Update item prices based on price lists
        for (const priceEntry of priceLists) {
          await Item.findOneAndUpdate(
            { code: priceEntry.itemNo, companyId },
            { unitPrice: priceEntry.unitPrice },
            { new: true }
          );
        }
      }
      
      console.log('Price list sync completed');
    } catch (error) {
      console.error('Price list sync failed:', error);
      throw error;
    }
  }

  static async syncPendingOrders() {
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

  static async syncPendingInvoices() {
    try {
      console.log('Syncing pending invoices...');
      
      const pendingInvoices = await Invoice.find({ syncStatus: 'pending' });
      
      for (const invoice of pendingInvoices) {
        try {
          const d365InvoiceData = this.mapInvoiceToD365Format(invoice);
          const d365Invoice = await d365Service.createSalesInvoice(invoice.companyId, d365InvoiceData);
          
          invoice.bcInvoiceId = d365Invoice.id;
          invoice.syncStatus = 'synced';
          await invoice.save();
          
          await this.logSync('Invoice', 'create', invoice._id.toString(), 'success');
        } catch (error) {
          invoice.syncStatus = 'failed';
          await invoice.save();
          
          await this.logSync('Invoice', 'create', invoice._id.toString(), 'failed', error.message);
        }
      }
      
      console.log('Pending invoices sync completed');
    } catch (error) {
      console.error('Pending invoices sync failed:', error);
      throw error;
    }
  }

  static async syncPendingPayments() {
    try {
      console.log('Syncing pending payments...');
      
      const pendingPayments = await Payment.find({ syncStatus: 'pending' });
      
      for (const payment of pendingPayments) {
        try {
          const d365PaymentData = this.mapPaymentToD365Format(payment);
          const d365Payment = await d365Service.createPayment(payment.companyId, d365PaymentData);
          
          payment.bcPaymentId = d365Payment.id;
          payment.syncStatus = 'synced';
          await payment.save();
          
          await this.logSync('Payment', 'create', payment._id.toString(), 'success');
        } catch (error) {
          payment.syncStatus = 'failed';
          await payment.save();
          
          await this.logSync('Payment', 'create', payment._id.toString(), 'failed', error.message);
        }
      }
      
      console.log('Pending payments sync completed');
    } catch (error) {
      console.error('Pending payments sync failed:', error);
      throw error;
    }
  }

  static async syncPendingReturns() {
    try {
      console.log('Syncing pending returns...');
      
      const pendingReturns = await SalesReturn.find({ syncStatus: 'pending' });
      
      for (const returnDoc of pendingReturns) {
        try {
          const d365ReturnData = this.mapReturnToD365Format(returnDoc);
          const d365Return = await d365Service.createSalesReturn(returnDoc.companyId, d365ReturnData);
          
          returnDoc.bcReturnId = d365Return.id;
          returnDoc.syncStatus = 'synced';
          await returnDoc.save();
          
          await this.logSync('SalesReturn', 'create', returnDoc._id.toString(), 'success');
        } catch (error) {
          returnDoc.syncStatus = 'failed';
          await returnDoc.save();
          
          await this.logSync('SalesReturn', 'create', returnDoc._id.toString(), 'failed', error.message);
        }
      }
      
      console.log('Pending returns sync completed');
    } catch (error) {
      console.error('Pending returns sync failed:', error);
      throw error;
    }
  }

  static async upsertCustomer(d365Customer, companyId) {
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
        divisionId: 'DEFAULT',
        location: {
          latitude: 0, // Set from additional data source
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

  static async upsertItem(d365Item, companyId) {
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
        companyId,
        barcode: d365Item.gtin || ''
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

  static mapOrderToD365Format(order) {
    return {
      customerNumber: order.customerId,
      orderDate: order.orderDate,
      requestedDeliveryDate: order.deliveryDate,
      salesOrderLines: order.lines.map((line) => ({
        itemNumber: line.itemId,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        discountPercent: line.discountPercent
      }))
    };
  }

  static mapInvoiceToD365Format(invoice) {
    return {
      customerNumber: invoice.customerId,
      invoiceDate: invoice.invoiceDate,
      dueDate: invoice.dueDate,
      salesInvoiceLines: invoice.lines.map((line) => ({
        itemNumber: line.itemId,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        discountPercent: line.discountPercent
      }))
    };
  }

  static mapPaymentToD365Format(payment) {
    return {
      customerNumber: payment.customerId,
      postingDate: payment.paymentDate,
      documentDate: payment.paymentDate,
      amount: payment.amount,
      paymentMethodCode: payment.paymentMethod.toUpperCase(),
      appliedEntries: payment.allocations.map(allocation => ({
        invoiceNumber: allocation.invoiceId,
        amountToApply: allocation.allocatedAmount
      }))
    };
  }

  static mapReturnToD365Format(returnDoc) {
    return {
      customerNumber: returnDoc.customerId,
      postingDate: returnDoc.returnDate,
      salesCreditMemoLines: returnDoc.lines.map((line) => ({
        itemNumber: line.itemId,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        reasonCode: line.reason
      }))
    };
  }

  static async logSync(entityType, operation, entityId, status, errorMessage) {
    const SyncLog = require('../../models/SyncLog');
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

  static getVatRate(taxGroupCode) {
    const region = process.env.DEFAULT_REGION || 'UAE';
    return region === 'UAE' ? 5 : 5; // 5% for both UAE and Oman
  }

  static getExciseRate(itemCategoryCode) {
    const excisableCategories = ['TOBACCO', 'ENERGY_DRINKS', 'CARBONATED_DRINKS'];
    if (excisableCategories.includes(itemCategoryCode)) {
      const region = process.env.DEFAULT_REGION || 'UAE';
      return region === 'UAE' ? 50 : 100;
    }
    return 0;
  }

  static isVanAllowedItem(itemCategoryCode) {
    const vanAllowedCategories = ['FMCG', 'BEVERAGES', 'SNACKS', 'GENERAL'];
    return vanAllowedCategories.includes(itemCategoryCode);
  }
}

module.exports = { SyncService };