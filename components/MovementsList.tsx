'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { formatCurrency, CATEGORY_ICONS, CATEGORY_COLORS } from '@/lib/utils';
import { format, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';
import MovementDetailSheet from './MovementDetailSheet';
import MovementsHistorySheet from './MovementsHistorySheet';
import type { Movement } from '@/types';

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

export default function MovementsList() {
  const { movements } = useApp();
  const [selected, setSelected] = useState<Movement | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  if (movements.length === 0) {
    return (
      <div className="px-5 mb-8">
        <h3 className="font-bold text-neutral-900 dark:text-white mb-4">Movimientos</h3>
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <span className="text-3xl opacity-40">📋</span>
          <p className="text-sm text-neutral-400 dark:text-neutral-500">Sin movimientos aún</p>
        </div>
      </div>
    );
  }

  const groups = groupByDate(movements.slice(0, 40));

  return (
    <>
      <motion.div
        className="px-5 mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-neutral-900 dark:text-white">Movimientos</h3>
          <button
            onClick={() => setShowHistory(true)}
            className="text-xs font-semibold text-accent"
          >
            Ver todos →
          </button>
        </div>

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
      </motion.div>

      <MovementDetailSheet movement={selected} onClose={() => setSelected(null)} />
      <MovementsHistorySheet open={showHistory} onClose={() => setShowHistory(false)} />
    </>
  );
}
