import React, { useState } from 'react';
import { ShieldCheck, Search, Filter, Clock, User, Server } from 'lucide-react';
import { usePOS } from '../../context/POSContext.tsx';

export const ActivityLogsView: React.FC = () => {
  const { activityLogs, t } = usePOS();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = activityLogs.filter(
    (l) =>
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5 pb-10 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-[28px] font-bold text-slate-900 dark:text-white tracking-tight">
            {t('Log Aktivitas & Audit Trail', 'Activity Logs & Audit Trail')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t('Catatan audit keamanan sistem, mutasi data, dan transaksi', 'Security event trail and sensitive action logging')}
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari aktivitas..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-purple-500 text-slate-800 dark:text-slate-200"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3">Waktu</th>
                <th className="py-3 px-3">Pengguna & Role</th>
                <th className="py-3 px-3">Aksi Sistem</th>
                <th className="py-3 px-3">Rincian Perubahan</th>
                <th className="py-3 px-3">Alamat IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                >
                  <td className="py-3 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{log.userName}</span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                        {log.userRole}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                    {log.action}
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                    {log.details}
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                    {log.ipAddress}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
