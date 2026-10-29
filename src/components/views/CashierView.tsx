import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Barcode,
  ShoppingBag,
  CreditCard,
  AlertCircle,
  Tag,
  Package,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext.tsx';
import { formatRupiah } from '../../utils/posLogic.ts';
import { PaymentModal } from '../modals/PaymentModal.tsx';
import { PaymentSuccessModal } from '../modals/PaymentSuccessModal.tsx';

export const CashierView: React.FC = () => {
  const {
    products,
    categories,
    cart,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    discountPercent,
    setDiscountPercent,
    cartTotals,
    setPreviewReceiptTransaction,
    lastCompletedTransaction,
    t,
  } = usePOS();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [barcodeInput, setBarcodeInput] = useState<string>('');
  const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState<boolean>(false);

  // Filter products by category & search query
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (p.status !== 'active') return false;
      const matchesCategory =
        selectedCategory === 'all' || p.categoryId === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        p.barcode.includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Handle fast barcode scanner enter
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    const found = products.find(
      (p) =>
        p.barcode === barcodeInput.trim() ||
        p.sku.toLowerCase() === barcodeInput.trim().toLowerCase()
    );
    if (found) {
      addToCart(found);
      setBarcodeInput('');
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Page Title & Barcode Scanner input */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-[28px] font-bold text-slate-900 dark:text-white tracking-tight">
            {t('Kasir', 'Point of Sale')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t('Transaksi penjualan dengan cepat dan mudah', 'Process fast and reliable sales transactions')}
          </p>
        </div>

        {/* Barcode Fast Scan Simulator */}
        <form
          onSubmit={handleBarcodeSubmit}
          className="relative max-w-xs w-full flex items-center"
        >
          <Barcode className="absolute left-3 w-4 h-4 text-purple-600 dark:text-purple-400" />
          <input
            type="text"
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            placeholder={t('Scan barcode / SKU enter...', 'Scan barcode / SKU...')}
            className="w-full pl-9 pr-3 py-1.5 text-xs font-mono bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/30 text-slate-800 dark:text-slate-200 shadow-xs"
          />
        </form>
      </div>

      {/* Main Split Layout: Left Catalog Grid (7 cols) + Right Cart (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Category Pills & Product Catalog Grid */}
        <div className="lg:col-span-7 space-y-4">
          {/* Category Pills Bar matching reference screenshot */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'text-white shadow-md shadow-purple-900/30'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
              }`}
              style={
                selectedCategory === 'all'
                  ? {
                      background: 'linear-gradient(135deg, #6336C9 0%, #F56B83 100%)',
                    }
                  : undefined
              }
            >
              Semua
            </button>

            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'text-white shadow-md shadow-purple-900/30'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
                  }`}
                  style={
                    isSelected
                      ? {
                          background:
                            'linear-gradient(135deg, #6336C9 0%, #F56B83 100%)',
                        }
                      : undefined
                  }
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Search within catalog */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari produk di katalog..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-purple-500 text-slate-800 dark:text-slate-200"
            />
          </div>

          {/* Products Grid matching reference screenshot */}
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                Tidak ada produk ditemukan
              </div>
              <p className="text-xs text-slate-400">
                Coba pilih kategori lain atau kata kunci pencarian berbeda
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {filteredProducts.map((product) => {
                const inCart = cart.find((c) => c.productId === product.id);
                const isOutOfStock = product.stock <= 0;

                return (
                  <div
                    key={product.id}
                    className={`group bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3 flex flex-col justify-between hover:shadow-lg transition-all duration-200 relative ${
                      isOutOfStock ? 'opacity-60 grayscale-50' : ''
                    }`}
                  >
                    {/* Top image container */}
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800 mb-2.5">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {/* Stock badge */}
                      <span
                        className={`absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                          product.stock <= product.minStock
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-900/70 text-white backdrop-blur-xs'
                        }`}
                      >
                        {product.stock} {product.unit}
                      </span>

                      {/* In cart indicator pill */}
                      {inCart && (
                        <span className="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-600 text-white">
                          {inCart.qty}x
                        </span>
                      )}
                    </div>

                    {/* Product Name & Price */}
                    <div>
                      <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                        {product.name}
                      </h4>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                          {formatRupiah(product.sellingPrice)}
                        </span>

                        {/* Quick Add (+) Button */}
                        <button
                          onClick={() => addToCart(product)}
                          disabled={isOutOfStock}
                          title="Tambah ke Keranjang"
                          className="w-6 h-6 rounded-full bg-[#6336C9] hover:bg-purple-700 active:scale-95 text-white flex items-center justify-center shadow-md shadow-purple-600/30 transition-all cursor-pointer disabled:bg-slate-400 disabled:pointer-events-none"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Keranjang Belanja Card matching reference screenshot */}
        <div className="lg:col-span-5 bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 space-y-4 lg:sticky lg:top-24">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-purple-600" />
              <span>{t('Keranjang Belanja', 'Shopping Cart')}</span>
            </h3>
            {cart.length > 0 && (
              <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-full">
                {cartTotals.totalItems} item
              </span>
            )}
          </div>

          {/* Cart Items Table */}
          {cart.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Keranjang masih kosong
              </div>
              <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto">
                Pilih produk dari katalog di sebelah kiri untuk memulai transaksi
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-semibold">
                    <th className="pb-2 px-1">No</th>
                    <th className="pb-2 px-2">Nama Produk</th>
                    <th className="pb-2 px-2">Harga</th>
                    <th className="pb-2 px-2 text-center">Qty</th>
                    <th className="pb-2 px-2 text-right">Subtotal</th>
                    <th className="pb-2 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {cart.map((item, index) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                    >
                      <td className="py-2.5 px-1 text-slate-400 font-semibold">
                        {index + 1}
                      </td>
                      <td className="py-2.5 px-2 font-medium text-slate-800 dark:text-slate-200">
                        <div className="truncate max-w-[120px] sm:max-w-[140px]">
                          {item.name}
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                        {formatRupiah(item.price)}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <div className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                          <button
                            onClick={() =>
                              updateCartQty(item.productId, item.qty - 1)
                            }
                            className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-md text-slate-600 dark:text-slate-300 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-5 text-center font-bold text-xs font-mono">
                            {item.qty}
                          </span>
                          <button
                            onClick={() =>
                              updateCartQty(item.productId, item.qty + 1)
                            }
                            className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded-md text-slate-600 dark:text-slate-300 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-right font-bold text-slate-900 dark:text-white font-mono text-[11px]">
                        {formatRupiah(item.qty * item.price)}
                      </td>
                      <td className="py-2.5 text-center">
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded-md transition-colors"
                          title="Hapus Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Cart Calculation Summary matching reference screenshot */}
          {cart.length > 0 && (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span>Total Item</span>
                <span className="font-semibold">{cartTotals.totalItems}</span>
              </div>

              {/* Discount Input */}
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  <span>Diskon</span>
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercent}
                    onChange={(e) =>
                      setDiscountPercent(
                        Math.max(0, Math.min(100, parseInt(e.target.value, 10) || 0))
                      )
                    }
                    className="w-12 px-1.5 py-0.5 text-right font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-semibold outline-none focus:border-purple-500"
                  />
                  <span>%</span>
                </div>
              </div>

              {cartTotals.discountAmount > 0 && (
                <div className="flex justify-between text-rose-500 font-semibold text-[11px]">
                  <span>Potongan Diskon</span>
                  <span>-{formatRupiah(cartTotals.discountAmount)}</span>
                </div>
              )}

              {/* Prominent Total Bayar matching screenshot */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Total Bayar
                </span>
                <span className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
                  {formatRupiah(cartTotals.total)}
                </span>
              </div>

              {/* Action Buttons matching screenshot: Hapus Keranjang (coral) & Proses Pembayaran (gradient) */}
              <div className="grid grid-cols-2 gap-3 pt-3">
                <button
                  type="button"
                  onClick={clearCart}
                  className="py-2.5 px-3 rounded-xl bg-[#F56B83] hover:bg-[#e0566e] text-white font-bold text-xs shadow-md shadow-rose-500/20 active:scale-[0.98] transition-all cursor-pointer"
                >
                  Hapus Keranjang
                </button>

                <button
                  type="button"
                  onClick={() => setIsPaymentOpen(true)}
                  className="py-2.5 px-3 rounded-xl text-white font-bold text-xs shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                  style={{
                    background:
                      'linear-gradient(135deg, #6336C9 0%, #F56B83 100%)',
                  }}
                >
                  Proses Pembayaran
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Confirmation Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onSuccess={() => setIsSuccessOpen(true)}
      />

      {/* Payment Success Modal */}
      <PaymentSuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        onViewReceipt={() => {
          setIsSuccessOpen(false);
          setPreviewReceiptTransaction(lastCompletedTransaction);
        }}
      />
    </div>
  );
};
