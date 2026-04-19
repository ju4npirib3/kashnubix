'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { formatCurrency, CATEGORY_ICONS, CATEGORY_COLORS } from '@/lib/utils';
import { format, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';
import MovementDetailSheet from './MovementDetailSheet';
import type { Movement } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
}

function groupByDate(movements: Movement[]) {
  const groups: { label: string; items: Movement[] }[] = [];
  const map = new Map<string, Movement[]>();
  for (const m of movements) {
    const d = new Date(m.date);
    const key = isToday(d) ? 'Hoy' : isYesterday(d) ? 'Ayer' : format(d, "d 'de' MMMM", { locale: es });
    if (!map.has(key)) { map.set(key, []); groups.push({ label: key, items: map.get(key)! }); }
    map.get(key)!.push(m);
  }
  return groups;
}

export default function MovementsHistorySheet({ open, onClose }: Props) {
  const { movements } = useApp();
  const [selected, setSelected] = useState<Movement | null>(null);
  const dragControls = useDragControls();

  useEffect(() => {
    if (open) document.body.classList.add('scroll-locked');
    else document.body.classList.remove('scroll-locked');
    return () => document.body.classList.remove('scroll-locked');
  }, [open]);

  const sorted = [...movements].sort((a, b) => b.date - a.date);
  const groups = groupByDate(sorted);

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-[55]"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.div
              className="fixed inset-x-0 top-0 bottom-0 max-w-md mx-auto z-[55] bg-bg-light dark:bg-bg-dark rounded-t-3xl safe-top flex flex-col"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 320 }}
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
              {/* Handle */}
              <div
                className="flex justify-center pt-3 pb-1 flex-shrink-0 cursor-grab active:cursor-grabbing touch-none"
                onPointerDown={e => dragControls.start(e)}
              >
                <div className="w-10 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pb-3 pt-1 flex-shrink-0">
                <div>
                  <h2 className="text-xl font-bold dark:text-white">Historial</h2>
                  <p className="text-xs text-neutral-400 mt-0.5">{movements.length} movimientos</p>
                </div>
                <button onClick={onClose} className="p-2 rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <X className="w-4 h-4 dark:text-white" />
                </button>
              </div>

              {/* List */}
              <div className="overflow-y-auto flex-1 px-5 pb-8">
                {groups.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-16 text-center">
                    <span className="text-4xl opacity-30">📋</span>
                    <p className="text-sm text-neutral-400">Sin movimientos aún</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {groups.map(({ label, items }) => (
                      <div key={label}>
                        <p className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-2 px-1">
                          {label}
                        </p>
                        <div className="bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden">
                          {items.map((m, i) => {
                            const catColor = CATEGORY_COLORS[m.category] ?? '#8E8E93';
                            const isIncome = m.type === 'income';
                            const mainLabel = m.establishment?.trim() || m.description;
                            const subLabel = m.establishment?.trim() ? m.category : null;

                            return (
                              <button
                                key={m.id}
                                onClick={() => setSelected(m)}
                                className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-neutral-50 dark:active:bg-neutral-800/60 transition-colors text-left"
                                style={i > 0 ? { borderTop: '1px solid rgba(0,0,0,0.05)' } : undefined}
                              >
                                <div
                                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                                  style={{ backgroundColor: catColor + '18' }}
                                >
                                  {CATEGORY_ICONS[m.category] ?? '📦'}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate leading-tight">
                                    {mainLabel}
                                  </p>
                                  {subLabel && (
                                    <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                                      {subLabel}
                                    </p>
                                  )}
                                </div>
                                <p
                                  className={`text-sm font-bold flex-shrink-0 ${isIncome ? 'text-income' : 'text-expense'}`}
                                  style={{ fontVariantNumeric: 'tabular-nums' }}
                                >
                                  {isIncome ? '+' : '−'}{formatCurrency(m.amount)}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Detail sheet — z-[60] so it renders above the history sheet */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-[60]"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
            />
            <InnerMovementDetail movement={selected} onClose={() => setSelected(null)} />
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Inline detail sheet rendered at z-[60] so it appears above MovementsHistorySheet
function InnerMovementDetail({ movement, onClose }: { movement: Movement; onClose: () => void }) {
  const { accounts, deleteMovementFn } = useApp();
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const dragControls = useDragControls();

  const account = accounts.find(a => a.id === movement.accountId);
  const isIncome = movement.type === 'income';
  const catColor = CATEGORY_COLORS[movement.category] ?? '#8E8E93';

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    await deleteMovementFn(movement.id, movement.accountId, movement.type, movement.amount);
    setDeleting(false);
    onClose();
  }

  return (
    <motion.div
      className="fixed inset-x-0 top-0 bottom-0 max-w-md mx-auto z-[60] bg-white dark:bg-neutral-900 rounded-t-3xl safe-top flex flex-col"
      initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 32, stiffness: 320 }}
      drag="y"
      dragControls={dragControls}
      dragListener={false}
      dragConstraints={{ top: 0 }}
      dragElastic={{ top: 0.05, bottom: 0 }}
      dragMomentum={false}
      onDragEnd={(_, info) => {
        if (info.offset.y > 40 || info.velocity.y > 300) { setConfirmDelete(false); onClose(); }
      }}
    >
      <div
        className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing touch-none"
        onPointerDown={e => dragControls.start(e)}
      >
        <div className="w-10 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
      </div>

      <div className="overflow-y-auto flex-1 px-6 pb-8 pt-2">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold dark:text-white">Detalle</h2>
          <button onClick={() => { setConfirmDelete(false); onClose(); }} className="p-2 rounded-full bg-neutral-100 dark:bg-neutral-800">
            <X className="w-4 h-4 dark:text-white" />
          </button>
        </div>

        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-[24px] flex items-center justify-center mb-4" style={{ backgroundColor: catColor + '22' }}>
            <span className="text-4xl">{CATEGORY_ICONS[movement.category] ?? '📦'}</span>
          </div>
          <p className={`font-black text-4xl leading-none ${isIncome ? 'text-income' : 'text-expense'}`} style={{ fontVariantNumeric: 'tabular-nums' }}>
            {isIncome ? '+' : '-'}{formatCurrency(movement.amount, account?.currency ?? 'MXN')}
          </p>
          <p className="text-neutral-500 dark:text-neutral-400 font-medium mt-2">{movement.description}</p>
        </div>

        <div className="bg-neutral-50 dark:bg-neutral-800 rounded-2xl divide-y divide-neutral-200 dark:divide-neutral-700 mb-6">
          <InfoRow label="Tipo" value={isIncome ? '↑ Ingreso' : '↓ Gasto'} valueClass={isIncome ? 'text-income' : 'text-expense'} />
          <InfoRow label="Categoría" value={movement.category} />
          {movement.establishment && <InfoRow label="Establecimiento" value={movement.establishment} />}
          <InfoRow label="Cuenta" value={account ? `${account.name} (${account.currency})` : movement.accountName} />
          <InfoRow label="Fecha" value={format(new Date(movement.date), "d 'de' MMMM yyyy", { locale: es })} />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 font-bold rounded-2xl active:scale-[0.98] transition-all ${
              confirmDelete ? 'bg-expense text-white' : 'bg-expense/10 dark:bg-expense/20 text-expense'
            } disabled:opacity-50`}
          >
            {deleting ? 'Eliminando...' : confirmDelete ? '¿Confirmar?' : 'Eliminar'}
          </button>
        </div>

        {confirmDelete && (
          <p className="text-center text-xs text-neutral-400 mt-2">Toca "¿Confirmar?" de nuevo para eliminar permanentemente</p>
        )}
      </div>
    </motion.div>
  );
}

function InfoRow({ label, value, valueClass = '' }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-neutral-500 dark:text-neutral-400">{label}</span>
      <span className={`text-sm font-semibold text-neutral-800 dark:text-neutral-200 text-right max-w-[60%] ${valueClass}`}>{value}</span>
    </div>
  );
}
