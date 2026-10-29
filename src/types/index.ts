export type UserRole = 'admin' | 'kasir' | 'manager';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  email: string;
  phone: string;
  avatar: string;
  status: 'active' | 'inactive';
  twoFactorEnabled: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon?: string;
  productCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  categoryId: string;
  categoryName: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  unit: string;
  image: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  costPrice: number;
  qty: number;
  stock: number;
  unit: string;
  image: string;
  categoryName: string;
}

export interface TransactionItem {
  productId: string;
  name: string;
  sku: string;
  price: number;
  costPrice: number;
  qty: number;
  subtotal: number;
  unit: string;
}

export type PaymentMethod = 'cash' | 'qris' | 'transfer';
export type TransactionStatus = 'completed' | 'cancelled' | 'refunded';

export interface Transaction {
  id: string;
  code: string;
  date: string;
  cashierId: string;
  cashierName: string;
  items: TransactionItem[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  total: number;
  cashReceived: number;
  changeAmount: number;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  notes?: string;
  cancelReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
}

export type MovementType = 'in' | 'out' | 'sale' | 'adjustment';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: MovementType;
  qty: number;
  previousStock: number;
  newStock: number;
  reason: string;
  userId: string;
  userName: string;
  timestamp: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  ipAddress: string;
}

export interface StoreSettings {
  storeName: string;
  slogan: string;
  address: string;
  phone: string;
  email: string;
  receiptFooter: string;
  paperSize: '58mm' | '80mm';
  taxPercent: number;
  enable2FA: boolean;
  lowStockThreshold: number;
  currency: string;
}

export type ViewType =
  | 'dashboard'
  | 'kasir'
  | 'produk'
  | 'kategori'
  | 'stok'
  | 'transaksi'
  | 'riwayat'
  | 'laporan'
  | 'pengguna'
  | 'log'
  | 'pengaturan';

export type Language = 'id' | 'en';
