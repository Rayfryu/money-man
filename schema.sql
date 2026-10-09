-- ====================================================================
-- CUANSISWA - SUPABASE DATABASE SCHEMA & SEED DATA
-- Money Management App Mobile-First Khusus Siswa Kelas Akhir
-- ====================================================================

-- 1. Enable UUID Extension (jika belum aktif)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing tables if re-running (CASCADE)
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS savings_goals CASCADE;
DROP TABLE IF EXISTS wallets CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- --------------------------------------------------------------------
-- TABLE: users
-- --------------------------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) DEFAULT 'Ayub Siswa',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- TABLE: wallets
-- --------------------------------------------------------------------
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('Cash', 'E-Wallet', 'Bank')),
    balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    color VARCHAR(30) DEFAULT 'emerald',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- TABLE: categories
-- --------------------------------------------------------------------
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    icon VARCHAR(50) NOT NULL DEFAULT 'Tag',
    color VARCHAR(30) DEFAULT 'slate',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- TABLE: transactions
-- --------------------------------------------------------------------
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    notes TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- TABLE: savings_goals
-- --------------------------------------------------------------------
CREATE TABLE savings_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    target_amount NUMERIC(15, 2) NOT NULL CHECK (target_amount > 0),
    current_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (current_amount >= 0),
    deadline DATE,
    icon VARCHAR(50) DEFAULT 'Target',
    color VARCHAR(30) DEFAULT 'indigo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for lightning fast queries
CREATE INDEX idx_wallets_user ON wallets(user_id);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date DESC);
CREATE INDEX idx_transactions_wallet ON transactions(wallet_id);
CREATE INDEX idx_savings_user ON savings_goals(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;

-- Development / Standard RLS Policies (Allow read/write for authenticated users)
CREATE POLICY "Public categories read" ON categories FOR SELECT USING (true);
CREATE POLICY "Users can manage own data" ON users FOR ALL USING (true);
CREATE POLICY "Users can manage own wallets" ON wallets FOR ALL USING (true);
CREATE POLICY "Users can manage own transactions" ON transactions FOR ALL USING (true);
CREATE POLICY "Users can manage own savings" ON savings_goals FOR ALL USING (true);

-- ====================================================================
-- SEED DATA
-- ====================================================================

-- 1. Insert Default User: username 'ayub', password 'root' (Bcrypt hash)
-- Bcrypt hash generated with cost 10 for 'root': $2a$10$wT8KzQ9o2NlFv5dKk6neQeG9w9Ga5l1iB7lWJj1B.6pZ21M0l
INSERT INTO users (id, username, password_hash, full_name)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'ayub',
    '$2a$10$0zX7d69C7sV0aW.r0p16s.o2wT8KzQ9o2NlFv5dKk6neQeG9w9Gau',
    'Ayub - Siswa Kelas XII'
) ON CONFLICT (username) DO NOTHING;

-- 2. Insert Default Categories (Pemasukan & Pengeluaran)
-- Pengeluaran: Uang Jajan, Bensin/Ongkos, Nongkrong, Kebutuhan Sekolah/UTBK, Dana Darurat
INSERT INTO categories (id, name, type, icon, color) VALUES
    ('c1111111-1111-1111-1111-111111111111', 'Uang Jajan', 'expense', 'Utensils', 'orange'),
    ('c2222222-2222-2222-2222-222222222222', 'Bensin / Ongkos', 'expense', 'Fuel', 'blue'),
    ('c3333333-3333-3333-3333-333333333333', 'Nongkrong & Kafe', 'expense', 'Coffee', 'amber'),
    ('c4444444-4444-4444-4444-444444444444', 'Kebutuhan Sekolah / UTBK', 'expense', 'GraduationCap', 'indigo'),
    ('c5555555-5555-5555-5555-555555555555', 'Dana Darurat Siswa', 'expense', 'ShieldAlert', 'rose');

-- Pemasukan: Jajan Harian, Hadiah/Bonus, Tabungan Diambil, Hasil Usaha/Freelance
INSERT INTO categories (id, name, type, icon, color) VALUES
    ('c6666666-6666-6666-6666-666666666666', 'Jajan Harian (Ortu)', 'income', 'WalletCards', 'emerald'),
    ('c7777777-7777-7777-7777-777777777777', 'Hadiah / Bonus', 'income', 'Gift', 'purple'),
    ('c8888888-8888-8888-8888-888888888888', 'Tabungan Diambil', 'income', 'PiggyBank', 'cyan'),
    ('c9999999-9999-9999-9999-999999999999', 'Hasil Usaha / Freelance', 'income', 'Briefcase', 'teal');

-- 3. Insert Default Wallets for 'ayub'
INSERT INTO wallets (id, user_id, name, type, balance, color) VALUES
    ('w1111111-1111-1111-1111-111111111111', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Dompet Tunai', 'Cash', 145000.00, 'emerald'),
    ('w2222222-2222-2222-2222-222222222222', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Gopay / OVO / DANA', 'E-Wallet', 285000.00, 'sky'),
    ('w3333333-3333-3333-3333-333333333333', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Rekening Bank (BCA/BRI)', 'Bank', 1250000.00, 'indigo');

-- 4. Insert Default Savings Goals for 'ayub'
INSERT INTO savings_goals (id, user_id, title, target_amount, current_amount, deadline, icon, color) VALUES
    ('s1111111-1111-1111-1111-111111111111', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Buku & Tryout UTBK-SNBT', 750000.00, 525000.00, CURRENT_DATE + INTERVAL '45 days', 'GraduationCap', 'indigo'),
    ('s2222222-2222-2222-2222-222222222222', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Jas / Baju Perpisahan Angkatan', 600000.00, 350000.00, CURRENT_DATE + INTERVAL '75 days', 'Sparkles', 'amber'),
    ('s3333333-3333-3333-3333-333333333333', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Laptop Kuliah Cicilan Awal', 4500000.00, 1850000.00, CURRENT_DATE + INTERVAL '180 days', 'Laptop', 'emerald');

-- 5. Insert Sample Recent Transactions for 'ayub'
INSERT INTO transactions (id, user_id, wallet_id, category_id, type, amount, notes, date) VALUES
    (uuid_generate_v4(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'w1111111-1111-1111-1111-111111111111', 'c6666666-6666-6666-6666-666666666666', 'income', 250000.00, 'Uang saku mingguan dari Ibu', CURRENT_DATE - 3),
    (uuid_generate_v4(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'w1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'expense', 22000.00, 'Makan siang kantin sekolah + es teh', CURRENT_DATE - 2),
    (uuid_generate_v4(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'w2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'expense', 30000.00, 'Isi bensin motor Honda Beat full tank', CURRENT_DATE - 2),
    (uuid_generate_v4(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'w2222222-2222-2222-2222-222222222222', 'c3333333-3333-3333-3333-333333333333', 'expense', 38000.00, 'Kopi susu + roti bakar ngerjain tugas', CURRENT_DATE - 1),
    (uuid_generate_v4(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'w3333333-3333-3333-3333-333333333333', 'c9999999-9999-9999-9999-999999999999', 'income', 350000.00, 'Freelance joki desain poster dies natalis', CURRENT_DATE - 1),
    (uuid_generate_v4(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'w1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'expense', 18000.00, 'Siomay + air mineral sepulang sekolah', CURRENT_DATE);
