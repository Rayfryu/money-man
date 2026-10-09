import React from 'react';
import { SlidersHorizontal, LogOut } from 'lucide-react';
import { User } from '../types';

interface TopBarProps {
  user: User;
  onOpenSettings: () => void;
  onLogout: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  user,
  onOpenSettings,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 px-4 h-14 flex items-center justify-between">
      {/* Brand Title */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-bold text-white">
          CS
        </div>
        <div>
          <span className="text-sm font-bold tracking-tight text-zinc-100 block leading-tight">
            Cuan<span className="text-emerald-400">Siswa</span>
          </span>
          <span className="text-[10px] text-zinc-500 tracking-normal block">
            Money Management Siswa
          </span>
        </div>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
          title="Pengaturan Budget & Profil"
        >
          <span className="font-medium text-[11px] truncate max-w-[70px]">{user.username}</span>
          <SlidersHorizontal className="w-3 h-3 text-zinc-500" />
        </button>

        <button
          onClick={onLogout}
          aria-label="Keluar / Logout"
          title="Keluar / Logout"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-rose-400 hover:bg-zinc-900 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
