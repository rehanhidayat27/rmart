import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  FileText,
  Printer,
  Download,
  PlusCircle,
  X,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext.tsx';
import { formatRupiah } from '../../utils/posLogic.ts';
import { generateReceiptPdf } from '../../utils/pdfGenerator.ts';

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewReceipt: () => void;
}

export const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  isOpen,
  onClose,
  onViewReceipt,
}) => {
  const { lastCompletedTransaction, storeSettings, t } = usePOS();

  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#6336C9', '#F56B83', '#FFB547', '#10B981'],
        });
      } catch {
        // Fallback gracefully if canvas is constrained
      }
    }
  }, [isOpen]);

  if (!isOpen || !lastCompletedTransaction) return null;

  const trx = lastCompletedTransaction;

  const handleDownloadPdf = () => {
    generateReceiptPdf(trx, storeSettings, true);
  };

  const handlePrint = () => {
    onViewReceipt();
    setTimeout(() => {
      window.print();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#1E293B] w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-center animate-in zoom-in-95 duration-200 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Animated Success Badge */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-500 mx-auto flex items-center justify-center mb-4 ring-8 ring-emerald-50 dark:ring-emerald-950/30">
          <CheckCircle2 className="w-9 h-9 stroke-[2.3] animate-bounce" />
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          {t('Pembayaran Berhasil!', 'Payment Successful!')}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {t('Transaksi telah disimpan & stok otomatis terpotong', 'Transaction saved & stock updated')}
        </p>

        {/* Transaction Summary Card */}
        <div className="my-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">No. Transaksi</span>
            <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
              {trx.code}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Waktu</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {trx.date}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Metode</span>
            <span className="uppercase font-semibold text-slate-800 dark:text-slate-200">
              {trx.paymentMethod}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Kasir</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {trx.cashierName}
            </span>
          </div>
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Total Pembayaran
            </span>
            <span className="text-base font-bold text-slate-900 dark:text-white font-mono">
              {formatRupiah(trx.total)}
            </span>
          </div>
          {trx.paymentMethod === 'cash' && (
            <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
              <span>Kembalian</span>
              <span className="font-mono text-sm font-bold">
                {formatRupiah(trx.changeAmount)}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={onViewReceipt}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4 text-purple-500" />
            <span>Lihat Struk</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-purple-500" />
            <span>Cetak Struk</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 font-semibold text-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Unduh PDF</span>
          </button>

          <button
            onClick={onClose}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #6336C9 0%, #F56B83 100%)',
            }}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Transaksi Baru</span>
          </button>
        </div>
      </div>
    </div>
  );
};
