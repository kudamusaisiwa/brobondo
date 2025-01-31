import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Customer } from '../types';
import { useOrderStore } from '../store/orderStore';
import { useProductStore } from '../store/productStore';
import { useCustomerStore } from '../store/customerStore';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { extractVAT } from '../utils/pricing';
import CustomerSelector from '../components/orders/CustomerSelector';
import ProductSelector from '../components/orders/ProductSelector';
import OrderSummary from '../components/orders/OrderSummary';
import DeliveryMethodSelector from '../components/orders/DeliveryMethodSelector';
import AddCustomerModal from '../components/modals/AddCustomerModal';
import Toast from '../components/ui/Toast';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';

export default function Orders() {
  const navigate = useNavigate();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    costPrice: number;
  }>>([]);
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'collection'>('delivery');
  const [deliveryDate, setDeliveryDate] = useState<Date>();
  const [collectionDate, setCollectionDate] = useState<Date>();
  const [orderDate, setOrderDate] = useState<Date>(new Date());
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [loading, setLoading] = useState(false);

  const { addCustomer } = useCustomerStore();
  const { products = [] } = useProductStore();
  const { addOrder } = useOrderStore();
  const { addNotification } = useNotificationStore();

  const handleCreateOrder = async () => {
    if (!selectedCustomer) {
      setToastMessage('Please select a customer');
      setToastType('error');
      setShowToast(true);
      return;
    }

    if (selectedProducts.length === 0) {
      setToastMessage('Please add at least one product');
      setToastType('error');
      setShowToast(true);
      return;
    }

    setLoading(true);

    try {
      const orderProducts = selectedProducts.map(({ productId, quantity, unitPrice, costPrice }) => {
        const product = products.find((p) => p.id === productId);
        if (!product) {
          throw new Error(`Product not found: ${productId}`);
        }
        return {
          id: productId,
          name: product.name,
          quantity,
          unitPrice,
          costPrice,
          productId: productId,
        };
      });

      const totalAmount = selectedProducts.reduce(
        (sum, { quantity, unitPrice }) => sum + quantity * unitPrice,
        0
      );

      const totalCost = selectedProducts.reduce(
        (sum, { quantity, costPrice }) => sum + quantity * costPrice,
        0
      );

      // Extract VAT from total amount
      const vatAmount = extractVAT(totalAmount);

      const orderId = await addOrder({
        customerId: selectedCustomer.id,
        products: orderProducts,
        status: 'quotation',
        deliveryMethod,
        deliveryDate: deliveryDate || null,
        collectionDate: collectionDate || null,
        totalAmount,
        totalCost,
        vatAmount,
        paidAmount: 0,
        partPayments: [],
        orderDate: orderDate || new Date()
      });

      // Add notification
      addNotification({
        message: `New order created for ${selectedCustomer.firstName} ${selectedCustomer.lastName}`,
        type: 'order'
      });

      setToastMessage('Order created successfully');
      setToastType('success');
      setShowToast(true);

      // Navigate to order details after a short delay
      setTimeout(() => {
        navigate(`/orders/${orderId}`);
      }, 1500);
    } catch (error: any) {
      console.error('Error creating order:', error);
      setToastMessage(error.message || 'Failed to create order');
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'totalOrders' | 'totalRevenue'>) => {
    try {
      const customerId = await addCustomer(customerData);
      setToastMessage('Customer added successfully');
      setToastType('success');
      setShowToast(true);
      setShowAddCustomerModal(false);
      
      const customer = {
        id: customerId,
        ...customerData,
        rating: 0,
        totalOrders: 0,
        totalRevenue: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setSelectedCustomer(customer);
    } catch (error: any) {
      setToastMessage(error.message || 'Failed to add customer');
      setToastType('error');
      setShowToast(true);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white hidden sm:block">New Order</h1>
        <div className="flex space-x-2 sm:space-x-3">
          <Link
            to="/orders"
            className="inline-flex items-center px-2 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            title="View All Orders"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline sm:ml-2">Back to Orders</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 hidden sm:block">Customer Details</h2>
            <CustomerSelector
              selectedCustomer={selectedCustomer}
              onSelectCustomer={setSelectedCustomer}
              onNewCustomer={() => setShowAddCustomerModal(true)}
            />
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 hidden sm:block">Products</h2>
            <ProductSelector
              products={products}
              selectedProducts={selectedProducts}
              onAddProduct={(productId, quantity, unitPrice, costPrice) => {
                setSelectedProducts(prev => [...prev, { productId, quantity, unitPrice, costPrice }]);
              }}
              onRemoveProduct={(index) => {
                setSelectedProducts(prev => prev.filter((_, i) => i !== index));
              }}
              onUpdateQuantity={(index, quantity) => {
                setSelectedProducts(prev => prev.map((item, i) => 
                  i === index ? { ...item, quantity } : item
                ));
              }}
            />
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 hidden sm:block">Order Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Order Date
                </label>
                <input
                  type="date"
                  value={orderDate.toISOString().split('T')[0]}
                  onChange={(e) => setOrderDate(new Date(e.target.value))}
                  max={new Date().toISOString().split('T')[0]}
                  className="modern-input mt-1"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 hidden sm:block">Delivery Method</h2>
            <DeliveryMethodSelector
              value={deliveryMethod}
              onChange={setDeliveryMethod}
              deliveryDate={deliveryDate}
              collectionDate={collectionDate}
              onDateChange={(type, date) => {
                if (type === 'delivery') {
                  setDeliveryDate(date);
                  setCollectionDate(undefined);
                } else {
                  setCollectionDate(date);
                  setDeliveryDate(undefined);
                }
              }}
            />
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleCreateOrder}
                disabled={loading}
                className="btn-primary inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="h-4 w-4 mr-2" />
                {loading ? 'Creating...' : 'Create Order'}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 sm:p-6 sticky top-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 hidden sm:block">Order Summary</h2>
            <OrderSummary
              products={products}
              selectedProducts={selectedProducts}
              customer={selectedCustomer}
              onCreateOrder={handleCreateOrder}
            />
          </div>
        </div>
      </div>

      <AddCustomerModal
        isOpen={showAddCustomerModal}
        onClose={() => setShowAddCustomerModal(false)}
        onAdd={handleAddCustomer}
      />

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}