import React, { useState, useEffect } from 'react';
import { X, ArrowDownRight, ArrowUpRight, Check, Calendar, StickyNote } from 'lucide-react';
import { Category, TransactionType } from '../types';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  initialType?: TransactionType;
  onAddTransaction: (data: {
    category_id: string;
    type: TransactionType;
    amount: number;
    notes: string;
    date: string;
  }) => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  categories,
  initialType = 'expense',
  onAddTransaction,
}) => {
  const [type, setType] = useState<TransactionType>(initialType);
  const [amountStr, setAmountStr] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Sync initial type when opened
  useEffect(() => {
    if (isOpen) {
      setType(initialType);
      setCategoryId('');
      setAmountStr('');
      setNotes('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen, initialType]);

  if (!isOpen) return null;

  // Filter categories by type
  const availableCategories = categories.filter((c) => c.type === type);
  // Auto set category if empty
  const activeCategoryId = categoryId || availableCategories[0]?.id || '';

  const quickAmounts = [10000, 20000, 50000, 100000];

  const handleAmountChange = (val: string) => {
    const clean = val.replace(/\D/g, '');
    setAmountStr(clean);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(amountStr);
    if (!amount || amount <= 0) {
      return;
    }

    onAddTransaction({
      type,
      amount,
      category_id: activeCategoryId,
      notes: notes.trim() || (type === 'expense' ? 'Pengeluaran' : 'Pemasukan'),
      date,
    });

    // Reset and close
    setAmountStr('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-zinc-900 border-t border-zinc-800 rounded-t-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Drag handle */}
        <div className="pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1 bg-zinc-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800">
          <div>
            <h3 className="text-sm font-semibold text-white">Catat Transaksi</h3>
            <p className="text-[11px] text-zinc-500">Saldo otomatis terupdate</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto px-5 py-4 space-y-4">
          {/* Segmented Type Picker */}
          <div className="grid grid-cols-2 p-1 bg-zinc-950 rounded-xl border border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategoryId('');
              }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
              <span>Pengeluaran (-)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategoryId('');
              }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pemasukan (+)</span>
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="text-[11px] font-medium text-zinc-400 block mb-1">
              Nominal (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-num font-semibold text-base">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                required
                placeholder="0"
                value={amountStr ? Number(amountStr).toLocaleString('id-ID') : ''}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-2xl font-bold font-num text-white placeholder:text-zinc-700 focus:outline-none focus:border-zinc-600 transition-colors"
                autoFocus
              />
            </div>

            {/* Quick Amount Chips */}
            <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
              {quickAmounts.map((q) => (
                <button
                  type="button"
                  key={q}
                  onClick={() => setAmountStr(q.toString())}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 text-xs font-num text-zinc-300 hover:bg-zinc-700 hover:text-white whitespace-nowrap active:scale-95 transition-all cursor-pointer"
                >
                  +{q >= 1000 ? `${q / 1000}rb` : q}
                </button>
              ))}
            </div>
          </div>

          {/* Category Picker */}
          <div>
            <label className="text-[11px] font-medium text-zinc-400 block mb-1.5">
              Kategori
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {availableCategories.map((c) => {
                const isSelected = activeCategoryId === c.id;
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setCategoryId(c.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-left text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-zinc-600 bg-zinc-800 text-white font-medium'
                        : 'border-zinc-800 bg-zinc-950/70 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
                    }`}
                  >
                    <span className="truncate">{c.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-zinc-200 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes & Date */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1 mb-1">
                <StickyNote className="w-3 h-3" />
                <span>Catatan</span>
              </label>
              <input
                type="text"
                placeholder={type === 'income' ? 'Uang saku' : 'Makan siang'}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-700 focus:outline-none focus:border-zinc-600"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1 mb-1">
                <Calendar className="w-3 h-3" />
                <span>Tanggal</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-600"
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!amountStr || Number(amountStr) <= 0}
              className="w-full py-3 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
            >
              Simpan Transaksi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
