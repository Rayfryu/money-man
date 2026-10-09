import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, PieChart as PieChartIcon, Plus } from 'lucide-react';
import { Transaction, Category } from '../types';
import { formatRupiah, formatRupiahShort } from '../lib/store';

interface AnalyticsChartsProps {
  transactions: Transaction[];
  categories: Category[];
  onOpenQuickAdd?: () => void;
}

// Minimalist palette for pie chart slices
const MINIMAL_COLORS = [
  '#71717a', // zinc-500
  '#a1a1aa', // zinc-400
  '#52525b', // zinc-600
  '#3f3f46', // zinc-700
  '#d4d4d8', // zinc-300
  '#10b981', // emerald-500
  '#f43f5e', // rose-500
];

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  transactions,
  categories,
  onOpenQuickAdd,
}) => {
  const [timeRange, setTimeRange] = useState<'month' | 'all'>('month');

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const filtered = transactions.filter((t) => {
    if (timeRange === 'all') return true;
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalExpense = filtered
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = filtered
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // Group expenses by category
  const expenseByCategoryMap: Record<string, number> = {};
  filtered
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      expenseByCategoryMap[t.category_id] = (expenseByCategoryMap[t.category_id] || 0) + t.amount;
    });

  const categoryPieData = Object.entries(expenseByCategoryMap)
    .map(([catId, amount], index) => {
      const cat = categories.find((c) => c.id === catId);
      return {
        name: cat ? cat.name : 'Lain-lain',
        value: amount,
        color: MINIMAL_COLORS[index % MINIMAL_COLORS.length],
      };
    })
    .sort((a, b) => b.value - a.value);

  const topExpense = categoryPieData[0];

  const barData = [
    {
      name: 'Pemasukan',
      amount: totalIncome,
      color: '#10b981',
    },
    {
      name: 'Pengeluaran',
      amount: totalExpense,
      color: '#71717a',
    },
  ];

  const hasData = filtered.length > 0;

  return (
    <div className="space-y-4">
      {/* Header & Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight">Analisis Keuangan</h2>
          <p className="text-[11px] text-zinc-500">Evaluasi pos pengeluaran & uang saku</p>
        </div>

        <div className="flex items-center p-1 bg-zinc-900 border border-zinc-800 rounded-lg">
          <button
            onClick={() => setTimeRange('month')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${
              timeRange === 'month'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Bulan Ini
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${
              timeRange === 'all'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Semua
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5">
          <div className="flex items-center gap-1.5 text-zinc-500 text-[11px] mb-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
            <span>Pemasukan</span>
          </div>
          <div className="text-base font-bold text-emerald-400 font-num">
            {formatRupiah(totalIncome)}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5">
          <div className="flex items-center gap-1.5 text-zinc-500 text-[11px] mb-1">
            <ArrowDownRight className="w-3.5 h-3.5 text-zinc-400" />
            <span>Pengeluaran</span>
          </div>
          <div className="text-base font-bold text-zinc-200 font-num">
            {formatRupiah(totalExpense)}
          </div>
        </div>
      </div>

      {!hasData ? (
        /* Minimalist Empty State */
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
            <PieChartIcon className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-white">Belum Ada Transaksi</h3>
            <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
              Diagram akan otomatis aktif setelah Anda mencatat transaksi pertama.
            </p>
          </div>

          {onOpenQuickAdd && (
            <button
              onClick={onOpenQuickAdd}
              className="py-2 px-3 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Catat Transaksi</span>
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Top Expense Insight */}
          {topExpense && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-400">
              Pengeluaran terbesar pada <span className="text-white font-medium">"{topExpense.name}"</span> sebesar <span className="font-num text-white">{formatRupiah(topExpense.value)}</span> ({Math.round((topExpense.value / (totalExpense || 1)) * 100)}%).
            </div>
          )}

          {/* Donut Chart */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-zinc-300 mb-2">
              Distribusi Kategori
            </h3>

            <div>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [formatRupiah(Number(value) || 0), 'Pengeluaran']}
                      contentStyle={{
                        backgroundColor: '#18181b',
                        borderColor: '#27272a',
                        borderRadius: '8px',
                        fontSize: '11px',
                        color: '#f4f4f5',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Rows */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-800">
                {categoryPieData.map((item, idx) => {
                  const percentage = Math.round((item.value / totalExpense) * 100);
                  return (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-zinc-400">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2 font-num">
                        <span className="text-zinc-500 text-[11px]">{percentage}%</span>
                        <span className="text-zinc-200">
                          {formatRupiah(item.value)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-zinc-300 mb-3">
              Perbandingan Masuk vs Keluar
            </h3>

            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.6} />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#71717a"
                    fontSize={10}
                    tickFormatter={(val) => formatRupiahShort(val)}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(val: any) => [formatRupiah(Number(val) || 0), 'Nominal']}
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderColor: '#27272a',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: '#f4f4f5',
                    }}
                  />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
