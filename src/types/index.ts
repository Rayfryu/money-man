export type WalletType = 'Cash' | 'E-Wallet' | 'Bank';
export type TransactionType = 'income' | 'expense';

export interface User {
  id: string;
  username: string;
  full_name: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  name: string;
  type: WalletType;
  balance: number;
  color?: string;
  account_number?: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  wallet_id?: string;
  category_id: string;
  type: TransactionType;
  amount: number;
  notes: string;
  date: string;
  created_at?: string;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline?: string;
  icon?: string;
  color?: string;
}

export interface DailyBudgetSetting {
  monthlyJajanBudget: number; // e.g. 600,000 IDR
}
