import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';
import { useCustomerStore } from '../../store/customerStore';
import { useOrderStore } from '../../store/orderStore';

interface Order {
  id: string;
  customerId: string;
  orderDate: { toDate: () => Date };
  total: number;
  status: string;
}

interface OrderCardProps {
  order: Order;
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const { getCustomerById } = useCustomerStore();
  const { updateOrderStatus } = useOrderStore();
  const customer = getCustomerById(order.customerId);
  const customerName = customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown Customer';

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: order.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event from bubbling up
    // Add your status change logic here
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white p-4 rounded-lg shadow-sm cursor-move 
        ${isDragging ? 'opacity-50' : 'opacity-100'} 
        hover:shadow-md transition-all duration-200`}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-medium text-gray-900">#{order.id.slice(-6)}</h4>
          <p className="text-sm text-gray-500">
            {format(order.orderDate.toDate(), 'MMM d, yyyy')}
          </p>
        </div>
        <select
          value={order.status}
          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className={`px-2 py-1 text-xs font-semibold rounded-full cursor-pointer
            ${statusColors[order.status as keyof typeof statusColors]}
            border-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
        >
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <div className="flex justify-between items-center mt-2">
        <span className="text-sm text-gray-600">{customerName}</span>
        <span className="text-sm font-medium text-gray-900">
          ${order.total.toFixed(2)}
        </span>
      </div>
    </div>
  );
};

export default OrderCard;