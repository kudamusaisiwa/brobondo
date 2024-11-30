export function calculateGrossProfit(sellingPrice: number, costPrice: number): number {
  if (!sellingPrice || !costPrice || sellingPrice <= 0 || costPrice <= 0) return 0;
  return ((sellingPrice - costPrice) / sellingPrice) * 100;
}

export function calculateMarkup(sellingPrice: number, costPrice: number): number {
  if (!sellingPrice || !costPrice || sellingPrice <= 0 || costPrice <= 0) return 0;
  return ((sellingPrice - costPrice) / costPrice) * 100;
}

export function extractVAT(amountIncVAT: number, vatRate: number = 0.15): number {
  return (amountIncVAT * vatRate) / (1 + vatRate);
}

export function calculatePriceExVAT(priceIncVAT: number, vatRate: number = 0.15): number {
  return priceIncVAT / (1 + vatRate);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function calculateTotalCost(products: Array<{ quantity: number; costPrice: number }>): number {
  return products.reduce((total, product) => total + (product.quantity * product.costPrice), 0);
}

export function calculateTotalRevenue(products: Array<{ quantity: number; basePrice: number }>): number {
  return products.reduce((total, product) => total + (product.quantity * product.basePrice), 0);
}

export function calculateOrderProfitMargin(
  products: Array<{ quantity: number; basePrice: number; costPrice: number }>
): number {
  const totalRevenue = calculateTotalRevenue(products);
  const totalCost = calculateTotalCost(products);
  
  if (totalRevenue <= 0 || totalCost <= 0) return 0;
  return ((totalRevenue - totalCost) / totalRevenue) * 100;
}