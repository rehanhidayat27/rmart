import React, { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Globe,
  Menu,
  CheckCircle2,
  AlertTriangle,
  Info,
  UserCheck,
} from 'lucide-react';
import { usePOS } from '../context/POSContext.tsx';
import { UserRole } from '../types/index.ts';

interface HeaderProps {
  onToggleSidebar: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  searchQuery,
  onSearchChange,
}) => {
  const {
    currentUser,
    switchRole,
    darkMode,
    toggleDarkMode,
    lang,
    setLang,
    t,
    notifications,
    markNotificationsRead,
    currentView,
  } = usePOS();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  // Live real-time formatted date matching reference image e.g., "Selasa, 28 Oktober 2025 14:32"
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      };
      const locale = lang === 'en' ? 'en-US' : 'id-ID';
      const formatted = now.toLocaleDateString(locale, options).replace(' at', '');
      setCurrentTime(formatted);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [lang]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const roles: { role: UserRole; label: string }[] = [
    { role: 'admin', label: 'Admin' },
    { role: 'kasir', label: 'Kasir' },
    { role: 'manager', label: 'Manager' },
  ];

  return (
    <header className="sticky top-0 z-30 h-20 bg-white/90 dark:bg-[#111827]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 md:px-8 flex items-center justify-between gap-4 transition-colors">
      {/* Left: Mobile hamburger & Global Search */}
      <div className="flex items-center gap-3.5 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation Sidebar"
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t(
              'Cari produk, kategori, atau transaksi...',
              'Search product, category, or transaction...'
            )}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 border border-transparent focus:border-purple-400/50 dark:focus:border-purple-500/50 rounded-xl outline-none transition-all duration-200 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              esc
            </button>
          )}
        </div>
      </div>

      {/* Right: Date, Controls & Profile */}
      <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
        {/* Live Date Time Display matching reference image */}
        <div className="hidden xl:flex flex-col text-right pr-2">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 capitalize">
            {currentTime.split(' ').slice(0, -1).join(' ')}
          </span>
          <span className="text-[11px] font-mono font-medium text-slate-400">
            {currentTime.split(' ').slice(-1)[0]} WIB
          </span>
        </div>

        {/* Role Switcher Badge */}
        <div className="relative">
          <button
            onClick={() => setShowRoleSwitcher((prev) => !prev)}
            title="Klik untuk berpindah peran akun"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/50 text-xs font-semibold hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span className="capitalize">{currentUser?.role}</span>
          </button>

          {showRoleSwitcher && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {t('Pilih Peran Akun', 'Select Account Role')}
              </div>
              {roles.map((r) => (
                <button
                  key={r.role}
                  onClick={() => {
                    switchRole(r.role);
                    setShowRoleSwitcher(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors ${
                    currentUser?.role === r.role
                      ? 'font-bold text-purple-600 dark:text-purple-400 bg-purple-50/50'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>{r.label}</span>
                  {currentUser?.role === r.role && (
                    <span className="text-[10px] bg-purple-600 text-white px-1.5 py-0.5 rounded-full">
                      Aktif
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Language Switcher */}
        <button
          onClick={() => setLang(lang === 'id' ? 'en' : 'id')}
          title={lang === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-bold flex items-center gap-1"
        >
          <Globe className="w-4 h-4 text-slate-500" />
          <span className="uppercase">{lang}</span>
        </button>

        {/* Dark / Light Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          title={darkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? (
            <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600 hover:-rotate-12 transition-transform" />
          )}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications((prev) => !prev);
              if (!showNotifications && unreadCount > 0) {
                markNotificationsRead();
              }
            }}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-4 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  {t('Notifikasi Sistem', 'System Notifications')}
                </span>
                <span className="text-[11px] text-slate-400">
                  {notifications.length} {t('pesan', 'messages')}
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 custom-scrollbar">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex gap-2.5 items-start"
                  >
                    {item.type === 'success' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    )}
                    {item.type === 'warning' && (
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    )}
                    {item.type === 'info' && (
                      <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 text-left">
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                        {item.message}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {item.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar Chip */}
        {currentUser && (
          <div className="flex items-center gap-2 pl-1 border-l border-slate-200 dark:border-slate-800">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-500/30"
            />
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
                {currentUser.name}
              </span>
              <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                {currentUser.role}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
