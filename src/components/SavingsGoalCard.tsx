import React, { useState } from 'react';
import { Target, Plus, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SavingsGoal } from '../types';
import { formatRupiah } from '../lib/store';

interface SavingsGoalCardProps {
  goals: SavingsGoal[];
  totalBalance: number;
  onDeposit: (goalId: string, amount: number) => void;
  onAddGoal: (goal: Omit<SavingsGoal, 'id' | 'user_id' | 'current_amount'>) => void;
  onDeleteGoal: (goalId: string) => void;
}

export const SavingsGoalCard: React.FC<SavingsGoalCardProps> = ({
  goals,
  totalBalance,
  onDeposit,
  onAddGoal,
  onDeleteGoal,
}) => {
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<SavingsGoal | null>(null);
  const [depositAmountStr, setDepositAmountStr] = useState<string>('50000');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New goal state
  const [newTitle, setNewTitle] = useState('');
  const [newTargetStr, setNewTargetStr] = useState('');
  const [newDeadline, setNewDeadline] = useState('');

  const totalCollected = goals.reduce((sum, g) => sum + g.current_amount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.target_amount, 0);

  const handleConfirmDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal) return;
    const amount = Number(depositAmountStr);
    if (!amount || amount <= 0 || amount > totalBalance) return;

    onDeposit(selectedGoal.id, amount);

    if (selectedGoal.current_amount + amount >= selectedGoal.target_amount) {
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (err) {
        console.error(err);
      }
    }

    setSelectedGoal(null);
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = Number(newTargetStr);
    if (!newTitle.trim() || !target || target <= 0) return;

    onAddGoal({
      title: newTitle.trim(),
      target_amount: target,
      deadline: newDeadline || undefined,
      icon: 'Target',
    });

    setNewTitle('');
    setNewTargetStr('');
    setNewDeadline('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight">Target Tabungan</h2>
          <p className="text-[11px] text-zinc-500">Rencana tabungan kelas akhir</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Target</span>
        </button>
      </div>

      {/* Summary Milestone Strip */}
      <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
            Terkumpul
          </span>
          <span className="text-base font-bold text-white font-num">
            {formatRupiah(totalCollected)}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
            Total Target
          </span>
          <span className="text-xs font-semibold text-zinc-300 font-num">
            {formatRupiah(totalTarget)}
          </span>
        </div>
      </div>

      {/* Goal Cards List */}
      <div className="space-y-2.5">
        {goals.length > 0 ? (
          goals.map((goal) => {
            const percent = Math.min(
              Math.round((goal.current_amount / goal.target_amount) * 100),
              100
            );
            const isCompleted = goal.current_amount >= goal.target_amount;

            return (
              <div
                key={goal.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3"
              >
                {/* Top Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-xs font-semibold text-zinc-100 truncate">
                      {goal.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-0.5">
                      {goal.deadline && (
                        <span>Deadline: {new Date(goal.deadline).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}</span>
                      )}
                      {goal.deadline && <span aria-hidden="true">·</span>}
                      <span className="font-num text-zinc-300">{percent}%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        setSelectedGoal(goal);
                        setDepositAmountStr('50000');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        isCompleted
                          ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                          : 'bg-zinc-100 text-zinc-950 hover:bg-white'
                      }`}
                    >
                      {isCompleted ? 'Selesai' : 'Setor'}
                    </button>

                    <button
                      onClick={() => setGoalToDelete(goal)}
                      className="p-1 rounded-md text-zinc-600 hover:text-rose-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                      title="Hapus target tabungan"
                      aria-label={`Hapus ${goal.title}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="w-full bg-zinc-950 rounded-full h-1.5 overflow-hidden border border-zinc-800">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isCompleted ? 'bg-emerald-500' : 'bg-zinc-300'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-num">
                    <span className="text-zinc-200">
                      {formatRupiah(goal.current_amount)}
                    </span>
                    <span className="text-zinc-500 text-[10px]">
                      Target: {formatRupiah(goal.target_amount)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center bg-zinc-900/40 border border-zinc-800 rounded-xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 text-zinc-400 flex items-center justify-center mx-auto border border-zinc-800">
              <Target className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-xs font-semibold text-white">Belum Ada Target Tabungan</h3>
              <p className="text-[11px] text-zinc-500">
                Buat target baru untuk kebutuhan kelas akhirmu.
              </p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="py-1.5 px-3 rounded-lg bg-zinc-100 text-zinc-950 text-xs font-medium hover:bg-white transition-colors cursor-pointer"
            >
              Buat Target
            </button>
          </div>
        )}
      </div>

      {/* Modal Konfirmasi Hapus Target */}
      {goalToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-3.5">
            <h3 className="text-sm font-semibold text-white">Hapus Target Tabungan?</h3>
            <p className="text-xs text-zinc-400">{goalToDelete.title}</p>

            {goalToDelete.current_amount > 0 && (
              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300">
                Saldo terkumpul <span className="font-semibold font-num text-white">{formatRupiah(goalToDelete.current_amount)}</span> akan dikembalikan ke total saldo.
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setGoalToDelete(null)}
                className="flex-1 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-medium hover:bg-zinc-700 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteGoal(goalToDelete.id);
                  setGoalToDelete(null);
                }}
                className="flex-1 py-2 rounded-lg bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600 cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Setor Tabungan */}
      {selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-3">
            <h3 className="text-sm font-semibold text-white">
              Setor ke {selectedGoal.title}
            </h3>

            <form onSubmit={handleConfirmDeposit} className="space-y-3">
              <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between">
                <span className="text-[11px] text-zinc-500">Saldo Tersedia:</span>
                <span className="text-xs font-semibold text-zinc-200 font-num">
                  {formatRupiah(totalBalance)}
                </span>
              </div>

              {totalBalance === 0 ? (
                <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400">
                  Saldo Anda saat ini Rp 0. Tambah uang masuk terlebih dahulu.
                </div>
              ) : (
                <div>
                  <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                    Nominal Setoran (Rp)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={depositAmountStr ? Number(depositAmountStr).toLocaleString('id-ID') : ''}
                    onChange={(e) => setDepositAmountStr(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm font-semibold font-num text-white focus:outline-none focus:border-zinc-700"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedGoal(null)}
                  className="flex-1 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-medium hover:bg-zinc-700 cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  disabled={totalBalance <= 0 || !depositAmountStr || Number(depositAmountStr) <= 0 || Number(depositAmountStr) > totalBalance}
                  className="flex-1 py-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Setor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Goal Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl">
            <h3 className="text-sm font-semibold text-white mb-3">
              Target Tabungan Baru
            </h3>

            <form onSubmit={handleCreateGoal} className="space-y-3">
              <div>
                <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                  Nama Target
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Tryout UTBK"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                  Target Nominal (Rp)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  placeholder="500000"
                  value={newTargetStr ? Number(newTargetStr).toLocaleString('id-ID') : ''}
                  onChange={(e) => setNewTargetStr(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-num text-white focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                  Deadline (Opsional)
                </label>
                <input
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-medium hover:bg-zinc-700 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!newTitle || !newTargetStr}
                  className="flex-1 py-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold cursor-pointer"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
