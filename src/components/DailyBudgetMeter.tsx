import React from 'react';
import { Settings } from 'lucide-react';
import { formatRupiah } from '../lib/store';

interface DailyBudgetMeterProps {
  monthlyBudget: number;
  todayExpense: number;
  onOpenSettings: () => void;
}

export const DailyBudgetMeter: React.FC<DailyBudgetMeterProps> = ({
  monthlyBudget,
  todayExpense,
  onOpenSettings,
}) => {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dailyQuota = Math.round(monthlyBudget / daysInMonth);
  const remainingToday = dailyQuota - todayExpense;
  const percentageUsed = Math.min(Math.round((todayExpense / dailyQuota) * 100), 100);

  const isOverbudget = remainingToday < 0;

  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4.5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-xs font-semibold text-zinc-300 block">
            Batas Jajan Harian
          </span>
          <span className="text-[11px] text-zinc-500">
            Kuota ideal per hari ({daysInMonth} hari bulan ini)
          </span>
        </div>

        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          title="Ubah Target Budget Bulanan"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Numbers */}
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-0.5">
            Sisa Jajan Hari Ini
          </span>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold font-num ${
              isOverbudget ? 'text-rose-400' : 'text-zinc-100'
            }`}>
              {formatRupiah(Math.abs(remainingToday))}
            </span>
            {isOverbudget && (
              <span className="text-xs text-rose-400 font-medium">Overbudget</span>
            )}
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-0.5">
            Target / Hari
          </span>
          <span className="text-xs font-semibold text-zinc-300 font-num">
            {formatRupiah(dailyQuota)}
          </span>
        </div>
      </div>

      {/* Minimal Progress Bar */}
      <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden mb-2.5 border border-zinc-800">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isOverbudget
              ? 'bg-rose-500'
              : percentageUsed >= 80
              ? 'bg-amber-400'
              : 'bg-emerald-500'
          }`}
          style={{ width: `${percentageUsed}%` }}
        />
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-800/80">
        <span>
          Terpakai {percentageUsed}%
        </span>
        <span className="font-num text-zinc-400">
          Pengeluaran: {formatRupiah(todayExpense)}
        </span>
      </div>
    </div>
  );
};
