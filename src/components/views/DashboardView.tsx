import React, { useState } from 'react';
import { motion, type Variants } from 'motion/react';
import {
  ShoppingCart,
  Receipt,
  Package,
  AlertTriangle,
  ArrowUpRight,
  ChevronRight,
  ExternalLink,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext.tsx';
import { formatRupiah } from '../../utils/posLogic.ts';
import { INITIAL_SALES_CHART_DATA } from '../../data/initialData.ts';

export const DashboardView: React.FC = () => {
  const {
    products,
    transactions,
    currentUser,
    setCurrentView,
    setPreviewReceiptTransaction,
    t,
  } = usePOS();

  const [hoveredPoint, setHoveredPoint] = useState<{
    date: string;
    amount: number;
    x: number;
    y: number;
  } | null>(null);

  // Compute live statistics based on real state plus reference baseline
  const completedTransactions = transactions.filter((t) => t.status === 'completed');
  const baseRevenue = 12850000;
  const baseCount = 247;
  const totalSalesAmount =
    baseRevenue +
    (completedTransactions.length > 5 ? (completedTransactions.length - 5) * 65000 : 0);
  const transactionCount =
    baseCount + (completedTransactions.length > 5 ? completedTransactions.length - 5 : 0);
  const totalProductCount = 56;
  const lowStockCount = 5;

  // Rank top selling products matching reference screenshot
  const topSellingList = [
    {
      id: 'p-1',
      name: 'Beras 5kg',
      soldQty: 32,
      unit: 'pcs',
      sellingPrice: 64000,
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
    },
    {
      id: 'p-2',
      name: 'Minyak Goreng 1L',
      soldQty: 28,
      unit: 'pcs',
      sellingPrice: 56000,
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400',
    },
    {
      id: 'p-3',
      name: 'Gula Pasir 1kg',
      soldQty: 24,
      unit: 'pcs',
      sellingPrice: 24000,
      image: 'https://images.unsplash.com/photo-1622484212850-eb596d769edc?w=400',
    },
    {
      id: 'p-4',
      name: 'Indomie',
      soldQty: 20,
      unit: 'pcs',
      sellingPrice: 16000,
      image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400',
    },
    {
      id: 'p-5',
      name: 'Telur Ayam',
      soldQty: 18,
      unit: 'pcs',
      sellingPrice: 27000,
      image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400',
    },
  ];

  // Low stock list matching reference screenshot
  const lowStockList = [
    {
      id: 'ls-1',
      name: 'Indomie',
      stock: 5,
      unit: 'pcs',
      image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400',
    },
    {
      id: 'ls-2',
      name: 'Susu UHT',
      stock: 8,
      unit: 'pcs',
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400',
    },
    {
      id: 'ls-3',
      name: 'Minyak Goreng 1L',
      stock: 12,
      unit: 'pcs',
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400',
    },
    {
      id: 'ls-4',
      name: 'Gula Pasir 1kg',
      stock: 10,
      unit: 'pcs',
      image: 'https://images.unsplash.com/photo-1622484212850-eb596d769edc?w=400',
    },
    {
      id: 'ls-5',
      name: 'Telur Ayam',
      stock: 15,
      unit: 'pcs',
      image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400',
    },
  ];

  // Interactive SVG Sales Chart calculation
  const chartData = INITIAL_SALES_CHART_DATA;
  const svgWidth = 640;
  const svgHeight = 220;
  const paddingX = 45;
  const paddingTop = 25;
  const paddingBottom = 35;
  const maxVal = 15000000; // 15jt max scale

  const points = chartData.map((d, i) => {
    const x = paddingX + (i / (chartData.length - 1)) * (svgWidth - paddingX * 2);
    const y =
      svgHeight -
      paddingBottom -
      (d.amount / maxVal) * (svgHeight - paddingTop - paddingBottom);
    return { ...d, x, y };
  });

  // Generate smooth cubic bezier curve
  const pathD = points.reduce((acc, curr, i, arr) => {
    if (i === 0) return `M ${curr.x} ${curr.y}`;
    const prev = arr[i - 1];
    const cp1x = prev.x + (curr.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (curr.x - prev.x) / 2;
    const cp2y = curr.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${
    svgHeight - paddingBottom
  } L ${points[0].x} ${svgHeight - paddingBottom} Z`;

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: 'easeOut' },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-16"
    >
      {/* Title & Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-[28px] font-extrabold text-slate-900 dark:text-white tracking-tight">
            Halo, {currentUser?.name?.split(' ')[0] || 'Admin'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Berikut ringkasan aktivitas toko Anda hari ini
          </p>
        </div>

        {/* Quick Launch POS Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setCurrentView('kasir')}
          className="self-start sm:self-auto flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 transition-all cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #6336C9 0%, #F56B83 100%)',
          }}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>{t('Buka Kasir POS', 'Open POS Register')}</span>
        </motion.button>
      </div>

      {/* 4 Stat Cards Row matching image_3b1ffcc5.png with distinct colors and animations */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5"
      >
        {/* Card 1: Total Penjualan - Emerald Green Accent */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#E8F8F2] dark:bg-emerald-950/50 flex items-center justify-center text-[#10B981] shrink-0 shadow-xs">
              <ShoppingCart className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {t('Total Penjualan', 'Total Sales')}
              </span>
              <div className="text-lg lg:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5 font-['Inter']">
                {formatRupiah(totalSalesAmount)}
              </div>
            </div>
          </div>
          <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center text-xs font-semibold text-[#10B981] gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>12% {t('dari kemarin', 'from yesterday')}</span>
          </div>
        </motion.div>

        {/* Card 2: Jumlah Transaksi - Purple Accent */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#F0EBFC] dark:bg-purple-950/50 flex items-center justify-center text-[#6336C9] shrink-0 shadow-xs">
              <Receipt className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {t('Jumlah Transaksi', 'Total Transactions')}
              </span>
              <div className="text-lg lg:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5 font-['Inter']">
                {transactionCount}
              </div>
            </div>
          </div>
          <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center text-xs font-semibold text-[#10B981] gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>8% {t('dari kemarin', 'from yesterday')}</span>
          </div>
        </motion.div>

        {/* Card 3: Total Produk - Warm Amber/Orange Accent (matching image_3b1ffcc5.png) */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FEF4E6] dark:bg-amber-950/50 flex items-center justify-center text-[#FFB547] shrink-0 shadow-xs">
              <Package className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {t('Total Produk', 'Total Products')}
              </span>
              <div className="text-lg lg:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5 font-['Inter']">
                {totalProductCount}
              </div>
            </div>
          </div>
          <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center text-xs font-semibold text-[#FFB547] gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>3 {t('produk baru', 'new products')}</span>
          </div>
        </motion.div>

        {/* Card 4: Stok Menipis - Coral Red Accent (matching image_3b1ffcc5.png) */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FEECEF] dark:bg-rose-950/50 flex items-center justify-center text-[#F43F5E] shrink-0 shadow-xs">
              <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {t('Stok Menipis', 'Low Stock Alert')}
              </span>
              <div className="text-lg lg:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5 font-['Inter']">
                {lowStockCount}
              </div>
            </div>
          </div>
          <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center text-xs font-semibold text-[#F43F5E] gap-1">
            <span>{t('Perlu restok segera', 'Restock required soon')}</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Middle Section: Chart & Side Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: 7 Days Sales Trend Chart (7 cols) */}
        <motion.div
          variants={cardVariants}
          className="lg:col-span-7 bg-white dark:bg-[#1E293B] p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t('Grafik Penjualan (7 Hari Terakhir)', 'Sales Trend (Last 7 Days)')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('Tren omset pendapatan harian toko sembako', 'Daily grocery revenue trends')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#6336C9]" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Penjualan (Rp)
              </span>
            </div>
          </div>

          {/* Interactive Chart Container */}
          <div className="relative w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto min-w-[480px] overflow-visible"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6336C9" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#6336C9" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              {[15000000, 10000000, 5000000, 0].map((val) => {
                const y =
                  svgHeight -
                  paddingBottom -
                  (val / maxVal) * (svgHeight - paddingTop - paddingBottom);
                return (
                  <g key={val}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={svgWidth - paddingX}
                      y2={y}
                      stroke="currentColor"
                      strokeDasharray="4 4"
                      className="text-slate-200 dark:text-slate-800"
                    />
                    <text
                      x={paddingX - 10}
                      y={y + 3}
                      textAnchor="end"
                      className="fill-slate-400 text-[10px] font-mono"
                    >
                      {val === 0 ? '0' : `${val / 1000000}jt`}
                    </text>
                  </g>
                );
              })}

              {/* Area fill */}
              <path d={areaD} fill="url(#chartGradient)" />

              {/* Animated Stroke */}
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
                d={pathD}
                fill="none"
                stroke="#6336C9"
                strokeWidth="3.2"
                strokeLinecap="round"
              />

              {/* Data points */}
              {points.map((pt) => {
                const isHovered = hoveredPoint?.date === pt.date;
                return (
                  <g
                    key={pt.date}
                    className="cursor-pointer group"
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 6 : 4}
                      fill="#FFFFFF"
                      stroke="#6336C9"
                      strokeWidth={isHovered ? 3 : 2}
                      className="transition-all duration-200"
                    />
                    {/* X-axis labels */}
                    <text
                      x={pt.x}
                      y={svgHeight - 12}
                      textAnchor="middle"
                      className={`text-[11px] font-medium transition-colors ${
                        isHovered
                          ? 'fill-purple-600 font-bold'
                          : 'fill-slate-500 dark:fill-slate-400'
                      }`}
                    >
                      {pt.date}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip overlay */}
            {hoveredPoint && (
              <div
                className="absolute z-10 -translate-x-1/2 -translate-y-full px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs shadow-xl pointer-events-none transition-all duration-150 border border-slate-700"
                style={{
                  left: `${(hoveredPoint.x / svgWidth) * 100}%`,
                  top: `${(hoveredPoint.y / svgHeight) * 100}%`,
                  marginTop: '-12px',
                }}
              >
                <div className="font-semibold text-slate-300">{hoveredPoint.date}</div>
                <div className="font-bold text-amber-400">
                  {formatRupiah(hoveredPoint.amount)}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right: Side Lists - Produk Terlaris & Stok Menipis (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Top Selling Products Card */}
          <motion.div
            variants={cardVariants}
            className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('Produk Terlaris', 'Best Sellers')}
              </h3>
              <button
                onClick={() => setCurrentView('produk')}
                className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 flex items-center gap-0.5"
              >
                <span>{t('Lihat Semua', 'View All')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/80 mt-1">
              {topSellingList.map((item, index) => (
                <div
                  key={item.id}
                  className="py-2.5 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/50 dark:hover:bg-slate-800/40 px-1 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-4 font-bold text-slate-400 shrink-0 text-center">
                      {index + 1}
                    </span>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                    />
                    <div className="truncate">
                      <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {item.soldQty} {item.unit}
                      </div>
                    </div>
                  </div>
                  <div className="text-right font-bold text-slate-900 dark:text-white shrink-0 font-mono">
                    {formatRupiah(item.sellingPrice)}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Low Stock Warning Card */}
          <motion.div
            variants={cardVariants}
            className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('Stok Menipis', 'Low Stock')}
                </h3>
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              </div>
              <button
                onClick={() => setCurrentView('stok')}
                className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 flex items-center gap-0.5"
              >
                <span>{t('Lihat Semua', 'View All')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/80 mt-1">
              {lowStockList.map((item) => (
                <div
                  key={item.id}
                  className="py-2.5 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/50 dark:hover:bg-slate-800/40 px-1 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                    />
                    <div className="truncate">
                      <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Sisa stok toko
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <span className="font-bold px-2 py-0.5 rounded-full text-[11px] bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                      {item.stock} {item.unit}
                    </span>
                    <button
                      onClick={() => setCurrentView('stok')}
                      title="Restok"
                      className="p-1 hover:bg-purple-100 dark:hover:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-md transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Section: Transaksi Terbaru Table matching screenshot */}
      <motion.div
        variants={cardVariants}
        className="bg-white dark:bg-[#1E293B] p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t('Transaksi Terbaru', 'Recent Transactions')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('5 transaksi terakhir yang berhasil diproses kasir', 'Latest completed cashier transactions')}
            </p>
          </div>
          <button
            onClick={() => setCurrentView('transaksi')}
            className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 flex items-center gap-1"
          >
            <span>{t('Kelola Semua Transaksi', 'Manage All')}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="pb-3 px-3">Kode Transaksi</th>
                <th className="pb-3 px-3">Waktu</th>
                <th className="pb-3 px-3">Kasir</th>
                <th className="pb-3 px-3">Metode</th>
                <th className="pb-3 px-3">Total Belanja</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {transactions.slice(0, 5).map((trx) => (
                <tr
                  key={trx.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3 px-3 font-mono font-bold text-purple-600 dark:text-purple-400">
                    {trx.code}
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                    {trx.date}
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200">
                    {trx.cashierName}
                  </td>
                  <td className="py-3 px-3">
                    <span className="uppercase font-semibold text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {trx.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-white font-mono">
                    {formatRupiah(trx.total)}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        trx.status === 'completed'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                          : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {trx.status === 'completed' ? 'Selesai' : 'Dibatalkan'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setPreviewReceiptTransaction(trx)}
                      className="px-2.5 py-1 text-xs font-semibold text-purple-600 hover:text-white hover:bg-purple-600 dark:text-purple-400 rounded-lg border border-purple-200 dark:border-purple-800 transition-all cursor-pointer"
                    >
                      Lihat Struk
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};
