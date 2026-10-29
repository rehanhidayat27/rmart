/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { POSProvider, usePOS } from './context/POSContext.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { Header } from './components/Header.tsx';
import { MobileNav } from './components/MobileNav.tsx';
import { ToastContainer } from './components/Toast.tsx';
import { ReceiptModal } from './components/modals/ReceiptModal.tsx';

// Views
import { LoginView } from './components/views/LoginView.tsx';
import { DashboardView } from './components/views/DashboardView.tsx';
import { CashierView } from './components/views/CashierView.tsx';
import { ProductsView } from './components/views/ProductsView.tsx';
import { CategoriesView } from './components/views/CategoriesView.tsx';
import { StockView } from './components/views/StockView.tsx';
import { TransactionsView } from './components/views/TransactionsView.tsx';
import { ReportsView } from './components/views/ReportsView.tsx';
import { UsersView } from './components/views/UsersView.tsx';
import { SettingsView } from './components/views/SettingsView.tsx';

const AppContent: React.FC = () => {
  const { currentUser, currentView, darkMode, toggleDarkMode } = usePOS();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // If unauthenticated, show Login Screen
  if (!currentUser) {
    return (
      <>
        <LoginView />
        <ToastContainer />
      </>
    );
  }

  // Render view component
  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'kasir':
        return <CashierView />;
      case 'produk':
        return <ProductsView />;
      case 'kategori':
        return <CategoriesView />;
      case 'stok':
        return <StockView />;
      case 'transaksi':
      case 'riwayat':
        return <TransactionsView />;
      case 'laporan':
        return <ReportsView />;
      case 'pengguna':
        return <UsersView />;
      case 'pengaturan':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-slate-800 dark:text-slate-100 flex transition-colors duration-200 relative selection:bg-purple-500 selection:text-white">
      {/* Fixed Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Layout Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen pb-20 lg:pb-8">
        <Header
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          searchQuery={globalSearch}
          onSearchChange={setGlobalSearch}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {renderCurrentView()}
        </main>
      </div>

      {/* Floating Bottom-Right Theme Toggle matching image_3b1ffcc5.png */}
      <div className="fixed bottom-5 right-5 z-40 hidden sm:flex items-center gap-1.5 p-1 rounded-full bg-slate-900/90 dark:bg-slate-800/90 text-white shadow-xl border border-slate-700/60 backdrop-blur-md">
        <button
          onClick={() => {
            if (darkMode) toggleDarkMode();
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            !darkMode
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          <span>Light</span>
        </button>

        <button
          onClick={() => {
            if (!darkMode) toggleDarkMode();
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            darkMode
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Moon className="w-3.5 h-3.5 text-purple-300" />
          <span>Dark</span>
        </button>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Thermal Receipt Preview & Printing Modal */}
      <ReceiptModal />

      {/* Real-time Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <POSProvider>
      <AppContent />
    </POSProvider>
  );
}
