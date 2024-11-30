import React from 'react';
import { Calculator } from 'lucide-react';
import { calculateGrossProfit, calculateMarkup, formatCurrency } from '../../utils/pricing';
import ProfitMarginBadge from './ProfitMarginBadge';

interface ProductPricingCardProps {
  basePrice: number;
  costPrice: number;
  showDetails?: boolean;
}

export default function ProductPricingCard({ 
  basePrice, 
  costPrice, 
  showDetails = false 
}: ProductPricingCardProps) {
  const grossProfitMargin = calculateGrossProfit(basePrice, costPrice);
  const markupPercentage = calculateMarkup(basePrice, costPrice);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Pricing Details</h3>
        <Calculator className="h-5 w-5 text-gray-400" />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">Selling Price</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {formatCurrency(basePrice)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">Cost Price</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {formatCurrency(costPrice)}
          </span>
        </div>

        {showDetails && (
          <>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Gross Profit</span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  {formatCurrency(basePrice - costPrice)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Markup</span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {markupPercentage.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <ProfitMarginBadge margin={grossProfitMargin} size="lg" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}