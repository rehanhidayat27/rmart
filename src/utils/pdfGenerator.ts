import { jsPDF } from 'jspdf';
import { Transaction, StoreSettings } from '../types/index.ts';
import { formatRupiah } from './posLogic.ts';

/**
 * Generate authentic Thermal Receipt PDF (58mm or 80mm)
 */
export function generateReceiptPdf(
  transaction: Transaction,
  settings: StoreSettings,
  autoDownload: boolean = true
): jsPDF {
  const is58 = settings.paperSize === '58mm';
  const pageWidth = is58 ? 58 : 80;
  
  // Calculate dynamic height based on item count
  const baseHeight = 120;
  const itemRowHeight = 7;
  const estimatedHeight = Math.max(140, baseHeight + transaction.items.length * itemRowHeight);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [pageWidth, estimatedHeight],
  });

  const margin = 4;
  const contentWidth = pageWidth - margin * 2;
  let y = 8;

  // Header
  doc.setFont('courier', 'bold');
  doc.setFontSize(is58 ? 12 : 14);
  doc.text('RMART POS', pageWidth / 2, y, { align: 'center' });
  y += 5;

  doc.setFont('courier', 'normal');
  doc.setFontSize(is58 ? 7 : 8);
  doc.text('Sistem Kasir Sembako Modern', pageWidth / 2, y, { align: 'center' });
  y += 4;

  // Split address into multiple lines if needed
  const addressLines = doc.splitTextToSize(settings.address, contentWidth);
  doc.text(addressLines, pageWidth / 2, y, { align: 'center' });
  y += addressLines.length * 3.5 + 1;

  doc.text(`Telp: ${settings.phone}`, pageWidth / 2, y, { align: 'center' });
  y += 4;

  // Divider
  doc.setLineDashPattern([1, 1], 0);
  doc.line(margin, y, pageWidth - margin, y);
  y += 4;

  // Meta info
  doc.setFontSize(is58 ? 6.5 : 7.5);
  doc.text(`No. Trx : ${transaction.code}`, margin, y);
  y += 3.5;
  doc.text(`Waktu   : ${transaction.date}`, margin, y);
  y += 3.5;
  doc.text(`Kasir   : ${transaction.cashierName}`, margin, y);
  y += 3.5;
  doc.text(`Metode  : ${transaction.paymentMethod.toUpperCase()}`, margin, y);
  y += 4;

  // Table Divider
  doc.setLineDashPattern([1, 1], 0);
  doc.line(margin, y, pageWidth - margin, y);
  y += 4;

  // Item List
  doc.setFont('courier', 'bold');
  doc.text('ITEM', margin, y);
  doc.text('TOTAL', pageWidth - margin, y, { align: 'right' });
  y += 3.5;

  doc.setFont('courier', 'normal');
  transaction.items.forEach((item) => {
    // Truncate name if long
    const maxChars = is58 ? 16 : 24;
    const nameStr = item.name.length > maxChars ? item.name.substring(0, maxChars - 2) + '..' : item.name;
    
    doc.text(nameStr, margin, y);
    doc.text(formatRupiah(item.subtotal).replace('Rp ', ''), pageWidth - margin, y, { align: 'right' });
    y += 3;
    
    // Qty and unit price
    doc.setFontSize(is58 ? 6 : 7);
    doc.text(`  ${item.qty} x ${formatRupiah(item.price).replace('Rp ', '')}`, margin, y);
    doc.setFontSize(is58 ? 6.5 : 7.5);
    y += 4;
  });

  // Totals Divider
  doc.setLineDashPattern([1, 1], 0);
  doc.line(margin, y, pageWidth - margin, y);
  y += 4;

  // Calculations
  const printRow = (label: string, value: string, bold: boolean = false) => {
    if (bold) doc.setFont('courier', 'bold');
    else doc.setFont('courier', 'normal');
    doc.text(label, margin, y);
    doc.text(value, pageWidth - margin, y, { align: 'right' });
    y += 3.8;
  };

  printRow('Subtotal', formatRupiah(transaction.subtotal));
  if (transaction.discountAmount > 0) {
    printRow(`Diskon (${transaction.discountPercent}%)`, `-${formatRupiah(transaction.discountAmount)}`);
  }
  if (transaction.taxAmount > 0) {
    printRow(`PPN (${transaction.taxPercent}%)`, formatRupiah(transaction.taxAmount));
  }

  y += 1;
  doc.setFontSize(is58 ? 8 : 9);
  printRow('TOTAL BAYAR', formatRupiah(transaction.total), true);
  doc.setFontSize(is58 ? 6.5 : 7.5);

  printRow('Tunai/Diterima', formatRupiah(transaction.cashReceived));
  printRow('Kembalian', formatRupiah(transaction.changeAmount));

  // Footer Divider
  y += 2;
  doc.setLineDashPattern([1, 1], 0);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  doc.setFont('courier', 'normal');
  doc.setFontSize(is58 ? 6 : 7);
  const footerLines = doc.splitTextToSize(settings.receiptFooter || 'Terima kasih atas kunjungan Anda!', contentWidth);
  doc.text(footerLines, pageWidth / 2, y, { align: 'center' });
  y += footerLines.length * 3.2 + 2;

  doc.text('*** LAYANAN KONSUMEN RMART ***', pageWidth / 2, y, { align: 'center' });

  if (autoDownload) {
    doc.save(`Struk_${transaction.code}.pdf`);
  }

  return doc;
}

