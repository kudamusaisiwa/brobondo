import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrderStore } from '../store/orderStore';
import { useCustomerStore } from '../store/customerStore';
import { useProductStore } from '../store/productStore';
import { OrderStatus } from '../types';
import CustomerSelector from '../components/orders/CustomerSelector';
import ProductSelector from '../components/orders/ProductSelector';
import OrderSummary from '../components/orders/OrderSummary';
import { extractVAT } from '../utils/pricing';
import Toast from '../components/ui/Toast';

export default function EditOrder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getOrderById, updateOrder } = useOrderStore();
  const { getCustomerById } = useCustomerStore();
  const { products } = useProductStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  
  const [formData, setFormData] = useState({
    customerId: '',
    status: '',
    deliveryMethod: '',
    deliveryDate: '',
    collectionDate: '',
    orderDate: '',
    products: [] as Array<{ productId: string; quantity: number; unitPrice: number; costPrice: number }>,
    totalAmount: 0,
    vatAmount: 0,
    paidAmount: 0,
    notes: '',
    reference: ''
  });

  useEffect(() => {
    if (id) {
      const order = getOrderById(id);
      if (order) {
        const customer = getCustomerById(order.customerId);
        if (!customer) {
          setError('Customer not found');
          setLoading(false);
          return;
        }

        const formatDate = (date: string | Date | null | undefined) => {
          if (!date) return '';
          const d = typeof date === 'string' ? new Date(date) : date;
          return d.toISOString().split('T')[0];
        };

        const formattedProducts = (order.products || []).map(product => ({
          productId: product.productId,
          quantity: product.quantity || 0,
          unitPrice: product.unitPrice || 0,
          costPrice: product.costPrice || 0
        }));

        setFormData({
          customerId: order.customerId || '',
          status: order.status || OrderStatus.PENDING,
          deliveryMethod: order.deliveryMethod || '',
          deliveryDate: formatDate(order.deliveryDate),
          collectionDate: formatDate(order.collectionDate),
          orderDate: formatDate(order.orderDate) || formatDate(new Date()),
          products: formattedProducts,
          totalAmount: order.totalAmount || 0,
          vatAmount: order.vatAmount || 0,
          paidAmount: order.paidAmount || 0,
          notes: order.notes || '',
          reference: order.reference || ''
        });
      } else {
        setError('Order not found');
      }
    }
    setLoading(false);
  }, [id, getOrderById, getCustomerById]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      // Calculate totals
      const totalAmount = formData.products.reduce(
        (sum, { quantity, unitPrice }) => sum + quantity * unitPrice,
        0
      );
      const vatAmount = extractVAT(totalAmount);

      // Clean products array and ensure all fields are present
      const cleanProducts = formData.products.map(product => ({
        productId: product.productId || '',
        quantity: Number(product.quantity) || 0,
        unitPrice: Number(product.unitPrice) || 0,
        costPrice: Number(product.costPrice) || 0
      })).filter(product => product.productId !== '');

      // Create base order data with required fields
      const baseOrderData = {
        customerId: formData.customerId || '',
        status: formData.status || 'pending',
        deliveryMethod: formData.deliveryMethod || 'delivery',
        products: cleanProducts,
        totalAmount: Number(totalAmount) || 0,
        vatAmount: Number(vatAmount) || 0,
        paidAmount: Number(formData.paidAmount) || 0,
        notes: formData.notes || '',
        reference: formData.reference || '',
        updatedAt: new Date()
      };

      // Add dates only if they are valid
      const dates: Record<string, Date> = {};
      if (formData.orderDate && !isNaN(new Date(formData.orderDate).getTime())) {
        dates.orderDate = new Date(formData.orderDate);
      }
      if (formData.deliveryDate && !isNaN(new Date(formData.deliveryDate).getTime())) {
        dates.deliveryDate = new Date(formData.deliveryDate);
      }
      if (formData.collectionDate && !isNaN(new Date(formData.collectionDate).getTime())) {
        dates.collectionDate = new Date(formData.collectionDate);
      }

      // Combine and clean the final order data
      const cleanOrderData = {
        ...baseOrderData,
        ...dates
      };

      // Log the data for debugging
      console.log('Form data:', formData);
      console.log('Clean order data before submission:', cleanOrderData);
      console.log('Products:', cleanProducts);
      console.log('Dates:', dates);

      await updateOrder(id, cleanOrderData);
      setToastMessage('Order updated successfully');
      setToastType('success');
      setShowToast(true);
      setTimeout(() => navigate('/orders/all'), 1500);
    } catch (err) {
      console.error('Error updating order:', err);
      setToastMessage(err instanceof Error ? err.message : 'Failed to update order');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProductChange = (products: Array<{ productId: string; quantity: number; unitPrice: number; costPrice: number }>) => {
    setFormData(prev => ({ ...prev, products }));
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Edit Order</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Order Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Order Date</label>
              <input
                type="date"
                name="orderDate"
                value={formData.orderDate}
                onChange={(e) => handleDateChange('orderDate', e.target.value)}
                className="w-full p-2 border rounded text-gray-900 dark:text-white bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-gray-900 dark:text-white bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                {Object.values(OrderStatus).map(status => (
                  <option key={status} value={status} className="bg-white dark:bg-gray-700">{status}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Reference</label>
            <input
              type="text"
              name="reference"
              value={formData.reference}
              onChange={handleInputChange}
              className="w-full p-2 border rounded text-gray-900 dark:text-white bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Order reference number"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Customer</h2>
          <CustomerSelector
            selectedCustomer={formData.customerId}
            onCustomerChange={(customerId) => setFormData(prev => ({ ...prev, customerId }))}
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Products</h2>
          <ProductSelector
            selectedProducts={formData.products}
            onProductsChange={handleProductChange}
            products={products}
          />
          <OrderSummary selectedProducts={formData.products} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Delivery Details</h2>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Delivery Method</label>
            <select
              name="deliveryMethod"
              value={formData.deliveryMethod}
              onChange={handleInputChange}
              className="w-full p-2 border rounded text-gray-900 dark:text-white bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="" className="bg-white dark:bg-gray-700">Select Method</option>
              <option value="delivery" className="bg-white dark:bg-gray-700">Delivery</option>
              <option value="collection" className="bg-white dark:bg-gray-700">Collection</option>
            </select>
          </div>

          {formData.deliveryMethod === 'delivery' && (
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Delivery Date</label>
              <input
                type="date"
                name="deliveryDate"
                value={formData.deliveryDate}
                onChange={(e) => handleDateChange('deliveryDate', e.target.value)}
                className="w-full p-2 border rounded text-gray-900 dark:text-white bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}

          {formData.deliveryMethod === 'collection' && (
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Collection Date</label>
              <input
                type="date"
                name="collectionDate"
                value={formData.collectionDate}
                onChange={(e) => handleDateChange('collectionDate', e.target.value)}
                className="w-full p-2 border rounded text-gray-900 dark:text-white bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Payment Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Total Amount</label>
              <input
                type="number"
                name="totalAmount"
                value={formData.totalAmount}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-gray-900 dark:text-white bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Paid Amount</label>
              <input
                type="number"
                name="paidAmount"
                value={formData.paidAmount}
                onChange={handleInputChange}
                className="w-full p-2 border rounded text-gray-900 dark:text-white bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                step="0.01"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Additional Information</h2>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={4}
              className="w-full p-2 border rounded text-gray-900 dark:text-white bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Add any additional notes about the order"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => navigate(`/orders/${id}`)}
            className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Save Changes
          </button>
        </div>
      </form>

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
