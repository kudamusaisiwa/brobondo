import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import OrderCard from './orders/OrderCard';

interface Order {
  id: string;
  customerId: string;
  orderDate: { toDate: () => Date };
  total: number;
  status: string;
}

interface OrderKanbanProps {
  orders: Order[];
  onOrderUpdate: (orderId: string, status: string) => void;
}

const STATUSES = ['pending', 'processing', 'completed', 'cancelled'];

const OrderKanban: React.FC<OrderKanbanProps> = ({ orders, onOrderUpdate }) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over) {
      const overId = over.id as string;
      const newStatus = overId.replace('-column', '');

      if (active.id && STATUSES.includes(newStatus)) {
        onOrderUpdate(active.id as string, newStatus);
      }
    }
    
    setActiveId(null);
  };

  // Group orders by status
  const ordersByStatus = STATUSES.reduce((acc, status) => {
    acc[status] = orders.filter((order) => order.status === status);
    return acc;
  }, {} as Record<string, Order[]>);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 min-w-full">
          {STATUSES.map((status) => (
            <div
              key={`${status}-column`}
              id={`${status}-column`}
              className="flex-1 min-w-[300px] bg-gray-50 rounded-lg p-4"
            >
              <h3 className="text-lg font-semibold capitalize mb-4 text-gray-700">
                {status}
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({ordersByStatus[status]?.length || 0})
                </span>
              </h3>
              
              <div className="space-y-3">
                {ordersByStatus[status]?.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeId && (
            <OrderCard
              order={orders.find((order) => order.id === activeId)!}
            />
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default OrderKanban;