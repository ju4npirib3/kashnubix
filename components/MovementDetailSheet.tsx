'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { X, Trash2, Copy } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useApp } from '@/contexts/AppContext';
import { formatCurrency, CATEGORY_ICONS, CATEGORY_COLORS } from '@/lib/utils';
import type { Movement } from '@/types';

interface Props {
  movement: Movement | null;
  onClose: () => void;
}

export default function MovementDetailSheet({ movement, onClose }: Props) {
  const { accounts, msiPlans, deleteMovementFn, deleteMsiPlanFn } = useApp();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const dragControls = useDragControls();

  // Body scroll lock
  useEffect(() => {
    if (movement) document.body.classList.add('scroll-locked');
    else document.body.classList.remove('scroll-locked');
    return () => document.body.classList.remove('scroll-locked');
  }, [movement]);

  if (!movement) return null;

  const account = accounts.find(a => a.id === movement.accountId);
  const isIncome = movement.type === 'income';
  const catColor = CATEGORY_COLORS[movement.category] ?? '#8E8E93';

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    // If this movement belongs to an MSI plan, delete the whole plan (not just the movement)
    const linkedPlan = msiPlans.find(p => p.movementId === movement!.id);
    if (linkedPlan) {
      await deleteMsiPlanFn(linkedPlan.id, movement!.id, movement!.accountId, movement!.amount);
    } else {
      await deleteMovementFn(movement!.id, movement!.accountId, movement!.type, movement!.amount);
    }
    setDeleting(false);
    onClose();
  }

  function handleCopy() {
    const params = new URLSearchParams({
      copy: '1',
      type: movement!.type,
      category: movement!.category,
      amount: String(movement!.amount),
      description: movement!.description,
      accountId: movement!.accountId,
    });
    if (movement!.establishment) params.set('establishment', movement!.establishment);
    onClose();
    router.push(`/home?${params.toString()}`);
  }

  return (
    <AnimatePresence>
      {movement && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setConfirmDelete(false); onClose(); }}
          />

          <motion.div
            className="fixed inset-x-0 top-0 bottom-0 max-w-md mx-auto z-50 bg-white dark:bg-neutral-900 rounded-t-3xl safe-top flex flex-col"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0.05, bottom: 0 }}
            dragMomentum={false}
            onDragEnd={(_, info) => {
              if (info.offset.y > 40 || info.velocity.y > 300) {
                setConfirmDelete(false);
                onClose();
              }
            }}
          >
            {/* Handle — drag here to close */}
            <div
              className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing touch-none"
              onPointerDown={e => dragControls.start(e)}
            >
              <div className="w-10 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
            </div>

            <div className="overflow-y-auto flex-1 px-6 pb-8 pt-2">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold dark:text-white">Detalle</h2>
                <button
                  onClick={() => { setConfirmDelete(false); onClose(); }}
                  className="p-2 rounded-full bg-neutral-100 dark:bg-neutral-800"
                >
                  <X className="w-4 h-4 dark:text-white" />
                </button>
              </div>

              {/* Category icon + amount */}
              <div className="flex flex-col items-center mb-8">
                <div
                  className="w-20 h-20 rounded-[24px] flex items-center justify-center mb-4"
                  style={{ backgroundColor: catColor + '22' }}
                >
                  <span className="text-4xl">{CATEGORY_ICONS[movement.category] ?? '📦'}</span>
                </div>

                <p
                  className={`font-black text-4xl leading-none ${isIncome ? 'text-income' : 'text-expense'}`}
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {isIncome ? '+' : '-'}{formatCurrency(movement.amount, account?.currency ?? 'MXN')}
                </p>

                <p className="text-neutral-500 dark:text-neutral-400 font-medium mt-2">
                  {movement.description}
                </p>
              </div>

              {/* Info rows */}
              <div className="bg-neutral-50 dark:bg-neutral-800 rounded-2xl divide-y divide-neutral-200 dark:divide-neutral-700 mb-6">
                <InfoRow label="Tipo" value={isIncome ? '↑ Ingreso' : '↓ Gasto'} valueClass={isIncome ? 'text-income' : 'text-expense'} />
                <InfoRow label="Categoría" value={movement.category} />
                {movement.establishment ? (
                  <InfoRow label="Establecimiento" value={movement.establishment} />
                ) : null}
                <InfoRow
                  label="Cuenta"
                  value={account ? `${account.name} (${account.currency})` : movement.accountName}
                />
                <InfoRow
                  label="Fecha"
                  value={format(new Date(movement.date), "d 'de' MMMM yyyy", { locale: es })}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleCopy}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-accent/10 dark:bg-accent/20 text-accent font-bold rounded-2xl active:scale-[0.98] transition-transform"
                >
                  <Copy className="w-4 h-4" />
                  Copiar
                </button>

                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 font-bold rounded-2xl active:scale-[0.98] transition-all ${
                    confirmDelete
                      ? 'bg-expense text-white'
                      : 'bg-expense/10 dark:bg-expense/20 text-expense'
                  } disabled:opacity-50`}
                >
                  <Trash2 className="w-4 h-4" />
                  {deleting ? 'Eliminando...' : confirmDelete ? '¿Confirmar?' : 'Eliminar'}
                </button>
              </div>

              {confirmDelete && (
                <p className="text-center text-xs text-neutral-400 mt-2">
                  Toca "¿Confirmar?" de nuevo para eliminar permanentemente
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function InfoRow({ label, value, valueClass = '' }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-neutral-500 dark:text-neutral-400">{label}</span>
      <span className={`text-sm font-semibold text-neutral-800 dark:text-neutral-200 text-right max-w-[60%] ${valueClass}`}>
        {value}
      </span>
    </div>
  );
}
