import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrderStore } from '../../store/orderStore';
import { useNotificationStore } from '../../store/notificationStore';
import { playPositiveSound } from '../../utils/audio';

const handleCreateOrder = async () => {
  if (!selectedCustomer) return;

  const orderProducts = selectedProducts.map(({ productId, quantity, unitPrice }) => {
    const product = products.find(p => p.id === productId);
    return {
      id: productId,
      name: product?.name || '',
      quantity,
      unitPrice
    };
  });

  const totalAmount = selectedProducts.reduce(
    (sum, { quantity, unitPrice }) => sum + quantity * unitPrice,
    0
  );

  const orderId = await addOrder({
    customerId: selectedCustomer.id,
    products: orderProducts,
    status: 'quotation',
    deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    deliveryMethod: 'delivery',
    paymentStatus: 'pending',
    totalAmount
  });

  setCreatedOrder(orderId);
  playPositiveSound();
  
  // Add notification
  addNotification({
    message: `New order #${orderId} created for ${selectedCustomer.name}`,
    type: 'order'
  });
};

// ... rest of the file remains unchanged ...