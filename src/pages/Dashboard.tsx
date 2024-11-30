import React, { useState, useEffect, useMemo } from 'react';
import { useOrderStore } from '../store/orderStore';
import { useAuthStore } from '../store/authStore';
import { useTaskStore } from '../store/taskStore';
import DateRangePicker from '../components/DateRangePicker';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import LeaderboardCard from '../components/dashboard/LeaderboardCard.enhanced';

const timeRanges = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'custom', label: 'Custom Range' }
];

type ChartMetric = 'revenue' | 'outstanding';

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState('7d');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<ChartMetric>('revenue');

  const { 
    orders = [], 
    getOrderStats,
    getOrderTrends,
    initialize: initOrders,
    loading: storeLoading,
    error: storeError
  } = useOrderStore();

  const { user } = useAuthStore();
  const { tasks, initialize: initTasks } = useTaskStore();

  useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      if (mounted) setIsLoading(true);
      
      try {
        const [orderUnsubscribe, taskUnsubscribe] = await Promise.all([
          initOrders(),
          initTasks()
        ]);
        if (mounted) setIsLoading(false);
        
        return () => {
          orderUnsubscribe?.();
          taskUnsubscribe?.();
        };
      } catch (error: any) {
        console.error('Error loading dashboard data:', error);
        if (mounted) {
          setError(error.message);
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [initOrders, initTasks]);

  useEffect(() => {
    if (storeError) {
      setError(storeError);
    }
  }, [storeError]);

  useEffect(() => {
    setIsLoading(storeLoading);
  }, [storeLoading]);

  const stats = useMemo(() => {
    if (!orders.length) {
      return {
        totalOrders: 0,
        activeCustomers: 0,
        revenue: 0,
        outstanding: 0,
        orderChange: 0,
        customerChange: 0,
        revenueChange: 0
      };
    }
    try {
      return getOrderStats(timeRange, customStartDate, customEndDate);
    } catch (error) {
      setError('Error calculating statistics');
      return {
        totalOrders: 0,
        activeCustomers: 0,
        revenue: 0,
        outstanding: 0,
        orderChange: 0,
        customerChange: 0,
        revenueChange: 0
      };
    }
  }, [getOrderStats, timeRange, customStartDate, customEndDate, orders]);

  const trends = useMemo(() => {
    if (!orders.length) return [];
    try {
      const result = getOrderTrends(timeRange, customStartDate, customEndDate);
      return result.map(item => ({
        ...item,
        date: format(new Date(item.date), 'MMM d'),
      }));
    } catch (error) {
      return [];
    }
  }, [getOrderTrends, timeRange, customStartDate, customEndDate, orders]);

  const handleTimeRangeChange = (newRange: string) => {
    if (newRange === 'custom') {
      setShowDatePicker(true);
    } else {
      setTimeRange(newRange);
      setCustomStartDate(null);
      setCustomEndDate(null);
    }
  };

  const handleDateRangeSelect = (startDate: Date, endDate: Date) => {
    setCustomStartDate(startDate);
    setCustomEndDate(endDate);
    setTimeRange('custom');
    setShowDatePicker(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="animate-pulse text-gray-600 dark:text-gray-300">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="text-red-500 dark:text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => handleTimeRangeChange(e.target.value)}
            className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            {timeRanges.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
          
          {showDatePicker && (
            <DateRangePicker
              onSelect={handleDateRangeSelect}
              onClose={() => setShowDatePicker(false)}
            />
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</h3>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                ${stats.revenue.toLocaleString()}
              </p>
              <div className="mt-1 flex items-center gap-1">
                {stats.revenueChange > 0 ? (
                  <ArrowUpIcon className="h-4 w-4 text-green-500" />
                ) : stats.revenueChange < 0 ? (
                  <ArrowDownIcon className="h-4 w-4 text-red-500" />
                ) : null}
                <p className={`text-sm ${
                  stats.revenueChange > 0 ? 'text-green-500' : 
                  stats.revenueChange < 0 ? 'text-red-500' : 
                  'text-gray-500 dark:text-gray-400'
                }`}>
                  {Math.abs(stats.revenueChange).toFixed(1)}% from previous period
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Outstanding Balance</h3>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                ${stats.outstanding.toLocaleString()}
              </p>
              <div className="mt-1 flex items-center gap-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  From {stats.totalOrders} total orders
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Orders</h3>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalOrders}
              </p>
              <div className="mt-1 flex items-center gap-1">
                {stats.orderChange > 0 ? (
                  <ArrowUpIcon className="h-4 w-4 text-green-500" />
                ) : stats.orderChange < 0 ? (
                  <ArrowDownIcon className="h-4 w-4 text-red-500" />
                ) : null}
                <p className={`text-sm ${
                  stats.orderChange > 0 ? 'text-green-500' : 
                  stats.orderChange < 0 ? 'text-red-500' : 
                  'text-gray-500 dark:text-gray-400'
                }`}>
                  {Math.abs(stats.orderChange).toFixed(1)}% from previous period
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Customers</h3>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {stats.activeCustomers}
              </p>
              <div className="mt-1 flex items-center gap-1">
                {stats.customerChange > 0 ? (
                  <ArrowUpIcon className="h-4 w-4 text-green-500" />
                ) : stats.customerChange < 0 ? (
                  <ArrowDownIcon className="h-4 w-4 text-red-500" />
                ) : null}
                <p className={`text-sm ${
                  stats.customerChange > 0 ? 'text-green-500' : 
                  stats.customerChange < 0 ? 'text-red-500' : 
                  'text-gray-500 dark:text-gray-400'
                }`}>
                  {Math.abs(stats.customerChange).toFixed(1)}% from previous period
                </p>
              </div>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Metrics</h2>
              <div className="flex items-center space-x-4">
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value as ChartMetric)}
                  className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="revenue">Total Revenue</option>
                  <option value="outstanding">Outstanding Payments</option>
                </select>
              </div>
            </div>
            
            <div className="h-96"> 
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={trends}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6B7280"
                    tick={{ fill: '#6B7280' }}
                    axisLine={{ strokeWidth: 2 }}
                  />
                  <YAxis 
                    stroke="#6B7280"
                    tick={{ fill: '#6B7280' }}
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                    axisLine={{ strokeWidth: 2 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: 'none',
                      borderRadius: '0.5rem',
                      color: '#F3F4F6'
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, selectedMetric === 'revenue' ? 'Revenue' : 'Outstanding']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend />
                  {selectedMetric === 'revenue' ? (
                    <Bar
                      dataKey="revenue"
                      name="Revenue"
                      fill="#3B82F6"
                      radius={[4, 4, 0, 0]}
                      background={{ fill: '#1E3A8A', radius: [4, 4, 0, 0], opacity: 0.2 }}
                      strokeWidth={1}
                      stroke="#2563EB"
                      shadowColor="#1E3A8A"
                      shadowOffset={4}
                      shadowBlur={6}
                    />
                  ) : (
                    <Bar
                      dataKey="outstanding"
                      name="Outstanding"
                      fill="#EF4444"
                      radius={[4, 4, 0, 0]}
                      background={{ fill: '#991B1B', radius: [4, 4, 0, 0], opacity: 0.2 }}
                      strokeWidth={1}
                      stroke="#DC2626"
                      shadowColor="#991B1B"
                      shadowOffset={4}
                      shadowBlur={6}
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
            <LeaderboardCard />
          </div>

          {/* My Tasks Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">My Tasks</h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                <div className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">Pending</div>
                <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {tasks.filter(task => task.assignedTo === user?.id && task.status === 'pending').length}
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <div className="text-blue-600 dark:text-blue-400 text-sm font-medium">In Progress</div>
                <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {tasks.filter(task => task.assignedTo === user?.id && task.status === 'in-progress').length}
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                <div className="text-green-600 dark:text-green-400 text-sm font-medium">Completed</div>
                <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {tasks.filter(task => task.assignedTo === user?.id && task.status === 'completed').length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}