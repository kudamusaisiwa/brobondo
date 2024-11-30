import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useOrderStore } from '../../store/orderStore';
import { useProductStore } from '../../store/productStore';
import { useExpenseStore } from '../../store/expenseStore';
import { getDateRange } from '../../utils/dateRange';
import type { Order } from '../../types';

interface GrossProfitByProductChartProps {
  timeRange: string;
  customStartDate: Date | null;
  customEndDate: Date | null;
}

export default function GrossProfitByProductChart({
  timeRange,
  customStartDate,
  customEndDate,
}: GrossProfitByProductChartProps) {
  const { orders = [] } = useOrderStore();
  const { products = [] } = useProductStore();
  const { getTotalExpenses } = useExpenseStore();

  const data = useMemo(() => {
    // Get date range based on selected filter
    const { startDate, endDate } = customStartDate && customEndDate 
      ? { startDate: customStartDate, endDate: customEndDate }
      : getDateRange(timeRange);

    // Filter orders by date range using orderDate
    const filteredOrders = orders.filter(order => {
      if (!order?.orderDate) return false;
      const orderDate = new Date(order.orderDate);
      return orderDate >= startDate && orderDate <= endDate;
    });

    // Get total expenses for the period
    const totalExpenses = getTotalExpenses(startDate, endDate);
    console.log('Total Expenses:', totalExpenses);
    
    const expensePerProduct = totalExpenses / (products.length || 1);
    console.log('Expense per product:', expensePerProduct);

    // Calculate revenue, cost, and profit by product
    const productStats = products.reduce((acc, product) => {
      let revenue = 0;
      let cost = 0;
      let orderCount = 0;

      // Process each order
      filteredOrders.forEach(order => {
        if (!order?.products) return;

        // Find this product in the order
        const orderProduct = order.products.find(p => p.id === product.id);
        if (!orderProduct) return;

        // Calculate revenue and cost for this order
        const orderRevenue = orderProduct.quantity * orderProduct.unitPrice;
        const orderCost = orderProduct.quantity * (product.basePrice || 0);

        revenue += orderRevenue;
        cost += orderCost;
        orderCount++;

        console.log('Order contribution:', {
          orderId: order.id,
          productId: product.id,
          quantity: orderProduct.quantity,
          unitPrice: orderProduct.unitPrice,
          orderRevenue,
          orderCost
        });
      });

      // Only include products with actual data
      if (revenue > 0 || cost > 0) {
        const grossProfit = revenue - cost - expensePerProduct;

        console.log('Product stats:', {
          product: product.name,
          revenue,
          cost,
          expenses: expensePerProduct,
          grossProfit,
          orderCount
        });

        acc.push({
          name: product.name,
          revenue: Number(revenue.toFixed(2)),
          cost: Number(cost.toFixed(2)),
          expenses: Number(expensePerProduct.toFixed(2)),
          grossProfit: Number(grossProfit.toFixed(2)),
        });
      }

      return acc;
    }, [] as Array<{
      name: string;
      revenue: number;
      cost: number;
      expenses: number;
      grossProfit: number;
    }>);

    // Sort by gross profit and take top 10
    const sortedStats = productStats
      .sort((a, b) => b.grossProfit - a.grossProfit)
      .slice(0, 10);

    console.log('Final chart data:', sortedStats);
    
    return sortedStats;
  }, [orders, products, timeRange, customStartDate, customEndDate, getTotalExpenses]);

  // If no data, show a message
  if (!data.length) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Gross Profit by Product
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-center py-10">
          No data available for the selected time range.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Gross Profit by Product (Top 10)
      </h2>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="name"
              stroke="#6B7280"
              tick={{ fill: '#6B7280' }}
              axisLine={{ strokeWidth: 2 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={100}
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
              formatter={(value: number) => [`$${value.toLocaleString()}`]}
              labelFormatter={(label) => `Product: ${label}`}
            />
            <Legend />
            <Bar
              dataKey="revenue"
              name="Revenue"
              fill="#3B82F6"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="cost"
              name="Cost"
              fill="#EF4444"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="expenses"
              name="Expenses"
              fill="#F59E0B"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="grossProfit"
              name="Gross Profit"
              fill="#10B981"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
