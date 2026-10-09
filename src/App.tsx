import React, { useState, useEffect } from 'react';
import {
  getStoredData,
  saveToStorage,
  setSessionAuth,
  DEFAULT_USER,
  DEFAULT_CATEGORIES,
  DEFAULT_SAVINGS_GOALS,
  DEFAULT_TRANSACTIONS,
  DEFAULT_TOTAL_BALANCE,
  formatRupiah,
} from './lib/store';
import { Transaction, SavingsGoal, TransactionType, Category } from './types';

// Components
import { LoginScreen } from './components/LoginScreen';
import { TopBar } from './components/TopBar';
import { BottomNav, TabType } from './components/BottomNav';
import { WalletCard } from './components/WalletCard';
import { DailyBudgetMeter } from './components/DailyBudgetMeter';
import { QuickAddModal } from './components/QuickAddModal';
import { SavingsGoalCard } from './components/SavingsGoalCard';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { SplitBillCalculator } from './components/SplitBillCalculator';
import { TransactionList } from './components/TransactionList';
import { SettingsModal } from './components/SettingsModal';

import { ArrowUpRight, ArrowDownRight, Sparkles, Plus } from 'lucide-react';

export default function App() {
  const [data, setData] = useState(getStoredData);
  const [currentTab, setCurrentTab] = useState<TabType>('home');

  // Modals state
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<TransactionType>('expense');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    saveToStorage('total_balance', data.totalBalance);
    saveToStorage('transactions', data.transactions);
    saveToStorage('savings', data.savingsGoals);
    saveToStorage('daily_budget', data.monthlyJajanBudget);
  }, [data]);

  // Auth Handlers: web awal mulai dari screen login
  const handleLoginSuccess = (_username: string) => {
    setSessionAuth(true);
    setData((prev) => ({ ...prev, isAuthenticated: true }));
  };

  const handleLogout = () => {
    setSessionAuth(false);
    setData((prev) => ({ ...prev, isAuthenticated: false }));
  };

  const handleOpenQuickAdd = (type: TransactionType = 'expense') => {
    setQuickAddType(type);
    setIsQuickAddOpen(true);
  };

  // Transaction Handler: Total Saldo otomatis bertambah jika pemasukan, berkurang jika pengeluaran
  const handleAddTransaction = (newTx: {
    category_id: string;
    type: TransactionType;
    amount: number;
    notes: string;
    date: string;
  }) => {
    const tx: Transaction = {
      id: `tx-${Date.now()}`,
      user_id: DEFAULT_USER.id,
      ...newTx,
    };

    setData((prev) => {
      const updatedBalance =
        newTx.type === 'income'
          ? prev.totalBalance + newTx.amount
          : prev.totalBalance - newTx.amount;

      return {
        ...prev,
        totalBalance: updatedBalance,
        transactions: [tx, ...prev.transactions],
      };
    });
  };

  // Delete Transaction Handler: Rollback total saldo
  const handleDeleteTransaction = (id: string) => {
    const target = data.transactions.find((t) => t.id === id);
    if (!target) return;

    setData((prev) => {
      const updatedBalance =
        target.type === 'income'
          ? prev.totalBalance - target.amount
          : prev.totalBalance + target.amount;

      return {
        ...prev,
        totalBalance: updatedBalance,
        transactions: prev.transactions.filter((t) => t.id !== id),
      };
    });
  };

  // Savings Deposit Handler: Potong dari Total Saldo langsung
  const handleDepositToSavings = (goalId: string, amount: number) => {
    const goal = data.savingsGoals.find((g) => g.id === goalId);
    if (!goal || data.totalBalance < amount) return;

    const updatedGoals = data.savingsGoals.map((g) => {
      if (g.id === goalId) return { ...g, current_amount: g.current_amount + amount };
      return g;
    });

    const tx: Transaction = {
      id: `tx-sg-${Date.now()}`,
      user_id: DEFAULT_USER.id,
      category_id: 'cat-sekolah',
      type: 'expense',
      amount,
      notes: `Setor tabungan: ${goal.title}`,
      date: new Date().toISOString().split('T')[0],
    };

    setData((prev) => ({
      ...prev,
      totalBalance: prev.totalBalance - amount,
      savingsGoals: updatedGoals,
      transactions: [tx, ...prev.transactions],
    }));
  };

  // Add Savings Goal
  const handleAddGoal = (newGoal: Omit<SavingsGoal, 'id' | 'user_id' | 'current_amount'>) => {
    const goal: SavingsGoal = {
      id: `sg-${Date.now()}`,
      user_id: DEFAULT_USER.id,
      current_amount: 0,
      ...newGoal,
    };
    setData((prev) => ({
      ...prev,
      savingsGoals: [...prev.savingsGoals, goal],
    }));
  };

  // Delete Savings Goal Handler (refund dana terkumpul ke total saldo jika ada)
  const handleDeleteGoal = (goalId: string) => {
    const target = data.savingsGoals.find((g) => g.id === goalId);
    if (!target) return;

    setData((prev) => ({
      ...prev,
      totalBalance: prev.totalBalance + target.current_amount,
      savingsGoals: prev.savingsGoals.filter((g) => g.id !== goalId),
    }));
  };

  // Add new Category Handler
  const handleAddCategory = (newCat: {
    name: string;
    type: TransactionType;
    color?: string;
  }) => {
    const defaultColor = newCat.type === 'income' ? '#10b981' : '#71717a';
    const category: Category = {
      id: `cat-${Date.now()}`,
      name: newCat.name,
      type: newCat.type,
      color: newCat.color || defaultColor,
      icon: newCat.type === 'income' ? 'WalletCards' : 'Tag',
    };

    setData((prev) => ({
      ...prev,
      categories: [...prev.categories, category],
    }));
  };

  // Delete Category Handler
  const handleDeleteCategory = (categoryId: string) => {
    setData((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c.id !== categoryId),
    }));
  };

  // Reset to 0
  const handleResetSeedData = () => {
    setData({
      isAuthenticated: true,
      totalBalance: DEFAULT_TOTAL_BALANCE,
      transactions: DEFAULT_TRANSACTIONS,
      savingsGoals: DEFAULT_SAVINGS_GOALS.map((g) => ({ ...g, current_amount: 0 })),
      categories: DEFAULT_CATEGORIES,
      monthlyJajanBudget: 600000,
    });
  };

  // Calculate today's expense for DailyBudgetMeter
  const todayStr = new Date().toISOString().split('T')[0];
  const todayExpense = data.transactions
    .filter((t) => t.date === todayStr && t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Month totals
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthTransactions = data.transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const monthIncome = currentMonthTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthExpense = currentMonthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // ALUR WEB AWAL: Screen Login jika belum login
  if (!data.isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex justify-center items-start relative selection:bg-zinc-800 selection:text-white py-0 md:py-6">
      {/* Desktop Companion Panel (Only visible on wide screens lg+) */}
      <aside aria-label="Informasi Demo Desktop" className="hidden lg:flex flex-col justify-between w-80 p-8 min-h-[calc(100vh-3rem)] sticky top-6 border border-zinc-800/80 rounded-3xl bg-zinc-900/60 backdrop-blur-xl mr-6 text-left shadow-xl">
        <div className="space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-800 border border-zinc-700/60 text-zinc-300 text-xs font-medium mb-3">
              <span>📱 Mobile-First</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Cuan<span className="text-emerald-400">Siswa</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
              Money Management App khusus siswa kelas akhir. Dioptimalkan penuh untuk kenyamanan smartphone.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
            <div className="text-xs font-semibold text-zinc-300">Akun Siswa Aktif</div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-zinc-100">
                A
              </div>
              <div>
                <div className="text-xs font-medium text-white">ayub (Siswa Kelas XII)</div>
                <div className="text-xs text-zinc-300 font-num">
                  Saldo: <span className="font-semibold text-white">{formatRupiah(data.totalBalance)}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-medium transition-colors cursor-pointer"
            >
              Keluar ke Screen Login
            </button>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Navigasi Halaman
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setCurrentTab('home')}
                className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                  currentTab === 'home' ? 'bg-zinc-800 border-zinc-700 text-white font-semibold' : 'bg-zinc-950/70 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                1. Beranda
              </button>
              <button
                onClick={() => setCurrentTab('analytics')}
                className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                  currentTab === 'analytics' ? 'bg-zinc-800 border-zinc-700 text-white font-semibold' : 'bg-zinc-950/70 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                2. Analitik
              </button>
              <button
                onClick={() => setCurrentTab('savings')}
                className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                  currentTab === 'savings' ? 'bg-zinc-800 border-zinc-700 text-white font-semibold' : 'bg-zinc-950/70 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                3. Tabungan
              </button>
              <button
                onClick={() => setCurrentTab('split-bill')}
                className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                  currentTab === 'split-bill' ? 'bg-zinc-800 border-zinc-700 text-white font-semibold' : 'bg-zinc-950/70 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                4. Split Bill
              </button>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-zinc-500 pt-6 border-t border-zinc-800">
          Total saldo otomatis berubah setiap kali mencatat uang masuk (+) & pengeluaran (-).
        </div>
      </aside>

      {/* Mobile-First Frame: Smartphone Container */}
      <div className="w-full max-w-md min-h-screen md:min-h-[820px] bg-zinc-950 flex flex-col relative pb-20 shadow-2xl md:rounded-[36px] md:border md:border-zinc-800 overflow-hidden z-10">
        {/* Top App Bar */}
        <TopBar
          user={DEFAULT_USER}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onLogout={handleLogout}
        />

        {/* Tab Body */}
        <main className="flex-1 p-4 space-y-4 overflow-y-auto">
          {/* TAB 1: HOME */}
          {currentTab === 'home' && (
            <>
              {/* Single Total Saldo Card (Tanpa Dompet) */}
              <WalletCard
                totalBalance={data.totalBalance}
                onOpenQuickAdd={(type) => handleOpenQuickAdd(type || 'expense')}
              />

              {/* Minimalist onboarding helper card when data is 0 */}
              {data.transactions.length === 0 && data.totalBalance === 0 && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-zinc-300" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">Saldo Siswa Saat Ini Rp 0</h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                        Mulai atur uang sakumu! Catat pemasukan pertama untuk mengaktifkan saldo.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenQuickAdd('income')}
                    className="w-full py-2.5 rounded-xl bg-zinc-100 text-zinc-950 text-xs font-semibold hover:bg-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Catat Uang Saku Pertama</span>
                  </button>
                </div>
              )}

              {/* Daily Budget Meter */}
              <DailyBudgetMeter
                monthlyBudget={data.monthlyJajanBudget}
                todayExpense={todayExpense}
                onOpenSettings={() => setIsSettingsOpen(true)}
              />

              {/* Monthly Income & Expense Overview */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5">
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 mb-1">
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Pemasukan Bulan Ini</span>
                  </div>
                  <div className="text-sm font-bold text-emerald-400 font-num">
                    {formatRupiah(monthIncome)}
                  </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5">
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 mb-1">
                    <ArrowDownRight className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Pengeluaran Bulan Ini</span>
                  </div>
                  <div className="text-sm font-bold text-zinc-200 font-num">
                    {formatRupiah(monthExpense)}
                  </div>
                </div>
              </div>

              {/* Quick Transaction Log */}
              <div className="pt-1">
                <TransactionList
                  transactions={data.transactions}
                  categories={data.categories}
                  onDeleteTransaction={handleDeleteTransaction}
                />
              </div>
            </>
          )}

          {/* TAB 2: ANALYTICS */}
          {currentTab === 'analytics' && (
            <AnalyticsCharts
              transactions={data.transactions}
              categories={data.categories}
              onOpenQuickAdd={() => handleOpenQuickAdd('income')}
            />
          )}

          {/* TAB 3: SAVINGS */}
          {currentTab === 'savings' && (
            <SavingsGoalCard
              goals={data.savingsGoals}
              totalBalance={data.totalBalance}
              onDeposit={handleDepositToSavings}
              onAddGoal={handleAddGoal}
              onDeleteGoal={handleDeleteGoal}
            />
          )}

          {/* TAB 4: SPLIT BILL */}
          {currentTab === 'split-bill' && (
            <SplitBillCalculator
              onRecordMyShare={(amt, note) => {
                handleAddTransaction({
                  category_id: 'cat-nongkrong',
                  type: 'expense',
                  amount: amt,
                  notes: note,
                  date: todayStr,
                });
              }}
            />
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNav
          currentTab={currentTab}
          onChangeTab={setCurrentTab}
          onOpenQuickAdd={() => handleOpenQuickAdd('expense')}
        />

        {/* Modals & Drawers */}
        <QuickAddModal
          isOpen={isQuickAddOpen}
          initialType={quickAddType}
          onClose={() => setIsQuickAddOpen(false)}
          categories={data.categories}
          onAddTransaction={handleAddTransaction}
        />

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          monthlyBudget={data.monthlyJajanBudget}
          categories={data.categories}
          transactions={data.transactions}
          savingsGoals={data.savingsGoals}
          onUpdateMonthlyBudget={(b) =>
            setData((prev) => ({ ...prev, monthlyJajanBudget: b }))
          }
          onResetSeedData={handleResetSeedData}
          onAddCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
        />
      </div>
    </div>
  );
}
