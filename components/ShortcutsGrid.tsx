'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings2, Check } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { CATEGORY_COLORS, cn } from '@/lib/utils';
import type { Shortcut, MovementType } from '@/types';

interface Props {
  onShortcut: (type: MovementType, category: string) => void;
}

export default function ShortcutsGrid({ onShortcut }: Props) {
  const { shortcuts, updateShortcutsFn, expenseCategories, incomeCategories } = useApp();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Omit<Shortcut, 'id'>[]>([]);

  const ALL_SHORTCUTS = [
    ...expenseCategories.map(c => ({ label: c.name, icon: c.icon, type: 'expense' as const, category: c.name })),
    ...incomeCategories.map(c => ({ label: c.name, icon: c.icon, type: 'income' as const, category: c.name })),
  ];

  function startEdit() {
    setDraft(shortcuts.map(s => ({ label: s.label, icon: s.icon, type: s.type, category: s.category })));
    setEditing(true);
  }

  async function saveEdit() {
    if (draft.length === 0) { setEditing(false); return; }
    await updateShortcutsFn(draft);
    setEditing(false);
  }

  function toggleDraft(item: Omit<Shortcut, 'id'>) {
    const idx = draft.findIndex(d => d.category === item.category && d.type === item.type);
    if (idx >= 0) {
      setDraft(draft.filter((_, i) => i !== idx));
    } else if (draft.length < 6) {
      setDraft([...draft, item]);
    }
  }

  function getShortcutColor(type: MovementType, category: string): string {
    if (CATEGORY_COLORS[category]) return CATEGORY_COLORS[category];
    return type === 'income' ? '#34C759' : '#FF9500';
  }

  return (
    <motion.div
      className="px-5 mb-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-neutral-900 dark:text-white tracking-tight">Accesos rápidos</h3>
        <button onClick={editing ? saveEdit : startEdit} className="text-sm font-semibold text-accent flex items-center gap-1">
          {editing ? <><Check className="w-3.5 h-3.5" /> Listo</> : <><Settings2 className="w-3.5 h-3.5" /> Editar</>}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {editing ? (
          <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">Selecciona hasta 6 accesos rápidos</p>
            <div className="flex flex-wrap gap-2">
              {ALL_SHORTCUTS.map(item => {
                const selected = draft.some(d => d.category === item.category && d.type === item.type);
                const color = getShortcutColor(item.type, item.category);
                return (
                  <button
                    key={`${item.type}-${item.category}`}
                    onClick={() => toggleDraft(item)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 rounded-2xl text-sm font-semibold transition-all',
                      selected ? 'text-white' : 'text-neutral-700 dark:text-neutral-300'
                    )}
                    style={selected
                      ? { backgroundColor: color }
                      : { backgroundColor: color + '20' }
                    }
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
              {shortcuts.map(s => {
                const color = getShortcutColor(s.type, s.category);
                return (
                  <button
                    key={s.id}
                    onClick={() => onShortcut(s.type, s.category)}
                    className="flex-shrink-0 flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
                  >
                    <div
                      className="w-14 h-14 rounded-[18px] flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: color + '22' }}
                    >
                      <span className="text-2xl leading-none">{s.icon}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 whitespace-nowrap max-w-[60px] truncate">
                      {s.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
