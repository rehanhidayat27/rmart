import React, { useState } from 'react';
import {
  ShoppingBag,
  User as UserIcon,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Info,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext.tsx';

export const LoginView: React.FC = () => {
  const { login } = usePOS();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMsg('Silakan masukkan username atau email Anda.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Silakan masukkan kata sandi / password Anda.');
      return;
    }
    const success = login(username, password);
    if (!success) {
      setErrorMsg('Username atau password tidak cocok.');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#F8FAFC] dark:bg-[#0F172A] font-['Inter',sans-serif] selection:bg-purple-500 selection:text-white">
      {/* Left Banner Column matching reference image */}
      <div className="relative w-full md:w-1/2 min-h-[320px] md:min-h-screen flex flex-col justify-between p-8 sm:p-12 text-white overflow-hidden bg-slate-950">
        {/* Background Image with Dark Vignette Gradient */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-45 scale-105"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1600&auto=format&fit=crop&q=80)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#172033] via-[#172033]/80 to-transparent" />

        {/* Top Logo matching reference image */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FFB547] to-[#F56B83] flex items-center justify-center text-white shadow-lg shadow-coral-500/30">
            <ShoppingBag className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-extrabold tracking-tight text-white">
                R<span className="text-[#FFB547]">Mart</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-purple-500/30 text-purple-200 border border-purple-400/40">
                POS
              </span>
            </div>
            <span className="text-xs text-slate-300 font-medium">
              Toko Sembako Modern
            </span>
          </div>
        </div>

        {/* Center Typography matching screenshot */}
        <div className="relative z-10 my-auto py-12 max-w-lg space-y-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] text-white">
            Belanja Mudah, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFB547] via-[#F56B83] to-purple-400">
              Hidup Lebih Hemat
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-md">
            Solusi lengkap untuk kebutuhan sembako harian Anda. Cepat, aman, dan terpercaya.
          </p>
        </div>

        {/* Bottom Badge */}
        <div className="relative z-10 text-xs text-slate-400 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Sistem Kasir Toko Sembako V2.5 Active</span>
        </div>
      </div>

      {/* Right Column: Clean Login Card matching screenshot */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-6">
          {/* Header text matching reference image */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Selamat Datang di <span className="text-purple-600 dark:text-purple-400">RMart</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Silakan login untuk melanjutkan ke sistem
            </p>
          </div>

          {/* Form matching reference image */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 text-xs">
                {errorMsg}
              </div>
            )}

            {/* Username Input with User icon */}
            <div>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username atau Email"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-purple-500 shadow-xs"
                />
              </div>
            </div>

            {/* Password Input with Lock & Eye toggle */}
            <div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full pl-10 pr-10 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-purple-500 shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <span>Ingat saya</span>
              </label>
              <button
                type="button"
                onClick={() =>
                  alert('Hubungi Administrator untuk mereset kata sandi Anda.')
                }
                className="text-purple-600 dark:text-purple-400 hover:underline font-semibold"
              >
                Lupa password?
              </button>
            </div>

            {/* Login Button with purple-pink gradient matching screenshot */}
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl text-white font-bold text-xs tracking-wider uppercase shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #6336C9 0%, #F56B83 100%)',
              }}
            >
              <span>Login</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Keterangan Akun Akses Sistem (Informasi Sementara) */}
          <div className="p-3.5 rounded-2xl bg-slate-100/90 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/60 text-xs space-y-2">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold text-[12px]">
              <Info className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <span>Keterangan Akun Akses:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              {/* Admin */}
              <div
                onClick={() => {
                  setUsername('admin');
                  setPassword('password123');
                }}
                className="bg-white dark:bg-slate-900/70 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-800 hover:border-purple-400 cursor-pointer transition-all shadow-2xs"
                title="Klik untuk mengisi otomatis"
              >
                <div className="font-bold text-purple-600 dark:text-purple-400">Admin</div>
                <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                  User: <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">admin</span>
                </div>
                <div className="text-slate-500 dark:text-slate-400">
                  Pass: <span className="font-mono text-slate-800 dark:text-slate-200">password123</span>
                </div>
              </div>

              {/* Kasir */}
              <div
                onClick={() => {
                  setUsername('kasir');
                  setPassword('password123');
                }}
                className="bg-white dark:bg-slate-900/70 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-800 hover:border-emerald-400 cursor-pointer transition-all shadow-2xs"
                title="Klik untuk mengisi otomatis"
              >
                <div className="font-bold text-emerald-600 dark:text-emerald-400">Kasir</div>
                <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                  User: <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">kasir</span>
                </div>
                <div className="text-slate-500 dark:text-slate-400">
                  Pass: <span className="font-mono text-slate-800 dark:text-slate-200">password123</span>
                </div>
              </div>

              {/* Manager */}
              <div
                onClick={() => {
                  setUsername('manager');
                  setPassword('password123');
                }}
                className="bg-white dark:bg-slate-900/70 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-800 hover:border-blue-400 cursor-pointer transition-all shadow-2xs"
                title="Klik untuk mengisi otomatis"
              >
                <div className="font-bold text-blue-600 dark:text-blue-400">Manager</div>
                <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                  User: <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">manager</span>
                </div>
                <div className="text-slate-500 dark:text-slate-400">
                  Pass: <span className="font-mono text-slate-800 dark:text-slate-200">password123</span>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">
              *Ketik manual di kolom atas atau klik salah satu kartu akun di atas untuk mengisi.
            </p>
          </div>

          {/* Footer copyright matching reference screenshot */}
          <div className="pt-2 text-center text-xs text-slate-400">
            © 2025 RMart. POS Kasir Sembako
          </div>
        </div>
      </div>
    </div>
  );
};
