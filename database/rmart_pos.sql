-- ==============================================================================
-- RMART POS — MODERN GROCERY POINT OF SALE & INVENTORY SYSTEM
-- DATABASE SCHEMA & SEED DATA (MySQL 8.0+ / MariaDB 10.4+)
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP DATABASE IF EXISTS rmart_pos;
CREATE DATABASE rmart_pos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE rmart_pos;

-- ------------------------------------------------------------------------------
-- 1. TABEL: users (Akun Pengguna dengan Enkripsi Password & Hak Akses)
-- ------------------------------------------------------------------------------
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'kasir', 'manager') NOT NULL DEFAULT 'kasir',
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NULL,
    avatar VARCHAR(255) NULL,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_role (role),
    INDEX idx_user_status (status)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 2. TABEL: categories (Kategori Produk Sembako)
-- ------------------------------------------------------------------------------
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NULL,
    icon VARCHAR(50) NULL DEFAULT 'Package',
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 3. TABEL: products (Katalog Barang Dagangan Sembako)
-- Menggunakan DECIMAL untuk mencegah presisi floating point error pada nilai rupiah
-- ------------------------------------------------------------------------------
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    barcode VARCHAR(100) NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    category_id INT NOT NULL,
    cost_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    selling_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    stock INT NOT NULL DEFAULT 0,
    min_stock INT NOT NULL DEFAULT 5,
    unit VARCHAR(30) NOT NULL DEFAULT 'pcs',
    image VARCHAR(255) NULL,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    INDEX idx_product_sku (sku),
    INDEX idx_product_category (category_id),
    INDEX idx_product_stock (stock)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 4. TABEL: transactions (Header Transaksi Penjualan Kasir)
-- ------------------------------------------------------------------------------
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    cashier_id INT NOT NULL,
    transaction_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(12, 2) NOT NULL,
    discount_percent DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    tax_percent DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total DECIMAL(12, 2) NOT NULL,
    cash_received DECIMAL(12, 2) NOT NULL,
    change_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    payment_method ENUM('cash', 'qris', 'transfer') NOT NULL DEFAULT 'cash',
    status ENUM('completed', 'cancelled', 'refunded') NOT NULL DEFAULT 'completed',
    notes TEXT NULL,
    cancel_reason TEXT NULL,
    cancelled_by INT NULL,
    cancelled_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cashier_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (cancelled_by) REFERENCES users(id) ON UPDATE CASCADE ON DELETE SET NULL,
    INDEX idx_trx_code (code),
    INDEX idx_trx_date (transaction_date),
    INDEX idx_trx_status (status)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 5. TABEL: transaction_items (Detail Barang per Transaksi - Snapshot Harga)
