import React, { useMemo } from 'react';
import { useExpenseStore } from '../../store/expenseStore';
import { getDateRange } from '../../utils/dateRange';

interface ExpensesTableProps {
  timeRange: string;
  customStartDate: Date | null;
  customEndDate: Date | null;
}

const ExpensesTable: React.FC<ExpensesTableProps> = ({
  timeRange,
  customStartDate,
  customEndDate
}) => {
  const { expenses } = useExpenseStore();

  const expenseData = useMemo(() => {
    // Get date range based on selected filter
    const { startDate, endDate } = customStartDate && customEndDate
      ? { startDate: customStartDate, endDate: customEndDate }
      : getDateRange(timeRange);

    // Get expenses for the date range
    const filteredExpenses = expenses.filter(expense => {
      if (!expense?.date) return false;
      
      // Handle both Timestamp and Date objects
      const expenseDate = expense.date instanceof Date 
        ? expense.date 
        : new Date(expense.date);
        
      return expenseDate >= startDate && expenseDate <= endDate;
    });

    // Group expenses by category
    const groupedExpenses = filteredExpenses.reduce((acc, expense) => {
      if (!expense?.category) return acc;

      const category = expense.category;
      if (!acc[category]) {
        acc[category] = {
          category,
          count: 0,
          totalAmount: 0,
          expenses: []
        };
      }
      
      acc[category].count++;
      acc[category].totalAmount += Number(expense.amount) || 0;
      acc[category].expenses.push(expense);
      return acc;
    }, {} as Record<string, { 
      category: string; 
      count: number; 
      totalAmount: number;
      expenses: typeof expenses;
    }>);

    // Convert to array and sort by total amount
    return Object.values(groupedExpenses)
      .sort((a, b) => b.totalAmount - a.totalAmount);
  }, [expenses, timeRange, customStartDate, customEndDate]);

  // Calculate total expenses
  const totalExpenses = useMemo(() => 
    expenseData.reduce((sum, group) => sum + group.totalAmount, 0),
    [expenseData]
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Expenses by Category
      </h2>
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
            {expenseData.map((group) => (
              <tr key={group.category} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {group.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {group.count}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  ${group.totalAmount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {((group.totalAmount / totalExpenses) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50 dark:bg-gray-700 font-medium">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                Total
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {expenseData.reduce((sum, group) => sum + group.count, 0)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                ${totalExpenses.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                100%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpensesTable;
