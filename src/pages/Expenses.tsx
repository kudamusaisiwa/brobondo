import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Calendar } from 'lucide-react';
import { useExpenseStore } from '../store/expenseStore';
import { useAuthStore } from '../store/authStore';
import AddExpenseModal from '../components/expenses/AddExpenseModal';
import EditExpenseModal from '../components/expenses/EditExpenseModal';
import ExpenseList from '../components/expenses/ExpenseList';
import ExpenseChart from '../components/expenses/ExpenseChart';
import Toast from '../components/ui/Toast';
import type { Expense } from '../types';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

type TimeRange = 'daily' | 'weekly' | 'monthly' | 'custom';

export default function Expenses() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<TimeRange>('weekly');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'chart'>('list');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const { expenses = [], loading, addExpense, updateExpense, deleteExpense, initialize } = useExpenseStore();
  const { user } = useAuthStore();

  // Calculate date range
  const now = new Date();
  const startDate = new Date();
  
  switch (timeRange) {
    case 'daily':
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'weekly':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'monthly':
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case 'custom':
      if (customStartDate && customEndDate) {
        startDate.setTime(customStartDate.getTime());
        now.setTime(customEndDate.getTime());
      } else {
        startDate.setDate(startDate.getDate() - 7);
      }
      break;
  }

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleTimeRangeChange = (value: TimeRange) => {
    setTimeRange(value);
    if (value === 'custom') {
      setShowDatePicker(true);
    } else {
      setShowDatePicker(false);
      setCustomStartDate(null);
      setCustomEndDate(null);
    }
  };

  const handleDateRangeSelect = (start: Date | null, end: Date | null) => {
    setCustomStartDate(start);
    setCustomEndDate(end);
    if (start && end) {
      setShowDatePicker(false);
    }
  };

  const handleAddExpense = async (expenseData: any) => {
    try {
      await addExpense(expenseData);
      setToastMessage('Expense added successfully');
      setToastType('success');
      setShowAddModal(false);
    } catch (error: any) {
      setToastMessage(error.message || 'Failed to add expense');
      setToastType('error');
    }
    setShowToast(true);
  };

  const handleEditExpense = async (expenseId: string, expenseData: Partial<Expense>) => {
    try {
      await updateExpense(expenseId, expenseData);
      setToastMessage('Expense updated successfully');
      setToastType('success');
      setSelectedExpense(null);
    } catch (error: any) {
      setToastMessage(error.message || 'Failed to update expense');
      setToastType('error');
    }
    setShowToast(true);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      await deleteExpense(expenseId);
      setToastMessage('Expense deleted successfully');
      setToastType('success');
    } catch (error: any) {
      setToastMessage(error.message || 'Failed to delete expense');
      setToastType('error');
    }
    setShowToast(true);
  };

  // Filter expenses based on search, category, and date range
  const filteredExpenses = expenses.filter(expense => {
    if (!expense) return false;

    const matchesSearch = 
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || expense.category === selectedCategory;
    
    const matchesDateRange = customStartDate && customEndDate ? 
      expense.date >= customStartDate && expense.date <= customEndDate :
      true;

    return matchesSearch && matchesCategory && matchesDateRange;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading expenses...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Expenses</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          />
        </div>

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="modern-select pl-10 pr-10 py-2 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <option value="all">All Categories</option>
              <option value="office_supplies">Office Supplies</option>
              <option value="utilities">Utilities</option>
              <option value="rent">Rent</option>
              <option value="salaries">Salaries</option>
              <option value="marketing">Marketing</option>
              <option value="travel">Travel</option>
              <option value="software">Software</option>
              <option value="hardware">Hardware</option>
              <option value="consulting">Consulting</option>
              <option value="legal">Legal</option>
              <option value="banking">Banking</option>
              <option value="food">Food</option>
              <option value="director_withdrawal">Director Withdrawal</option>
              <option value="transport">Transport</option>
              <option value="salary_advance">Salary Advance</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <select
              value={timeRange}
              onChange={(e) => handleTimeRangeChange(e.target.value as TimeRange)}
              className="modern-select pl-10 pr-10 py-2 dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <option value="daily">Today</option>
              <option value="weekly">This Week</option>
              <option value="monthly">This Month</option>
              <option value="custom">Customer Range</option>
            </select>
            {showDatePicker && (
              <div className="absolute mt-2 right-0 z-10">
                <DatePicker
                  selectsRange={true}
                  startDate={customStartDate}
                  endDate={customEndDate}
                  onChange={(update: [Date | null, Date | null]) => handleDateRangeSelect(update[0], update[1])}
                  isClearable={true}
                  inline
                />
              </div>
            )}
          </div>

          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'chart' : 'list')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:border-gray-600"
          >
            {viewMode === 'list' ? 'Show Chart' : 'Show List'}
          </button>
        </div>
      </div>

      {viewMode === 'chart' ? (
        <ExpenseChart 
          expenses={expenses} 
          startDate={startDate}
          endDate={now}
        />
      ) : (
        <ExpenseList 
          expenses={expenses}
          timeRange={timeRange}
          startDate={startDate}
          endDate={now}
          onTimeRangeChange={handleTimeRangeChange}
          onDateRangeChange={handleDateRangeSelect}
          onEditClick={(expense) => setSelectedExpense(expense)}
          onDeleteClick={handleDeleteExpense}
        />
      )}

      <AddExpenseModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddExpense}
        currentUserId={user?.id}
      />

      {selectedExpense && (
        <EditExpenseModal
          isOpen={!!selectedExpense}
          onClose={() => setSelectedExpense(null)}
          onSave={handleEditExpense}
          expense={selectedExpense}
        />
      )}

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}