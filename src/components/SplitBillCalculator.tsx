import React, { useState } from 'react';
import { Users, Check, ArrowDownRight, Share2 } from 'lucide-react';
import { formatRupiah } from '../lib/store';

interface SplitBillCalculatorProps {
  onRecordMyShare: (amount: number, note: string) => void;
}

export const SplitBillCalculator: React.FC<SplitBillCalculatorProps> = ({
  onRecordMyShare,
}) => {
  const [billTitle, setBillTitle] = useState('Nongkrong Kafe');
  const [subtotalStr, setSubtotalStr] = useState('120000');
  const [taxPercent, setTaxPercent] = useState<number>(10);
  const [discountStr, setDiscountStr] = useState('0');
  const [peopleCount, setPeopleCount] = useState<number>(4);
  const [roundUpToThousand, setRoundUpToThousand] = useState(true);
  const [copied, setCopied] = useState(false);
  const [recorded, setRecorded] = useState(false);

  const subtotal = Number(subtotalStr) || 0;
  const discount = Number(discountStr) || 0;
  const taxAmount = (subtotal * taxPercent) / 100;
  const grandTotal = Math.max(0, subtotal + taxAmount - discount);

  const rawPerPerson = peopleCount > 0 ? grandTotal / peopleCount : 0;
  const perPerson = roundUpToThousand ? Math.ceil(rawPerPerson / 1000) * 1000 : Math.round(rawPerPerson);

  const handleUpdatePeople = (delta: number) => {
    setPeopleCount((prev) => Math.max(2, prev + delta));
  };

  const generateWhatsAppMessage = () => {
    return `🧾 *RINCIAN PATUNGAN*
📍 *Acara:* ${billTitle}
💰 *Subtotal:* ${formatRupiah(subtotal)}
${taxPercent > 0 ? `📊 *Pajak (${taxPercent}%):* ${formatRupiah(taxAmount)}\n` : ''}${discount > 0 ? `🎟️ *Diskon:* -${formatRupiah(discount)}\n` : ''}━━━━━━━━━━━━━━━━━━
💵 *TOTAL:* ${formatRupiah(grandTotal)}
👥 *Orang:* ${peopleCount} orang
👉 *Per orang:* *${formatRupiah(perPerson)}*

Bisa transfer ke Ayub ya rek. Terima kasih! 🙌`;
  };

  const handleCopy = () => {
    const text = generateWhatsAppMessage();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRecord = () => {
    if (perPerson <= 0) return;
    onRecordMyShare(perPerson, `Patungan: ${billTitle}`);
    setRecorded(true);
    setTimeout(() => setRecorded(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-sm font-semibold text-white tracking-tight">Kalkulator Split Bill</h2>
        <p className="text-[11px] text-zinc-500">
          Hitung patungan nongkrong per orang dengan cepat
        </p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4.5 space-y-4">
        {/* Title */}
        <div>
          <label className="text-[11px] font-medium text-zinc-400 block mb-1">
            Nama Acara / Kafe
          </label>
          <input
            type="text"
            value={billTitle}
            onChange={(e) => setBillTitle(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-700"
          />
        </div>

        {/* Subtotal */}
        <div>
          <label className="text-[11px] font-medium text-zinc-400 block mb-1">
            Total Tagihan (Rp)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-num font-semibold text-sm">
              Rp
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={subtotalStr ? Number(subtotalStr).toLocaleString('id-ID') : ''}
              onChange={(e) => setSubtotalStr(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-lg font-bold font-num text-white focus:outline-none focus:border-zinc-700"
            />
          </div>
        </div>

        {/* Tax & Discount */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-medium text-zinc-400 block mb-1">
              Pajak Resto (% PB1)
            </label>
            <div className="flex gap-1.5">
              {[0, 10, 11].map((pct) => (
                <button
                  type="button"
                  key={pct}
                  onClick={() => setTaxPercent(pct)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium font-num transition-colors cursor-pointer ${
                    taxPercent === pct
                      ? 'bg-zinc-100 text-zinc-950 font-semibold'
                      : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-zinc-400 block mb-1">
              Diskon (Rp)
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={discountStr ? Number(discountStr).toLocaleString('id-ID') : ''}
              onChange={(e) => setDiscountStr(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-num text-white focus:outline-none focus:border-zinc-700"
            />
          </div>
        </div>

        {/* People Counter */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-medium text-zinc-400">
              Jumlah Orang
            </label>
            <span className="text-xs font-semibold text-white font-num">{peopleCount} Orang</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleUpdatePeople(-1)}
              className="w-10 h-9 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-bold flex items-center justify-center hover:bg-zinc-800 cursor-pointer"
            >
              -
            </button>
            <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl h-9 flex items-center justify-center text-xs font-semibold text-white font-num">
              {peopleCount} Siswa
            </div>
            <button
              type="button"
              onClick={() => handleUpdatePeople(1)}
              className="w-10 h-9 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-bold flex items-center justify-center hover:bg-zinc-800 cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        {/* Round Up */}
        <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
          <input
            type="checkbox"
            checked={roundUpToThousand}
            onChange={(e) => setRoundUpToThousand(e.target.checked)}
            className="w-4 h-4 rounded text-zinc-200 bg-zinc-950 border-zinc-700"
          />
          <span>Bulatkan ke ribuan terdekat</span>
        </label>

        {/* Results Card */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Total Tagihan:</span>
            <span className="text-zinc-300 font-num font-medium">{formatRupiah(grandTotal)}</span>
          </div>

          <div className="flex items-baseline justify-between pt-1 border-t border-zinc-800/80">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Bagian Per Orang</span>
              <span className="text-xl font-bold font-num text-white">
                {formatRupiah(perPerson)}
              </span>
            </div>
            <div className="text-right text-[11px] text-zinc-500 font-num">
              ÷ {peopleCount} orang
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={handleCopy}
            className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Tersalin!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Salin ke WA</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleRecord}
            disabled={perPerson <= 0}
            className="py-2.5 px-3 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
          >
            {recorded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Tercatat!</span>
              </>
            ) : (
              <>
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>Catat Porsi Saya</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
