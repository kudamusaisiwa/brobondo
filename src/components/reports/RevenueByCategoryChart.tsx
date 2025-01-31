import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useOrderStore } from '../../store/orderStore';
import { useProductStore } from '../../store/productStore';
import { usePaymentStore } from '../../store/paymentStore';
import { getDateRange } from '../../utils/dateRange';

interface RevenueByCategoryChartProps {
  timeRange: string;
  customStartDate?: Date | null;
  customEndDate?: Date | null;
  viewType?: 'paid' | 'all';
}

export default function RevenueByCategoryChart({
  timeRange,
  customStartDate,
  customEndDate,
  viewType = 'paid'
}: RevenueByCategoryChartProps) {
  const { orders = [] } = useOrderStore();
  const { products = [] } = useProductStore();
  const { payments = [] } = usePaymentStore();

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

  // Get paid orders if viewType is 'paid'
  const paidOrderIds = viewType === 'paid' 
    ? new Set(
        payments
          .filter(payment => {
            const paymentDate = new Date(payment.date);
            return paymentDate >= startDate && paymentDate <= endDate;
          })
          .map(payment => payment.orderId)
      )
    : null;

  // Calculate revenue by category
  const revenueByCategory = filteredOrders.reduce((acc, order) => {
    // Skip if we're only looking at paid orders and this order isn't paid
    if (viewType === 'paid' && !paidOrderIds?.has(order.id)) return acc;
    
    if (!order?.products) return acc;
    
    order.products.forEach(orderProduct => {
      const product = products.find(p => p.id === orderProduct.id);
      if (!product?.category) return;

      if (!acc[product.category]) {
        acc[product.category] = {
          id: product.category,
          category: product.category.replace(/_/g, ' '),
          revenue: 0,
          quantity: 0,
          orders: 0,
          products: new Set()
        };
      }
      acc[product.category].revenue += orderProduct.quantity * orderProduct.unitPrice;
      acc[product.category].quantity += orderProduct.quantity;
      acc[product.category].orders += 1;
      acc[product.category].products.add(product.id);
    });
    return acc;
  }, {} as Record<string, { 
    id: string; 
    category: string; 
    revenue: number;
    quantity: number;
    orders: number;
    products: Set<string>;
  }>);

  // Convert to chart data and sort by revenue
  const chartData = Object.values(revenueByCategory)
    .map(data => ({
      ...data,
      uniqueProducts: data.products.size
    }))
    .sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Revenue by Category
      </h2>
      <div className="flex justify-between mb-4">
        <div>
          <select 
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-2"
            value={viewType}
            onChange={e => console.log(e.target.value)}
          >
            <option value="paid">Paid Revenue</option>
            <option value="all">All Revenue</option>
          </select>
        </div>
      </div>
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
              dataKey="category"
              width={150}
              stroke="var(--chart-text)"
              tick={{ fill: 'var(--chart-text)' }}
            />
            <Tooltip
              formatter={(value: number, name: string, props: any) => {
                const item = chartData.find(d => d.category === props.payload.category);
                return [
                  <>
                    <div>Revenue: ${value.toLocaleString()}</div>
                    <div>Quantity: {item?.quantity}</div>
                    <div>Orders: {item?.orders}</div>
                    <div>Products: {item?.uniqueProducts}</div>
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