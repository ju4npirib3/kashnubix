'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { cn, ACCOUNT_COLORS, ACCOUNT_TYPE_LABELS } from '@/lib/utils';
import type { AccountType } from '@/types';

interface Props { open: boolean; onClose: () => void; }

const TYPES: AccountType[] = ['checking', 'savings', 'cash', 'investment', 'credit'];

const TYPE_ICONS: Record<AccountType, string> = {
  checking: '🏦', savings: '🐖', cash: '💵', investment: '📈', credit: '💳',
};

export default function AddAccountModal({ open, onClose }: Props) {
  const { addAccountFn } = useApp();
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('checking');
  const [balance, setBalance] = useState('');
  const [color, setColor] = useState(ACCOUNT_COLORS[0]);
  const [currency, setCurrency] = useState('MXN');
  // Credit card specific
  const [creditLimit, setCreditLimit] = useState('');
  const [cutoffDay, setCutoffDay] = useState('');
  const [paymentDueDay, setPaymentDueDay] = useState('');
  // Savings specific
  const [interestRate, setInterestRate] = useState('');
  const [termMonths, setTermMonths] = useState('');
  const [saving, setSaving] = useState(false);
  const dragControls = useDragControls();

  const isCredit = type === 'credit';
  const isSavings = type === 'savings';
  const isInvestment = type === 'investment';

  // Body scroll lock
  useEffect(() => {
    if (open) document.body.classList.add('scroll-locked');
    else document.body.classList.remove('scroll-locked');
    return () => document.body.classList.remove('scroll-locked');
  }, [open]);

  function resetAndClose() {
    setName(''); setBalance(''); setType('checking');
    setColor(ACCOUNT_COLORS[0]); setCurrency('MXN');
    setCreditLimit(''); setCutoffDay(''); setPaymentDueDay('');
    setInterestRate(''); setTermMonths('');
    onClose();
  }

  function handleNumeric(val: string, set: (v: string) => void) {
    set(val.replace(/[^0-9.]/g, '').replace(/^(\d*\.?\d*).*$/, '$1'));
  }

  function handleDay(val: string, set: (v: string) => void) {
    const n = parseInt(val.replace(/\D/g, ''), 10);
    if (isNaN(n)) { set(''); return; }
    set(String(Math.min(31, Math.max(1, n))));
  }

  async function handleSubmit() {
    if (!name.trim()) return;
    if (isCredit && !creditLimit) return;
    setSaving(true);
    try {
      await addAccountFn({
        name: name.trim(),
        type,
        balance: isCredit ? 0 : (parseFloat(balance) || 0),
        previousBalance: isCredit ? 0 : (parseFloat(balance) || 0),
        color,
        currency,
        createdAt: Date.now(),
        ...(isCredit && {
          creditLimit: parseFloat(creditLimit),
          cutoffDay: cutoffDay ? parseInt(cutoffDay) : undefined,
          paymentDueDay: paymentDueDay ? parseInt(paymentDueDay) : undefined,
        }),
        ...(isInvestment && interestRate && {
          interestRate: parseFloat(interestRate),
          termMonths: termMonths ? parseInt(termMonths) : undefined,
          interestStartDate: Date.now(),
        }),
      });
      resetAndClose();
    } finally {
      setSaving(false);
    }
  }

  const canSubmit = name.trim() && (!isCredit || !!creditLimit);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={resetAndClose}
          />
          <motion.div
            className="fixed inset-x-0 top-0 bottom-0 max-w-md mx-auto z-50 bg-white dark:bg-neutral-900 rounded-t-3xl safe-top flex flex-col"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0.05, bottom: 0 }}
            dragMomentum={false}
            onDragEnd={(_, info) => {
              if (info.offset.y > 40 || info.velocity.y > 300) resetAndClose();
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
              <h2 className="text-xl font-bold dark:text-white">Nueva cuenta</h2>
              <button onClick={resetAndClose} className="p-2 rounded-full bg-neutral-100 dark:bg-neutral-800">
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
                  placeholder={isCredit ? 'Ej: BBVA Azul, Banamex Oro...' : 'Ej: Mi cuenta bancaria'}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3.5 bg-neutral-100 dark:bg-neutral-800 rounded-2xl dark:text-white outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>

              {isCredit ? (
                /* ── Credit card fields ── */
                <>
                  {/* Credit limit */}
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

                  {/* Dates */}
                  <div className="flex gap-3 mb-4">
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1 block">
                        Día de corte
                      </label>
                      <input
                        type="text" inputMode="numeric" placeholder="Ej: 15"
                        value={cutoffDay}
                        onChange={e => handleDay(e.target.value, setCutoffDay)}
                        className="w-full px-4 py-3.5 bg-neutral-100 dark:bg-neutral-800 rounded-2xl font-bold dark:text-white outline-none focus:ring-2 focus:ring-accent/30 text-center text-lg"
                      />
                      <p className="text-[10px] text-neutral-400 text-center mt-1">día del mes</p>
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1 block">
                        Día de pago
                      </label>
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
              ) : (
                /* ── Regular / Savings account fields ── */
                <>
                  <div className="mb-4">
                    <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1 block">
                      {isSavings || isInvestment ? 'Monto inicial' : 'Balance inicial'}
                    </label>
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

                  {isInvestment && (
                    <div className="mb-4 bg-income/5 dark:bg-income/10 rounded-2xl p-4 space-y-3">
                      <p className="text-xs font-bold text-income uppercase tracking-wide">📈 Intereses</p>
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1 block">Tasa anual</label>
                          <div className="relative">
                            <input
                              type="text" inputMode="decimal" placeholder="0.00"
                              value={interestRate}
                              onChange={e => handleNumeric(e.target.value, setInterestRate)}
                              className="w-full pl-3 pr-8 py-3 bg-white dark:bg-neutral-800 rounded-xl font-bold dark:text-white outline-none focus:ring-2 focus:ring-income/30 text-center text-lg"
                              style={{ fontVariantNumeric: 'tabular-nums' }}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-sm">%</span>
                          </div>
                          <p className="text-[10px] text-neutral-400 text-center mt-1">anual</p>
                        </div>
                        <div className="flex-1">
                          <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1 block">Plazo</label>
                          <div className="relative">
                            <input
                              type="text" inputMode="numeric" placeholder="12"
                              value={termMonths}
                              onChange={e => {
                                const n = parseInt(e.target.value.replace(/\D/g, ''), 10);
                                setTermMonths(isNaN(n) ? '' : String(Math.max(1, n)));
                              }}
                              className="w-full px-3 py-3 bg-white dark:bg-neutral-800 rounded-xl font-bold dark:text-white outline-none focus:ring-2 focus:ring-income/30 text-center text-lg"
                            />
                          </div>
                          <p className="text-[10px] text-neutral-400 text-center mt-1">meses</p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Currency */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1 block">Moneda</label>
                <div className="flex gap-2">
                  {['MXN', 'USD'].map(c => (
                    <button
                      key={c}
                      onClick={() => setCurrency(c)}
                      className={cn(
                        'flex-1 py-3 rounded-2xl text-sm font-bold transition-all',
                        currency === c ? 'bg-accent text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                      )}
                    >
                      {c === 'MXN' ? '🇲🇽 MXN' : '🇺🇸 USD'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div className="mb-6">
                <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-3 block">Color</label>
                <div className="grid grid-cols-5 gap-3">
                  {ACCOUNT_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={cn(
                        'w-full aspect-square rounded-2xl transition-all active:scale-90',
                        color === c
                          ? 'ring-[3px] ring-white ring-offset-2 dark:ring-offset-neutral-900 scale-105'
                          : 'opacity-80 hover:opacity-100'
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
                {saving ? 'Guardando...' : isCredit ? '💳 Agregar tarjeta' : 'Crear cuenta'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
