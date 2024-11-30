import React, { useMemo, useState, useEffect } from 'react';
import { useExpenseStore } from '../../store/expenseStore';

const COLORS = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', 
  '#FF9F40', '#C9CBCF', '#FF5733', '#33FF57', '#3357FF',
  '#FF33F1', '#33FFF1', '#F1FF33', '#8E44AD', '#3498DB'
];

interface ExpenseTypeChartProps {
  timeRange?: string;
  customStartDate?: Date | null;
  customEndDate?: Date | null;
}

export default function ExpenseTypeChart({ 
  timeRange = '7d', 
  customStartDate, 
  customEndDate 
}: ExpenseTypeChartProps) {
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
  const { expenses = [], loading, initialize } = useExpenseStore();

  // Initialize expenses on component mount
  useEffect(() => {
    initialize();
  }, []);

  // Filter and calculate expenses by category
  const expensesByCategory = useMemo(() => {
    console.log('Total Expenses:', expenses.length);
    console.log('Expenses:', JSON.stringify(expenses, null, 2));

    const filteredExpenses = expenses.filter(expense => {
      if (!expense) return false;

      // Date range filtering logic
      const expenseDate = new Date(expense.date);
      if (customStartDate && customEndDate) {
        return expenseDate >= customStartDate && expenseDate <= customEndDate;
      }

      // Default time range filtering
      const now = new Date();
      switch (timeRange) {
        case 'today':
          return expenseDate.toDateString() === now.toDateString();
        case 'yesterday':
          const yesterday = new Date(now);
          yesterday.setDate(now.getDate() - 1);
          return expenseDate.toDateString() === yesterday.toDateString();
        case '7d':
          const sevenDaysAgo = new Date(now);
          sevenDaysAgo.setDate(now.getDate() - 7);
          return expenseDate >= sevenDaysAgo;
        case '30d':
          const thirtyDaysAgo = new Date(now);
          thirtyDaysAgo.setDate(now.getDate() - 30);
          return expenseDate >= thirtyDaysAgo;
        case '3m':
          const threeMonthsAgo = new Date(now);
          threeMonthsAgo.setMonth(now.getMonth() - 3);
          return expenseDate >= threeMonthsAgo;
        case '12m':
          const twelveMonthsAgo = new Date(now);
          twelveMonthsAgo.setFullYear(now.getFullYear() - 1);
          return expenseDate >= twelveMonthsAgo;
        default:
          return true;
      }
    });

    // Aggregate expenses by category
    const categoryTotals = filteredExpenses.reduce((acc, expense) => {
      const category = expense.category || 'other';
      acc[category] = (acc[category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    console.log('Expenses by Category:', JSON.stringify(categoryTotals, null, 2));
    return categoryTotals;
  }, [expenses, timeRange, customStartDate, customEndDate]);

  // Sort categories by expense amount
  const sortedCategories = Object.entries(expensesByCategory)
    .sort((a, b) => b[1] - a[1]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <p className="text-center text-gray-500 dark:text-gray-400">Loading expenses...</p>
      </div>
    );
  }

  if (sortedCategories.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <p className="text-center text-gray-500 dark:text-gray-400">No expenses found for the selected time range.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Expense Type Analysis
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setChartType('pie')}
            className={`px-3 py-1 rounded-md text-sm ${
              chartType === 'pie' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Pie Chart
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1 rounded-md text-sm ${
              chartType === 'bar' 
                ? 'bg-primary-600 text-white' 
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Bar Chart
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Chart Area */}
        <div className="flex-grow h-[400px] overflow-hidden">
          {chartType === 'pie' ? (
            <div className="relative w-full h-full">
              <svg viewBox="0 0 400 400" className="w-full h-full">
                {sortedCategories.map((category, index) => {
                  const total = sortedCategories.reduce((sum, [, amount]) => sum + amount, 0);
                  const percentage = (category[1] / total) * 100;
                  const startAngle = sortedCategories
                    .slice(0, index)
                    .reduce((sum, [, amount]) => sum + (amount / total) * 360, 0);
                  const angle = (percentage / 100) * 360;

                  const x1 = 200 + 180 * Math.cos(Math.PI * (startAngle - 90) / 180);
                  const y1 = 200 + 180 * Math.sin(Math.PI * (startAngle - 90) / 180);
                  const x2 = 200 + 180 * Math.cos(Math.PI * (startAngle + angle - 90) / 180);
                  const y2 = 200 + 180 * Math.sin(Math.PI * (startAngle + angle - 90) / 180);

                  const largeArcFlag = angle > 180 ? 1 : 0;

                  return (
                    <g key={category[0]}>
                      <path
                        d={`M 200 200 L ${x1} ${y1} A 180 180 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                        fill={COLORS[index % COLORS.length]}
                        stroke="white"
                        strokeWidth="2"
                      />
                    </g>
                  );
                })}
                <circle cx="200" cy="200" r="100" fill="white" />
              </svg>
            </div>
          ) : (
            <div className="w-full h-full flex items-end space-x-2 p-4">
              {sortedCategories.map((category, index) => (
                <div 
                  key={category[0]} 
                  className="flex flex-col items-center"
                  style={{ width: `${100 / sortedCategories.length}%` }}
                >
                  <div 
                    className="w-full transition-all duration-300 ease-in-out"
                    style={{ 
                      height: `${(category[1] / Math.max(...sortedCategories.map(c => c[1]))) * 300}px`, 
                      backgroundColor: COLORS[index % COLORS.length] 
                    }}
                  />
                  <span className="text-xs mt-2 text-gray-600 dark:text-gray-300 rotate-45 origin-bottom-left text-center">
                    {category[0].replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Legend Area */}
        <div className="w-full md:w-1/3 pl-4 mt-4 md:mt-0">
          <h3 className="text-md font-semibold mb-4 text-gray-700 dark:text-gray-300">
            Expense Breakdown
          </h3>
          <div className="space-y-2">
            {sortedCategories.map((category, index) => (
              <div 
                key={category[0]} 
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    {category[0].replace('_', ' ')}
                  </span>
                </div>
                <span className="text-gray-500 dark:text-gray-400">
                  ${category[1].toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
