'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  onAddClick: () => void;
}

const NAV_ITEMS = [
  { href: '/home',     emoji: '🏠', label: 'Inicio',   color: '#007AFF' },
  { href: '/charts',   emoji: '📊', label: 'Gráficas', color: '#5856D6' },
  { href: '/accounts', emoji: '💳', label: 'Cuentas',  color: '#34C759' },
  { href: '/settings', emoji: '⚙️', label: 'Ajustes',  color: '#FF9500' },
];

export default function BottomNav({ onAddClick }: BottomNavProps) {
  const pathname = usePathname();

  return (
    /* Outer wrapper: full screen width, solid background — nothing bleeds through */
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
      {/* Inner content: centered, respects safe area */}
      <div className="max-w-md mx-auto px-2 pt-2 pb-safe flex items-center justify-around"
        style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}
      >
        {NAV_ITEMS.slice(0, 2).map(item => (
          <NavItem key={item.href} {...item} active={pathname === item.href} />
        ))}

        {/* Center Add Button */}
        <button onClick={onAddClick} className="flex flex-col items-center -mt-6">
          <div className="w-14 h-14 rounded-full bg-accent shadow-lg shadow-accent/40 flex items-center justify-center active:scale-95 transition-transform">
            <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[10px] mt-1 text-neutral-500 dark:text-neutral-400 font-medium">Agregar</span>
        </button>

        {NAV_ITEMS.slice(2).map(item => (
          <NavItem key={item.href} {...item} active={pathname === item.href} />
        ))}
      </div>
    </nav>
  );
}

function NavItem({ href, emoji, label, color, active }: {
  href: string; emoji: string; label: string; color: string; active: boolean;
}) {
  return (
    <Link href={href} className="flex flex-col items-center gap-1 px-3 py-1">
      <div
        className={cn(
          'w-10 h-10 rounded-[12px] flex items-center justify-center transition-all',
          active ? 'scale-105' : 'opacity-60'
        )}
        style={active ? { backgroundColor: color } : { backgroundColor: color + '22' }}
      >
        <span className="text-xl leading-none">{emoji}</span>
      </div>
      <span className={cn(
        'text-[10px] font-medium transition-colors',
        active ? 'text-neutral-900 dark:text-white' : 'text-neutral-400 dark:text-neutral-500'
      )}>
        {label}
      </span>
    </Link>
  );
}
