import { Wallet, Category, Transaction, SavingsGoal, User } from '../types';

export const DEFAULT_USER: User = {
  id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  username: 'ayub',
  full_name: 'Ayub (Siswa Kelas XII)',
};

export const DEFAULT_CATEGORIES: Category[] = [
  // Pengeluaran
  { id: 'cat-jajan', name: 'Uang Jajan', type: 'expense', icon: 'Utensils', color: '#f97316' },
  { id: 'cat-bensin', name: 'Bensin / Ongkos', type: 'expense', icon: 'Fuel', color: '#3b82f6' },
  { id: 'cat-nongkrong', name: 'Nongkrong & Kafe', type: 'expense', icon: 'Coffee', color: '#eab308' },
  { id: 'cat-sekolah', name: 'Kebutuhan Sekolah / UTBK', type: 'expense', icon: 'GraduationCap', color: '#6366f1' },
  { id: 'cat-darurat', name: 'Dana Darurat Siswa', type: 'expense', icon: 'ShieldAlert', color: '#f43f5e' },
  // Pemasukan
  { id: 'cat-ortu', name: 'Jajan Harian (Ortu)', type: 'income', icon: 'WalletCards', color: '#10b981' },
  { id: 'cat-bonus', name: 'Hadiah / Bonus', type: 'income', icon: 'Gift', color: '#a855f7' },
  { id: 'cat-tarik-tabungan', name: 'Tabungan Diambil', type: 'income', icon: 'PiggyBank', color: '#06b6d4' },
  { id: 'cat-freelance', name: 'Hasil Usaha / Freelance', type: 'income', icon: 'Briefcase', color: '#14b8a6' },
];

export const DEFAULT_WALLETS: Wallet[] = [
  {
    id: 'w-cash',
    user_id: DEFAULT_USER.id,
    name: 'Dompet Tunai',
    type: 'Cash',
    balance: 0,
    color: '#10b981',
  },
  {
    id: 'w-ewallet',
    user_id: DEFAULT_USER.id,
    name: 'Gopay / OVO / DANA',
    type: 'E-Wallet',
    balance: 0,
    color: '#0ea5e9',
  },
  {
    id: 'w-bank',
    user_id: DEFAULT_USER.id,
    name: 'Rekening Bank (BCA/BRI)',
    type: 'Bank',
    balance: 0,
    color: '#6366f1',
  },
];

export const DEFAULT_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: 'sg-utbk',
    user_id: DEFAULT_USER.id,
    title: 'Buku & Tryout UTBK-SNBT',
    target_amount: 750000,
    current_amount: 0,
    deadline: '2026-11-20',
    icon: 'GraduationCap',
    color: '#6366f1',
  },
  {
    id: 'sg-perpisahan',
    user_id: DEFAULT_USER.id,
    title: 'Jas / Baju Perpisahan Angkatan',
    target_amount: 600000,
    current_amount: 0,
    deadline: '2026-12-15',
    icon: 'Sparkles',
    color: '#f59e0b',
  },
  {
    id: 'sg-laptop',
    user_id: DEFAULT_USER.id,
    title: 'Laptop Kuliah (DP Cicilan)',
    target_amount: 4500000,
    current_amount: 0,
    deadline: '2027-04-30',
    icon: 'Laptop',
    color: '#10b981',
  },
];

// Kosongkan transaksi awal: datanya 0
export const DEFAULT_TRANSACTIONS: Transaction[] = [];

export const formatRupiah = (number: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(number);
};

export const formatRupiahShort = (num: number): string => {
  if (Math.abs(num) >= 1_000_000) {
    return `Rp ${(num / 1_000_000).toFixed(1).replace('.0', '')} Jt`;
  }
  if (Math.abs(num) >= 1_000) {
    return `Rp ${(num / 1_000).toFixed(0)} Rb`;
  }
  return formatRupiah(num);
};

// Saldo awal 0
export const DEFAULT_TOTAL_BALANCE = 0;

// Storage keys v2 agar data lama otomatis ter-reset ke 0
const STORAGE_PREFIX = 'cuansiswa_v2_';

export const getStoredData = () => {
  try {
    // Alur web awal: mulai dari screen login jika session belum diverifikasi pada sesi ini
    const isAuth = sessionStorage.getItem(`${STORAGE_PREFIX}auth`) === 'true';
    const rawBalance = localStorage.getItem(`${STORAGE_PREFIX}total_balance`);
    const rawTransactions = localStorage.getItem(`${STORAGE_PREFIX}transactions`);
    const rawSavings = localStorage.getItem(`${STORAGE_PREFIX}savings`);
    const rawBudget = localStorage.getItem(`${STORAGE_PREFIX}daily_budget`);

    return {
      isAuthenticated: isAuth,
      totalBalance: rawBalance !== null ? Number(rawBalance) : DEFAULT_TOTAL_BALANCE,
      transactions: rawTransactions !== null ? (JSON.parse(rawTransactions) as Transaction[]) : DEFAULT_TRANSACTIONS,
      savingsGoals: rawSavings !== null ? (JSON.parse(rawSavings) as SavingsGoal[]) : DEFAULT_SAVINGS_GOALS,
      categories: DEFAULT_CATEGORIES,
      monthlyJajanBudget: rawBudget !== null ? Number(rawBudget) : 600000,
    };
  } catch {
    return {
      isAuthenticated: false,
      totalBalance: DEFAULT_TOTAL_BALANCE,
      transactions: DEFAULT_TRANSACTIONS,
      savingsGoals: DEFAULT_SAVINGS_GOALS,
      categories: DEFAULT_CATEGORIES,
      monthlyJajanBudget: 600000,
    };
  }
};

export const saveToStorage = (key: string, data: unknown) => {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(data));
  } catch (e) {
    console.error('Storage save error:', e);
  }
};

export const setSessionAuth = (isAuth: boolean) => {
  try {
    if (isAuth) {
      sessionStorage.setItem(`${STORAGE_PREFIX}auth`, 'true');
    } else {
      sessionStorage.removeItem(`${STORAGE_PREFIX}auth`);
    }
  } catch (e) {
    console.error('Session storage error:', e);
  }
};
