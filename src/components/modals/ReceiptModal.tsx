import React from 'react';
import { X, Printer, Download, Store, Check } from 'lucide-react';
import { usePOS } from '../../context/POSContext.tsx';
import { formatRupiah } from '../../utils/posLogic.ts';
import { generateReceiptPdf } from '../../utils/pdfGenerator.ts';

export const ReceiptModal: React.FC = () => {
  const {
    previewReceiptTransaction,
    setPreviewReceiptTransaction,
    storeSettings,
    t,
  } = usePOS();

  if (!previewReceiptTransaction) return null;

  const trx = previewReceiptTransaction;

  const handleDownload = () => {
    generateReceiptPdf(trx, storeSettings, true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#1E293B] w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
              {t('Pratinjau Struk Kasir', 'Receipt Preview')} ({storeSettings.paperSize})
            </span>
          </div>
          <button
            onClick={() => setPreviewReceiptTransaction(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thermal Receipt Paper Area (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-slate-100/70 dark:bg-slate-950/50 flex justify-center">
          <div
            id="printable-receipt"
            className="w-full max-w-[320px] bg-white text-slate-900 p-5 rounded-md shadow-md font-mono text-[11px] leading-tight select-none border border-slate-200 print:shadow-none print:border-none print:w-full print:p-0"
          >
            {/* Store Banner */}
            <div className="text-center pb-3 border-b border-dashed border-slate-400 space-y-1">
              <div className="font-extrabold text-sm tracking-wider">
                RMART POS
              </div>
              <div className="text-[10px] text-slate-600">
                {storeSettings.slogan}
              </div>
              <div className="text-[9.5px] text-slate-500 max-w-[220px] mx-auto">
                {storeSettings.address}
              </div>
              <div className="text-[9.5px] text-slate-500">
                Telp: {storeSettings.phone}
              </div>
            </div>

            {/* Transaction Meta */}
            <div className="py-2.5 border-b border-dashed border-slate-400 space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span>No. Trx :</span>
                <span className="font-bold">{trx.code}</span>
              </div>
              <div className="flex justify-between">
                <span>Waktu   :</span>
                <span>{trx.date}</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir   :</span>
                <span>{trx.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span>Metode  :</span>
                <span className="uppercase font-semibold">{trx.paymentMethod}</span>
              </div>
            </div>

            {/* Items Table */}
            <div className="py-2.5 border-b border-dashed border-slate-400 space-y-2">
              <div className="flex justify-between font-bold text-[10.5px]">
                <span>ITEM</span>
                <span>SUBTOTAL</span>
              </div>

              {trx.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between">
                    <span className="truncate pr-2 font-medium">{item.name}</span>
                    <span className="shrink-0">{formatRupiah(item.subtotal)}</span>
                  </div>
                  <div className="text-[9.5px] text-slate-500">
                    {item.qty} x {formatRupiah(item.price)}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="py-2.5 border-b border-dashed border-slate-400 space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatRupiah(trx.subtotal)}</span>
              </div>
              {trx.discountAmount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Diskon ({trx.discountPercent}%)</span>
                  <span>-{formatRupiah(trx.discountAmount)}</span>
                </div>
              )}
              {trx.taxAmount > 0 && (
                <div className="flex justify-between">
                  <span>PPN ({trx.taxPercent}%)</span>
                  <span>{formatRupiah(trx.taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-200">
                <span>TOTAL</span>
                <span>{formatRupiah(trx.total)}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span>Tunai / Diterima</span>
                <span>{formatRupiah(trx.cashReceived)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Kembalian</span>
                <span>{formatRupiah(trx.changeAmount)}</span>
              </div>
            </div>

            {/* Footer message */}
            <div className="text-center pt-3 text-[9.5px] text-slate-600 space-y-1">
              <div>{storeSettings.receiptFooter}</div>
              <div className="pt-2 font-semibold">*** TERIMA KASIH ***</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2.5 shrink-0">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 font-semibold text-xs hover:bg-purple-100 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh PDF</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all cursor-pointer"
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
  );
};
