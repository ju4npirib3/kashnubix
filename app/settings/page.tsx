'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/components/ThemeProvider';
import BottomNav from '@/components/BottomNav';
import AddMovementModal from '@/components/AddMovementModal';
import {
  Sun, Moon, Smartphone, ChevronRight, LogOut,
  Shield, Bell, HelpCircle, Info, X, Check, Plus, Pencil,
} from 'lucide-react';
import { cn, getInitials, CATEGORY_COLORS, DEFAULT_EXPENSE_CATS, DEFAULT_INCOME_CATS } from '@/lib/utils';
import type { CustomCategory } from '@/types';

export default function SettingsPage() {
  const { user, loading, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { expenseCategories, incomeCategories, saveAllCategoriesFn } = useApp();
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const [catTab, setCatTab] = useState<'expense' | 'income'>('expense');
  const [editingCat, setEditingCat] = useState<CustomCategory | null>(null);
  const [addingCat, setAddingCat] = useState(false);
  const [catSaving, setCatSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  if (loading || !user) return null;

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  // Current list for the active tab
  const currentCats = catTab === 'expense' ? expenseCategories : incomeCategories;
  const otherCats = catTab === 'expense' ? incomeCategories : expenseCategories;

  async function handleSaveCat(cat: CustomCategory) {
    setCatSaving(true);
    try {
      const updated = currentCats.map(c => c.id === cat.id ? cat : c);
      const hasNew = !currentCats.some(c => c.id === cat.id);
      const newList = hasNew ? [...currentCats, cat] : updated;
      await saveAllCategoriesFn([...otherCats, ...newList]);
    } finally {
      setCatSaving(false);
      setEditingCat(null);
      setAddingCat(false);
    }
  }

  async function handleDeleteCat(id: string) {
    const newList = currentCats.filter(c => c.id !== id);
    if (newList.length === 0) return; // always keep at least one
    await saveAllCategoriesFn([...otherCats, ...newList]);
  }

  function openAddCat() {
    setEditingCat({
      id: `custom-${catTab}-${Date.now()}`,
      name: '',
      icon: catTab === 'income' ? '💰' : '💸',
      type: catTab,
    });
    setAddingCat(true);
  }

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark safe-top pb-28">
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Configuración</h1>
      </div>

      {/* Profile */}
      <div className="mx-5 card p-4 flex items-center gap-4 mb-6 shadow-sm">
        {user.photoURL ? (
          <Image src={user.photoURL} alt={user.name} width={56} height={56} className="w-14 h-14 rounded-full" />
        ) : (
          <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center">
            <span className="text-white text-xl font-bold">{getInitials(user.name)}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-neutral-900 dark:text-white truncate">{user.name}</p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">{user.email}</p>
        </div>
      </div>

      {/* Categories */}
      <div className="mx-5 mb-4">
        <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2 px-1">
          Categorías
        </p>
        <div className="card shadow-sm overflow-hidden">
          {/* Tab switcher */}
          <div className="flex bg-neutral-100 dark:bg-neutral-800 m-3 rounded-xl p-1">
            {(['expense', 'income'] as const).map(t => (
              <button
                key={t}
                onClick={() => { setCatTab(t); setEditingCat(null); setAddingCat(false); }}
                className={cn(
                  'flex-1 py-2 rounded-lg text-sm font-semibold transition-all',
                  catTab === t
                    ? 'bg-white dark:bg-neutral-700 shadow-sm text-neutral-900 dark:text-white'
                    : 'text-neutral-500 dark:text-neutral-400'
                )}
              >
                {t === 'expense' ? '↓ Gastos' : '↑ Ingresos'}
              </button>
            ))}
          </div>

          {/* Category list */}
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {currentCats.map(cat => (
              <div key={cat.id} className="flex items-center gap-3 px-4 py-3">
                {editingCat?.id === cat.id && !addingCat ? (
                  <CatEditRow
                    cat={editingCat}
                    onChange={setEditingCat}
                    onSave={() => handleSaveCat(editingCat)}
                    onCancel={() => setEditingCat(null)}
                    saving={catSaving}
                  />
                ) : (
                  <>
                    <div
                      className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: (CATEGORY_COLORS[cat.name] ?? '#8E8E93') + '25' }}
                    >
                      <span className="text-xl">{cat.icon}</span>
                    </div>
                    <span className="flex-1 font-semibold text-neutral-800 dark:text-neutral-200">{cat.name}</span>
                    <button
                      onClick={() => { setEditingCat(cat); setAddingCat(false); }}
                      className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    {currentCats.length > 1 && (
                      <button
                        onClick={() => handleDeleteCat(cat.id)}
                        className="p-2 rounded-xl bg-expense/10 text-expense"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </>
                )}
              </div>
            ))}

            {/* Add new category row */}
            {addingCat && editingCat ? (
              <div className="px-4 py-3">
                <CatEditRow
                  cat={editingCat}
                  onChange={setEditingCat}
                  onSave={() => handleSaveCat(editingCat)}
                  onCancel={() => { setEditingCat(null); setAddingCat(false); }}
                  saving={catSaving}
                  isNew
                />
              </div>
            ) : (
              <button
                onClick={openAddCat}
                className="w-full flex items-center gap-3 px-4 py-3 active:bg-neutral-50 dark:active:bg-neutral-800/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-[12px] bg-accent/10 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-accent" />
                </div>
                <span className="font-semibold text-accent">Agregar categoría</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Theme */}
      <div className="mx-5 mb-4">
        <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2 px-1">Apariencia</p>
        <div className="card overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-800 shadow-sm">
          {([
            { value: 'light', label: 'Claro', Icon: Sun, color: '#FFCC00', emoji: '☀️' },
            { value: 'dark', label: 'Oscuro', Icon: Moon, color: '#5856D6', emoji: '🌙' },
            { value: 'system', label: 'Sistema', Icon: Smartphone, color: '#007AFF', emoji: '📱' },
          ] as const).map(({ value, label, emoji, color }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-neutral-50 dark:active:bg-neutral-800/50 transition-colors"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: color + (theme === value ? 'ff' : '25') }}
              >
                <span className="text-lg leading-none">{emoji}</span>
              </div>
              <span className="flex-1 text-left font-semibold text-neutral-800 dark:text-neutral-200">{label}</span>
              {theme === value && (
                <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Other settings */}
      <div className="mx-5 mb-4">
        <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2 px-1">General</p>
        <div className="card overflow-hidden divide-y divide-neutral-100 dark:divide-neutral-800 shadow-sm">
          {[
            { label: 'Notificaciones', Icon: Bell, color: '#FF3B30', emoji: '🔔' },
            { label: 'Privacidad y seguridad', Icon: Shield, color: '#34C759', emoji: '🔒' },
            { label: 'Ayuda', Icon: HelpCircle, color: '#007AFF', emoji: '❓' },
            { label: 'Acerca de KashNubix', Icon: Info, color: '#5856D6', emoji: 'ℹ️' },
          ].map(({ label, color, emoji }) => (
            <button
              key={label}
              className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-neutral-50 dark:active:bg-neutral-800/50 transition-colors"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: color + '25' }}
              >
                <span className="text-lg leading-none">{emoji}</span>
              </div>
              <span className="flex-1 text-left font-semibold text-neutral-800 dark:text-neutral-200">{label}</span>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </button>
          ))}
        </div>
      </div>

      {/* Logout */}
      <div className="mx-5 mb-4">
        <button
          onClick={handleLogout}
          className="w-full card p-4 flex items-center gap-3 shadow-sm active:opacity-80 transition-opacity"
        >
          <div className="w-9 h-9 rounded-xl bg-expense/10 flex items-center justify-center">
            <LogOut className="w-4 h-4 text-expense" />
          </div>
          <span className="font-bold text-expense">Cerrar sesión</span>
        </button>
      </div>

      <p className="text-center text-xs text-neutral-400 dark:text-neutral-600 mt-6 pb-2">KashNubix v1.0.0</p>

      <BottomNav onAddClick={() => setShowAdd(true)} />
      <AddMovementModal open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}

// ─── Inline category edit row ─────────────────────────────────────────────────
function CatEditRow({
  cat, onChange, onSave, onCancel, saving, isNew = false,
}: {
  cat: CustomCategory;
  onChange: (c: CustomCategory) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  isNew?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 w-full">
      <input
        type="text"
        placeholder="Emoji"
        value={cat.icon}
        onChange={e => onChange({ ...cat, icon: e.target.value.trim().slice(0, 4) })}
        className="w-12 text-center text-xl bg-neutral-100 dark:bg-neutral-800 rounded-xl py-2 outline-none focus:ring-2 focus:ring-accent/30 dark:text-white"
      />
      <input
        type="text"
        placeholder={isNew ? 'Nombre de categoría' : 'Nombre'}
        value={cat.name}
        onChange={e => onChange({ ...cat, name: e.target.value })}
        className="flex-1 px-3 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-sm font-semibold dark:text-white outline-none focus:ring-2 focus:ring-accent/30"
      />
      <button
        onClick={onSave}
        disabled={saving || !cat.name.trim() || !cat.icon.trim()}
        className="p-2 rounded-xl bg-income/10 text-income disabled:opacity-40"
      >
        <Check className="w-4 h-4" />
      </button>
      <button onClick={onCancel} className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
