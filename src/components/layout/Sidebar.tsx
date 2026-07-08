'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useUserData } from '@/hooks/useUserData';
import { ChartNoAxesCombined, Compass, LogOut, Route, ShieldCheck } from 'lucide-react';
import { StaccMark } from '@/components/brand/StaccMark';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut, hasSelectedPath, isAdmin } = useUserData();

  const navItems = [
    { name: 'Roadmap', href: '/roadmap', icon: Route },
    { name: 'Progress', href: '/dashboard', icon: ChartNoAxesCombined },
    { name: 'Explore paths', href: '/paths', icon: Compass },
    ...(isAdmin ? [{ name: 'Admin', href: '/admin', icon: ShieldCheck }] : []),
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-full w-64 flex-col border-r border-cyan/15 bg-navy py-6 text-on-surface md:flex">
      <div className="px-lg mb-8">
        <div className="flex items-center gap-3 mb-2">
          <StaccMark className="h-10 w-10 shrink-0" />
          <div>
            <h2 className="font-code text-[19px] font-bold uppercase tracking-[0.14em] text-on-surface">Stacc</h2>
            <p className="font-code text-[11px] text-on-surface-variant mt-0.5 lowercase">
              {hasSelectedPath ? '// roadmap tracker' : '// choose your first path'}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        <p className="px-4 pb-2 pt-1 micro-label text-outline">
          Workspace
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-lg gap-3 transition-all ${
                isActive
                  ? 'bg-cyan/[0.07] text-cyan font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span className="font-label-md text-label-md">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto px-4 space-y-1 pt-4 border-t border-outline-variant mx-4 dark:border-outline/30">
        <button
          onClick={handleSignOut}
          className="w-full text-left text-error hover:bg-error-container/20 flex items-center px-4 py-3 rounded-lg gap-3 transition-colors font-label-md text-label-md"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
