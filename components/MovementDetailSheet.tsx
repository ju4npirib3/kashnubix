'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { X, Trash2, Copy, Pencil, Check } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useApp } from '@/contexts/AppContext';
import { formatCurrency, CATEGORY_ICONS, CATEGORY_COLORS, cn } from '@/lib/utils';
import type { Movement } from '@/types';

const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
function formatDisplayDate(s: string) {
  const [y, m, d] = s.split('-').map(Number);
  return `${d} de ${MONTHS_ES[m - 1]} de ${y}`;
}
function tsToDateString(ts: number) {
  const d = new Date(ts);
  return [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('-');
}
function dateStringToTs(s: string) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0).getTime();
}
function todayString() {
  const d = new Date();
  return [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('-');
}

interface Props {
  movement: Movement | null;
  onClose: () => void;
}

export default function MovementDetailSheet({ movement, onClose }: Props) {
  const { accounts, msiPlans, expenseCategories, incomeCategories, deleteMovementFn, deleteMsiPlanFn, updateMovementFn } = useApp();
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editEstablishment, setEditEstablishment] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const dragControls = useDragControls();

  useEffect(() => {
    if (movement) document.body.classList.add('scroll-locked');
    else document.body.classList.remove('scroll-locked');
    return () => document.body.classList.remove('scroll-locked');
  }, [movement]);

  // Reset editing state when movement changes
  useEffect(() => {
    setEditing(false);
    setConfirmDelete(false);
  }, [movement?.id]);

  if (!movement) return null;

  const account = accounts.find(a => a.id === movement.accountId);
  const isIncome = movement.type === 'income';
  const isTransfer = movement.type === 'transfer';
  const catColor = CATEGORY_COLORS[movement.category] ?? '#8E8E93';
  const categories = movement.type === 'income' ? incomeCategories : expenseCategories;

  function startEdit() {
    setEditAmount(String(movement!.amount));
    setEditCategory(movement!.category);
    setEditDescription(movement!.description);
    setEditEstablishment(movement!.establishment ?? '');
    setEditDate(tsToDateString(movement!.date));
    setEditing(true);
  }

  async function handleSaveEdit() {
    if (!movement || !editAmount || !editCategory) return;
    setEditSaving(true);
    try {
      const updates: Partial<Omit<Movement, 'id'>> = {
        amount: parseFloat(editAmount),
        category: editCategory,
        description: editDescription.trim() || editCategory,
        date: dateStringToTs(editDate),
      };
      if (editEstablishment.trim()) updates.establishment = editEstablishment.trim();
      await updateMovementFn(movement, updates);
      setEditing(false);
      onClose();
    } catch {
      // error handled silently
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    const linkedPlan = msiPlans.find(p => p.movementId === movement!.id);
    if (linkedPlan) {
      await deleteMsiPlanFn(linkedPlan.id, movement!.id, movement!.accountId, movement!.amount);
    } else {
      await deleteMovementFn(movement!.id, movement!.accountId, movement!.type, movement!.amount);
    }
    setDeleting(false);
    onClose();
  }

  return (
    <AnimatePresence>
      {movement && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setConfirmDelete(false); setEditing(false); onClose(); }}
          />

          <motion.div
            className="fixed inset-x-0 top-0 bottom-0 max-w-md mx-auto z-[60] bg-white dark:bg-neutral-900 rounded-t-3xl safe-top flex flex-col"
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
                setEditing(false);
                onClose();
              }
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
                <h2 className="text-lg font-bold dark:text-white">
                  {editing ? 'Editar movimiento' : 'Detalle'}
                </h2>
                <button
                  onClick={() => { setConfirmDelete(false); setEditing(false); onClose(); }}
                  className="p-2 rounded-full bg-neutral-100 dark:bg-neutral-800"
                >
                  <X className="w-4 h-4 dark:text-white" />
                </button>
              </div>

              {editing ? (
                /* ── Edit form ── */
                <div className="space-y-4">
                  {/* Amount */}
                  <div>
                    <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1 block">Monto</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-4 text-neutral-400 font-bold text-xl z-10">$</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={editAmount}
                        onChange={e => setEditAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                        className="w-full pl-9 pr-4 py-4 bg-neutral-100 dark:bg-neutral-800 rounded-2xl text-2xl font-black dark:text-white outline-none focus:ring-2 focus:ring-accent/30"
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-2 block">Categoría</label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map(c => {
                        const color = CATEGORY_COLORS[c.name] ?? '#8E8E93';
                        const selected = editCategory === c.name;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setEditCategory(c.name)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-sm font-semibold transition-all"
                            style={selected ? { backgroundColor: color, color: '#fff' } : { backgroundColor: color + '20' }}
                          >
                            <span>{c.icon}</span>
                            <span className={selected ? 'text-white' : 'text-neutral-700 dark:text-neutral-300'}>{c.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1 block">Nota</label>
                    <input
                      type="text"
                      value={editDescription}
                      onChange={e => setEditDescription(e.target.value)}
                      placeholder="Descripción..."
                      className="w-full px-4 py-3.5 bg-neutral-100 dark:bg-neutral-800 rounded-2xl dark:text-white outline-none focus:ring-2 focus:ring-accent/30"
                    />
                  </div>

                  {/* Establishment */}
                  <div>
                    <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1 block">Establecimiento (opcional)</label>
                    <input
                      type="text"
                      value={editEstablishment}
                      onChange={e => setEditEstablishment(e.target.value)}
                      placeholder="Ej: Walmart, Starbucks..."
                      className="w-full px-4 py-3.5 bg-neutral-100 dark:bg-neutral-800 rounded-2xl dark:text-white outline-none focus:ring-2 focus:ring-accent/30"
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1 block">Fecha</label>
                    <div className="relative rounded-2xl bg-neutral-100 dark:bg-neutral-800">
                      <div className="flex items-center justify-center gap-2 py-3.5 select-none pointer-events-none">
                        <span className="text-base">📅</span>
                        <span className="font-semibold text-neutral-800 dark:text-white">{formatDisplayDate(editDate)}</span>
                      </div>
                      <input
                        type="date"
                        value={editDate}
                        max={todayString()}
                        onChange={e => { if (e.target.value && e.target.value <= todayString()) setEditDate(e.target.value); }}
                        className="absolute inset-0 w-full h-full rounded-2xl cursor-pointer border-0 outline-none"
                        style={{ opacity: 0.011, background: 'transparent', colorScheme: 'light dark' }}
                      />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="flex-1 py-3.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-semibold rounded-2xl"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      disabled={editSaving || !editAmount || !editCategory}
                      className="flex-1 py-3.5 bg-accent text-white font-bold rounded-2xl disabled:opacity-40 flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      {editSaving ? 'Guardando...' : 'Guardar'}
                    </button>
                  </div>
                </div>
              ) : (
                /* ── Detail view ── */
                <>
                  <div className="flex flex-col items-center mb-8">
                    <div
                      className="w-20 h-20 rounded-[24px] flex items-center justify-center mb-4"
                      style={{ backgroundColor: catColor + '22' }}
                    >
                      <span className="text-4xl">{CATEGORY_ICONS[movement.category] ?? '📦'}</span>
                    </div>
                    <p
                      className={`font-black text-4xl leading-none ${
                        isTransfer ? 'text-neutral-600 dark:text-neutral-300'
                        : isIncome ? 'text-income' : 'text-expense'
                      }`}
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {isTransfer
                        ? (movement.transferDirection === 'out' ? '-' : '+')
                        : isIncome ? '+' : '-'
                      }{formatCurrency(movement.amount, account?.currency ?? 'MXN')}
                    </p>
                    <p className="text-neutral-500 dark:text-neutral-400 font-medium mt-2">{movement.description}</p>
                  </div>

                  <div className="bg-neutral-50 dark:bg-neutral-800 rounded-2xl divide-y divide-neutral-200 dark:divide-neutral-700 mb-6">
                    <InfoRow
                      label="Tipo"
                      value={isTransfer
                        ? (movement.transferDirection === 'out' ? '↔ Traspaso (salida)' : '↔ Traspaso (entrada)')
                        : isIncome ? '↑ Ingreso' : '↓ Gasto'
                      }
                      valueClass={isTransfer ? 'text-neutral-500' : isIncome ? 'text-income' : 'text-expense'}
                    />
                    {isTransfer && movement.transferLinkedAccountName && (
                      <InfoRow
                        label={movement.transferDirection === 'out' ? 'Hacia' : 'Desde'}
                        value={movement.transferLinkedAccountName}
                      />
                    )}
                    {!isTransfer && <InfoRow label="Categoría" value={movement.category} />}
                    {movement.establishment && <InfoRow label="Establecimiento" value={movement.establishment} />}
                    <InfoRow label="Cuenta" value={account ? `${account.name} (${account.currency})` : movement.accountName} />
                    <InfoRow label="Fecha" value={format(new Date(movement.date), "d 'de' MMMM yyyy", { locale: es })} />
                  </div>

                  <div className="flex gap-3">
                    {!isTransfer && (
                      <button
                        type="button"
                        onClick={startEdit}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-accent/10 dark:bg-accent/20 text-accent font-bold rounded-2xl active:scale-[0.98] transition-transform"
                      >
                        <Pencil className="w-4 h-4" />
                        Editar
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting}
                      className={cn(
                        'flex-1 flex items-center justify-center gap-2 py-3.5 font-bold rounded-2xl active:scale-[0.98] transition-all disabled:opacity-50',
                        confirmDelete ? 'bg-expense text-white' : 'bg-expense/10 dark:bg-expense/20 text-expense'
                      )}
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
                </>
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
      <span className={`text-sm font-semibold text-neutral-800 dark:text-neutral-200 text-right max-w-[60%] ${valueClass}`}>{value}</span>
    </div>
  );
}
