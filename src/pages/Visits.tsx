import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar,
  Navigation,
  Plus
} from 'lucide-react';
import { visitService, customerService } from '../services/api';

export default function Visits() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: visits, isLoading } = useQuery({
    queryKey: ['visits', selectedDate],
    queryFn: () => visitService.getVisits({ date: selectedDate }).then(res => res.data)
  });

  const { data: customers } = useQuery({
    queryKey: ['customers-for-visits'],
    queryFn: () => customerService.getCustomers({ limit: 100 }).then(res => res.data.customers)
  });

  const checkInMutation = useMutation({
    mutationFn: ({ visitId, location }: { visitId: string; location: { latitude: number; longitude: number } }) =>
      visitService.checkIn(visitId, location),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
    }
  });

  const checkOutMutation = useMutation({
    mutationFn: ({ visitId, data }: { visitId: string; data: any }) =>
      visitService.checkOut(visitId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
    }
  });

  const createVisitMutation = useMutation({
    mutationFn: (data: any) => visitService.createVisit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      setShowCreateModal(false);
    }
  });

  const handleCheckIn = (visitId: string) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          checkInMutation.mutate({
            visitId,
            location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
          });
        },
        (error) => {
          alert('Unable to get your location. Please enable location services.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const handleCheckOut = (visitId: string) => {
    const notes = prompt('Add any notes for this visit:');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          checkOutMutation.mutate({
            visitId,
            data: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              notes
            }
          });
        }
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'missed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'planned': return Clock;
      case 'missed': return XCircle;
      case 'cancelled': return XCircle;
      default: return Clock;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Visit Management</h1>
        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          />
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Visit
          </button>
        </div>
      </div>

      {/* Visit Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Visits', value: visits?.length || 0, color: 'bg-blue-500' },
          { label: 'Completed', value: visits?.filter((v: any) => v.status === 'completed').length || 0, color: 'bg-green-500' },
          { label: 'Pending', value: visits?.filter((v: any) => v.status === 'planned').length || 0, color: 'bg-yellow-500' },
          { label: 'Missed', value: visits?.filter((v: any) => v.status === 'missed').length || 0, color: 'bg-red-500' }
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <MapPin className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Visits List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Visits for {new Date(selectedDate).toLocaleDateString()}
          </h2>
        </div>

        {isLoading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading visits...</p>
          </div>
        ) : visits?.length === 0 ? (
          <div className="p-6 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No visits scheduled</h3>
            <p className="text-gray-500">Create a new visit to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {visits?.map((visit: any) => {
              const StatusIcon = getStatusIcon(visit.status);
              return (
                <div key={visit._id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {visit.customerId?.name || 'Unknown Customer'}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(visit.status)}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {visit.status.charAt(0).toUpperCase() + visit.status.slice(1)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {visit.customerId?.address}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {new Date(visit.plannedDate).toLocaleTimeString()}
                        </div>
                      </div>
                      {visit.notes && (
                        <p className="mt-2 text-sm text-gray-600">{visit.notes}</p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {visit.status === 'planned' && (
                        <button
                          onClick={() => handleCheckIn(visit._id)}
                          disabled={checkInMutation.isPending}
                          className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                        >
                          <Navigation className="h-4 w-4 mr-2" />
                          Check In
                        </button>
                      )}
                      {visit.status === 'completed' && visit.checkInTime && !visit.checkOutTime && (
                        <button
                          onClick={() => handleCheckOut(visit._id)}
                          disabled={checkOutMutation.isPending}
                          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Check Out
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Visit Timeline */}
                  {(visit.checkInTime || visit.checkOutTime) && (
                    <div className="mt-4 pl-4 border-l-2 border-gray-200">
                      {visit.checkInTime && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-green-600">Checked In:</span>
                          <span className="text-sm text-gray-600 ml-2">
                            {new Date(visit.checkInTime).toLocaleTimeString()}
                          </span>
                        </div>
                      )}
                      {visit.checkOutTime && (
                        <div>
                          <span className="text-sm font-medium text-blue-600">Checked Out:</span>
                          <span className="text-sm text-gray-600 ml-2">
                            {new Date(visit.checkOutTime).toLocaleTimeString()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Visit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Visit</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                createVisitMutation.mutate({
                  customerId: formData.get('customerId'),
                  plannedDate: new Date(formData.get('plannedDate') as string),
                  notes: formData.get('notes')
                });
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer</label>
                  <select
                    name="customerId"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select a customer</option>
                    {customers?.map((customer: any) => (
                      <option key={customer._id} value={customer._id}>
                        {customer.name} ({customer.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Planned Date & Time</label>
                  <input
                    type="datetime-local"
                    name="plannedDate"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    name="notes"
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Optional notes for this visit"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createVisitMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {createVisitMutation.isPending ? 'Creating...' : 'Create Visit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}