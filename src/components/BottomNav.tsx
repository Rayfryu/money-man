import React from 'react';
import { Home, PieChart, Target, Users, Plus } from 'lucide-react';

export type TabType = 'home' | 'analytics' | 'savings' | 'split-bill';

interface BottomNavProps {
  currentTab: TabType;
  onChangeTab: (tab: TabType) => void;
  onOpenQuickAdd: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onChangeTab,
  onOpenQuickAdd,
}) => {
  return (
    <nav 
      aria-label="Navigasi Utama"
      className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800 max-w-md mx-auto"
    >
      <div className="flex items-center justify-between px-3 h-16 pb-safe relative">
        {/* Tab 1: Home */}
        <button
          onClick={() => onChangeTab('home')}
          className={`flex-1 flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors ${
            currentTab === 'home' ? 'text-zinc-100 font-semibold' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Home className="w-5 h-5 stroke-[2]" />
          <span className="text-[10px] tracking-tight mt-1">Beranda</span>
        </button>

        {/* Tab 2: Analytics */}
        <button
          onClick={() => onChangeTab('analytics')}
          className={`flex-1 flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors ${
            currentTab === 'analytics' ? 'text-zinc-100 font-semibold' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <PieChart className="w-5 h-5 stroke-[2]" />
          <span className="text-[10px] tracking-tight mt-1">Analitik</span>
        </button>

        {/* Center Action Button (+) */}
        <div className="flex-1 flex justify-center -mt-5">
          <button
            onClick={onOpenQuickAdd}
            aria-label="Tambah Transaksi"
            className="w-12 h-12 rounded-2xl bg-zinc-100 hover:bg-white text-zinc-950 flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer border border-zinc-300"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab 3: Savings */}
        <button
          onClick={() => onChangeTab('savings')}
          className={`flex-1 flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors ${
            currentTab === 'savings' ? 'text-zinc-100 font-semibold' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Target className="w-5 h-5 stroke-[2]" />
          <span className="text-[10px] tracking-tight mt-1">Tabungan</span>
        </button>

        {/* Tab 4: Split Bill */}
        <button
          onClick={() => onChangeTab('split-bill')}
          className={`flex-1 flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors ${
            currentTab === 'split-bill' ? 'text-zinc-100 font-semibold' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Users className="w-5 h-5 stroke-[2]" />
          <span className="text-[10px] tracking-tight mt-1">Split Bill</span>
        </button>
      </div>
    </nav>
  );
};
