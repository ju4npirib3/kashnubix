'use client';

import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { getGreeting, getInitials } from '@/lib/utils';

export default function Header() {
  const { user } = useAuth();
  if (!user) return null;

  const firstName = user.name.split(' ').slice(0, 2).join(' ');

  return (
    <div className="flex items-center justify-between px-5 pt-5 pb-3">
      {/* Left: greeting + name */}
      <div className="flex flex-col gap-0.5">
        <p className="text-xs font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-widest leading-none">
          {getGreeting()}
        </p>
        <p className="text-2xl font-black text-neutral-900 dark:text-white leading-tight tracking-tight">
          {firstName}
        </p>
      </div>

      {/* Right: avatar */}
      {user.photoURL ? (
        <Image
          src={user.photoURL}
          alt={user.name}
          width={40}
          height={40}
          className="w-10 h-10 rounded-full object-cover"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
          <span className="text-white font-bold text-sm">{getInitials(user.name)}</span>
        </div>
      )}
    </div>
  );
}
