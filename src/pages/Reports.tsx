import React, { useState } from 'react';
import { Filter, Calendar } from 'lucide-react';
import { useOrderStore } from '../store/orderStore';
import { useCustomerStore } from '../store/customerStore';
import { useProductStore } from '../store/productStore';
import { useTaskStore } from '../store/taskStore';
import { useExpenseStore } from '../store/expenseStore';
import TaskSummaryCard from '../components/reports/TaskSummaryCard';
import RevenueByProductChart from '../components/reports/RevenueByProductChart';
import RevenueByCategoryChart from '../components/reports/RevenueByCategoryChart';
import PaymentMethodsTable from '../components/reports/PaymentMethodsTable';
import DateRangePicker from '../components/DateRangePicker';
import StatCard from '../components/dashboard/StatCard';
import ProfitLossTable from '../components/reports/ProfitLossTable';
import ExpenseTypeChart from '../components/reports/ExpenseTypeChart';

const timeRanges = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '3m', label: 'Last 3 months' },
  { value: '12m', label: 'Last 12 months' },
  { value: 'custom', label: 'Custom Range' }
];

export default function Reports() {
  // Global date range state
  const [timeRange, setTimeRange] = useState('7d');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);

  // Individual component date ranges
  const [revenueTimeRange, setRevenueTimeRange] = useState('7d');
  const [revenueStartDate, setRevenueStartDate] = useState<Date | null>(null);
  const [revenueEndDate, setRevenueEndDate] = useState<Date | null>(null);

  const [paymentsTimeRange, setPaymentsTimeRange] = useState('7d');
  const [paymentsStartDate, setPaymentsStartDate] = useState<Date | null>(null);
  const [paymentsEndDate, setPaymentsEndDate] = useState<Date | null>(null);

  const [categoryTimeRange, setCategoryTimeRange] = useState('7d');
  const [categoryStartDate, setCategoryStartDate] = useState<Date | null>(null);
  const [categoryEndDate, setCategoryEndDate] = useState<Date | null>(null);

  const { orders = [], getOrderStats, getOrderTrends } = useOrderStore();
  const { customers = [] } = useCustomerStore();
  const { products = [] } = useProductStore();
  const { tasks = [] } = useTaskStore();
  const { expenses = [], getTotalExpenses } = useExpenseStore();

  // Handle date picker for different components
  const [activeDatePicker, setActiveDatePicker] = useState<string>('');

  const handleDateRangeSelect = (startDate: Date, endDate: Date) => {
    switch (activeDatePicker) {
      case 'revenue':
        setRevenueStartDate(startDate);
        setRevenueEndDate(endDate);
        setRevenueTimeRange('custom');
        break;
      case 'payments':
        setPaymentsStartDate(startDate);
        setPaymentsEndDate(endDate);
        setPaymentsTimeRange('custom');
        break;
      case 'category':
        setCategoryStartDate(startDate);
        setCategoryEndDate(endDate);
        setCategoryTimeRange('custom');
        break;
      default:
        setCustomStartDate(startDate);
        setCustomEndDate(endDate);
        setTimeRange('custom');
    }
    setShowDatePicker(false);
  };

  const stats = getOrderStats(timeRange, customStartDate, customEndDate);
  const trends = getOrderTrends(timeRange, customStartDate, customEndDate);

  // Calculate additional metrics
  const totalExpenses = getTotalExpenses(customStartDate, customEndDate);
  const pendingTasks = tasks.filter(t => t?.status === 'pending').length;
  const completedTasks = tasks.filter(t => t?.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Reports</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <select
              value={timeRange}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  setShowDatePicker(true);
                } else {
                  setTimeRange(e.target.value);
                  setCustomStartDate(null);
                  setCustomEndDate(null);
                }
              }}
              className="modern-select pl-10 pr-10 py-2"
            >
              {timeRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Profit & Loss Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Profit & Loss Statement</h2>
        <ProfitLossTable
          timeRange={timeRange}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
        />
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={`$${stats.revenue.toLocaleString()}`}
          change={`${stats.revenueChange > 0 ? '+' : ''}${stats.revenueChange.toFixed(1)}%`}
          trend={stats.revenueChange >= 0 ? 'up' : 'down'}
          color="green"
        />
        <StatCard
          title="Total Expenses"
          value={`$${getTotalExpenses(
            timeRange === 'custom' ? customStartDate : undefined, 
            timeRange === 'custom' ? customEndDate : undefined,
            timeRange === 'custom' ? undefined : timeRange
          ).toLocaleString()}`}
          change={`${stats.expenseChange > 0 ? '+' : ''}${stats.expenseChange?.toFixed(1) || '0'}%`}
          trend={stats.expenseChange >= 0 ? 'up' : 'down'}
          color="red"
        />
        <StatCard
          title="Active Customers"
          value={stats.activeCustomers.toString()}
          change={`${stats.customerChange > 0 ? '+' : ''}${stats.customerChange.toFixed(1)}%`}
          trend={stats.customerChange >= 0 ? 'up' : 'down'}
          color="blue"
        />
        <StatCard
          title="Tasks"
          value={pendingTasks.toString()}
          subValue={`${completedTasks} completed`}
          change="0%"
          trend="up"
          color="yellow"
        />
      </div>

      {/* Task Summary */}
      <TaskSummaryCard 
        timeRange={timeRange}
        customStartDate={customStartDate}
        customEndDate={customEndDate}
      />

      {/* Charts Section */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue by Product</h2>
            <select
              value={revenueTimeRange}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  setActiveDatePicker('revenue');
                  setShowDatePicker(true);
                } else {
                  setRevenueTimeRange(e.target.value);
                  setRevenueStartDate(null);
                  setRevenueEndDate(null);
                }
              }}
              className="modern-select px-4 py-2"
            >
              {timeRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
          <RevenueByProductChart 
            timeRange={revenueTimeRange} 
            customStartDate={revenueStartDate} 
            customEndDate={revenueEndDate} 
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Methods</h2>
            <select
              value={paymentsTimeRange}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  setActiveDatePicker('payments');
                  setShowDatePicker(true);
                } else {
                  setPaymentsTimeRange(e.target.value);
                  setPaymentsStartDate(null);
                  setPaymentsEndDate(null);
                }
              }}
              className="modern-select px-4 py-2"
            >
              {timeRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
          <PaymentMethodsTable 
            timeRange={paymentsTimeRange} 
            customStartDate={paymentsStartDate} 
            customEndDate={paymentsEndDate} 
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue by Category</h2>
            <select
              value={categoryTimeRange}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  setActiveDatePicker('category');
                  setShowDatePicker(true);
                } else {
                  setCategoryTimeRange(e.target.value);
                  setCategoryStartDate(null);
                  setCategoryEndDate(null);
                }
              }}
              className="modern-select px-4 py-2"
            >
              {timeRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
          <RevenueByCategoryChart 
            timeRange={categoryTimeRange} 
            customStartDate={categoryStartDate} 
            customEndDate={categoryEndDate} 
          />
        </div>

        {/* New Expense Type Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Expense Type</h2>
          </div>
          <ExpenseTypeChart 
            timeRange={timeRange}
            customStartDate={customStartDate}
            customEndDate={customEndDate}
          />
        </div>
      </div>

      {showDatePicker && (
        <DateRangePicker
          onSelect={handleDateRangeSelect}
          onClose={() => setShowDatePicker(false)}
          initialStartDate={activeDatePicker === 'revenue' ? revenueStartDate : 
            activeDatePicker === 'payments' ? paymentsStartDate : 
            activeDatePicker === 'category' ? categoryStartDate : customStartDate}
          initialEndDate={activeDatePicker === 'revenue' ? revenueEndDate : 
            activeDatePicker === 'payments' ? paymentsEndDate : 
            activeDatePicker === 'category' ? categoryEndDate : customEndDate}
        />
      )}
    </div>
  );
}