import React, { useState, useMemo } from 'react';
import {
  Search,
  Calendar,
  Filter,
  Receipt,
  Eye,
  Download,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext.tsx';
import { formatRupiah } from '../../utils/posLogic.ts';
import { Transaction } from '../../types/index.ts';
import { TransactionDetailModal } from '../modals/TransactionDetailModal.tsx';
import { exportTransactionsToCsv } from '../../utils/pdfGenerator.ts';

export const TransactionsView: React.FC = () => {
  const { transactions, setPreviewReceiptTransaction, t } = usePOS();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'completed' | 'cancelled'>('all');
  const [selectedCashier, setSelectedCashier] = useState('all');
  const [dateRange, setDateRange] = useState('28/10/2025 - 28/10/2025');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Filter logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        t.code.toLowerCase().includes(query) ||
        t.cashierName.toLowerCase().includes(query) ||
        t.items.some((i) => i.name.toLowerCase().includes(query));

      const matchesStatus =
        selectedStatus === 'all' || t.status === selectedStatus;

      const matchesCashier =
        selectedCashier === 'all' ||
        t.cashierName.toLowerCase().includes(selectedCashier.toLowerCase());

      return matchesSearch && matchesStatus && matchesCashier;
    });
  }, [transactions, searchQuery, selectedStatus, selectedCashier]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage));
  const paginatedList = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-5 pb-10 animate-in fade-in duration-200">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl lg:text-[28px] font-bold text-slate-900 dark:text-white tracking-tight">
          {t('Riwayat Transaksi', 'Transaction History')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {t('Lihat semua transaksi penjualan kasir', 'Comprehensive audit trail of all store sales')}
        </p>
      </div>

      {/* Main Table Card matching reference screenshot */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 space-y-4">
        {/* Filters Bar matching reference screenshot */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari kode transaksi, kasir..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-purple-500 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Date range picker pill matching screenshot */}
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>{dateRange}</span>
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value as any);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-purple-500 text-slate-700 dark:text-slate-300"
            >
              <option value="all">Semua Status</option>
              <option value="completed">Selesai</option>
              <option value="cancelled">Dibatalkan</option>
            </select>

            {/* Export CSV button */}
            <button
              onClick={() => exportTransactionsToCsv(filteredTransactions)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Data Table matching screenshot */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3">No</th>
                <th className="py-3 px-3">Kode Transaksi</th>
                <th className="py-3 px-3">Tanggal</th>
                <th className="py-3 px-3">Total</th>
                <th className="py-3 px-3">Kasir</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {paginatedList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada data transaksi yang sesuai filter
                  </td>
                </tr>
              ) : (
                paginatedList.map((trx, index) => {
                  const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;

                  return (
                    <tr
                      key={trx.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-3 text-slate-400 font-semibold">
                        {globalIndex}
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-purple-600 dark:text-purple-400">
                        {trx.code}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300">
                        {trx.date}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white font-mono">
                        {formatRupiah(trx.total)}
                      </td>
                      <td className="py-3.5 px-3 font-medium text-slate-800 dark:text-slate-200">
                        {trx.cashierName}
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            trx.status === 'completed'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                              : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                          }`}
                        >
                          {trx.status === 'completed' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          <span>
                            {trx.status === 'completed' ? 'Selesai' : 'Dibatalkan'}
                          </span>
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedTransaction(trx)}
                            title="Detail Transaksi"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setPreviewReceiptTransaction(trx)}
                            title="Lihat & Cetak Struk"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info & Pagination matching screenshot */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Menampilkan{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {filteredTransactions.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} -{' '}
              {Math.min(currentPage * itemsPerPage, filteredTransactions.length)}
            </span>{' '}
            dari{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {filteredTransactions.length}
            </span>{' '}
            data
          </div>

          <div className="flex items-center gap-1 self-center sm:self-auto">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const page = idx + 1;
              const isActive = currentPage === page;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        onOpenReceipt={(trx) => {
          setSelectedTransaction(null);
          setPreviewReceiptTransaction(trx);
        }}
      />
    </div>
  );
};
