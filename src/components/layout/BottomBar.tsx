'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChartNoAxesCombined, Compass, Route, Settings, UserRound } from 'lucide-react';
import { useUserData } from '@/hooks/useUserData';

export default function BottomBar() {
  const pathname = usePathname();
  const { user } = useUserData();

  const items = [
    { name: 'Roadmap', href: '/roadmap', icon: Route },
    { name: 'Progress', href: '/dashboard', icon: ChartNoAxesCombined },
    { name: 'Explore', href: '/paths', icon: Compass },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Portfolio', href: `/u/${encodeURIComponent(user.username)}`, icon: UserRound },
  ];

  return (
    <nav aria-label="Primary" className="fixed bottom-0 left-0 z-40 flex min-h-16 w-full items-start border-t border-cyan/15 bg-navy/95 pb-[env(safe-area-inset-bottom)] shadow-lg backdrop-blur-xl md:hidden">
      {items.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex min-h-16 min-w-0 flex-1 flex-col items-center justify-center px-1 py-1 transition-colors ${
              isActive
                ? 'bg-cyan/[0.1] text-cyan font-bold'
                : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            <span className="mt-1 max-w-full truncate font-code text-[9px] font-semibold">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
