import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Layers,
  Boxes,
  Receipt,
  BarChart3,
  Users,
  Settings,
  ShieldCheck,
  BookOpen,
  LogOut,
  ShoppingBag,
} from 'lucide-react';
import { usePOS } from '../context/POSContext.tsx';
import { ViewType, UserRole } from '../types/index.ts';

interface MenuItem {
  id: ViewType;
  labelId: string;
  labelEn: string;
  icon: React.ElementType;
  allowedRoles: UserRole[];
  badge?: string;
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: 'dashboard',
    labelId: 'Dashboard',
    labelEn: 'Dashboard',
    icon: LayoutDashboard,
    allowedRoles: ['admin', 'kasir', 'manager'],
  },
  {
    id: 'kasir',
    labelId: 'Kasir',
    labelEn: 'Cashier / POS',
    icon: ShoppingCart,
    allowedRoles: ['admin', 'kasir'],
  },
  {
    id: 'produk',
    labelId: 'Produk',
    labelEn: 'Products',
    icon: Package,
    allowedRoles: ['admin', 'manager'],
  },
  {
    id: 'kategori',
    labelId: 'Kategori',
    labelEn: 'Categories',
    icon: Layers,
    allowedRoles: ['admin', 'manager'],
  },
  {
    id: 'stok',
    labelId: 'Stok Barang',
    labelEn: 'Inventory & Stock',
    icon: Boxes,
    allowedRoles: ['admin', 'manager'],
  },
  {
    id: 'transaksi',
    labelId: 'Transaksi',
    labelEn: 'Transactions',
    icon: Receipt,
    allowedRoles: ['admin', 'kasir', 'manager'],
  },
  {
    id: 'riwayat',
    labelId: 'Riwayat Penjualan',
    labelEn: 'Sales History',
    icon: Receipt,
    allowedRoles: ['admin', 'kasir', 'manager'],
  },
  {
    id: 'laporan',
    labelId: 'Laporan',
    labelEn: 'Sales Reports',
    icon: BarChart3,
    allowedRoles: ['admin', 'manager'],
  },
  {
    id: 'pengguna',
    labelId: 'Pengguna',
    labelEn: 'Users & Staff',
    icon: Users,
    allowedRoles: ['admin'],
  },
  {
    id: 'pengaturan',
    labelId: 'Pengaturan',
    labelEn: 'Settings',
    icon: Settings,
    allowedRoles: ['admin'],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentView, setCurrentView, currentUser, logout, t } = usePOS();

  if (!currentUser) return null;

  // Filter allowed menus based on RBAC role
  const allowedMenus = MENU_ITEMS.filter((item) =>
    item.allowedRoles.includes(currentUser.role)
  );

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'manager':
        return 'Store Manager';
      case 'kasir':
        return 'Kasir Toko';
      default:
        return role;
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-[#172033] text-slate-700 dark:text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-slate-200/90 dark:border-slate-800/80 shadow-xl lg:shadow-none select-none`}
      >
        {/* Brand Logo matching the reference image */}
        <div className="h-20 flex items-center px-6 gap-3.5 border-b border-slate-100 dark:border-slate-800/60">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFB547] to-[#F56B83] flex items-center justify-center text-white shadow-lg shadow-coral-500/20">
            <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white font-['Inter']">
                R<span className="text-[#FFB547]">Mart</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30">
                POS
              </span>
            </div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Toko Sembako Modern
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5 custom-scrollbar">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {t('Menu Navigasi', 'Main Navigation')}
          </div>

          {allowedMenus.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-200 group cursor-pointer ${
                  isActive
                    ? 'text-white shadow-md shadow-purple-500/25 dark:shadow-purple-900/40 font-semibold'
                    : 'text-slate-600 hover:text-purple-700 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60'
                }`}
                style={
                  isActive
                    ? {
                        background: 'linear-gradient(135deg, #6336C9 0%, #F56B83 100%)',
                      }
                    : undefined
                }
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive
                        ? 'text-white stroke-[2.3]'
                        : 'text-slate-400 group-hover:text-purple-600 dark:text-slate-400 dark:group-hover:text-slate-200 group-hover:scale-105'
                    }`}
                  />
                  <span>{t(item.labelId, item.labelEn)}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-[#FFB547]/20 dark:text-[#FFB547] dark:border-[#FFB547]/40'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* User Profile Card at bottom (matching the reference image) */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/40">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/50 transition-colors">
            <div className="flex items-center gap-3 overflow-hidden">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-500/40 shrink-0"
              />
              <div className="flex flex-col text-left truncate">
                <span className="text-[13px] font-semibold text-slate-900 dark:text-white truncate">
                  {currentUser.name}
                </span>
                <span className="text-[11px] text-purple-600 dark:text-purple-300 font-medium capitalize">
                  {getRoleDisplayName(currentUser.role)}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              title={t('Keluar Akun', 'Logout')}
              aria-label="Logout"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 rounded-lg transition-colors shrink-0 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
