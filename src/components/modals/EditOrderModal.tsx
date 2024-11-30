import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useProductStore } from '../../store/productStore';
import type { Order } from '../../types';
import ProductSelector from '../orders/ProductSelector';

interface EditOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (orderData: Partial<Order>) => void;
  order: Order;
}

export default function EditOrderModal({ isOpen, onClose, onSave, order }: EditOrderModalProps) {
  const { products } = useProductStore();
  const [selectedProducts, setSelectedProducts] = useState(order.products);
  const [formData, setFormData] = useState({
    registeredCompanyName: order.registeredCompanyName || '',
    rsaPhoneNumber: order.rsaPhoneNumber || '',
    bankAccountNumber: order.bankAccountNumber || '',
    deliveryMethod: order.deliveryMethod,
    deliveryDate: order.deliveryDate ? order.deliveryDate.toISOString().split('T')[0] : '',
    collectionDate: order.collectionDate ? order.collectionDate.toISOString().split('T')[0] : ''
  });

  if (!isOpen) return null;

  const handleSave = () => {
    const totalAmount = selectedProducts.reduce(
      (sum, product) => sum + product.quantity * product.unitPrice,
      0
    );

    const orderData: Partial<Order> = {
      products: selectedProducts,
      registeredCompanyName: formData.registeredCompanyName || undefined,
      rsaPhoneNumber: formData.rsaPhoneNumber || undefined,
      bankAccountNumber: formData.bankAccountNumber || undefined,
      deliveryMethod: formData.deliveryMethod,
      totalAmount,
      vatAmount: totalAmount * 0.15 // 15% VAT
    };

    // Only add dates if they are set
    if (formData.deliveryDate) {
      orderData.deliveryDate = new Date(formData.deliveryDate);
    }

    if (formData.collectionDate) {
      orderData.collectionDate = new Date(formData.collectionDate);
    }

    onSave(orderData);
  };

  const validateRSAPhoneNumber = (number: string) => {
    // South African phone number format: +27 XX XXX XXXX
    const regex = /^(\+27|0)[1-9][0-9]{8}$/;
    return regex.test(number.replace(/\s+/g, ''));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

        <div className="relative w-full max-w-4xl transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl transition-all">
          <div className="absolute right-4 top-4">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
              <X className="h-6 w-6" />
            </button>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Edit Order #{order.id}</h2>

          <div className="space-y-6">
            {/* Company Information */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Company Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Registered Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.registeredCompanyName}
                    onChange={(e) => setFormData({ ...formData, registeredCompanyName: e.target.value })}
                    className="modern-input mt-1"
                    placeholder="Enter registered company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    RSA Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.rsaPhoneNumber}
                    onChange={(e) => setFormData({ ...formData, rsaPhoneNumber: e.target.value })}
                    className="modern-input mt-1"
                    placeholder="+27 XX XXX XXXX"
                  />
                  {formData.rsaPhoneNumber && !validateRSAPhoneNumber(formData.rsaPhoneNumber) && (
                    <p className="mt-1 text-sm text-red-600">Please enter a valid South African phone number</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Bank Account Number
                  </label>
                  <input
                    type="text"
                    value={formData.bankAccountNumber}
                    onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                    className="modern-input mt-1"
                    placeholder="Enter bank account number"
                  />
                </div>
              </div>
            </div>

            {/* Products */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Products</h3>
              <ProductSelector
                products={products}
                selectedProducts={selectedProducts.map(p => ({
                  productId: p.id,
                  quantity: p.quantity,
                  unitPrice: p.unitPrice
                }))}
                onAddProduct={(productId, quantity, unitPrice) => {
                  const product = products.find(p => p.id === productId);
                  if (product) {
                    setSelectedProducts([...selectedProducts, {
                      id: productId,
                      name: product.name,
                      quantity,
                      unitPrice
                    }]);
                  }
                }}
                onRemoveProduct={(index) => {
                  setSelectedProducts(prev => prev.filter((_, i) => i !== index));
                }}
                onUpdateQuantity={(index, quantity) => {
                  setSelectedProducts(prev => prev.map((p, i) => 
                    i === index ? { ...p, quantity } : p
                  ));
                }}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}