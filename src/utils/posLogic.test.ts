import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatRupiah,
  calculateCartTotals,
  calculateChange,
  canAddStock,
  generateTransactionCode,
  getStockStatus,
  type CartItem,
} from './posLogic.ts';

test('formatRupiah formats Indonesian currency correctly', () => {
  assert.equal(formatRupiah(0), 'Rp 0');
  assert.equal(formatRupiah(64000), 'Rp 64.000');
  assert.equal(formatRupiah(12850000), 'Rp 12.850.000');
  assert.equal(formatRupiah(NaN), 'Rp 0');
});

test('calculateCartTotals calculates subtotal, discount, and tax correctly', () => {
  const items: CartItem[] = [
    {
      id: 'p1',
      name: 'Beras 5kg',
      sku: 'BRS-001',
      price: 64000,
      costPrice: 55000,
      qty: 2,
      stock: 15,
      unit: 'sak',
    },
    {
      id: 'p2',
      name: 'Minyak Goreng 1L',
      sku: 'MYK-001',
      price: 56000,
      costPrice: 48000,
      qty: 1,
      stock: 28,
      unit: 'pouch',
    },
  ];

  // 2 * 64,000 + 1 * 56,000 = 128,000 + 56,000 = 184,000
  const totalsWithoutDiscount = calculateCartTotals(items, 0, 0);
  assert.equal(totalsWithoutDiscount.subtotal, 184000);
  assert.equal(totalsWithoutDiscount.totalItems, 3);
  assert.equal(totalsWithoutDiscount.discountAmount, 0);
  assert.equal(totalsWithoutDiscount.total, 184000);

  // 10% discount on 184,000 = 18,400, net = 165,600
  const totalsWithDiscount = calculateCartTotals(items, 10, 0);
  assert.equal(totalsWithDiscount.discountAmount, 18400);
  assert.equal(totalsWithDiscount.total, 165600);
});

test('calculateChange calculates cash change accurately and flags insufficient funds', () => {
  const result1 = calculateChange(200000, 184000);
  assert.equal(result1.change, 16000);
  assert.equal(result1.isSufficient, true);

  const exact = calculateChange(184000, 184000);
  assert.equal(exact.change, 0);
  assert.equal(exact.isSufficient, true);

  const underpaid = calculateChange(150000, 184000);
  assert.equal(underpaid.change, 0);
  assert.equal(underpaid.isSufficient, false);
});

test('canAddStock prevents adding items when exceeding available stock', () => {
  assert.equal(canAddStock(0, 1, 10), true);
  assert.equal(canAddStock(9, 1, 10), true);
  assert.equal(canAddStock(10, 1, 10), false);
  assert.equal(canAddStock(5, 6, 10), false);
  assert.equal(canAddStock(0, 0, 10), false);
});

test('generateTransactionCode formats code with leading zeroes', () => {
  assert.equal(generateTransactionCode(1), 'TRX-000001');
  assert.equal(generateTransactionCode(1247), 'TRX-001247');
});

test('getStockStatus identifies available, low, and out of stock levels', () => {
  assert.equal(getStockStatus(20, 5), 'available');
  assert.equal(getStockStatus(5, 5), 'low');
  assert.equal(getStockStatus(2, 5), 'low');
  assert.equal(getStockStatus(0, 5), 'out_of_stock');
  assert.equal(getStockStatus(-1, 5), 'out_of_stock');
});
