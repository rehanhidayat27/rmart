import React, { useState } from 'react';
import { X, Boxes, Save, AlertCircle } from 'lucide-react';
import { usePOS } from '../../context/POSContext.tsx';

interface StockAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProductId?: string;
}

export const StockAdjustModal: React.FC<StockAdjustModalProps> = ({
  isOpen,
  onClose,
  selectedProductId,
}) => {
  const { products, adjustStock, t } = usePOS();

  const [productId, setProductId] = useState(selectedProductId || products[0]?.id || '');
  const [type, setType] = useState<'in' | 'out' | 'adjustment'>('in');
  const [qty, setQty] = useState<number>(10);
  const [reason, setReason] = useState<string>('Restok barang dari supplier');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const currentProduct = products.find((p) => p.id === productId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) {
      setErrorMsg('Pilih produk yang akan disesuaikan.');
      return;
    }
    if (qty <= 0) {
      setErrorMsg('Jumlah harus lebih dari 0.');
      return;
    }
    if (!reason.trim()) {
      setErrorMsg('Alasan penyesuaian stok wajib diisi.');
      return;
    }

    adjustStock(productId, type, qty, reason.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#1E293B] w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Boxes className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t('Penyesuaian Stok Barang', 'Adjust Inventory Stock')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-4 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Product Select */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Pilih Produk Sembako *
            </label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-purple-500 text-slate-800 dark:text-slate-200"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Stok: {p.stock} {p.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Current Stock Banner */}
          {currentProduct && (
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/50 flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">
                Stok Saat Ini:
              </span>
              <span className="font-mono font-bold text-purple-600 dark:text-purple-300 text-sm">
                {currentProduct.stock} {currentProduct.unit}
              </span>
            </div>
          )}

          {/* Type of Adjustment */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Jenis Mutasi Stok *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setType('in');
                  setReason('Barang masuk dari supplier');
                }}
                className={`py-2 px-1 rounded-xl border text-center font-semibold transition-all cursor-pointer ${
                  type === 'in'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                + Masuk (In)
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('out');
                  setReason('Barang rusak / bocor');
                }}
                className={`py-2 px-1 rounded-xl border text-center font-semibold transition-all cursor-pointer ${
                  type === 'out'
                    ? 'border-rose-500 bg-rose-50 text-rose-700 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                - Keluar (Out)
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('adjustment');
                  setReason('Hasil stock opname fisik toko');
                }}
                className={`py-2 px-1 rounded-xl border text-center font-semibold transition-all cursor-pointer ${
                  type === 'adjustment'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                Opname Set
              </button>
            </div>
          </div>

          {/* Qty */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              {type === 'adjustment' ? 'Set Total Stok Menjadi *' : 'Jumlah Perubahan *'}
            </label>
            <input
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(parseInt(e.target.value, 10) || 0)}
              className="w-full px-3 py-2 font-mono font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-purple-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Alasan Penyesuaian (Audit Trail) *
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Kiriman baru dari agen, barang kadaluarsa..."
              required
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-purple-500 text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-white font-bold shadow-md shadow-purple-600/30"
              style={{
                background: 'linear-gradient(135deg, #6336C9 0%, #F56B83 100%)',
              }}
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Mutasi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
