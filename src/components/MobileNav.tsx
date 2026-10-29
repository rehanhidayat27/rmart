import React from 'react';
import { LayoutDashboard, ShoppingCart, Receipt, Package, Settings } from 'lucide-react';
import { usePOS } from '../context/POSContext.tsx';
import { ViewType } from '../types/index.ts';

export const MobileNav: React.FC = () => {
  const { currentView, setCurrentView, currentUser } = usePOS();

  if (!currentUser) return null;

  const items = [
    { id: 'dashboard' as ViewType, label: 'Beranda', icon: LayoutDashboard },
    { id: 'kasir' as ViewType, label: 'Kasir', icon: ShoppingCart },
    { id: 'produk' as ViewType, label: 'Produk', icon: Package },
    { id: 'transaksi' as ViewType, label: 'Transaksi', icon: Receipt },
    { id: 'pengaturan' as ViewType, label: 'Pengaturan', icon: Settings },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-lg">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
              isActive
                ? 'text-purple-600 dark:text-purple-400 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
