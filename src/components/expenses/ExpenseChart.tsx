import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3, Table } from 'lucide-react';
import type { Expense } from '../../types';

interface ExpenseChartProps {
  expenses: Expense[];
  startDate: Date;
  endDate: Date;
}

export default function ExpenseChart({ expenses, startDate, endDate }: ExpenseChartProps) {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  // Filter expenses based on date range
  const filteredExpenses = expenses.filter(expense => {
    const expenseDate = expense.date instanceof Date ? expense.date : new Date(expense.date);
    return expenseDate >= startDate && expenseDate <= endDate;
  });

  // Group expenses by category with proper type checking
  const expensesByCategory = filteredExpenses.reduce((acc, expense) => {
    if (!expense?.category || !expense?.amount) return acc;
    
    const category = expense.category;
    if (!acc[category]) {
      acc[category] = {
        amount: 0,
        count: 0,
        expenses: []
      };
    }
    acc[category].amount += Number(expense.amount) || 0;
    acc[category].count += 1;
    acc[category].expenses.push(expense);
    return acc;
  }, {} as Record<string, { amount: number; count: number; expenses: Expense[] }>);

  // Convert to chart data format and ensure all numbers are valid
  const chartData = Object.entries(expensesByCategory)
    .map(([category, data]) => ({
      category: category.replace(/_/g, ' '),
      amount: Number(data.amount) || 0,
      count: data.count
    }))
    .filter(item => !isNaN(item.amount) && item.amount > 0);

  // Sort by amount descending
  chartData.sort((a, b) => b.amount - a.amount);

  // Calculate total expenses
  const totalExpenses = chartData.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  // Vibrant color palette for categories
  const categoryColors = {
    'office_supplies': '#FF6B6B',    // Bright Red
    'utilities': '#4ECDC4',          // Vibrant Turquoise
    'rent': '#45B7D1',               // Bright Blue
    'salaries': '#4ADE80',           // Vivid Green
    'marketing': '#FFA600',          // Bright Orange
    'equipment': '#FF4D4D',          // Saturated Red
    'software': '#A78BFA',           // Vibrant Purple
    'hardware': '#FFD93D',           // Bright Yellow
    'travel': '#06B6D4',             // Bright Cyan
    'consulting': '#F472B6',         // Bright Pink
    'legal': '#9333EA',              // Deep Purple
    'banking': '#22D3EE',            // Bright Cyan Blue
    'food': '#FF8C42',               // Vivid Orange
    'director_withdrawal': '#60A5FA', // Bright Blue
    'transport': '#C084FC',          // Vibrant Purple
    'salary_advance': '#FB923C',     // Bright Orange
    'other': '#94A3B8',              // Rich Gray
  };

  // Get color for category
  const getVibrantColor = (category: string) => {
    const cleanCategory = category.toLowerCase().replace(/\s+/g, '_');
    return categoryColors[cleanCategory] || `#${Math.floor(Math.random()*16777215).toString(16)}`;
  };

  if (!filteredExpenses.length) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Expenses by Category
        </h2>
        <p className="text-gray-500 dark:text-gray-400">No expenses to display</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          Expenses by Category
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('chart')}
            className={`p-2 rounded-lg ${
              viewMode === 'chart'
                ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400'
                : 'hover:bg-gray-100 text-gray-600 dark:hover:bg-gray-700 dark:text-gray-400'
            }`}
            aria-label="Chart view"
          >
            <BarChart3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-lg ${
              viewMode === 'table'
                ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400'
                : 'hover:bg-gray-100 text-gray-600 dark:hover:bg-gray-700 dark:text-gray-400'
            }`}
            aria-label="Table view"
          >
            <Table className="w-5 h-5" />
          </button>
        </div>
      </div>

      {viewMode === 'chart' ? (
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                className="stroke-gray-200 dark:stroke-gray-700" 
              />
              <XAxis 
                dataKey="category" 
                className="text-gray-600 dark:text-gray-300"
                tick={{ fill: 'currentColor' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                className="text-gray-600 dark:text-gray-300"
                tick={{ fill: 'currentColor' }}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgb(31, 41, 55)', 
                  border: 'none',
                  borderRadius: '0.375rem',
                  color: 'white'
                }}
                itemStyle={{ color: 'white' }}
                cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Amount']}
              />
              <Bar 
                dataKey="amount" 
                radius={[4, 4, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={getVibrantColor(entry.category)}
                    className="opacity-90 hover:opacity-100"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Number of Expenses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  % of Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {chartData.map((item) => (
                <tr key={item.category} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {item.category.split(' ').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {item.count.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    ${item.amount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {((item.amount / totalExpenses) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50 dark:bg-gray-700 font-medium">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  Total
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {chartData.reduce((sum, item) => sum + item.count, 0).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  ${totalExpenses.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  100%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}