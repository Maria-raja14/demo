import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Phone, Mail, CreditCard, AlertTriangle } from 'lucide-react';
import { customerService } from '../services/api';

export default function Customers() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const { data: customersData, isLoading } = useQuery({
    queryKey: ['customers', search, page],
    queryFn: () => customerService.getCustomers({ search, page, limit: 20 }).then(res => res.data)
  });

  const { data: customerAging } = useQuery({
    queryKey: ['customer-aging', selectedCustomer?._id],
    queryFn: () => selectedCustomer ? customerService.getCustomerAging(selectedCustomer._id).then(res => res.data) : null,
    enabled: !!selectedCustomer
  });

  const getCreditStatus = (customer: any) => {
    const utilization = (customer.currentBalance / customer.creditLimit) * 100;
    if (utilization >= 90) return { color: 'text-red-600', label: 'Critical' };
    if (utilization >= 70) return { color: 'text-yellow-600', label: 'Warning' };
    return { color: 'text-green-600', label: 'Good' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Customer Directory</h2>
            </div>
            
            {isLoading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading customers...</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {customersData?.customers?.map((customer: any) => {
                  const creditStatus = getCreditStatus(customer);
                  return (
                    <div
                      key={customer._id}
                      className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedCustomer?._id === customer._id ? 'bg-primary-50' : ''
                      }`}
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-medium text-gray-900">{customer.name}</h3>
                            <span className="text-sm text-gray-500">({customer.code})</span>
                            {customer.isBlocked && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Blocked
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {customer.city}, {customer.region}
                            </div>
                            {customer.phone && (
                              <div className="flex items-center">
                                <Phone className="h-4 w-4 mr-1" />
                                {customer.phone}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <CreditCard className="h-4 w-4 text-gray-400" />
                            <span className={`text-sm font-medium ${creditStatus.color}`}>
                              {creditStatus.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            ${customer.currentBalance.toLocaleString()} / ${customer.creditLimit.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {customersData && customersData.totalPages > 1 && (
              <div className="p-6 border-t border-gray-200 flex justify-between items-center">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page {page} of {customersData.totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(customersData.totalPages, page + 1))}
                  disabled={page === customersData.totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Customer Details */}
        <div className="space-y-6">
          {selectedCustomer ? (
            <>
              {/* Customer Info */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Details</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="text-gray-900">{selectedCustomer.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Code</label>
                    <p className="text-gray-900">{selectedCustomer.code}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Address</label>
                    <p className="text-gray-900">{selectedCustomer.address}</p>
                  </div>
                  {selectedCustomer.email && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-900">{selectedCustomer.email}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Payment Terms</label>
                    <p className="text-gray-900">{selectedCustomer.paymentTerms}</p>
                  </div>
                  {selectedCustomer.lastVisit && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Last Visit</label>
                      <p className="text-gray-900">
                        {new Date(selectedCustomer.lastVisit).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Credit Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Credit Information</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Credit Limit</span>
                    <span className="font-semibold">${selectedCustomer.creditLimit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Current Balance</span>
                    <span className="font-semibold">${selectedCustomer.currentBalance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Available Credit</span>
                    <span className="font-semibold text-green-600">
                      ${(selectedCustomer.creditLimit - selectedCustomer.currentBalance).toLocaleString()}
                    </span>
                  </div>
                  
                  {/* Credit Utilization Bar */}
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Credit Utilization</span>
                      <span>{((selectedCustomer.currentBalance / selectedCustomer.creditLimit) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          (selectedCustomer.currentBalance / selectedCustomer.creditLimit) >= 0.9
                            ? 'bg-red-500'
                            : (selectedCustomer.currentBalance / selectedCustomer.creditLimit) >= 0.7
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{
                          width: `${Math.min(100, (selectedCustomer.currentBalance / selectedCustomer.creditLimit) * 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Aging Analysis */}
              {customerAging && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Aging Analysis</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Current (0-30 days)</span>
                      <span className="font-semibold">${customerAging.agingBuckets.current.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">31-60 days</span>
                      <span className="font-semibold">${customerAging.agingBuckets.bucket30.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">61-90 days</span>
                      <span className="font-semibold text-yellow-600">${customerAging.agingBuckets.bucket60.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Over 90 days</span>
                      <span className="font-semibold text-red-600">${customerAging.agingBuckets.bucket90.toLocaleString()}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between items-center">
                      <span className="font-medium text-gray-900">Total Outstanding</span>
                      <span className="font-bold text-lg">${customerAging.agingBuckets.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Customer</h3>
              <p className="text-gray-500">Choose a customer from the list to view detailed information</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}