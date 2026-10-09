import React, { useState } from 'react';
import { Eye, EyeOff, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatRupiah } from '../lib/store';
import { TransactionType } from '../types';

interface WalletCardProps {
  totalBalance: number;
  onOpenQuickAdd: (defaultType?: TransactionType) => void;
}

export const WalletCard: React.FC<WalletCardProps> = ({
  totalBalance,
  onOpenQuickAdd,
}) => {
  const [showBalance, setShowBalance] = useState<boolean>(true);

  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 shadow-sm">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-zinc-400">
          Total Saldo Siswa
        </span>

        <button
          onClick={() => setShowBalance(!showBalance)}
          className="p-1 rounded-md text-zinc-500 hover:text-zinc-300 transition-colors"
          aria-label={showBalance ? 'Sembunyikan saldo' : 'Tampilkan saldo'}
          title={showBalance ? 'Sembunyikan saldo' : 'Tampilkan saldo'}
        >
          {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Balance Display */}
      <div className="mb-5">
        <div className="flex items-baseline gap-2">
          <h2 className="text-3xl font-bold tracking-tight text-white font-num">
            {showBalance ? formatRupiah(totalBalance) : 'Rp ••••••••'}
          </h2>
          {totalBalance === 0 && (
            <span className="text-[10px] text-zinc-400 font-num px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700/60">
              Rp 0
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons: Minimalist Outlined & Matte */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => onOpenQuickAdd('income')}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-100 border border-zinc-700/80 text-xs font-semibold active:scale-[0.98] transition-all cursor-pointer"
        >
          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
          <span>Uang Masuk</span>
        </button>

        <button
          onClick={() => onOpenQuickAdd('expense')}
          className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-100 border border-zinc-700/80 text-xs font-semibold active:scale-[0.98] transition-all cursor-pointer"
        >
          <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
          <span>Pengeluaran</span>
        </button>
      </div>
    </div>
  );
};
