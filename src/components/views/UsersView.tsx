import React, { useState } from 'react';
import {
  Users as UsersIcon,
  Plus,
  Pencil,
  Trash2,
  Shield,
  CheckCircle2,
  XCircle,
  KeyRound,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext.tsx';
import { User, UserRole } from '../../types/index.ts';
import { UserModal } from '../modals/UserModal.tsx';

export const UsersView: React.FC = () => {
  const { users, deleteUser, currentUser, t } = usePOS();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
            Admin
          </span>
        );
      case 'manager':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
            Manager
          </span>
        );
      case 'kasir':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            Kasir
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 pb-10 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-[28px] font-bold text-slate-900 dark:text-white tracking-tight">
            {t('Pengguna & Hak Akses', 'Users & Staff RBAC')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t('Kelola akun staf kasir, supervisor manager, dan administrator', 'Manage role-based authentication and security')}
          </p>
        </div>

        <button
          onClick={() => {
            setUserToEdit(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-md shadow-purple-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer self-start sm:self-auto"
          style={{
            background: 'linear-gradient(135deg, #6336C9 0%, #F56B83 100%)',
          }}
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Pengguna</span>
        </button>
      </div>

      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3">Pengguna</th>
                <th className="py-3 px-3">Username</th>
                <th className="py-3 px-3">Role Hak Akses</th>
                <th className="py-3 px-3">Email & Kontak</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">2FA</th>
                <th className="py-3 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((u) => {
                const isSelf = currentUser?.id === u.id;
                return (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-500/30"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {isSelf && (
                              <span className="text-[9px] bg-slate-200 dark:bg-slate-700 px-1 rounded-sm text-slate-600 dark:text-slate-300">
                                Anda
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Terdaftar: {u.createdAt.slice(0, 10)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-purple-600 dark:text-purple-400">
                      @{u.username}
                    </td>
                    <td className="py-3 px-3">{getRoleBadge(u.role)}</td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      <div>{u.email}</div>
                      <div className="text-[10px] text-slate-400">{u.phone}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {u.status === 'active' ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-semibold ${
                          u.twoFactorEnabled ? 'text-emerald-600' : 'text-slate-400'
                        }`}
                      >
                        {u.twoFactorEnabled ? 'Aktif' : 'Mati'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setUserToEdit(u);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                          title="Edit Pengguna"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {!isSelf && (
                          <button
                            onClick={() => deleteUser(u.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Hapus Pengguna"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userToEdit={userToEdit}
      />
    </div>
  );
};
