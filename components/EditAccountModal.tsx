'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { cn, ACCOUNT_COLORS, ACCOUNT_TYPE_LABELS } from '@/lib/utils';
import type { Account, AccountType } from '@/types';

interface Props {
  account: Account | null;
  onClose: () => void;
}

const TYPES: AccountType[] = ['checking', 'savings', 'cash', 'investment', 'credit'];
const TYPE_ICONS: Record<AccountType, string> = {
  checking: '🏦', savings: '🐖', cash: '💵', investment: '📈', credit: '💳',
};

export default function EditAccountModal({ account, onClose }: Props) {
  const { updateAccountFn } = useApp();
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('checking');
  const [color, setColor] = useState(ACCOUNT_COLORS[0]);
  const [creditLimit, setCreditLimit] = useState('');
  const [cutoffDay, setCutoffDay] = useState('');
  const [paymentDueDay, setPaymentDueDay] = useState('');
  const [balance, setBalance] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [termMonths, setTermMonths] = useState('');
  const [saving, setSaving] = useState(false);
  const dragControls = useDragControls();

  const isCredit = type === 'credit';
  const isInvestment = type === 'investment';

  useEffect(() => {
    if (account) {
      setName(account.name);
      setType(account.type);
      setColor(account.color);
      setCreditLimit(account.creditLimit != null ? String(account.creditLimit) : '');
      setCutoffDay(account.cutoffDay != null ? String(account.cutoffDay) : '');
      setPaymentDueDay(account.paymentDueDay != null ? String(account.paymentDueDay) : '');
      setBalance(String(account.balance));
      setInterestRate(account.interestRate != null ? String(account.interestRate) : '');
      setTermMonths(account.termMonths != null ? String(account.termMonths) : '');
    }
  }, [account]);

  useEffect(() => {
    if (account) document.body.classList.add('scroll-locked');
    else document.body.classList.remove('scroll-locked');
    return () => document.body.classList.remove('scroll-locked');
  }, [account]);

  function handleNumeric(val: string, set: (v: string) => void) {
    set(val.replace(/[^0-9.]/g, '').replace(/^(\d*\.?\d*).*$/, '$1'));
  }

  function handleDay(val: string, set: (v: string) => void) {
    const n = parseInt(val.replace(/\D/g, ''), 10);
    if (isNaN(n)) { set(''); return; }
    set(String(Math.min(31, Math.max(1, n))));
  }

  async function handleSubmit() {
    if (!name.trim() || !account) return;
    if (isCredit && !creditLimit) return;
    setSaving(true);
    try {
      await updateAccountFn(account.id, {
        name: name.trim(),
        type,
        color,
        ...(isCredit && {
          creditLimit: parseFloat(creditLimit),
          cutoffDay: cutoffDay ? parseInt(cutoffDay) : undefined,
          paymentDueDay: paymentDueDay ? parseInt(paymentDueDay) : undefined,
        }),
        ...(!isCredit && !isInvestment && {
          balance: parseFloat(balance) || 0,
          previousBalance: parseFloat(balance) || 0,
        }),
        ...(isInvestment && {
          balance: parseFloat(balance) || 0,
          previousBalance: parseFloat(balance) || 0,
          interestRate: interestRate ? parseFloat(interestRate) : undefined,
          termMonths: termMonths ? parseInt(termMonths) : undefined,
          interestStartDate: account.interestStartDate ?? Date.now(),
        }),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const canSubmit = name.trim() && (!isCredit || !!creditLimit);

  return (
    <AnimatePresence>
      {account && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-[70]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 top-0 bottom-0 max-w-md mx-auto z-[70] bg-white dark:bg-neutral-900 rounded-t-3xl safe-top flex flex-col"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0.05, bottom: 0 }}
            dragMomentum={false}
            onDragEnd={(_, info) => {
              if (info.offset.y > 40 || info.velocity.y > 300) onClose();
            }}
            onClick={e => e.stopPropagation()}
          >
            <div
              className="flex justify-center pt-3 pb-1 flex-shrink-0 cursor-grab active:cursor-grabbing touch-none"
              onPointerDown={e => dragControls.start(e)}
            >
              <div className="w-10 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
            </div>

            <div className="flex items-center justify-between px-6 pb-3 pt-1 flex-shrink-0">
              <h2 className="text-xl font-bold dark:text-white">Editar cuenta</h2>
              <button onClick={onClose} className="p-2 rounded-full bg-neutral-100 dark:bg-neutral-800">
                <X className="w-4 h-4 dark:text-white" />
              </button>
            </div>

            <div className="overflow-y-auto px-6 pb-6 flex-1">
              {/* Type */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-2 block">Tipo</label>
                <div className="flex flex-wrap gap-2">
                  {TYPES.map(t => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-2 rounded-2xl text-sm font-semibold transition-all',
                        type === t ? 'bg-accent text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                      )}
                    >
                      <span>{TYPE_ICONS[t]}</span> {ACCOUNT_TYPE_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1 block">
                  {isCredit ? 'Nombre de la tarjeta' : 'Nombre'}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3.5 bg-neutral-100 dark:bg-neutral-800 rounded-2xl dark:text-white outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>

              {/* Balance for regular accounts */}
              {!isCredit && !isInvestment && (
                <div className="mb-4">
                  <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1 block">Monto</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">$</span>
                    <input
                      type="text" inputMode="decimal" placeholder="0.00"
                      value={balance}
                      onChange={e => handleNumeric(e.target.value, setBalance)}
                      className="w-full pl-8 pr-4 py-3.5 bg-neutral-100 dark:bg-neutral-800 rounded-2xl text-xl font-black dark:text-white outline-none focus:ring-2 focus:ring-accent/30"
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    />
                  </div>
                </div>
              )}

              {/* Investment fields */}
              {isInvestment && (
                <div className="mb-4 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1 block">Monto</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">$</span>
                      <input
                        type="text" inputMode="decimal" placeholder="0.00"
                        value={balance}
                        onChange={e => handleNumeric(e.target.value, setBalance)}
                        className="w-full pl-8 pr-4 py-3.5 bg-neutral-100 dark:bg-neutral-800 rounded-2xl text-xl font-black dark:text-white outline-none focus:ring-2 focus:ring-accent/30"
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                      />
                    </div>
                  </div>
                  <div className="bg-income/5 dark:bg-income/10 rounded-2xl p-4">
                    <p className="text-xs font-bold text-income uppercase tracking-wide mb-3">📈 Intereses</p>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1 block">Tasa anual</label>
                        <div className="relative">
                          <input
                            type="text" inputMode="decimal" placeholder="0.00"
                            value={interestRate}
                            onChange={e => handleNumeric(e.target.value, setInterestRate)}
                            className="w-full pl-3 pr-8 py-3 bg-white dark:bg-neutral-800 rounded-xl font-bold dark:text-white outline-none focus:ring-2 focus:ring-income/30 text-center text-lg"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-sm">%</span>
                        </div>
                        <p className="text-[10px] text-neutral-400 text-center mt-1">anual</p>
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1 block">Plazo</label>
                        <input
                          type="text" inputMode="numeric" placeholder="12"
                          value={termMonths}
                          onChange={e => {
                            const n = parseInt(e.target.value.replace(/\D/g, ''), 10);
                            setTermMonths(isNaN(n) ? '' : String(Math.max(1, n)));
                          }}
                          className="w-full px-3 py-3 bg-white dark:bg-neutral-800 rounded-xl font-bold dark:text-white outline-none focus:ring-2 focus:ring-income/30 text-center text-lg"
                        />
                        <p className="text-[10px] text-neutral-400 text-center mt-1">meses</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Credit fields */}
              {isCredit && (
                <>
                  <div className="mb-4">
                    <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1 block">
                      Límite de crédito <span className="text-expense">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">$</span>
                      <input
                        type="text" inputMode="decimal" placeholder="0.00"
                        value={creditLimit}
                        onChange={e => handleNumeric(e.target.value, setCreditLimit)}
                        className="w-full pl-8 pr-4 py-3.5 bg-neutral-100 dark:bg-neutral-800 rounded-2xl text-xl font-black dark:text-white outline-none focus:ring-2 focus:ring-accent/30"
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mb-4">
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1 block">Día de corte</label>
                      <input
                        type="text" inputMode="numeric" placeholder="Ej: 15"
                        value={cutoffDay}
                        onChange={e => handleDay(e.target.value, setCutoffDay)}
                        className="w-full px-4 py-3.5 bg-neutral-100 dark:bg-neutral-800 rounded-2xl font-bold dark:text-white outline-none focus:ring-2 focus:ring-accent/30 text-center text-lg"
                      />
                      <p className="text-[10px] text-neutral-400 text-center mt-1">día del mes</p>
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1 block">Día de pago</label>
                      <input
                        type="text" inputMode="numeric" placeholder="Ej: 5"
                        value={paymentDueDay}
                        onChange={e => handleDay(e.target.value, setPaymentDueDay)}
                        className="w-full px-4 py-3.5 bg-neutral-100 dark:bg-neutral-800 rounded-2xl font-bold dark:text-white outline-none focus:ring-2 focus:ring-accent/30 text-center text-lg"
                      />
                      <p className="text-[10px] text-neutral-400 text-center mt-1">día del mes</p>
                    </div>
                  </div>
                </>
              )}

              {/* Color */}
              <div className="mb-6">
                <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-2 block">Color</label>
                <div className="flex gap-3 flex-wrap">
                  {ACCOUNT_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={cn(
                        'w-9 h-9 rounded-full transition-transform',
                        color === c && 'scale-125 ring-2 ring-white ring-offset-1 dark:ring-offset-neutral-900'
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!canSubmit || saving}
                className="w-full py-4 bg-accent text-white font-bold rounded-2xl active:scale-[0.98] transition-transform disabled:opacity-40"
              >
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
