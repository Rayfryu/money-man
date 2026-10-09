import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeftRight } from 'lucide-react';
import { Wallet } from '../types';
import { formatRupiah } from '../lib/store';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: Wallet[];
  onTransfer: (fromId: string, toId: string, amount: number, notes?: string) => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  wallets,
  onTransfer,
}) => {
  const [fromId, setFromId] = useState<string>(wallets[2]?.id || wallets[0]?.id || '');
  const [toId, setToId] = useState<string>(wallets[0]?.id || wallets[1]?.id || '');
  const [amountStr, setAmountStr] = useState<string>('');
  const [notes, setNotes] = useState<string>('Transfer antar dompet');

  if (!isOpen) return null;

  const fromWallet = wallets.find((w) => w.id === fromId);
  const toWallet = wallets.find((w) => w.id === toId);

  const amount = Number(amountStr) || 0;
  const isInsufficient = fromWallet ? amount > fromWallet.balance : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromId === toId) {
      return;
    }
    if (amount <= 0 || isInsufficient) {
      return;
    }

    onTransfer(fromId, toId, amount, notes.trim());
    setAmountStr('');
    onClose();
  };

  const handleSwap = () => {
    const temp = fromId;
    setFromId(toId);
    setToId(temp);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl relative"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Transfer Antar Dompet</h3>
              <p className="text-[11px] text-slate-400">Pindahkan saldo antar wallet</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* From and To Selector */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-3 relative">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Dari Dompet (Sumber)</label>
              <select
                value={fromId}
                onChange={(e) => setFromId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({formatRupiah(w.balance)})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={handleSwap}
                className="p-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Tukar posisi"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 rotate-90" />
              </button>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Ke Dompet (Tujuan)</label>
              <select
                value={toId}
                onChange={(e) => setToId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id} disabled={w.id === fromId}>
                    {w.name} ({formatRupiah(w.balance)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1">
              Nominal Transfer
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-num font-semibold text-sm">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                required
                placeholder="0"
                value={amountStr ? Number(amountStr).toLocaleString('id-ID') : ''}
                onChange={(e) => setAmountStr(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-lg font-bold font-num text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Quick shortcuts */}
            <div className="flex gap-1.5 mt-2">
              {[25000, 50000, 100000].map((amt) => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => setAmountStr(amt.toString())}
                  className="px-2 py-1 bg-slate-800 text-[10px] rounded text-slate-300 hover:bg-slate-700 font-num"
                >
                  +{amt / 1000}k
                </button>
              ))}
            </div>

            {isInsufficient && (
              <p className="text-[11px] text-rose-400 mt-1">
                Saldo dompet sumber tidak cukup ({formatRupiah(fromWallet?.balance || 0)})
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1">
              Catatan Transfer (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Action */}
          <button
            type="submit"
            disabled={amount <= 0 || isInsufficient || fromId === toId}
            className="w-full py-3 rounded-xl bg-emerald-500 text-slate-950 font-semibold text-xs hover:bg-emerald-400 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Konfirmasi Transfer
          </button>
        </form>
      </div>
    </div>
  );
};
