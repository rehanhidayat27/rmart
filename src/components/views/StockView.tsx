import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext.tsx';
import { formatRupiah, getStockStatus } from '../../utils/posLogic.ts';
import { StockAdjustModal } from '../modals/StockAdjustModal.tsx';

export const StockView: React.FC = () => {
  const { products, stockMovements, t } = usePOS();
  const [activeTab, setActiveTab] = useState<'inventory' | 'movements'>('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>(undefined);

  // Stock health counts
  const totalStockItems = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= p.minStock).length;
  const outOfStockCount = products.filter((p) => p.stock <= 0).length;
  const safeStockCount = products.length - lowStockCount - outOfStockCount;

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMovements = stockMovements.filter(
    (m) =>
      m.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.reason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5 pb-10 animate-in fade-in duration-200">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-[28px] font-bold text-slate-900 dark:text-white tracking-tight">
            {t('Stok Barang & Mutasi', 'Inventory & Stock Movements')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t('Pantau ketersediaan barang dan audit riwayat penyesuaian stok', 'Track inventory health and stock adjustment audits')}
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedProductId(undefined);
            setIsAdjustModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-md shadow-purple-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer self-start sm:self-auto"
          style={{
            background: 'linear-gradient(135deg, #6336C9 0%, #F56B83 100%)',
          }}
        >
          <Plus className="w-4 h-4" />
          <span>+ Penyesuaian Stok (Mutasi)</span>
        </button>
      </div>

      {/* 4 Inventory Health KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1E293B] p-4.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-400 font-medium">Total Unit Barang</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono mt-1">
            {totalStockItems} <span className="text-xs text-slate-400 font-normal">unit</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] p-4.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-emerald-600 font-medium">Stok Aman</span>
          <div className="text-2xl font-bold text-emerald-600 font-mono mt-1">
            {safeStockCount} <span className="text-xs text-slate-400 font-normal">produk</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] p-4.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-amber-600 font-medium">Stok Menipis</span>
          <div className="text-2xl font-bold text-amber-600 font-mono mt-1">
            {lowStockCount} <span className="text-xs text-slate-400 font-normal">produk</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] p-4.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-rose-600 font-medium">Stok Habis</span>
          <div className="text-2xl font-bold text-rose-600 font-mono mt-1">
            {outOfStockCount} <span className="text-xs text-slate-400 font-normal">produk</span>
          </div>
        </div>
      </div>

      {/* Main Tabbed Card */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 space-y-4">
        {/* Tab switchers & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Katalog Inventaris ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('movements')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'movements'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Riwayat Mutasi Stok ({stockMovements.length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari produk / alasan..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-purple-500 text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        {/* Tab 1: Inventory Table */}
        {activeTab === 'inventory' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3">Produk</th>
                  <th className="py-3 px-3">Kategori</th>
                  <th className="py-3 px-3">Sisa Stok</th>
                  <th className="py-3 px-3">Min. Stok</th>
                  <th className="py-3 px-3">Status Inventaris</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProducts.map((p) => {
                  const status = getStockStatus(p.stock, p.minStock);
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200"
                          />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {p.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {p.sku}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                        {p.categoryName}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white text-sm">
                        {p.stock} <span className="text-xs font-normal text-slate-400">{p.unit}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-mono">
                        {p.minStock} {p.unit}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            status === 'available'
                              ? 'bg-emerald-100 text-emerald-700'
                              : status === 'low'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {status === 'available' ? 'Tersedia' : status === 'low' ? 'Menipis' : 'Habis'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedProductId(p.id);
                            setIsAdjustModalOpen(true);
                          }}
                          className="px-3 py-1 rounded-lg text-xs font-semibold text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/50 border border-purple-200 dark:border-purple-800 transition-colors cursor-pointer"
                        >
                          Sesuaikan Stok
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Stock Movements Audit Table */}
        {activeTab === 'movements' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3">Waktu</th>
                  <th className="py-3 px-3">Produk</th>
                  <th className="py-3 px-3">Jenis Mutasi</th>
                  <th className="py-3 px-3 text-center">Qty Mutasi</th>
                  <th className="py-3 px-3 text-center">Stok (Sebelum - Sesudah)</th>
                  <th className="py-3 px-3">Alasan / Catatan</th>
                  <th className="py-3 px-3">Penanggung Jawab</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredMovements.map((m) => (
                  <tr
                    key={m.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                  >
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {m.timestamp}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">
                      {m.productName}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          m.type === 'in'
                            ? 'bg-emerald-100 text-emerald-700'
                            : m.type === 'sale'
                            ? 'bg-purple-100 text-purple-700'
                            : m.type === 'out'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {m.type === 'in' && <ArrowDownLeft className="w-3 h-3" />}
                        {m.type === 'sale' && <ArrowUpRight className="w-3 h-3" />}
                        {m.type === 'out' && <ArrowUpRight className="w-3 h-3" />}
                        {m.type === 'adjustment' && <RefreshCw className="w-3 h-3" />}
                        <span>
                          {m.type === 'in'
                            ? 'Masuk'
                            : m.type === 'sale'
                            ? 'Penjualan'
                            : m.type === 'out'
                            ? 'Keluar / Rusak'
                            : 'Opname'}
                        </span>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold">
                      {m.type === 'in' ? `+${m.qty}` : m.type === 'out' || m.type === 'sale' ? `-${m.qty}` : m.qty}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-500">
                      {m.previousStock} → <strong className="text-slate-800 dark:text-slate-200">{m.newStock}</strong>
                    </td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                      {m.reason}
                    </td>
                    <td className="py-3 px-3 text-slate-500 flex items-center gap-1.5">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>{m.userName}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <StockAdjustModal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        selectedProductId={selectedProductId}
      />
    </div>
  );
};