-- Snapshot harga dan nama menjaga integritas historis jika harga produk berubah
-- ------------------------------------------------------------------------------
CREATE TABLE transaction_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(150) NOT NULL,
    sku VARCHAR(50) NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    cost_price DECIMAL(12, 2) NOT NULL,
    qty INT NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    unit VARCHAR(30) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    INDEX idx_item_trx (transaction_id),
    INDEX idx_item_product (product_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 6. TABEL: stock_movements (Catatan Mutasi Stok / Audit Inventory)
-- ------------------------------------------------------------------------------
CREATE TABLE stock_movements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    type ENUM('in', 'out', 'sale', 'adjustment') NOT NULL,
    qty INT NOT NULL,
    previous_stock INT NOT NULL,
    new_stock INT NOT NULL,
    reason VARCHAR(255) NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_movement_product (product_id),
    INDEX idx_movement_date (created_at)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 7. TABEL: activity_logs (Audit Trail Keamanan & Aktivitas Sistem)
-- ------------------------------------------------------------------------------
CREATE TABLE activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    ip_address VARCHAR(45) NOT NULL DEFAULT '127.0.0.1',
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_activity_user (user_id),
    INDEX idx_activity_date (created_at)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 8. TABEL: store_settings (Pengaturan Profil Toko & Konfigurasi)
-- ------------------------------------------------------------------------------
CREATE TABLE store_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(50) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    description VARCHAR(255) NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- SEED DATA AWAL REALISTIS
-- ------------------------------------------------------------------------------

-- Users (Password demo default: 'password123' ter-hash bcrypt)
INSERT INTO users (id, username, password_hash, name, role, email, phone, avatar, status) VALUES
(1, 'admin', '$2y$10$e8g3.l04.2e0qB96xJqGveK9o8Z.cT9a5bX6p7y0s1.zQ2wE4r5T6', 'Admin Utama RMart', 'admin', 'admin@rmart.id', '0812-3456-7890', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'active'),
(2, 'kasir', '$2y$10$e8g3.l04.2e0qB96xJqGveK9o8Z.cT9a5bX6p7y0s1.zQ2wE4r5T6', 'Siti Rahma (Kasir 1)', 'kasir', 'kasir@rmart.id', '0813-8899-7711', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'active'),
(3, 'manager', '$2y$10$e8g3.l04.2e0qB96xJqGveK9o8Z.cT9a5bX6p7y0s1.zQ2wE4r5T6', 'Budi Hartono (Manager)', 'manager', 'manager@rmart.id', '0811-2233-4455', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'active');

-- Categories
INSERT INTO categories (id, name, description, icon) VALUES
(1, 'Sembako', 'Bahan pokok kebutuhan sehari-hari seperti beras, minyak, dan gula', 'Package'),
(2, 'Makanan Instan', 'Mie instan, bubur cepat saji, dan biskuit', 'Utensils'),
(3, 'Minuman', 'Minuman teh, kopi kemasan, susu cair, dan air mineral', 'CupSoda'),
(4, 'Perawatan', 'Sabun mandi, detergen, sampo, dan pasta gigi', 'Sparkles'),
(5, 'Lainnya', 'Bumbu dapur, saus, kecap, dan perlengkapan rumah tangga', 'ShoppingBag');

-- Products
INSERT INTO products (id, sku, barcode, name, category_id, cost_price, selling_price, stock, min_stock, unit, image) VALUES
(1, 'BRS-5KG', '899123456001', 'Beras 5kg', 1, 54000.00, 64000.00, 15, 5, 'sak', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400'),
(2, 'MYK-1L', '899123456002', 'Minyak Goreng 1L', 1, 48000.00, 56000.00, 28, 10, 'pouch', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400'),
(3, 'GLA-1KG', '899123456003', 'Gula Pasir 1kg', 1, 19500.00, 24000.00, 20, 8, 'kg', 'https://images.unsplash.com/photo-1622484212850-eb596d769edc?w=400'),
(4, 'TLR-1KG', '899123456004', 'Telur Ayam', 1, 22000.00, 27000.00, 12, 6, 'kg', 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400'),
(5, 'IDM-GRG', '899123456005', 'Indomie', 2, 13000.00, 16000.00, 50, 15, 'pak (5 pcs)', 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400'),
(6, 'SSU-UHT', '899123456006', 'Susu UHT', 3, 5200.00, 6500.00, 8, 10, 'kotak', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400'),
(7, 'TEH-BTL', '899123456007', 'Teh Botol', 3, 3000.00, 4000.00, 45, 12, 'botol', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400'),
(8, 'ROTI-TWR', '899123456008', 'Roti Tawar', 2, 8500.00, 11000.00, 14, 5, 'bungkus', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400'),
(9, 'KOP-KPL', '899123456009', 'Kopi Kapal Api 165g', 3, 12000.00, 14500.00, 4, 5, 'bungkus', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400'),
(10, 'TPG-SGT', '899123456010', 'Tepung Terigu Segitiga 1kg', 1, 10500.00, 13000.00, 3, 6, 'kg', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400'),
(11, 'KCP-BNG', '899123456011', 'Kecap Manis Bango 550ml', 5, 19000.00, 23000.00, 2, 5, 'pouch', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400'),
(12, 'SBN-LFB', '899123456012', 'Sabun Mandi Batang', 4, 3500.00, 4800.00, 40, 10, 'pcs', 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=400');

-- Store Settings
INSERT INTO store_settings (setting_key, setting_value, description) VALUES
('store_name', 'RMart Sembako Modern', 'Nama resmi toko pada struk dan sistem'),
('slogan', 'Belanja Mudah, Usaha Makin Berkembang', 'Slogan toko sembako'),
('address', 'Jl. Merdeka No. 45, Kebayoran Baru, Jakarta Selatan', 'Alamat lengkap toko'),
('phone', '0812-3456-7890', 'Nomor telepon operasional'),
('email', 'info@rmart.id', 'Email layanan konsumen'),
('receipt_footer', 'Terima Kasih Telah Berbelanja di RMart! Barang yang sudah dibeli tidak dapat ditukar kecuali ada perjanjian.', 'Catatan di bagian bawah struk belanja'),
('paper_size', '58mm', 'Ukuran printer thermal default (58mm atau 80mm)'),
('tax_percent', '0', 'Persentase Pajak PPN (0-11%)'),
('low_stock_threshold', '5', 'Batas minimal stok untuk memicu peringatan restok');

SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- CATATAN ARSITEKTUR SISTEM:
-- 1. Skema menggunakan Foreign Key dengan constraint ON DELETE RESTRICT untuk
--    mencegah penghapusan produk / kasir yang masih memiliki riwayat transaksi.
-- 2. Tipe data DECIMAL(12,2) dipakai untuk menjaga keakuratan mata uang Rupiah.
-- 3. Transaksi atomik diimplementasikan dengan:
--    BEGIN TRANSACTION; ... COMMIT; / ROLLBACK;
-- ==============================================================================
