import React, { useState } from 'react';
import { X, Receipt, Printer, Download, Ban, AlertCircle } from 'lucide-react';
import { usePOS } from '../../context/POSContext.tsx';
import { Transaction } from '../../types/index.ts';
import { formatRupiah } from '../../utils/posLogic.ts';
import { generateReceiptPdf } from '../../utils/pdfGenerator.ts';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onOpenReceipt: (trx: Transaction) => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  onClose,
  onOpenReceipt,
}) => {
  const { storeSettings, cancelTransaction, currentUser, t } = usePOS();
  const [isCancelConfirm, setIsCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  if (!transaction) return null;

  const canCancel =
    (currentUser?.role === 'admin' || currentUser?.role === 'manager') &&
    transaction.status === 'completed';

  const handleCancel = () => {
    if (!cancelReason.trim()) return;
    cancelTransaction(transaction.id, cancelReason);
    setIsCancelConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#1E293B] w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Receipt className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Detail Transaksi: {transaction.code}
              </h3>
              <p className="text-[11px] text-slate-500">{transaction.date}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs custom-scrollbar">
          {/* Status banner */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-between ${
              transaction.status === 'completed'
                ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 text-emerald-700 dark:text-emerald-300'
                : 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 text-rose-700 dark:text-rose-300'
            }`}
          >
            <span className="font-bold uppercase tracking-wider">
              Status: {transaction.status === 'completed' ? 'Selesai' : 'Dibatalkan'}
            </span>
            <span className="font-semibold uppercase">
              Metode: {transaction.paymentMethod}
            </span>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
            <div>
              <span className="text-slate-400">Kasir:</span>
              <div className="font-bold text-slate-800 dark:text-white mt-0.5">
                {transaction.cashierName}
              </div>
            </div>
            <div>
              <span className="text-slate-400">No. Transaksi:</span>
              <div className="font-mono font-bold text-purple-600 dark:text-purple-400 mt-0.5">
                {transaction.code}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-2">
            <div className="font-bold text-slate-700 dark:text-slate-300">
              Daftar Barang Belanja
            </div>
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase text-slate-400 font-semibold">
                  <tr>
                    <th className="p-2.5">Item</th>
                    <th className="p-2.5">Harga</th>
                    <th className="p-2.5 text-center">Qty</th>
                    <th className="p-2.5 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {transaction.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 font-medium text-slate-800 dark:text-slate-200">
                        {item.name}
                      </td>
                      <td className="p-2.5 font-mono text-slate-600 dark:text-slate-400">
                        {formatRupiah(item.price)}
                      </td>
                      <td className="p-2.5 text-center font-bold font-mono">
                        {item.qty}
                      </td>
                      <td className="p-2.5 text-right font-bold font-mono text-slate-900 dark:text-white">
                        {formatRupiah(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Box */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-1.5 font-mono">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Subtotal:</span>
              <span>{formatRupiah(transaction.subtotal)}</span>
            </div>
            {transaction.discountAmount > 0 && (
              <div className="flex justify-between text-rose-500">
                <span>Diskon ({transaction.discountPercent}%):</span>
                <span>-{formatRupiah(transaction.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-800">
              <span>Total:</span>
              <span>{formatRupiah(transaction.total)}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400 pt-1">
              <span>Diterima:</span>
              <span>{formatRupiah(transaction.cashReceived)}</span>
            </div>
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
              <span>Kembalian:</span>
              <span>{formatRupiah(transaction.changeAmount)}</span>
            </div>
          </div>

          {/* Cancellation reason if cancelled */}
          {transaction.status === 'cancelled' && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 rounded-xl space-y-1">
              <span className="font-bold text-rose-700 dark:text-rose-400">
                Alasan Pembatalan:
              </span>
              <p className="text-slate-700 dark:text-slate-300">
                {transaction.cancelReason || 'Dibatalkan oleh kasir/admin'}
              </p>
              <div className="text-[10px] text-slate-400">
                Oleh {transaction.cancelledBy} pada {transaction.cancelledAt}
              </div>
            </div>
          )}

          {/* Cancellation form */}
          {isCancelConfirm && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 rounded-xl space-y-2.5">
              <div className="flex items-center gap-1.5 font-bold text-rose-600 text-xs">
                <AlertCircle className="w-4 h-4" />
                <span>Konfirmasi Pembatalan Transaksi</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Stok barang akan otomatis dikembalikan ke inventaris toko.
              </p>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Masukkan alasan pembatalan (wajib)..."
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-rose-300 rounded-lg outline-none"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCancelConfirm(false)}
                  className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={!cancelReason.trim()}
                  className="px-3 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg disabled:opacity-50"
                >
                  Proses Batal
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <div>
            {canCancel && !isCancelConfirm && (
              <button
                type="button"
                onClick={() => setIsCancelConfirm(true)}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 font-semibold text-xs transition-colors"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Batalkan Transaksi</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => generateReceiptPdf(transaction, storeSettings, true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-purple-600" />
              <span>PDF Struk</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenReceipt(transaction)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white font-bold text-xs shadow-md shadow-purple-600/30"
              style={{
                background: 'linear-gradient(135deg, #6336C9 0%, #F56B83 100%)',
              }}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Thermal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
