import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Layers, AlertCircle } from 'lucide-react';
import { usePOS } from '../../context/POSContext.tsx';
import { Category } from '../../types/index.ts';
import { CategoryModal } from '../modals/CategoryModal.tsx';

export const CategoriesView: React.FC = () => {
  const { categories, products, deleteCategory, t } = usePOS();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

  // Compute live product count per category
  const categoriesWithCounts = categories.map((cat) => {
    const count = products.filter((p) => p.categoryId === cat.id).length;
    return { ...cat, liveCount: count };
  });

  return (
    <div className="space-y-5 pb-10 animate-in fade-in duration-200">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl lg:text-[28px] font-bold text-slate-900 dark:text-white tracking-tight">
          {t('Data Kategori', 'Categories Management')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {t('Kelola kategori produk sembako', 'Organize grocery items by departments & categories')}
        </p>
      </div>

      {/* Main Card matching reference screenshot */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-5 space-y-4">
        {/* Top Action Row */}
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-500">
            Total {categories.length} Kategori Terdaftar
          </div>

          <button
            onClick={() => {
              setCategoryToEdit(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-md shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #6336C9 0%, #F56B83 100%)',
            }}
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Kategori</span>
          </button>
        </div>

        {/* Table matching reference screenshot */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3">No</th>
                <th className="py-3 px-3">Nama Kategori</th>
                <th className="py-3 px-3">Deskripsi</th>
                <th className="py-3 px-3 text-center">Jumlah Produk</th>
                <th className="py-3 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {categoriesWithCounts.map((cat, index) => (
                <tr
                  key={cat.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3.5 px-3 text-slate-400 font-semibold">
                    {index + 1}
                  </td>
                  <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">
                    {cat.name}
                  </td>
                  <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300">
                    {cat.description || '-'}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 font-mono">
                      {cat.liveCount}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => {
                          setCategoryToEdit(cat);
                          setIsModalOpen(true);
                        }}
                        title="Edit Kategori"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteCategory(cat.id)}
                        title="Hapus Kategori"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer info matching screenshot */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div>
            Menampilkan 1 - {categories.length} dari {categories.length} data
          </div>
          <div className="flex items-center gap-1">
            <span className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
              1
            </span>
          </div>
        </div>
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categoryToEdit={categoryToEdit}
      />
    </div>
  );
};
