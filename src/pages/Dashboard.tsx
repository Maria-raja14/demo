import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  Users, 
  MapPin, 
  Package, 
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { reportService, visitService } from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  change?: string;
}

function StatCard({ title, value, icon: Icon, color, change }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className="text-sm text-green-600 mt-1">{change}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: salesSummary } = useQuery({
    queryKey: ['sales-summary'],
    queryFn: () => reportService.getSalesSummary({
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString()
    }).then(res => res.data)
  });

  const { data: visitCompliance } = useQuery({
    queryKey: ['visit-compliance'],
    queryFn: () => reportService.getVisitCompliance({
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date().toISOString()
    }).then(res => res.data)
  });

  const { data: todayVisits } = useQuery({
    queryKey: ['today-visits'],
    queryFn: () => visitService.getVisits({
      date: new Date().toISOString().split('T')[0]
    }).then(res => res.data)
  });

  const stats = [
    {
      title: 'Monthly Sales',
      value: salesSummary?.summary?.totalAmount ? `$${salesSummary.summary.totalAmount.toLocaleString()}` : '$0',
      icon: DollarSign,
      color: 'bg-green-500',
      change: '+12% from last month'
    },
    {
      title: 'Orders This Month',
      value: salesSummary?.summary?.totalOrders || 0,
      icon: TrendingUp,
      color: 'bg-primary-500'
    },
    {
      title: 'Today\'s Visits',
      value: todayVisits?.length || 0,
      icon: MapPin,
      color: 'bg-blue-500'
    },
    {
      title: 'Visit Compliance',
      value: visitCompliance?.complianceRate ? `${visitCompliance.complianceRate}%` : '0%',
      icon: CheckCircle,
      color: 'bg-green-500'
    }
  ];

  const completedVisits = todayVisits?.filter((v: any) => v.status === 'completed').length || 0;
  const pendingVisits = todayVisits?.filter((v: any) => v.status === 'planned').length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.username}!
            </h1>
            <p className="text-gray-600 mt-1">
              Here's what's happening with your van sales today
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Last sync</p>
            <p className="text-sm font-medium text-gray-900">
              {user?.lastSync ? new Date(user.lastSync).toLocaleString() : 'Never'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Today's Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visit Status */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Visits</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span className="font-medium text-green-900">Completed</span>
              </div>
              <span className="text-2xl font-bold text-green-600">{completedVisits}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-yellow-600 mr-3" />
                <span className="font-medium text-yellow-900">Pending</span>
              </div>
              <span className="text-2xl font-bold text-yellow-600">{pendingVisits}</span>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Performance</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Order Value</span>
              <span className="font-semibold">
                ${salesSummary?.summary?.avgOrderValue?.toFixed(2) || '0.00'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total VAT Collected</span>
              <span className="font-semibold">
                ${salesSummary?.summary?.totalVat?.toFixed(2) || '0.00'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Excise</span>
              <span className="font-semibold">
                ${salesSummary?.summary?.totalExcise?.toFixed(2) || '0.00'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
            <Users className="h-8 w-8 text-primary-600 mb-2" />
            <span className="text-sm font-medium text-primary-900">View Customers</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <MapPin className="h-8 w-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-blue-900">Plan Route</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-green-900">New Order</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <Package className="h-8 w-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-purple-900">Check Inventory</span>
          </button>
        </div>
      </div>
    </div>
  );
}