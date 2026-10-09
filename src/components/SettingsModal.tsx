import React, { useState } from 'react';
import {
  X,
  Sliders,
  Database,
  RotateCcw,
  Check,
  Tag,
  Plus,
  Trash2,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Download,
  FileSpreadsheet,
  FileDown,
} from 'lucide-react';
import { Category, TransactionType, Transaction, SavingsGoal } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthlyBudget: number;
  categories: Category[];
  transactions?: Transaction[];
  savingsGoals?: SavingsGoal[];
  onUpdateMonthlyBudget: (newBudget: number) => void;
  onResetSeedData: () => void;
  onAddCategory: (category: { name: string; type: TransactionType; color?: string }) => void;
  onDeleteCategory: (categoryId: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  monthlyBudget,
  categories,
  transactions = [],
  savingsGoals = [],
  onUpdateMonthlyBudget,
  onResetSeedData,
  onAddCategory,
  onDeleteCategory,
}) => {
  const [budgetStr, setBudgetStr] = useState(monthlyBudget.toString());
  const [saved, setSaved] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  // Category management state
  const [categoryTab, setCategoryTab] = useState<TransactionType>('expense');
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<TransactionType>('expense');
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [categorySuccess, setCategorySuccess] = useState<string | null>(null);
  const [confirmDeleteCatId, setConfirmDeleteCatId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(budgetStr);
    if (val && val > 0) {
      onUpdateMonthlyBudget(val);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleReset = () => {
    onResetSeedData();
    setResetConfirm(false);
    onClose();
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) {
      setCategoryError('Nama kategori tidak boleh kosong');
      return;
    }

    // Check duplicate
    const exists = categories.some(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase() && c.type === newCatType
    );
    if (exists) {
      setCategoryError(`Kategori "${trimmed}" sudah ada`);
      return;
    }

    onAddCategory({
      name: trimmed,
      type: newCatType,
    });

    setNewCatName('');
    setCategoryError(null);
    setCategorySuccess(`Kategori "${trimmed}" berhasil dibuat!`);
    setTimeout(() => setCategorySuccess(null), 2500);
  };

  const handleDeleteCategory = (catId: string) => {
    const target = categories.find((c) => c.id === catId);
    // Count how many categories left for this type
    const remainingForType = categories.filter((c) => c.type === target?.type);
    if (remainingForType.length <= 1) {
      setCategoryError(`Harus ada minimal 1 kategori ${target?.type === 'income' ? 'pemasukan' : 'pengeluaran'}`);
      setConfirmDeleteCatId(null);
      setTimeout(() => setCategoryError(null), 3000);
      return;
    }

    onDeleteCategory(catId);
    setConfirmDeleteCatId(null);
    setCategorySuccess(`Kategori "${target?.name}" dihapus`);
    setTimeout(() => setCategorySuccess(null), 2000);
  };

  // CSV Export helpers
  const escapeCsv = (val: string | number | null | undefined): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val);
    return `"${str.replace(/"/g, '""')}"`;
  };

  const triggerDownload = (csvContent: string, filename: string) => {
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportTransactions = () => {
    const headers = ['ID', 'Tanggal', 'Tipe', 'Kategori', 'Nominal (Rp)', 'Catatan'];
    const categoryMap = new Map<string, string>();
    categories.forEach((c) => categoryMap.set(c.id, c.name));

    const rows = transactions.map((t) => [
      escapeCsv(t.id),
      escapeCsv(t.date),
      escapeCsv(t.type === 'expense' ? 'Pengeluaran' : 'Pemasukan'),
      escapeCsv(categoryMap.get(t.category_id) || t.category_id),
      escapeCsv(t.amount),
      escapeCsv(t.notes || ''),
    ]);

    const csvString = [headers.map((h) => `"${h}"`).join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    triggerDownload(csvString, `transaksi_cuansiswa_${dateStr}.csv`);
    setExportFeedback(`Export riwayat transaksi (${transactions.length} baris) berhasil diunduh!`);
    setTimeout(() => setExportFeedback(null), 3500);
  };

  const handleExportSavings = () => {
    const headers = [
      'ID',
      'Nama Target Tabungan',
      'Target Nominal (Rp)',
      'Terkumpul Saat Ini (Rp)',
      'Sisa Kebutuhan (Rp)',
      'Progress (%)',
      'Tenggat Waktu',
    ];

    const rows = savingsGoals.map((g) => {
      const sisa = Math.max(0, g.target_amount - g.current_amount);
      const pct = g.target_amount > 0 ? ((g.current_amount / g.target_amount) * 100).toFixed(1) + '%' : '0%';
      return [
        escapeCsv(g.id),
        escapeCsv(g.title),
        escapeCsv(g.target_amount),
        escapeCsv(g.current_amount),
        escapeCsv(sisa),
        escapeCsv(pct),
        escapeCsv(g.deadline || '-'),
      ];
    });

    const csvString = [headers.map((h) => `"${h}"`).join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    triggerDownload(csvString, `status_tabungan_cuansiswa_${dateStr}.csv`);
    setExportFeedback(`Export status tabungan (${savingsGoals.length} target) berhasil diunduh!`);
    setTimeout(() => setExportFeedback(null), 3500);
  };

  const handleExportAll = () => {
    handleExportTransactions();
    setTimeout(() => {
      handleExportSavings();
      setExportFeedback('Semua data (transaksi & tabungan) berhasil diekspor!');
      setTimeout(() => setExportFeedback(null), 3500);
    }, 400);
  };

  const filteredCategories = categories.filter((c) => c.type === categoryTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div 
        className="w-full max-w-sm max-h-[90vh] bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl relative flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-zinc-400" />
            <h3 className="text-sm font-semibold text-white">Pengaturan CuanSiswa</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="mt-4 space-y-4 overflow-y-auto pr-1">
          {/* Student Profile Card */}
          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-zinc-200 font-bold text-xs">
              A
            </div>
            <div>
              <div className="text-xs font-semibold text-zinc-100">Ayub · Siswa Kelas XII</div>
              <div className="text-[11px] text-zinc-500">Target: Lolos SNBT & Mandiri Finansial</div>
            </div>
          </div>

          {/* Category Management Section */}
          <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
                <Tag className="w-3.5 h-3.5 text-zinc-400" />
                <span>Kelola Kategori Transaksi</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-num">
                {categories.length} total
              </span>
            </div>
            <p className="text-[10px] text-zinc-500">
              Buat kategori baru atau hapus yang tidak terpakai untuk pencatatan jajan & tabungan.
            </p>

            {/* Form Buat Kategori Baru */}
            <form onSubmit={handleCreateCategory} className="space-y-2 pt-1 border-t border-zinc-800/80">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-400">
                <Plus className="w-3 h-3 text-zinc-500" />
                <span>Tambah Kategori Baru</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setNewCatType('expense')}
                  className={`py-1.5 px-2.5 rounded-lg text-[11px] font-medium border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    newCatType === 'expense'
                      ? 'bg-zinc-800 border-zinc-700 text-rose-400 font-semibold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <ArrowDownRight className="w-3 h-3" />
                  <span>Pengeluaran</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNewCatType('income')}
                  className={`py-1.5 px-2.5 rounded-lg text-[11px] font-medium border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    newCatType === 'income'
                      ? 'bg-zinc-800 border-zinc-700 text-emerald-400 font-semibold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <ArrowUpRight className="w-3 h-3" />
                  <span>Pemasukan</span>
                </button>
              </div>

              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Nama kategori baru..."
                  value={newCatName}
                  onChange={(e) => {
                    setNewCatName(e.target.value);
                    if (categoryError) setCategoryError(null);
                  }}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
                />
                <button
                  type="submit"
                  disabled={!newCatName.trim()}
                  className="px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-950 text-xs font-semibold hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
                >
                  Tambah
                </button>
              </div>

              {categoryError && (
                <div className="flex items-center gap-1.5 text-[10px] text-rose-400 pt-0.5">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{categoryError}</span>
                </div>
              )}

              {categorySuccess && (
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 pt-0.5">
                  <Check className="w-3 h-3 shrink-0" />
                  <span>{categorySuccess}</span>
                </div>
              )}
            </form>

            {/* List Kategori dengan Tab Expense / Income */}
            <div className="pt-2 border-t border-zinc-800/80 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400 font-medium">Daftar Kategori:</span>
                <div className="flex gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setCategoryTab('expense')}
                    className={`px-2 py-0.5 rounded text-[10px] transition-colors cursor-pointer ${
                      categoryTab === 'expense'
                        ? 'bg-zinc-800 text-white font-medium'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Pengeluaran ({categories.filter((c) => c.type === 'expense').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryTab('income')}
                    className={`px-2 py-0.5 rounded text-[10px] transition-colors cursor-pointer ${
                      categoryTab === 'income'
                        ? 'bg-zinc-800 text-white font-medium'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Pemasukan ({categories.filter((c) => c.type === 'income').length})
                  </button>
                </div>
              </div>

              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-0.5">
                {filteredCategories.map((cat) => {
                  const isConfirming = confirmDeleteCatId === cat.id;

                  return (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-800/80 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: cat.color || (cat.type === 'income' ? '#10b981' : '#71717a') }}
                        />
                        <span className="text-zinc-200 truncate text-[11px] font-medium">
                          {cat.name}
                        </span>
                      </div>

                      {isConfirming ? (
                        <div className="flex items-center gap-1.5 shrink-0 animate-in fade-in">
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="px-2 py-0.5 rounded bg-rose-500 text-white text-[10px] font-semibold hover:bg-rose-600 transition-colors cursor-pointer"
                          >
                            Hapus
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteCatId(null)}
                            className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[10px] hover:text-white transition-colors cursor-pointer"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteCatId(cat.id)}
                          className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                          title={`Hapus kategori ${cat.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Daily Budget Configuration */}
          <form onSubmit={handleSaveBudget} className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2.5">
            <div>
              <label className="text-[11px] font-semibold text-zinc-300 block">
                Target Budget Jajan Bulanan
              </label>
              <p className="text-[10px] text-zinc-500">
                Dasar pembagian kuota harian pada Daily Budget Meter
              </p>
            </div>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-num font-semibold text-xs">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                required
                value={budgetStr ? Number(budgetStr).toLocaleString('id-ID') : ''}
                onChange={(e) => setBudgetStr(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs font-num font-bold text-white focus:outline-none focus:border-zinc-700"
              />
            </div>

            <div className="flex gap-2">
              {[450000, 600000, 800000].map((b) => (
                <button
                  type="button"
                  key={b}
                  onClick={() => setBudgetStr(b.toString())}
                  className="px-2 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 font-num hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  {b / 1000}k/bln
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-zinc-100 text-zinc-950 text-xs font-semibold hover:bg-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {saved ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Budget Tersimpan!</span>
                </>
              ) : (
                <span>Simpan Target Jajan</span>
              )}
            </button>
          </form>

          {/* Export Data (CSV) Section */}
          <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-300">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Portabilitas Data (Ekspor CSV)</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono">
                .CSV
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 leading-relaxed">
              Unduh riwayat transaksi dan status tabungan saat ini dalam format CSV standar (kompatibel Excel & Google Sheets) untuk cadangan data lokal.
            </p>

            {exportFeedback && (
              <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 rounded-lg p-2.5">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>{exportFeedback}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-0.5">
              {/* Export Transactions */}
              <button
                type="button"
                onClick={handleExportTransactions}
                className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/70 text-left transition-all group cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-zinc-200 group-hover:text-white">
                      Riwayat Transaksi
                    </span>
                    <Download className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                  </div>
                  <p className="text-[10px] text-zinc-500">
                    {transactions.length} catatan transaksi
                  </p>
                </div>
                <span className="text-[9px] font-mono text-zinc-500 mt-2">
                  transaksi.csv
                </span>
              </button>

              {/* Export Savings */}
              <button
                type="button"
                onClick={handleExportSavings}
                className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/70 text-left transition-all group cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-zinc-200 group-hover:text-white">
                      Status Tabungan
                    </span>
                    <Download className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                  </div>
                  <p className="text-[10px] text-zinc-500">
                    {savingsGoals.length} target impian
                  </p>
                </div>
                <span className="text-[9px] font-mono text-zinc-500 mt-2">
                  status_tabungan.csv
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleExportAll}
              className="w-full py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5 text-zinc-400" />
              <span>Unduh Kedua File Sekaligus (.CSV)</span>
            </button>
          </div>

          {/* Database & Reset Section */}
          <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-300">
              <Database className="w-3.5 h-3.5 text-zinc-500" />
              <span>Database & Reset Saldo</span>
            </div>
            <p className="text-[10px] text-zinc-500">
              Kosongkan semua transaksi dan setel saldo menjadi Rp 0 untuk mulai dari awal.
            </p>

            {resetConfirm ? (
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setResetConfirm(false)}
                  className="flex-1 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs hover:bg-zinc-700 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 py-1.5 rounded-lg bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600 cursor-pointer"
                >
                  Ya, Kosongkan (Rp 0)
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setResetConfirm(true)}
                className="w-full py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-rose-400 hover:border-zinc-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Kosongkan Data (Reset ke Rp 0)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