/**
 * Generate Sales Report PDF (A4 format)
 */
export function generateSalesReportPdf(
  transactions: Transaction[],
  summary: {
    totalRevenue: number;
    transactionCount: number;
    averageValue: number;
    periodLabel: string;
  },
  settings: StoreSettings
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  let y = 16;

  // Header Banner
  doc.setFillColor(23, 32, 51); // #172033 Midnight Navy
  doc.rect(0, 0, pageWidth, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('RMART POS — LAPORAN PENJUALAN', 15, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`${settings.storeName} | ${settings.address}`, 15, 23);
  doc.text(`Periode Laporan: ${summary.periodLabel} | Dicetak: ${new Date().toLocaleString('id-ID')}`, 15, 28);

  y = 42;
  doc.setTextColor(30, 41, 59);

  // Summary Metrics Boxes
  const boxWidth = 42;
  const boxHeight = 22;

  const metrics = [
    { label: 'Total Penjualan', value: formatRupiah(summary.totalRevenue), color: [16, 185, 129] },
    { label: 'Jumlah Transaksi', value: `${summary.transactionCount} Trx`, color: [99, 54, 201] },
    { label: 'Rata-rata Transaksi', value: formatRupiah(summary.averageValue), color: [245, 107, 131] },
    { label: 'Status Toko', value: 'Berjalan Optimal', color: [255, 181, 71] },
  ];

  metrics.forEach((m, idx) => {
    const x = 15 + idx * (boxWidth + 4);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, y, boxWidth, boxHeight, 3, 3, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, y, boxWidth, boxHeight, 3, 3, 'D');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(m.label, x + 4, y + 7);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(m.color[0], m.color[1], m.color[2]);
    doc.text(m.value, x + 4, y + 16);
  });

  y += 32;

  // Transaction Table Header
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Daftar Transaksi Periode Ini', 15, y);
  y += 6;

  doc.setFillColor(99, 54, 201); // #6336C9 Deep Plum
  doc.rect(15, y, 180, 8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('No', 18, y + 5.5);
  doc.text('Kode Transaksi', 30, y + 5.5);
  doc.text('Waktu', 65, y + 5.5);
  doc.text('Kasir', 105, y + 5.5);
  doc.text('Metode', 135, y + 5.5);
  doc.text('Total', 170, y + 5.5);
  y += 8;

  // Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  transactions.slice(0, 35).forEach((t, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, y, 180, 7, 'F');
    }
    doc.setTextColor(51, 65, 85);
    doc.text(String(index + 1), 18, y + 4.8);
    doc.text(t.code, 30, y + 4.8);
    doc.text(t.date, 65, y + 4.8);
    doc.text(t.cashierName, 105, y + 4.8);
    doc.text(t.paymentMethod.toUpperCase(), 135, y + 4.8);
    doc.text(formatRupiah(t.total), 170, y + 4.8);
    y += 7;

    // Page overflow safety
    if (y > 275 && index < transactions.length - 1) {
      doc.addPage();
      y = 20;
    }
  });

  // Bottom footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('RMart POS — Dicetak otomatis dari Modul Laporan Sistem Kasir Sembako', 15, 288);
  doc.text(`Halaman 1 dari 1`, 180, 288);

  doc.save(`Laporan_Penjualan_RMart_${new Date().toISOString().slice(0, 10)}.pdf`);
}

/**
 * Generate CSV for transaction history
 */
export function exportTransactionsToCsv(transactions: Transaction[]): void {
  const headers = ['ID', 'Kode Transaksi', 'Tanggal', 'Kasir', 'Metode Pembayaran', 'Subtotal', 'Diskon', 'PPN', 'Total', 'Status'];
  const rows = transactions.map((t, idx) => [
    idx + 1,
    t.code,
    `"${t.date}"`,
    `"${t.cashierName}"`,
    t.paymentMethod.toUpperCase(),
    t.subtotal,
    t.discountAmount,
    t.taxAmount,
    t.total,
    t.status,
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Transaksi_RMart_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
