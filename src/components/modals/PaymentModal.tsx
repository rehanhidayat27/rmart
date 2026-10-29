import React, { useState } from 'react';
import {
  X,
  CreditCard,
  QrCode,
  Banknote,
  Check,
  AlertCircle,
  Loader2,
  Building2,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext.tsx';
import { formatRupiah, calculateChange } from '../../utils/posLogic.ts';
import { PaymentMethod } from '../../types/index.ts';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { cartTotals, processTransaction, t } = usePOS();
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [cashInput, setCashInput] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const total = cartTotals.total;
  const numericCash = method === 'cash' ? (cashInput ? parseInt(cashInput, 10) : 0) : total;
  const { change, isSufficient } = calculateChange(numericCash, total);

  // Quick cash buttons
  const quickCashOptions = [
    { label: 'Uang Pas', amount: total },
    { label: 'Rp 50.000', amount: 50000 },
    { label: 'Rp 100.000', amount: 100000 },
    { label: 'Rp 200.000', amount: 200000 },
    { label: 'Rp 500.000', amount: 500000 },
  ].filter((opt) => opt.amount >= total || opt.label === 'Uang Pas');

  const handleConfirmPayment = () => {
    if (method === 'cash' && !isSufficient) {
      setErrorMsg('Nominal uang tunai yang diterima masih kurang!');
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');

    // Simulate micro-delay for realistic bank/pos settlement
    setTimeout(() => {
      const result = processTransaction({
        paymentMethod: method,
        cashReceived: numericCash,
        notes,
      });

      setIsProcessing(false);

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMsg(result.error || 'Gagal memproses transaksi.');
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#1E293B] w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t('Konfirmasi Pembayaran Kasir', 'Confirm Payment')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('Pilih metode pembayaran dan masukkan nominal', 'Select payment method and input amount')}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Total Tagihan Prominent Display */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t('Total Tagihan Belanja', 'Total Due')}
            </span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
              {formatRupiah(total)}
            </span>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              {t('Metode Pembayaran', 'Payment Method')}
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setMethod('cash')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold gap-1.5 transition-all cursor-pointer ${
                  method === 'cash'
                    ? 'border-purple-600 bg-purple-50/70 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 ring-2 ring-purple-600/20'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Banknote className="w-5 h-5" />
                <span>Tunai (Cash)</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('qris')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold gap-1.5 transition-all cursor-pointer ${
                  method === 'qris'
                    ? 'border-purple-600 bg-purple-50/70 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 ring-2 ring-purple-600/20'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <QrCode className="w-5 h-5" />
                <span>QRIS Dinamis</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('transfer')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold gap-1.5 transition-all cursor-pointer ${
                  method === 'transfer'
                    ? 'border-purple-600 bg-purple-50/70 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 ring-2 ring-purple-600/20'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Building2 className="w-5 h-5" />
                <span>Transfer Bank</span>
              </button>
            </div>
          </div>

          {/* Conditional Cash Payment Interface */}
          {method === 'cash' && (
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('Uang Tunai Diterima (Rp)', 'Cash Received (IDR)')}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={cashInput}
                    onChange={(e) => {
                      setCashInput(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="0"
                    className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-base font-bold text-slate-900 dark:text-white outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    autoFocus
                  />
                </div>
              </div>

              {/* Quick Cash Buttons */}
              <div className="flex flex-wrap gap-2">
                {quickCashOptions.map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setCashInput(opt.amount.toString())}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-900/50 hover:text-purple-700 dark:hover:text-purple-300 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Kembalian Real-time Preview */}
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between ${
                  isSufficient
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60'
                    : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60'
                }`}
              >
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {t('Kembalian Pelanggan', 'Customer Change')}
                </span>
                <span
                  className={`text-lg font-mono font-extrabold ${
                    isSufficient
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {isSufficient ? formatRupiah(change) : 'Uang Kurang'}
                </span>
              </div>
            </div>
          )}

          {/* Conditional QRIS Interface */}
          {method === 'qris' && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center space-y-3">
              <div className="w-36 h-36 bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex items-center justify-center">
                {/* Clean realistic QRIS QR representation */}
                <div className="w-full h-full bg-slate-900 p-2 rounded-lg flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div className="w-7 h-7 bg-white rounded-xs p-1">
                      <div className="w-full h-full bg-slate-900" />
                    </div>
                    <div className="w-7 h-7 bg-white rounded-xs p-1">
                      <div className="w-full h-full bg-slate-900" />
                    </div>
                  </div>
                  <div className="text-[9px] font-mono font-bold text-white tracking-widest text-center">
                    RMART-QRIS
                  </div>
                  <div className="flex justify-between">
                    <div className="w-7 h-7 bg-white rounded-xs p-1">
                      <div className="w-full h-full bg-slate-900" />
                    </div>
                    <div className="w-4 h-4 bg-emerald-400 rounded-xs" />
                  </div>
                </div>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Scan QRIS dengan BCA, Mandiri, GoPay, OVO, ShopeePay
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Nominal Rp {total.toLocaleString('id-ID')} terverifikasi otomatis
                </p>
              </div>
            </div>
          )}

          {/* Conditional Bank Transfer Interface */}
          {method === 'transfer' && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Bank Tujuan:</span>
                <span className="font-bold text-slate-800 dark:text-white">BCA (Bank Central Asia)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">No. Rekening:</span>
                <span className="font-mono font-bold text-purple-600 dark:text-purple-400">8820-1928-3344</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Atas Nama:</span>
                <span className="font-semibold text-slate-800 dark:text-white">PT RMART SEMBAKO INDONESIA</span>
              </div>
            </div>
          )}

          {/* Notes input */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              {t('Catatan Transaksi (Opsional)', 'Transaction Notes (Optional)')}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Titip plastik ganda, pelanggan Bu Ani"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-purple-500"
            />
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {t('Batal', 'Cancel')}
          </button>

          <button
            type="button"
            onClick={handleConfirmPayment}
            disabled={isProcessing || (method === 'cash' && !isSufficient)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold text-xs shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #6336C9 0%, #F56B83 100%)',
            }}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('Memproses...', 'Processing...')}</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>{t('Selesaikan Pembayaran', 'Complete Payment')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
