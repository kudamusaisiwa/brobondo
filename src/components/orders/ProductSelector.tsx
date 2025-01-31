import React, { useState } from 'react';
import { Plus, Trash } from 'lucide-react';
import Select from 'react-select';
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

interface ProductOption {
  value: string;
  label: string;
  product: Product;
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

  // Convert products to options format for react-select
  const productOptions: ProductOption[] = products.map(product => ({
    value: product.id,
    label: `${product.name} - $${product.basePrice.toFixed(2)}`,
    product
  }));

  const handleProductChange = (option: ProductOption | null) => {
    if (option) {
      setSelectedProductId(option.value);
      const product = option.product;
      setUnitPrice(product.basePrice);
      setCostPrice(product.costPrice);
      setQuantity(product.minQuantity);
      setErrors({ quantity: '', unitPrice: '' });
    } else {
      setSelectedProductId('');
      setUnitPrice(0);
      setCostPrice(0);
      setQuantity(0);
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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Product
          </label>
          <Select
            options={productOptions}
            value={productOptions.find(option => option.value === selectedProductId) || null}
            onChange={(option) => handleProductChange(option as ProductOption)}
            className="react-select-container"
            classNamePrefix="react-select"
            placeholder="Search for a product..."
            isClearable
            isSearchable
            styles={{
              control: (base) => ({
                ...base,
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--input-border)',
                '&:hover': {
                  borderColor: 'var(--input-border-hover)'
                }
              }),
              menu: (base) => ({
                ...base,
                backgroundColor: 'var(--dropdown-bg)',
                zIndex: 50
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isFocused 
                  ? 'var(--dropdown-hover-bg)' 
                  : 'var(--dropdown-bg)',
                color: 'var(--text-primary)'
              }),
              singleValue: (base) => ({
                ...base,
                color: 'var(--text-primary)'
              }),
              input: (base) => ({
                ...base,
                color: 'var(--text-primary)'
              })
            }}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Quantity
          </label>
          <input
            type="number"
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className={`modern-input ${errors.quantity ? 'border-red-500' : ''}`}
          />
          {errors.quantity && (
            <p className="mt-1 text-sm text-red-500">{errors.quantity}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Unit Price
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={unitPrice}
            onChange={(e) => setUnitPrice(Number(e.target.value))}
            className={`modern-input ${errors.unitPrice ? 'border-red-500' : ''}`}
          />
          {errors.unitPrice && (
            <p className="mt-1 text-sm text-red-500">{errors.unitPrice}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleAdd}
          disabled={!selectedProductId || !quantity || quantity <= 0}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Selected Products List */}
      <div className="mt-4">
        {selectedProducts.map((selectedProduct, index) => {
          const product = products.find(p => p.id === selectedProduct.productId);
          if (!product) return null;

          return (
            <div
              key={`${selectedProduct.productId}-${index}`}
              className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  {product.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Unit Price: ${selectedProduct.unitPrice.toFixed(2)}
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-24">
                  <input
                    type="number"
                    min="0"
                    value={selectedProduct.quantity}
                    onChange={(e) => onUpdateQuantity(index, Number(e.target.value))}
                    className="modern-input"
                  />
                </div>

                <p className="w-24 text-right font-medium text-gray-900 dark:text-white">
                  ${(selectedProduct.quantity * selectedProduct.unitPrice).toFixed(2)}
                </p>

                <button
                  onClick={() => onRemoveProduct(index)}
                  className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                >
                  <Trash className="h-5 w-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}