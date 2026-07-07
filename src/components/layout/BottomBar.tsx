'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChartNoAxesCombined, Compass, Route } from 'lucide-react';

export default function BottomBar() {
  const pathname = usePathname();

  const items = [
    { name: 'Roadmap', href: '/roadmap', icon: Route },
    { name: 'Progress', href: '/dashboard', icon: ChartNoAxesCombined },
    { name: 'Explore', href: '/paths', icon: Compass },
  ];

  return (
    <nav className="bg-surface-container-lowest/95 backdrop-blur-xl border-t border-outline-variant shadow-lg fixed bottom-0 left-0 w-full z-40 flex justify-around items-center h-16 pb-safe md:hidden dark:bg-background/95 dark:border-outline/30">
      {items.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`min-h-12 min-w-[88px] flex flex-col items-center justify-center px-4 py-1 rounded-xl transition-all ${
              isActive
                ? 'bg-primary-container text-on-primary-container scale-95 font-bold dark:bg-primary/20 dark:text-primary-fixed'
                : 'text-on-surface-variant hover:bg-surface-container dark:text-outline-variant'
            }`}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            <span className="micro-label mt-0.5">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
