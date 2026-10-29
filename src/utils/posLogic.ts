/**
 * Pure POS calculation & validation business logic for RMart POS
 * Decoupled from UI for 100% unit testability
 */

export interface CartItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  costPrice: number;
  qty: number;
  stock: number;
  unit: string;
}

export interface CalculationResult {
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  total: number;
  totalItems: number;
}

/**
 * Format number into Indonesian Rupiah (Rp)
 */
export function formatRupiah(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'Rp 0';
  }
  const formatted = Math.round(amount).toLocaleString('id-ID');
  return `Rp ${formatted}`;
}

/**
 * Calculate totals for cart items
 */
export function calculateCartTotals(
  items: CartItem[],
  discountPercent: number = 0,
  taxPercent: number = 0
): CalculationResult {
  const safeDiscountPercent = Math.max(0, Math.min(100, discountPercent || 0));
  const safeTaxPercent = Math.max(0, Math.min(100, taxPercent || 0));

  const subtotal = items.reduce((sum, item) => {
    const itemQty = Math.max(0, item.qty || 0);
    const itemPrice = Math.max(0, item.price || 0);
    return sum + itemQty * itemPrice;
  }, 0);

  const totalItems = items.reduce((sum, item) => sum + Math.max(0, item.qty || 0), 0);

  const discountAmount = Math.round((subtotal * safeDiscountPercent) / 100);
  const afterDiscount = Math.max(0, subtotal - discountAmount);

  const taxAmount = Math.round((afterDiscount * safeTaxPercent) / 100);
  const total = afterDiscount + taxAmount;

  return {
    subtotal,
    discountPercent: safeDiscountPercent,
    discountAmount,
    taxPercent: safeTaxPercent,
    taxAmount,
    total,
    totalItems,
  };
}

/**
 * Calculate change money (kembalian)
 */
export function calculateChange(cashReceived: number, totalAmount: number): {
  change: number;
  isSufficient: boolean;
} {
  const safeCash = Math.max(0, cashReceived || 0);
  const safeTotal = Math.max(0, totalAmount || 0);
  const change = safeCash - safeTotal;
  return {
    change: Math.max(0, change),
    isSufficient: safeCash >= safeTotal,
  };
}

/**
 * Validate if quantity can be added to cart against current stock
 */
export function canAddStock(currentInCart: number, addQty: number, availableStock: number): boolean {
  if (addQty <= 0) return false;
  return currentInCart + addQty <= availableStock;
}

/**
 * Generate formatted unique transaction code
 * e.g., TRX-001247
 */
export function generateTransactionCode(counter: number, prefix: string = 'TRX'): string {
  const pad = String(counter).padStart(6, '0');
  return `${prefix}-${pad}`;
}

/**
 * Check stock status level
 */
export function getStockStatus(stock: number, minStock: number = 5): 'available' | 'low' | 'out_of_stock' {
  if (stock <= 0) return 'out_of_stock';
  if (stock <= minStock) return 'low';
  return 'available';
}
