import React, { useState } from 'react';
import {
  Search,
  Trash2,
  ArrowDownRight,
  ArrowUpRight,
  CalendarRange,
  X,
  RotateCcw,
} from 'lucide-react';
import { Transaction, Category } from '../types';
import { formatRupiah } from '../lib/store';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  onDeleteTransaction: (id: string) => void;
}

type DatePreset = 'all' | 'today' | 'week' | 'month' | 'custom';

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  categories,
  onDeleteTransaction,
}) => {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'expense' | 'income'>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  
  // Date Range state
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isCustomDateOpen, setIsCustomDateOpen] = useState(false);

  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const getSevenDaysAgoStr = () => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  };
  const getFirstDayOfMonthStr = () => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  };

  const handleSelectPreset = (preset: DatePreset) => {
    setDatePreset(preset);
    const today = getTodayStr();

    if (preset === 'today') {
      setStartDate(today);
      setEndDate(today);
      setIsCustomDateOpen(false);
    } else if (preset === 'week') {
      setStartDate(getSevenDaysAgoStr());
      setEndDate(today);
      setIsCustomDateOpen(false);
    } else if (preset === 'month') {
      setStartDate(getFirstDayOfMonthStr());
      setEndDate(today);
      setIsCustomDateOpen(false);
    } else if (preset === 'custom') {
      setIsCustomDateOpen(true);
      if (!startDate) setStartDate(getSevenDaysAgoStr());
      if (!endDate) setEndDate(today);
    } else {
      setStartDate('');
      setEndDate('');
      setIsCustomDateOpen(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedType('all');
    setSelectedCategoryId('all');
    setDatePreset('all');
    setStartDate('');
    setEndDate('');
    setIsCustomDateOpen(false);
  };

  // Filter logic
  const filtered = transactions.filter((t) => {
    if (selectedType !== 'all' && t.type !== selectedType) return false;
    if (selectedCategoryId !== 'all' && t.category_id !== selectedCategoryId) return false;
    if (startDate && t.date < startDate) return false;
    if (endDate && t.date > endDate) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchNote = t.notes?.toLowerCase().includes(q);
      const cat = categories.find((c) => c.id === t.category_id);
      const matchCat = cat?.name.toLowerCase().includes(q);
      const matchAmt = t.amount.toString().includes(q);
      return matchNote || matchCat || matchAmt;
    }

    return true;
  });

  const filteredExpense = filtered
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const filteredIncome = filtered
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const getCategory = (id: string) => categories.find((c) => c.id === id);

  const hasActiveFilters =
    search.trim() !== '' ||
    selectedType !== 'all' ||
    selectedCategoryId !== 'all' ||
    datePreset !== 'all' ||
    Boolean(startDate) ||
    Boolean(endDate);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight">Riwayat Transaksi</h2>
          <p className="text-[11px] text-zinc-500">Semua catatan pemasukan & pengeluaran</p>
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white font-medium px-2 py-1 rounded-md bg-zinc-800 border border-zinc-700/60 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Cari transaksi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Type Filter Buttons */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 text-xs">
        <button
          onClick={() => setSelectedType('all')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap text-[11px] font-medium transition-colors ${
            selectedType === 'all'
              ? 'bg-zinc-100 text-zinc-950 font-semibold'
              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
          }`}
        >
          Semua
        </button>
        <button
          onClick={() => setSelectedType('expense')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap text-[11px] font-medium transition-colors ${
            selectedType === 'expense'
              ? 'bg-zinc-800 text-zinc-100 font-semibold border border-zinc-700'
              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
          }`}
        >
          Pengeluaran
        </button>
        <button
          onClick={() => setSelectedType('income')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap text-[11px] font-medium transition-colors ${
            selectedType === 'income'
              ? 'bg-zinc-800 text-zinc-100 font-semibold border border-zinc-700'
              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
          }`}
        >
          Pemasukan
        </button>
      </div>

      {/* Date Range Presets */}
      <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl space-y-2">
        <div className="flex items-center justify-between text-[11px] text-zinc-400">
          <div className="flex items-center gap-1.5 font-medium text-zinc-300">
            <CalendarRange className="w-3.5 h-3.5 text-zinc-400" />
            <span>Periode Waktu</span>
          </div>
          {(startDate || endDate) && (
            <span className="text-[10px] text-zinc-400 font-num">
              {startDate && new Date(startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
              {startDate && endDate && ' - '}
              {endDate && new Date(endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>

        {/* Preset Chips */}
        <div className="grid grid-cols-5 gap-1 text-[11px]">
          {(['all', 'today', 'week', 'month', 'custom'] as DatePreset[]).map((preset) => {
            const labels: Record<DatePreset, string> = {
              all: 'Semua',
              today: 'Hari Ini',
              week: '7 Hari',
              month: 'Bulan Ini',
              custom: 'Kustom',
            };
            const isSelected = datePreset === preset;
            return (
              <button
                type="button"
                key={preset}
                onClick={() => handleSelectPreset(preset)}
                className={`py-1.5 rounded-md font-medium transition-colors text-center cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-800 text-white border border-zinc-700 font-semibold'
                    : 'bg-zinc-950/70 border border-zinc-800/80 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {labels[preset]}
              </button>
            );
          })}
        </div>

        {/* Custom Range Expandable */}
        {isCustomDateOpen && (
          <div className="pt-2 border-t border-zinc-800 space-y-2 animate-in fade-in duration-150">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Mulai</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setDatePreset('custom');
                  }}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-700"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">Sampai</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setDatePreset('custom');
                  }}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-700"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter Summary */}
      <div className="flex items-center justify-between text-xs px-1 text-zinc-500">
        <span className="font-num text-[11px]">
          {filtered.length} transaksi
        </span>
        <div className="flex items-center gap-2 font-num text-[11px]">
          {filteredExpense > 0 && (
            <span className="text-rose-400">
              -{formatRupiah(filteredExpense)}
            </span>
          )}
          {filteredIncome > 0 && (
            <span className="text-emerald-400">
              +{formatRupiah(filteredIncome)}
            </span>
          )}
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-2">
        {filtered.length > 0 ? (
          filtered.map((t) => {
            const cat = getCategory(t.category_id);
            const isExpense = t.type === 'expense';
            const formattedDate = new Date(t.date).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
            });

            return (
              <div
                key={t.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center justify-between gap-3 hover:border-zinc-700 transition-colors"
              >
                {/* Details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                      isExpense
                        ? 'bg-zinc-950 text-rose-400 border-zinc-800'
                        : 'bg-zinc-950 text-emerald-400 border-zinc-800'
                    }`}
                  >
                    {isExpense ? (
                      <ArrowDownRight className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium text-zinc-100 truncate">
                      {t.notes || cat?.name || 'Transaksi'}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 mt-0.5">
                      <span className="truncate">{cat?.name || 'Umum'}</span>
                      <span aria-hidden="true">·</span>
                      <span className="shrink-0">{formattedDate}</span>
                    </div>
                  </div>
                </div>

                {/* Amount & Delete */}
                <div className="flex items-center gap-2 shrink-0">
                  <div
                    className={`text-xs font-semibold font-num text-right ${
                      isExpense ? 'text-zinc-200' : 'text-emerald-400'
                    }`}
                  >
                    {isExpense ? '-' : '+'}
                    {formatRupiah(t.amount)}
                  </div>

                  <button
                    onClick={() => onDeleteTransaction(t.id)}
                    className="p-1 rounded-md text-zinc-600 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                    title="Hapus transaksi"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center text-xs text-zinc-500 bg-zinc-900/40 rounded-xl border border-zinc-800/60">
            Tidak ada transaksi pada filter ini.
          </div>
        )}
      </div>
    </div>
  );
};
