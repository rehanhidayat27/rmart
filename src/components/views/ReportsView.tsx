import React, { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  Receipt,
  CreditCard,
  DollarSign,
  UserCheck,
  FileSpreadsheet,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext.tsx';
import { formatRupiah } from '../../utils/posLogic.ts';
import { generateSalesReportPdf, exportTransactionsToCsv } from '../../utils/pdfGenerator.ts';

export const ReportsView: React.FC = () => {
  const { transactions, products, storeSettings, t } = usePOS();
  const [period, setPeriod] = useState<'today' | '7days' | 'month' | 'custom'>('7days');
  const [dateRangeStr, setDateRangeStr] = useState('28/10/2025 - 28/10/2025');

  const completed = transactions.filter((t) => t.status === 'completed');
  const totalRevenue = completed.reduce((sum, t) => sum + t.total, 0);
  const transactionCount = completed.length;
  const averageValue = transactionCount > 0 ? Math.round(totalRevenue / transactionCount) : 0;

  // Payment breakdown
  const paymentMethodCounts = completed.reduce(
    (acc, t) => {
      acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + t.total;
      return acc;
    },
    { cash: 0, qris: 0, transfer: 0 } as Record<string, number>
  );

  // Cashier performance
  const cashierStats = completed.reduce((acc, t) => {
    const prev = acc[t.cashierName] || { count: 0, total: 0 };
    acc[t.cashierName] = {
      count: prev.count + 1,
      total: prev.total + t.total,
    };
    return acc;
  }, {} as Record<string, { count: number; total: number }>);

  const handleExportPdf = () => {
    generateSalesReportPdf(
      completed,
      {
        totalRevenue,
        transactionCount,
        averageValue,
        periodLabel: period === 'today' ? 'Hari Ini' : '7 Hari Terakhir',
      },
      storeSettings
    );
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Title & Export PDF button matching screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-[28px] font-bold text-slate-900 dark:text-white tracking-tight">
            {t('Laporan Penjualan', 'Sales Analytics & Reports')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t('Ringkasan laporan penjualan toko sembako', 'Revenue metrics, cashier productivity, and exportable financial audits')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportTransactionsToCsv(completed)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportPdf}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-md shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #6336C9 0%, #F56B83 100%)',
            }}
          >
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row matching screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-5">
        {/* Total Penjualan */}
        <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-500 shrink-0">
              <DollarSign className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500">Total Penjualan</span>
              <div className="text-xl font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                {formatRupiah(totalRevenue)}
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            ↗ 12% dari periode sebelumnya
          </div>
        </div>

        {/* Jumlah Transaksi */}
        <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 shrink-0">
              <Receipt className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500">Jumlah Transaksi</span>
              <div className="text-xl font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                {transactionCount}
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            ↗ 8% dari periode sebelumnya
          </div>
        </div>

        {/* Rata-rata Nilai Transaksi */}
        <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-500 shrink-0">
              <TrendingUp className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500">Rata-rata Transaksi</span>
              <div className="text-xl font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                {formatRupiah(averageValue)}
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            ↗ 10% dari periode sebelumnya
          </div>
        </div>
      </div>

      {/* Breakdown Grid: Payment Methods & Cashier Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Payment Methods Breakdown */}
        <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Distribusi Metode Pembayaran
          </h3>

          <div className="space-y-3 text-xs">
            {Object.entries(paymentMethodCounts).map(([method, amount]) => {
              const pct = totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0;
              const label =
                method === 'cash' ? 'Tunai (Cash)' : method === 'qris' ? 'QRIS Dinamis' : 'Transfer Bank';

              return (
                <div key={method} className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">{label}</span>
                    <span className="font-mono text-slate-900 dark:text-white">
                      {formatRupiah(amount)} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        method === 'cash'
                          ? 'bg-emerald-500'
                          : method === 'qris'
                          ? 'bg-purple-600'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.max(5, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cashier Performance */}
        <div className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Performa Kasir
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {Object.entries(cashierStats).map(([name, stat]) => (
              <div key={name} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center font-bold">
                    {name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">{name}</div>
                    <div className="text-[11px] text-slate-400">{stat.count} transaksi berhasil</div>
                  </div>
                </div>
                <div className="text-right font-bold font-mono text-purple-600 dark:text-purple-400">
                  {formatRupiah(stat.total)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
