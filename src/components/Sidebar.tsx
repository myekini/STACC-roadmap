'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUserData } from '@/hooks/useUserData';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useUserData();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { name: 'Roadmap', href: '/roadmap', icon: 'account_tree', fill: true },
    { name: 'Paths', href: '/paths', icon: 'insights' },
    { name: 'Community', href: '#', icon: 'groups' },
    { name: 'Settings', href: '#', icon: 'person' },
  ];

  return (
    <aside className="bg-surface-container-lowest text-on-surface docked left-0 h-full w-64 hidden md:flex flex-col border-r border-outline-variant fixed left-0 top-0 z-40 py-lg dark:bg-inverse-surface/10">
      <div className="px-lg mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center shrink-0 dark:bg-primary/20">
            <span className="material-symbols-outlined text-primary icon-fill text-2xl">school</span>
          </div>
          <div>
            <h2 className="font-headline-md text-[20px] font-bold text-primary dark:text-primary-fixed">Mastery Path</h2>
            <p className="font-label-md text-xs text-on-surface-variant mt-0.5">
              Rank: {user.rank} • {user.xp.toLocaleString()} XP
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-lg gap-3 transition-all ${
                isActive
                  ? 'text-primary font-bold border-r-4 border-primary bg-surface-container-low dark:bg-primary/10 dark:text-primary-fixed'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary dark:hover:bg-inverse-surface/20 dark:text-outline-variant dark:hover:text-primary-fixed'
              }`}
            >
              <span className={`material-symbols-outlined ${item.fill || isActive ? 'icon-fill' : ''}`}>
                {item.icon}
              </span>
              <span className="font-label-md text-label-md">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-4 space-y-1 pt-4 border-t border-outline-variant mx-4 dark:border-outline/30">
        <Link href="/dashboard" className="block w-full mb-1">
          <button className="w-full py-2 border border-outline-variant rounded-lg font-label-md text-label-md text-primary hover:bg-surface-container transition-colors dark:border-outline dark:text-primary-fixed dark:hover:bg-inverse-surface/30">
            View Profile
          </button>
        </Link>
        <a
          href="#"
          className="text-on-surface-variant hover:bg-surface-container-high hover:text-primary flex items-center px-4 py-3 rounded-lg gap-3 transition-colors font-label-md text-label-md dark:text-outline-variant dark:hover:bg-inverse-surface/20"
        >
          <span className="material-symbols-outlined">help</span>
          Help
        </a>
        <button
          onClick={() => signOut()}
          className="w-full text-left text-error hover:bg-error-container/20 flex items-center px-4 py-3 rounded-lg gap-3 transition-colors font-label-md text-label-md"
        >
          <span className="material-symbols-outlined">logout</span>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
