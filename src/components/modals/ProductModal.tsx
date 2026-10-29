import React, { useState, useEffect } from 'react';
import { X, Package, Image as ImageIcon, Save, AlertCircle } from 'lucide-react';
import { usePOS } from '../../context/POSContext.tsx';
import { Product } from '../../types/index.ts';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit: Product | null;
}

const PRESET_GROCERY_IMAGES = [
  { label: 'Beras', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400' },
  { label: 'Minyak Goreng', url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400' },
  { label: 'Gula Pasir', url: 'https://images.unsplash.com/photo-1622484212850-eb596d769edc?w=400' },
  { label: 'Telur Ayam', url: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400' },
  { label: 'Mie Instan', url: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400' },
  { label: 'Susu UHT', url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400' },
  { label: 'Teh & Minuman', url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400' },
  { label: 'Roti & Bakery', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400' },
  { label: 'Kopi Bubuk', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400' },
  { label: 'Kecap & Saus', url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400' },
  { label: 'Sabun & Mandi', url: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=400' },
];

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
}) => {
  const { categories, addProduct, updateProduct, products, t } = usePOS();

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [costPrice, setCostPrice] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [minStock, setMinStock] = useState<number>(5);
  const [unit, setUnit] = useState('pcs');
  const [image, setImage] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setSku(productToEdit.sku);
      setBarcode(productToEdit.barcode || '');
      setCategoryId(productToEdit.categoryId);
      setCostPrice(productToEdit.costPrice);
      setSellingPrice(productToEdit.sellingPrice);
      setStock(productToEdit.stock);
      setMinStock(productToEdit.minStock);
      setUnit(productToEdit.unit);
      setImage(productToEdit.image);
      setStatus(productToEdit.status);
    } else {
      setName('');
      setSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
      setBarcode(`899${Math.floor(100000000 + Math.random() * 900000000)}`);
      setCategoryId(categories[0]?.id || 'cat-1');
      setCostPrice(10000);
      setSellingPrice(13000);
      setStock(20);
      setMinStock(5);
      setUnit('pcs');
      setImage(PRESET_GROCERY_IMAGES[0].url);
      setStatus('active');
    }
    setErrorMsg('');
  }, [productToEdit, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrorMsg('Nama produk wajib diisi.');
      return;
    }
    if (!sku.trim()) {
      setErrorMsg('SKU produk wajib diisi.');
      return;
    }
    if (sellingPrice <= 0) {
      setErrorMsg('Harga jual harus lebih dari Rp 0.');
      return;
    }

    // Check SKU uniqueness
    const skuExists = products.some(
      (p) => p.sku.toLowerCase() === sku.trim().toLowerCase() && p.id !== productToEdit?.id
    );
    if (skuExists) {
      setErrorMsg(`SKU '${sku}' sudah digunakan oleh produk lain.`);
      return;
    }

    if (productToEdit) {
      updateProduct(productToEdit.id, {
        name,
        sku,
        barcode,
        categoryId,
        costPrice,
        sellingPrice,
        stock,
        minStock,
        unit,
        image,
        status,
      });
    } else {
      addProduct({
        name,
        sku,
        barcode,
        categoryId,
        costPrice,
        sellingPrice,
        stock,
        minStock,
        unit,
        image,
        status,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#1E293B] w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {productToEdit
                ? t('Edit Data Produk Sembako', 'Edit Product')
                : t('Tambah Produk Sembako Baru', 'Add New Product')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nama Produk */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nama Produk Sembako *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Beras Ramos 5kg, Minyak Sania 2L"
                required
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-purple-500 text-slate-900 dark:text-white"
              />
            </div>

            {/* SKU */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kode SKU (Unik) *
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="BRS-001"
                required
                className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-purple-500 text-slate-900 dark:text-white"
              />
            </div>

            {/* Barcode */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Barcode Scanner (EAN-13)
              </label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="899123456001"
                className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-purple-500 text-slate-900 dark:text-white"
              />
            </div>

            {/* Kategori */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kategori Produk *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-purple-500 text-slate-900 dark:text-white"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Satuan */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Satuan Barang *
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-purple-500 text-slate-900 dark:text-white"
              >
                <option value="pcs">pcs</option>
                <option value="sak">sak (karung)</option>
                <option value="kg">kg (kilogram)</option>
                <option value="pouch">pouch (refill)</option>
                <option value="botol">botol</option>
                <option value="kotak">kotak</option>
                <option value="bungkus">bungkus</option>
                <option value="pak (5 pcs)">pak (5 pcs)</option>
                <option value="dus">dus / karton</option>
              </select>
            </div>

            {/* Harga Modal */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Harga Modal (Rp) *
              </label>
              <input
                type="number"
                min="0"
                value={costPrice}
                onChange={(e) => setCostPrice(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-purple-500 text-slate-900 dark:text-white"
              />
            </div>

            {/* Harga Jual */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Harga Jual (Rp) *
              </label>
              <input
                type="number"
                min="1"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3.5 py-2 text-xs font-mono font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-purple-500 text-purple-600 dark:text-purple-400"
              />
            </div>

            {/* Stok */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Jumlah Stok Saat Ini *
              </label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-purple-500 text-slate-900 dark:text-white"
              />
            </div>

            {/* Min Stok */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Batas Minimum Stok (Alert) *
              </label>
              <input
                type="number"
                min="1"
                value={minStock}
                onChange={(e) => setMinStock(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-purple-500 text-slate-900 dark:text-white"
              />
            </div>

            {/* Preset Image Picker */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Pilih Foto Produk Sembako Cepat
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {PRESET_GROCERY_IMAGES.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setImage(preset.url)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                      image === preset.url
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950 text-purple-600'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-purple-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {t('Batal', 'Cancel')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2 rounded-xl text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #6336C9 0%, #F56B83 100%)',
            }}
          >
            <Save className="w-4 h-4" />
            <span>{t('Simpan Produk', 'Save Product')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
