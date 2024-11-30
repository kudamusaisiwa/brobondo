import React, { useState } from 'react';
import { Plus, Trash } from 'lucide-react';
import type { Product } from '../../store/productStore';

interface ProductSelectorProps {
  products: Product[];
  selectedProducts: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    costPrice: number;
  }>;
  onAddProduct: (productId: string, quantity: number, unitPrice: number, costPrice: number) => void;
  onRemoveProduct: (index: number) => void;
  onUpdateQuantity: (index: number, quantity: number) => void;
}

export default function ProductSelector({
  products,
  selectedProducts,
  onAddProduct,
  onRemoveProduct,
  onUpdateQuantity
}: ProductSelectorProps) {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [unitPrice, setUnitPrice] = useState(0);
  const [costPrice, setCostPrice] = useState(0);
  const [errors, setErrors] = useState({
    quantity: '',
    unitPrice: ''
  });

  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);
    const product = products.find(p => p.id === productId);
    if (product) {
      setUnitPrice(product.basePrice);
      setCostPrice(product.costPrice);
      setQuantity(product.minQuantity);
      setErrors({ quantity: '', unitPrice: '' });
    }
  };

  const validateProduct = () => {
    const newErrors = {
      quantity: '',
      unitPrice: ''
    };

    const selectedProduct = products.find(p => p.id === selectedProductId);
    if (selectedProduct) {
      if (quantity < selectedProduct.minQuantity) {
        newErrors.quantity = `Minimum quantity is ${selectedProduct.minQuantity}`;
      }
      if (quantity > 10000) {
        newErrors.quantity = 'Maximum quantity is 10,000';
      }
      if (unitPrice <= 0) {
        newErrors.unitPrice = 'Unit price must be greater than 0';
      }
      if (unitPrice < selectedProduct.basePrice * 0.5) {
        newErrors.unitPrice = `Minimum price is $${(selectedProduct.basePrice * 0.5).toFixed(2)}`;
      }
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleAdd = () => {
    if (selectedProductId && validateProduct()) {
      const selectedProduct = products.find(p => p.id === selectedProductId);
      if (selectedProduct) {
        onAddProduct(
          selectedProductId, 
          quantity || 0, 
          unitPrice || selectedProduct.basePrice || 0, 
          costPrice || selectedProduct.costPrice || 0
        );
        setSelectedProductId('');
        setQuantity(0);
        setUnitPrice(0);
        setCostPrice(0);
        setErrors({ quantity: '', unitPrice: '' });
      }
    }
  };

  const handleQuantityChange = (value: number, index?: number) => {
    if (index !== undefined) {
      // Updating existing product
      const product = products.find(p => p.id === selectedProducts[index].productId);
      if (product && value >= product.minQuantity && value <= 10000) {
        onUpdateQuantity(index, value);
      }
    } else {
      // Adding new product
      setQuantity(value);
      if (errors.quantity) {
        setErrors(prev => ({ ...prev, quantity: '' }));
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Products</h2>

      <div className="space-y-4">
        {/* Product Selection Form */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <select
              value={selectedProductId}
              onChange={(e) => handleProductChange(e.target.value)}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 dark:focus:border-blue-400"
            >
              <option value="">Select a product</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <input
              type="number"
              value={quantity || ''}
              onChange={(e) => handleQuantityChange(Number(e.target.value))}
              placeholder="Quantity"
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 dark:focus:border-blue-400"
            />
            {errors.quantity && (
              <p className="text-sm text-red-500 mt-1">{errors.quantity}</p>
            )}
          </div>

          <div>
            <input
              type="number"
              value={unitPrice || ''}
              onChange={(e) => setUnitPrice(Number(e.target.value))}
              placeholder="Unit Price"
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 dark:focus:border-blue-400"
            />
            {errors.unitPrice && (
              <p className="text-sm text-red-500 mt-1">{errors.unitPrice}</p>
            )}
          </div>

          <div>
            <input
              type="number"
              value={costPrice || ''}
              onChange={(e) => setCostPrice(Number(e.target.value))}
              placeholder="Cost Price"
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 dark:focus:border-blue-400"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleAdd}
            disabled={!selectedProductId}
            className="flex items-center px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </button>
        </div>

        {/* Selected Products List */}
        <div className="mt-6">
          {selectedProducts.map((selectedProduct, index) => {
            const product = products.find(p => p.id === selectedProduct.productId);
            if (!product) return null;

            return (
              <div 
                key={index} 
                className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700"
              >
                <div className="flex-1">
                  <h3 className="text-gray-900 dark:text-white font-medium">{product.name}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Unit Price: ${(selectedProduct.unitPrice || 0).toFixed(2)}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Cost Price: ${(selectedProduct.costPrice || 0).toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    value={selectedProduct.quantity}
                    onChange={(e) => handleQuantityChange(Number(e.target.value), index)}
                    className="w-24 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 dark:focus:border-blue-400"
                  />
                  <button
                    onClick={() => onRemoveProduct(index)}
                    className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}