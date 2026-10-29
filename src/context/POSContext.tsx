import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  UserRole,
  Category,
  Product,
  CartItem,
  Transaction,
  StockMovement,
  ActivityLog,
  StoreSettings,
  ViewType,
  Language,
  PaymentMethod,
} from '../types/index.ts';
import {
  INITIAL_USERS,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_TRANSACTIONS,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_STORE_SETTINGS,
} from '../data/initialData.ts';
import { calculateCartTotals, generateTransactionCode } from '../utils/posLogic.ts';

export interface ToastInfo {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'success' | 'warning' | 'info';
  read: boolean;
}

interface POSContextType {
  // Auth & Roles
  currentUser: User | null;
  login: (username: string, password?: string) => boolean;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  users: User[];
  addUser: (userData: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, userData: Partial<User>) => void;
  deleteUser: (id: string) => boolean;

  // Navigation & View
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;

  // Categories
  categories: Category[];
  addCategory: (category: Omit<Category, 'id' | 'productCount' | 'createdAt'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => { success: boolean; message: string };

  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'categoryName'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => { success: boolean; message: string };

  // Cart & POS
  cart: CartItem[];
  addToCart: (product: Product, qty?: number) => boolean;
  updateCartQty: (productId: string, qty: number) => boolean;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  discountPercent: number;
  setDiscountPercent: (percent: number) => void;
  cartTotals: ReturnType<typeof calculateCartTotals>;

  // Transactions
  transactions: Transaction[];
  processTransaction: (params: {
    paymentMethod: PaymentMethod;
    cashReceived: number;
    notes?: string;
  }) => { success: boolean; transaction?: Transaction; error?: string };
  cancelTransaction: (id: string, reason: string) => { success: boolean; message: string };

  // Stock & Inventory
  stockMovements: StockMovement[];
  adjustStock: (productId: string, type: 'in' | 'out' | 'adjustment', qty: number, reason: string) => void;

  // Activity Logs
  activityLogs: ActivityLog[];

  // Settings
  storeSettings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;

  // UI States
  darkMode: boolean;
  toggleDarkMode: () => void;
  lang: Language;
  setLang: (lang: Language) => void;
  t: (idText: string, enText: string) => string;

  // Notifications & Toasts
  toasts: ToastInfo[];
  showToast: (message: string, type?: ToastInfo['type']) => void;
  removeToast: (id: string) => void;
  notifications: AppNotification[];
  markNotificationsRead: () => void;

  // Selected item states for Modals
  lastCompletedTransaction: Transaction | null;
  setLastCompletedTransaction: (trx: Transaction | null) => void;
  previewReceiptTransaction: Transaction | null;
  setPreviewReceiptTransaction: (trx: Transaction | null) => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'rmart_users_v2',
  PRODUCTS: 'rmart_products_v2',
  CATEGORIES: 'rmart_categories_v2',
  TRANSACTIONS: 'rmart_transactions_v2',
  STOCK_MOVEMENTS: 'rmart_stock_movements_v2',
  ACTIVITY_LOGS: 'rmart_activity_logs_v2',
  SETTINGS: 'rmart_settings_v2',
  CURRENT_USER: 'rmart_current_user_v2',
  DARK_MODE: 'rmart_dark_mode_v2',
  LANG: 'rmart_lang_v2',
};

export const POSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Safe localStorage helper
  const loadStored = <T,>(key: string, fallback: T): T => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : fallback;
    } catch {
      return fallback;
    }
  };

  // State initialization
  const [users, setUsers] = useState<User[]>(() => loadStored(STORAGE_KEYS.USERS, INITIAL_USERS));
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = loadStored<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    return saved || INITIAL_USERS[0]; // Default logged in as Admin for instant rich demo
  });

  const [categories, setCategories] = useState<Category[]>(() =>
    loadStored(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES)
  );
  const [products, setProducts] = useState<Product[]>(() =>
    loadStored(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS)
  );
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    loadStored(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS)
  );
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() =>
    loadStored(STORAGE_KEYS.STOCK_MOVEMENTS, INITIAL_STOCK_MOVEMENTS)
  );
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() =>
    loadStored(STORAGE_KEYS.ACTIVITY_LOGS, INITIAL_ACTIVITY_LOGS)
  );
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() =>
    loadStored(STORAGE_KEYS.SETTINGS, INITIAL_STORE_SETTINGS)
  );

  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
    if (saved !== null) return saved === 'true';
    return false;
  });

  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LANG);
    return saved === 'en' ? 'en' : 'id';
  });

  const [toasts, setToasts] = useState<ToastInfo[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-1',
      title: 'Selamat Datang di RMart POS',
      message: 'Sistem siap digunakan untuk melayani transaksi dan inventaris sembako.',
      time: 'Baru saja',
      type: 'info',
      read: false,
    },
    {
      id: 'notif-2',
      title: 'Peringatan Stok Menipis',
      message: '5 produk sembako mendekati batas minimum stok.',
      time: '10 mnt lalu',
      type: 'warning',
      read: false,
    },
  ]);

  const [lastCompletedTransaction, setLastCompletedTransaction] = useState<Transaction | null>(null);
  const [previewReceiptTransaction, setPreviewReceiptTransaction] = useState<Transaction | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STOCK_MOVEMENTS, JSON.stringify(stockMovements));
  }, [stockMovements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(storeSettings));
  }, [storeSettings]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DARK_MODE, String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.style.colorScheme = 'light';
    }
  }, [darkMode]);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem(STORAGE_KEYS.LANG, newLang);
  };

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const t = (idText: string, enText: string) => (lang === 'en' ? enText : idText);

  // Toast Helpers
  const showToast = (message: string, type: ToastInfo['type'] = 'success') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  };

  // Activity Logger
  const logActivity = (action: string, details: string) => {
    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toLocaleString('id-ID'),
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'Sistem',
      userRole: currentUser?.role || 'admin',
      action,
      details,
      ipAddress: '192.168.1.101',
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  // Auth Operations
  const login = (usernameInput: string, passwordInput?: string): boolean => {
    const trimmed = usernameInput.trim().toLowerCase();
    if (!passwordInput || !passwordInput.trim()) {
      showToast('Silakan masukkan kata sandi / password Anda.', 'error');
      return false;
    }
    const found = users.find(
      (u) =>
        (u.username.toLowerCase() === trimmed || u.email.toLowerCase() === trimmed) &&
        u.status === 'active'
    );
    if (found) {
      setCurrentUser(found);
      logActivity('Login Berhasil', `Pengguna ${found.name} (${found.role}) masuk ke sistem.`);
      showToast(`Selamat datang kembali, ${found.name}!`, 'success');
      return true;
    }
    showToast('Username atau password tidak sesuai.', 'error');
    return false;
  };

  const logout = () => {
    if (currentUser) {
      logActivity('Logout', `Pengguna ${currentUser.name} keluar dari sesi.`);
    }
    setCurrentUser(null);
    clearCart();
    showToast('Sesi kasir berhasil diakhiri.', 'info');
  };

  const switchRole = (role: UserRole) => {
    const target = users.find((u) => u.role === role && u.status === 'active') || users[0];
    setCurrentUser(target);
    logActivity('Ganti Role Demo', `Beralih peran menjadi ${target.role} (${target.name})`);
    showToast(`Beralih ke akun ${target.name} (${target.role.toUpperCase()})`, 'info');
  };

  // User Management
  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    setUsers((prev) => [...prev, newUser]);
    logActivity('Tambah Pengguna', `Menambahkan akun baru: ${newUser.name} (${newUser.role})`);
    showToast(`Pengguna ${newUser.name} berhasil ditambahkan!`, 'success');
  };

  const updateUser = (id: string, userData: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...userData } : u)));
    if (currentUser?.id === id) {
      setCurrentUser((prev) => (prev ? { ...prev, ...userData } : prev));
    }
    logActivity('Ubah Pengguna', `Memperbarui data akun ID: ${id}`);
    showToast('Data akun pengguna berhasil diperbarui!', 'success');
  };

  const deleteUser = (id: string): boolean => {
    if (currentUser?.id === id) {
      showToast('Tidak dapat menghapus akun yang sedang aktif digunakan!', 'error');
      return false;
    }
    const target = users.find((u) => u.id === id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
    logActivity('Hapus Pengguna', `Menghapus akun: ${target?.name || id}`);
    showToast('Akun pengguna berhasil dihapus.', 'info');
    return true;
  };

  // Category Operations
  const addCategory = (categoryData: Omit<Category, 'id' | 'productCount' | 'createdAt'>) => {
    const newCat: Category = {
      ...categoryData,
      id: `cat-${Date.now()}`,
      productCount: 0,
      createdAt: new Date().toLocaleDateString('id-ID'),
    };
    setCategories((prev) => [...prev, newCat]);
    logActivity('Tambah Kategori', `Menambahkan kategori produk: ${newCat.name}`);
    showToast(`Kategori ${newCat.name} berhasil ditambahkan!`, 'success');
  };

  const updateCategory = (id: string, categoryData: Partial<Category>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...categoryData } : c)));
    logActivity('Ubah Kategori', `Memperbarui data kategori ID: ${id}`);
    showToast('Kategori berhasil diperbarui!', 'success');
  };

  const deleteCategory = (id: string): { success: boolean; message: string } => {
    const category = categories.find((c) => c.id === id);
    const hasProducts = products.some((p) => p.categoryId === id);
    if (hasProducts) {
      showToast(`Kategori '${category?.name}' tidak dapat dihapus karena masih digunakan produk!`, 'error');
      return { success: false, message: 'Kategori masih terikat dengan produk aktif.' };
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    logActivity('Hapus Kategori', `Menghapus kategori: ${category?.name}`);
    showToast(`Kategori ${category?.name} berhasil dihapus.`, 'info');
    return { success: true, message: 'Kategori berhasil dihapus.' };
  };

  // Product Operations
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'categoryName'>) => {
    const category = categories.find((c) => c.id === productData.categoryId);
    const newProduct: Product = {
      ...productData,
      id: `prd-${Date.now()}`,
      categoryName: category?.name || 'Umum',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setProducts((prev) => [newProduct, ...prev]);

    // Update category count
    if (category) {
      setCategories((prev) =>
        prev.map((c) => (c.id === category.id ? { ...c, productCount: c.productCount + 1 } : c))
      );
    }

    // Record initial stock movement
    if (newProduct.stock > 0) {
      const movement: StockMovement = {
        id: `sm-${Date.now()}`,
        productId: newProduct.id,
        productName: newProduct.name,
        type: 'in',
        qty: newProduct.stock,
        previousStock: 0,
        newStock: newProduct.stock,
        reason: 'Stok awal penambahan produk baru',
        userId: currentUser?.id || 'sys',
        userName: currentUser?.name || 'Sistem',
        timestamp: new Date().toLocaleString('id-ID'),
      };
      setStockMovements((prev) => [movement, ...prev]);
    }

    logActivity('Tambah Produk', `Menambahkan produk baru: ${newProduct.name} (${newProduct.sku})`);
    showToast(`Produk ${newProduct.name} berhasil ditambahkan!`, 'success');
  };

  const updateProduct = (id: string, productData: Partial<Product>) => {
    const category = categories.find((c) => c.id === productData.categoryId);
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            ...productData,
            categoryName: category ? category.name : p.categoryName,
          };
        }
        return p;
      })
    );
    logActivity('Ubah Produk', `Memperbarui data produk ID: ${id}`);
    showToast('Data produk berhasil diperbarui!', 'success');
  };

  const deleteProduct = (id: string): { success: boolean; message: string } => {
    const product = products.find((p) => p.id === id);
    const hasTransactions = transactions.some((t) =>
      t.items.some((item) => item.productId === id)
    );

    if (hasTransactions) {
      // Soft delete protection
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: 'inactive' } : p))
      );
      logActivity('Nonaktifkan Produk', `Menonaktifkan produk ${product?.name} karena memiliki riwayat transaksi.`);
      showToast(`Produk '${product?.name}' dinonaktifkan untuk menjaga integritas transaksi lampau.`, 'info');
      return { success: true, message: 'Produk memiliki riwayat transaksi, status diubah menjadi Nonaktif.' };
    }

    setProducts((prev) => prev.filter((p) => p.id !== id));
    logActivity('Hapus Produk', `Menghapus produk: ${product?.name}`);
    showToast(`Produk ${product?.name} berhasil dihapus permanen.`, 'info');
    return { success: true, message: 'Produk berhasil dihapus.' };
  };

  // Stock Adjustment
  const adjustStock = (
    productId: string,
    type: 'in' | 'out' | 'adjustment',
    qty: number,
    reason: string
  ) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    let newStock = product.stock;
    if (type === 'in') newStock = product.stock + qty;
    else if (type === 'out') newStock = Math.max(0, product.stock - qty);
    else if (type === 'adjustment') newStock = Math.max(0, qty);

    const diff = Math.abs(newStock - product.stock);

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
    );

    const movement: StockMovement = {
      id: `sm-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      type,
      qty: diff,
      previousStock: product.stock,
      newStock,
      reason,
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'Sistem',
      timestamp: new Date().toLocaleString('id-ID'),
    };
    setStockMovements((prev) => [movement, ...prev]);

    logActivity('Penyesuaian Stok', `${type.toUpperCase()} ${product.name}: ${product.stock} -> ${newStock} (${reason})`);
    showToast(`Stok ${product.name} berhasil diperbarui menjadi ${newStock} ${product.unit}.`, 'success');
  };

  // Cart Operations
  const addToCart = (product: Product, addQty: number = 1): boolean => {
    const existing = cart.find((item) => item.productId === product.id);
    const currentQtyInCart = existing ? existing.qty : 0;
    const requestedTotal = currentQtyInCart + addQty;

    if (requestedTotal > product.stock) {
      showToast(`Stok ${product.name} tidak mencukupi! Tersedia hanya ${product.stock} ${product.unit}.`, 'warning');
      return false;
    }

    if (existing) {
      setCart((prev) =>
        prev.map((item) =>
          item.productId === product.id ? { ...item, qty: requestedTotal } : item
        )
      );
    } else {
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${product.id}`,
        productId: product.id,
        name: product.name,
        sku: product.sku,
        price: product.sellingPrice,
        costPrice: product.costPrice,
        qty: addQty,
        stock: product.stock,
        unit: product.unit,
        image: product.image,
        categoryName: product.categoryName,
      };
      setCart((prev) => [...prev, newItem]);
    }
    return true;
  };

  const updateCartQty = (productId: string, newQty: number): boolean => {
    const product = products.find((p) => p.id === productId);
    if (!product) return false;

    if (newQty <= 0) {
      removeFromCart(productId);
      return true;
    }

    if (newQty > product.stock) {
      showToast(`Stok ${product.name} maksimal ${product.stock} ${product.unit}.`, 'warning');
      return false;
    }

    setCart((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, qty: newQty } : item))
    );
    return true;
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountPercent(0);
  };

  // Computed Cart Totals
  const cartTotals = calculateCartTotals(
    cart.map((c) => ({
      id: c.productId,
      name: c.name,
      sku: c.sku,
      price: c.price,
      costPrice: c.costPrice,
      qty: c.qty,
      stock: c.stock,
      unit: c.unit,
    })),
    discountPercent,
    storeSettings.taxPercent
  );

  // Atomic Transaction Processing
  const processTransaction = (params: {
    paymentMethod: PaymentMethod;
    cashReceived: number;
    notes?: string;
  }): { success: boolean; transaction?: Transaction; error?: string } => {
    if (cart.length === 0) {
      return { success: false, error: 'Keranjang belanja masih kosong.' };
    }

    // 1. Stock check before payment
    for (const item of cart) {
      const currentProduct = products.find((p) => p.id === item.productId);
      if (!currentProduct || currentProduct.stock < item.qty) {
        const available = currentProduct ? currentProduct.stock : 0;
        showToast(`Stok ${item.name} berubah! Tersisa ${available}. Pembayaran dibatalkan.`, 'error');
        return { success: false, error: `Stok ${item.name} tidak mencukupi.` };
      }
    }

    // 2. Calculation & change verification
    const { total, subtotal, discountAmount, taxAmount } = cartTotals;
    const cashReceived = params.paymentMethod === 'cash' ? params.cashReceived : total;

    if (cashReceived < total) {
      return { success: false, error: 'Uang pembayaran kurang dari total tagihan.' };
    }

    const changeAmount = cashReceived - total;
    const nextCounter = transactions.length + 1248; // Continue sequence
    const code = generateTransactionCode(nextCounter);
    const dateStr = new Date().toLocaleString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).replace(/\//g, '-');

    const newTransaction: Transaction = {
      id: `tx-${Date.now()}`,
      code,
      date: dateStr,
      cashierId: currentUser?.id || 'usr-1',
      cashierName: currentUser?.name || 'Kasir',
      items: cart.map((item) => ({
        productId: item.productId,
        name: item.name,
        sku: item.sku,
        price: item.price,
        costPrice: item.costPrice,
        qty: item.qty,
        subtotal: item.qty * item.price,
        unit: item.unit,
      })),
      subtotal,
      discountPercent,
      discountAmount,
      taxPercent: storeSettings.taxPercent,
      taxAmount,
      total,
      cashReceived,
      changeAmount,
      paymentMethod: params.paymentMethod,
      status: 'completed',
      notes: params.notes,
    };

    // 3. Atomically update inventory & record stock movements
    setProducts((prev) =>
      prev.map((prod) => {
        const cartItem = cart.find((c) => c.productId === prod.id);
        if (cartItem) {
          return {
            ...prod,
            stock: Math.max(0, prod.stock - cartItem.qty),
          };
        }
        return prod;
      })
    );

    const movements: StockMovement[] = cart.map((item) => {
      const prod = products.find((p) => p.id === item.productId)!;
      return {
        id: `sm-${Date.now()}-${item.productId}`,
        productId: item.productId,
        productName: item.name,
        type: 'sale',
        qty: item.qty,
        previousStock: prod.stock,
        newStock: Math.max(0, prod.stock - item.qty),
        reason: `Penjualan Kasir POS (${code})`,
        userId: currentUser?.id || 'usr-1',
        userName: currentUser?.name || 'Kasir',
        timestamp: dateStr,
      };
    });

    setStockMovements((prev) => [...movements, ...prev]);
    setTransactions((prev) => [newTransaction, ...prev]);

    // 4. Log activity & add real-time notification
    logActivity('Transaksi Selesai', `Transaksi ${code} berhasil senilai ${total} (${params.paymentMethod})`);

    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Transaksi Kasir Berhasil!',
      message: `${code} sebesar Rp ${total.toLocaleString('id-ID')} (${currentUser?.name})`,
      time: 'Baru saja',
      type: 'success',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Clear cart & retain transaction for receipt modal
    clearCart();
    setLastCompletedTransaction(newTransaction);
    showToast(`Transaksi ${code} sukses diproses!`, 'success');

    return { success: true, transaction: newTransaction };
  };

  // Transaction Cancellation (Restores stock atomicity)
  const cancelTransaction = (id: string, reason: string): { success: boolean; message: string } => {
    const trx = transactions.find((t) => t.id === id);
    if (!trx) return { success: false, message: 'Transaksi tidak ditemukan.' };
    if (trx.status === 'cancelled') return { success: false, message: 'Transaksi sudah dibatalkan sebelumnya.' };

    // Restore stock
    setProducts((prev) =>
      prev.map((prod) => {
        const item = trx.items.find((i) => i.productId === prod.id);
        if (item) {
          return { ...prod, stock: prod.stock + item.qty };
        }
        return prod;
      })
    );

    // Record return stock movements
    const restoreMovements: StockMovement[] = trx.items.map((item) => {
      const prod = products.find((p) => p.id === item.productId);
      const curr = prod ? prod.stock : 0;
      return {
        id: `sm-${Date.now()}-${item.productId}`,
        productId: item.productId,
        productName: item.name,
        type: 'in',
        qty: item.qty,
        previousStock: curr,
        newStock: curr + item.qty,
        reason: `Pembatalan Transaksi ${trx.code}: ${reason}`,
        userId: currentUser?.id || 'usr-1',
        userName: currentUser?.name || 'Admin',
        timestamp: new Date().toLocaleString('id-ID'),
      };
    });
    setStockMovements((prev) => [...restoreMovements, ...prev]);

    // Update status
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: 'cancelled',
              cancelReason: reason,
              cancelledBy: currentUser?.name || 'Admin',
              cancelledAt: new Date().toLocaleString('id-ID'),
            }
          : t
      )
    );

    logActivity('Pembatalan Transaksi', `Membatalkan ${trx.code}. Alasan: ${reason}. Stok berhasil dikembalikan.`);
    showToast(`Transaksi ${trx.code} berhasil dibatalkan. Stok otomatis dikembalikan!`, 'info');
    return { success: true, message: 'Transaksi dibatalkan dan stok telah dipulihkan.' };
  };

  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setStoreSettings((prev) => ({ ...prev, ...newSettings }));
    logActivity('Pengaturan Diperbarui', 'Konfigurasi profil toko dan struk belanja disimpan.');
    showToast('Pengaturan toko berhasil diperbarui!', 'success');
  };

  const markNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <POSContext.Provider
      value={{
        currentUser,
        login,
        logout,
        switchRole,
        users,
        addUser,
        updateUser,
        deleteUser,

        currentView,
        setCurrentView,

        categories,
        addCategory,
        updateCategory,
        deleteCategory,

        products,
        addProduct,
        updateProduct,
        deleteProduct,

        cart,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        discountPercent,
        setDiscountPercent,
        cartTotals,

        transactions,
        processTransaction,
        cancelTransaction,

        stockMovements,
        adjustStock,

        activityLogs,

        storeSettings,
        updateSettings,

        darkMode,
        toggleDarkMode,
        lang,
        setLang,
        t,

        toasts,
        showToast,
        removeToast,
        notifications,
        markNotificationsRead,

        lastCompletedTransaction,
        setLastCompletedTransaction,
        previewReceiptTransaction,
        setPreviewReceiptTransaction,
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) throw new Error('usePOS must be used within a POSProvider');
  return context;
};
