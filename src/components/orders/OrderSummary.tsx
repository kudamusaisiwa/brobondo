import React from 'react';
import { extractVAT } from '../../utils/pricing';
import type { Product } from '../../store/productStore';
import type { Customer } from '../../types';

interface OrderSummaryProps {
  selectedProducts: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
  customer?: Customer | null;
  onCreateOrder?: () => void;
}

export default function OrderSummary({
  selectedProducts,
  customer,
  onCreateOrder
}: OrderSummaryProps) {
  const totalAmount = (selectedProducts || []).reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  // Extract VAT from total (since prices include VAT)
  const vatAmount = extractVAT(totalAmount);
  const subtotal = totalAmount - vatAmount;

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Order Summary</h2>

      {customer && (
        <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Customer</h3>
          <div className="text-gray-900 dark:text-white">
            <p className="font-medium">{customer.firstName} {customer.lastName}</p>
            {customer.companyName && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{customer.companyName}</p>
            )}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {selectedProducts && selectedProducts.length > 0 ? (
          <>
            <div className="space-y-2">
              {selectedProducts.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {item.quantity}x {item.productId}
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    ${(item.quantity * item.unitPrice).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Subtotal (excl. VAT)</span>
                <span className="text-gray-900 dark:text-white">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-600 dark:text-gray-400">VAT (15%)</span>
                <span className="text-gray-900 dark:text-white">${vatAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium text-base mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-900 dark:text-white">Total</span>
                <span className="text-gray-900 dark:text-white">${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {onCreateOrder && (
              <button
                onClick={onCreateOrder}
                className="w-full mt-6 btn-primary"
              >
                Create Order
              </button>
            )}
          </>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            No products selected
          </p>
        )}
      </div>
    </div>
  );
}