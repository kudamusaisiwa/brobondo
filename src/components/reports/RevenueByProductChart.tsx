import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useOrderStore } from '../../store/orderStore';
import { useProductStore } from '../../store/productStore';
import { getDateRange } from '../../utils/dateRange';

interface RevenueByProductChartProps {
  timeRange: string;
  customStartDate?: Date | null;
  customEndDate?: Date | null;
}

export default function RevenueByProductChart({ 
  timeRange,
  customStartDate,
  customEndDate 
}: RevenueByProductChartProps) {
  const { orders = [] } = useOrderStore();
  const { products = [] } = useProductStore();

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

  // Calculate revenue by product
  const revenueByProduct = filteredOrders.reduce((acc, order) => {
    if (!order?.products) return acc;
    
    order.products.forEach(orderProduct => {
      const product = products.find(p => p.id === orderProduct.id);
      if (!product?.category) return;

      const key = `${product.id}-${product.name}`;
      if (!acc[key]) {
        acc[key] = {
          id: product.id,
          name: product.name,
          revenue: 0,
          quantity: 0,
          orders: 0
        };
      }
      acc[key].revenue += orderProduct.quantity * orderProduct.unitPrice;
      acc[key].quantity += orderProduct.quantity;
      acc[key].orders += 1;
    });
    return acc;
  }, {} as Record<string, { 
    id: string; 
    name: string; 
    revenue: number;
    quantity: number;
    orders: number;
  }>);

  // Convert to chart data and sort by revenue
  const chartData = Object.values(revenueByProduct)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10); // Show top 10 products

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Top 10 Products by Revenue
      </h2>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ left: 20, right: 20, top: 10, bottom: 10 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="var(--chart-grid)"
              horizontal={false}
            />
            <XAxis
              type="number"
              tickFormatter={(value) => `$${value.toLocaleString()}`}
              stroke="var(--chart-text)"
              tick={{ fill: 'var(--chart-text)' }}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={150}
              stroke="var(--chart-text)"
              tick={{ fill: 'var(--chart-text)' }}
            />
            <Tooltip
              formatter={(value: number, name: string, props: any) => {
                const item = chartData.find(d => d.name === props.payload.name);
                return [
                  <>
                    <div>Revenue: ${value.toLocaleString()}</div>
                    <div>Quantity: {item?.quantity}</div>
                    <div>Orders: {item?.orders}</div>
                  </>,
                  'Statistics'
                ];
              }}
              contentStyle={{
                backgroundColor: 'var(--color-surface-50)',
                border: '1px solid var(--color-surface-200)',
                borderRadius: '0.5rem'
              }}
            />
            <Bar 
              dataKey="revenue" 
              fill="var(--chart-revenue)"
              radius={[0, 4, 4, 0]}
              maxBarSize={50}
            >
              {chartData.map((entry) => (
                <Cell 
                  key={`cell-${entry.id}`}
                  fillOpacity={0.9}
                  className="transition-all duration-200 hover:fill-opacity-100"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}