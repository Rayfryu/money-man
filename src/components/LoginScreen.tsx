import React, { useState } from 'react';
import { Lock, User as UserIcon, ArrowRight, ShieldCheck } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (username: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('ayub');
  const [password, setPassword] = useState('root');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      // Check seeded credentials: ayub / root
      if (username.trim().toLowerCase() === 'ayub' && password === 'root') {
        onLoginSuccess('ayub');
      } else {
        setError('Username atau password salah! Gunakan: ayub / root');
        setLoading(false);
      }
    }, 250);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center px-4 py-8 max-w-md mx-auto">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-sm font-bold text-white mx-auto mb-3">
          CS
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Cuan<span className="text-emerald-400">Siswa</span>
        </h1>
        <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
          Money Management Siswa Kelas Akhir
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-sm font-semibold text-white">Masuk ke Akun</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Gunakan akun personal siswa
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-medium text-zinc-400 block mb-1">
              Username
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ayub"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-zinc-400 block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="root"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer shadow-sm mt-1"
          >
            {loading ? (
              <span>Memverifikasi...</span>
            ) : (
              <>
                <span>Masuk Sekarang</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Button */}
        <div className="mt-5 pt-4 border-t border-zinc-800/80 space-y-2 text-center">
          <button
            type="button"
            onClick={() => onLoginSuccess('ayub')}
            className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-300 text-xs font-medium flex items-center justify-center gap-2 transition-colors border border-zinc-700/60 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-zinc-400" />
            <span>Masuk Langsung (Akun Ayub / Demo)</span>
          </button>
          <p className="text-[10px] text-zinc-500 font-num">
            Username: ayub · Password: root
          </p>
        </div>
      </div>
    </div>
  );
};
