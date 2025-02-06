import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useProductStore, type Product } from '../../store/productStore';
import { calculateGrossProfit, calculateMarkup } from '../../utils/pricing';
import ProfitMarginBadge from '../products/ProfitMarginBadge';
import type { UnitType } from '../../types';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: Product;
}

export default function EditProductModal({ isOpen, onClose, onSuccess, product }: EditProductModalProps) {
  const { updateProduct } = useProductStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: product?.name || '',
    category: product?.category || '',
    minQuantity: product?.minQuantity?.toString() || '1',
    basePrice: product?.basePrice?.toString() || '0',
    costPrice: product?.costPrice?.toString() || '0',
    unit: product?.unit || 'piece',
    unitType: product?.unitType || 'product',
    description: product?.description || '',
    imageUrl: product?.imageUrl || ''
  });

  // If no product is provided or modal is closed, don't render
  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const basePrice = parseFloat(formData.basePrice);
      const costPrice = parseFloat(formData.costPrice);

      if (costPrice > basePrice) {
        throw new Error('Cost price cannot be greater than selling price');
      }

      await updateProduct(product.id, {
        ...formData,
        minQuantity: parseInt(formData.minQuantity) || 1,
        basePrice,
        costPrice
      });
      onSuccess();
    } catch (error) {
      console.error('Error updating product:', error);
    } finally {
      setLoading(false);
    }
  };

  const grossProfitMargin = calculateGrossProfit(
    parseFloat(formData.basePrice),
    parseFloat(formData.costPrice)
  );

  const markupPercentage = calculateMarkup(
    parseFloat(formData.basePrice),
    parseFloat(formData.costPrice)
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

        <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl transition-all">
          <div className="absolute right-4 top-4">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
              <X className="h-6 w-6" />
            </button>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Edit Property</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Type
              </label>
              <select
                value={formData.unitType}
                onChange={(e) => setFormData({ ...formData, unitType: e.target.value as 'product' | 'service' })}
                className="modern-select mt-1"
                required
              >
                <option value="product">Product</option>
                <option value="service">Service</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="modern-input mt-1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="modern-input mt-1"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Minimum Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.minQuantity}
                  onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
                  className="modern-input mt-1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Unit
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value as UnitType })}
                  className="modern-select mt-1"
                  required
                >
                  {formData.unitType === 'product' ? (
                    <>
                      <option value="piece">Piece</option>
                      <option value="meter">Meter</option>
                      <option value="square_meter">Square Meter</option>
                      <option value="cubic_meter">Cubic Meter</option>
                    </>
                  ) : (
                    <>
                      <option value="service">Service</option>
                      <option value="hour">Hour</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Cost Price ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                  className="modern-input mt-1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Selling Price ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                  className="modern-input mt-1"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Gross Profit Margin
                </label>
                <div className="mt-1">
                  <ProfitMarginBadge margin={grossProfitMargin} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Markup Percentage
                </label>
                <div className="mt-1 text-sm font-medium text-blue-600 dark:text-blue-400">
                  {markupPercentage.toFixed(1)}%
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="modern-textarea mt-1"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Image URL
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="modern-input mt-1"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-800"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}