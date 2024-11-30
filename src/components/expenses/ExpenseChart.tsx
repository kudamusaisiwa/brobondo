import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3, Table } from 'lucide-react';
import type { Expense } from '../../types';

interface ExpenseChartProps {
  expenses: Expense[];
}

export default function ExpenseChart({ expenses }: ExpenseChartProps) {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  // Group expenses by category with proper type checking
  const expensesByCategory = expenses.reduce((acc, expense) => {
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
    'office_supplies': '#FF4D4D',    // Bright Red
    'utilities': '#4ECDC4',          // Vibrant Turquoise
    'rent': '#3498DB',               // Bright Blue
    'salaries': '#2ECC71',           // Vivid Green
    'marketing': '#F39C12',          // Bright Orange
    'equipment': '#E74C3C',          // Saturated Red
    'software': '#9B59B6',           // Vibrant Purple
    'hardware': '#F1C40F',           // Bright Yellow
    'travel': '#1ABC9C',             // Bright Cyan
    'consulting': '#E91E63',         // Bright Pink
    'legal': '#673AB7',              // Deep Purple
    'banking': '#00BCD4',            // Bright Cyan Blue
    'food': '#FF5722',               // Vivid Orange
    'director_withdrawal': '#2196F3', // Bright Blue
    'transport': '#9C27B0',          // Vibrant Purple
    'salary_advance': '#FF9800',     // Bright Orange
    'other': '#795548',              // Rich Brown
  };

  // Get color for category
  const getVibrantColor = (category: string) => {
    const cleanCategory = category.toLowerCase().replace(/\s+/g, '_');
    return categoryColors[cleanCategory] || `hsl(${Math.random() * 360}, 70%, 50%)`;
  };

  if (!expenses.length) {
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
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis 
                type="number" 
                tickFormatter={(value) => `$${value.toLocaleString()}`} 
              />
              <YAxis 
                type="category" 
                dataKey="category" 
                width={120}
                tickFormatter={(value) => value.split(' ').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              />
              <Tooltip 
                formatter={(value: number) => [`$${value.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}`, 'Amount']}
                contentStyle={{
                  backgroundColor: 'var(--color-surface-50)',
                  border: '1px solid var(--color-surface-200)',
                  borderRadius: '0.5rem'
                }}
              />
              <Bar 
                dataKey="amount" 
                radius={[0, 4, 4, 0]}
                fill={(entry) => getVibrantColor(entry.category)}
              />
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