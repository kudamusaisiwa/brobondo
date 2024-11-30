import React, { useState, useMemo } from 'react';
import { useExpenseStore } from '../../store/expenseStore';
import { useOrderStore } from '../../store/orderStore';
import { formatCurrency } from '../../utils/pricing';
import { getDateRange } from '../../utils/dateRange';
import { Switch } from '../ui/switch';
import { Order } from '../../types';
import { calculateTotalRevenue, calculateTotalCost } from '../../utils/pricing';

interface ProfitLossTableProps {
  timeRange: string;
  customStartDate: Date | null;
  customEndDate: Date | null;
}

const calculateProfitForPeriod = (orders: Order[], startDate: Date, endDate: Date) => {
  // Filter orders within the date range
  const periodOrders = orders.filter(order => {
    const orderDate = order.orderDate instanceof Date 
      ? order.orderDate 
      : new Date(order.orderDate);
    return orderDate >= startDate && orderDate <= endDate;
  });

  // Calculate revenue and costs for each order
  const totals = periodOrders.reduce((acc, order) => {
    if (!order.products?.length) return acc;

    // Calculate revenue for this order (Quantity * Selling Price for each product)
    const orderRevenue = order.products.reduce((sum, product) => {
      const quantity = Number(product.quantity) || 0;
      const unitPrice = Number(product.unitPrice) || 0;
      return sum + (quantity * unitPrice);
    }, 0);

    // Calculate COGS for this order (Quantity * Cost Price for each product)
    const orderCOGS = order.products.reduce((sum, product) => {
      const quantity = Number(product.quantity) || 0;
      const costPrice = Number(product.costPrice) || 0;
      return sum + (quantity * costPrice);
    }, 0);

    return {
      revenue: acc.revenue + orderRevenue,
      cogs: acc.cogs + orderCOGS
    };
  }, { revenue: 0, cogs: 0 });

  // Calculate gross profit (Revenue - COGS)
  const grossProfit = totals.revenue - totals.cogs;

  // Calculate gross profit margin as a percentage
  const grossProfitMargin = totals.revenue > 0 
    ? ((grossProfit / totals.revenue) * 100)
    : 0;

  return {
    revenue: Number(totals.revenue.toFixed(2)),
    cost: Number(totals.cogs.toFixed(2)),
    profit: Number(grossProfit.toFixed(2)),
    profitMargin: Number(grossProfitMargin.toFixed(2))
  };
};

const ProfitLossTable: React.FC<ProfitLossTableProps> = ({
  timeRange,
  customStartDate,
  customEndDate
}) => {
  const [showGrossProfit, setShowGrossProfit] = useState(true);
  const { expenses } = useExpenseStore();
  const { orders } = useOrderStore();

  const financialData = useMemo(() => {
    // Get date range
    const { startDate, endDate } = customStartDate && customEndDate
      ? { startDate: customStartDate, endDate: customEndDate }
      : getDateRange(timeRange);

    // Adjust end date to include the entire last day
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setHours(23, 59, 59, 999);

    // Filter expenses within date range
    const periodExpenses = expenses.filter(expense => {
      if (!expense?.date) return false;
      const expenseDate = expense.date instanceof Date ? expense.date : expense.date.toDate();
      return expenseDate >= startDate && expenseDate <= adjustedEndDate;
    });

    // Calculate profit metrics for the period
    const profitMetrics = calculateProfitForPeriod(orders, startDate, adjustedEndDate);

    // Calculate total expenses (excluding cost of goods)
    const totalExpenses = periodExpenses.reduce((sum, expense) => 
      sum + (expense?.amount || 0), 0
    );

    // Calculate net profit (Gross Profit - Operating Expenses)
    const netProfit = profitMetrics.profit - totalExpenses;

    // Calculate net profit margin
    const netProfitMargin = profitMetrics.revenue > 0 ? (netProfit / profitMetrics.revenue) * 100 : 0;

    return {
      totalRevenue: profitMetrics.revenue,
      costOfGoodsSold: profitMetrics.cost,
      grossProfit: profitMetrics.profit,
      totalExpenses,
      netProfit,
      grossProfitMargin: profitMetrics.profitMargin,
      netProfitMargin
    };
  }, [orders, expenses, timeRange, customStartDate, customEndDate]);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {showGrossProfit ? 'Gross Profit Analysis' : 'Profit & Loss Statement'}
        </h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {showGrossProfit ? 'Show Full P&L' : 'Show Gross Profit'}
          </span>
          <Switch
            checked={showGrossProfit}
            onCheckedChange={setShowGrossProfit}
          />
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600 dark:text-gray-300">Revenue</span>
            <span className="text-gray-900 dark:text-white font-medium">
              {formatCurrency(financialData.totalRevenue)}
            </span>
          </div>

          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600 dark:text-gray-300">Cost of Goods Sold</span>
            <span className="text-gray-900 dark:text-white font-medium">
              {formatCurrency(financialData.costOfGoodsSold)}
            </span>
          </div>

          <div className="flex justify-between items-center py-2 border-t border-gray-200 dark:border-gray-700">
            <span className="text-gray-800 dark:text-gray-200 font-medium">Gross Profit</span>
            <span className="text-gray-900 dark:text-white font-semibold">
              {formatCurrency(financialData.grossProfit)}
            </span>
          </div>

          <div className="flex justify-between items-center py-2 text-sm">
            <span className="text-gray-500 dark:text-gray-400">Gross Profit Margin</span>
            <span className="text-gray-600 dark:text-gray-300">
              {financialData.grossProfitMargin.toFixed(1)}%
            </span>
          </div>

          {!showGrossProfit && (
            <>
              <div className="flex justify-between items-center py-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-300">Operating Expenses</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {formatCurrency(financialData.totalExpenses)}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-800 dark:text-gray-200 font-medium">Net Profit</span>
                <span className="text-gray-900 dark:text-white font-semibold">
                  {formatCurrency(financialData.netProfit)}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 text-sm">
                <span className="text-gray-500 dark:text-gray-400">Net Profit Margin</span>
                <span className="text-gray-600 dark:text-gray-300">
                  {financialData.netProfitMargin.toFixed(1)}%
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfitLossTable;
