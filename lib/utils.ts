import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getGreeting(): string {
  const h = new Date().getHours();
  if (h >= 0 && h < 12) return 'Buenos días';
  if (h >= 12 && h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

export function formatCurrency(amount: number, currency = 'MXN'): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function calcPercentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export const ACCOUNT_COLORS = [
  // Púrpuras / Índigos
  '#6366F1', '#8B5CF6', '#7C3AED', '#A855F7', '#9333EA',
  // Rosas / Rojos
  '#EC4899', '#F43F5E', '#EF4444', '#DC2626', '#BE185D',
  // Naranjas / Amarillos
  '#F59E0B', '#F97316', '#FB923C', '#EAB308', '#D97706',
  // Verdes
  '#10B981', '#22C55E', '#16A34A', '#14B8A6', '#0D9488',
  // Azules / Cielos
  '#3B82F6', '#2563EB', '#1D4ED8', '#0EA5E9', '#0284C7',
  // Neutros oscuros
  '#334155', '#475569', '#57534E', '#1E293B', '#18181B',
];

export const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  checking: 'Débito',
  savings: 'Ahorros',
  cash: 'Efectivo',
  investment: 'Inversión',
  credit: 'Crédito',
};

export const INCOME_CATEGORIES = [
  'Salario', 'Freelance', 'Inversión', 'Negocio', 'Regalo', 'Reembolso', 'Otros',
];

export const EXPENSE_CATEGORIES = [
  'Comida', 'Transporte', 'Entretenimiento', 'Salud', 'Ropa',
  'Servicios', 'Educación', 'Viajes', 'Hogar', 'Tecnología', 'Otros',
];

export const CATEGORY_ICONS: Record<string, string> = {
  Salario: '💼', Freelance: '💻', Inversión: '📈', Negocio: '🏢',
  Regalo: '🎁', Reembolso: '↩️', Comida: '🍔', Transporte: '🚗',
  Entretenimiento: '🎮', Salud: '🏥', Ropa: '👗', Servicios: '⚡',
  Educación: '📚', Viajes: '✈️', Hogar: '🏠', Tecnología: '📱', Otros: '📦',
  Traspaso: '↔️',
};

// iOS-style colors for each category
export const CATEGORY_COLORS: Record<string, string> = {
  Salario: '#34C759', Freelance: '#007AFF', Inversión: '#5856D6', Negocio: '#FF9500',
  Regalo: '#FF2D55', Reembolso: '#32ADE6',
  Comida: '#FF9500', Transporte: '#007AFF', Entretenimiento: '#AF52DE',
  Salud: '#FF3B30', Ropa: '#FF2D55', Servicios: '#FFCC00',
  Educación: '#34C759', Viajes: '#5AC8FA', Hogar: '#FF6B00',
  Tecnología: '#5856D6', Otros: '#8E8E93',
  Traspaso: '#636366',
};

// Default category objects (stable IDs for Firestore)
export const DEFAULT_EXPENSE_CATS = [
  { id: 'comida', name: 'Comida', icon: '🍔' },
  { id: 'transporte', name: 'Transporte', icon: '🚗' },
  { id: 'entretenimiento', name: 'Entretenimiento', icon: '🎮' },
  { id: 'salud', name: 'Salud', icon: '🏥' },
  { id: 'ropa', name: 'Ropa', icon: '👗' },
  { id: 'servicios', name: 'Servicios', icon: '⚡' },
  { id: 'educacion', name: 'Educación', icon: '📚' },
  { id: 'viajes', name: 'Viajes', icon: '✈️' },
  { id: 'hogar', name: 'Hogar', icon: '🏠' },
  { id: 'tecnologia', name: 'Tecnología', icon: '📱' },
  { id: 'otros-gasto', name: 'Otros', icon: '📦' },
];

export const DEFAULT_INCOME_CATS = [
  { id: 'salario', name: 'Salario', icon: '💼' },
  { id: 'freelance', name: 'Freelance', icon: '💻' },
  { id: 'inversion', name: 'Inversión', icon: '📈' },
  { id: 'negocio', name: 'Negocio', icon: '🏢' },
  { id: 'regalo', name: 'Regalo', icon: '🎁' },
  { id: 'reembolso', name: 'Reembolso', icon: '↩️' },
  { id: 'otros-ingreso', name: 'Otros', icon: '📦' },
];

export const DEFAULT_SHORTCUTS = [
  { label: 'Comida', icon: '🍔', type: 'expense' as const, category: 'Comida' },
  { label: 'Transporte', icon: '🚗', type: 'expense' as const, category: 'Transporte' },
  { label: 'Salario', icon: '💼', type: 'income' as const, category: 'Salario' },
  { label: 'Servicios', icon: '⚡', type: 'expense' as const, category: 'Servicios' },
  { label: 'Freelance', icon: '💻', type: 'income' as const, category: 'Freelance' },
  { label: 'Otros', icon: '📦', type: 'expense' as const, category: 'Otros' },
];

/** Returns the next calendar date for a given day-of-month */
export function nextDateForDay(day: number): Date {
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), day);
  if (thisMonth.getTime() > now.getTime()) return thisMonth;
  return new Date(now.getFullYear(), now.getMonth() + 1, day);
}

/** Days remaining until the next occurrence of a day-of-month */
export function daysUntil(day: number): number {
  const next = nextDateForDay(day);
  const diff = next.getTime() - Date.now();
  return Math.ceil(diff / 86_400_000);
}

// Build balance timeline from movements (for charts/sparklines)
export function buildBalanceHistory(
  currentBalance: number,
  movements: { date: number; type: string; amount: number }[],
): { date: number; balance: number }[] {
  const sorted = [...movements].sort((a, b) => a.date - b.date);
  if (sorted.length === 0) {
    const now = Date.now();
    return [
      { date: now - 30 * 86_400_000, balance: currentBalance },
      { date: now, balance: currentBalance },
    ];
  }
  // Compute what balance was before the first movement
  const totalNet = sorted.reduce(
    (s, m) => (m.type === 'income' ? s + m.amount : s - m.amount), 0
  );
  let bal = currentBalance - totalNet;
  const points: { date: number; balance: number }[] = [
    { date: sorted[0].date - 1000, balance: bal },
  ];
  for (const m of sorted) {
    bal = m.type === 'income' ? bal + m.amount : bal - m.amount;
    points.push({ date: m.date, balance: bal });
  }
  return points;
}
