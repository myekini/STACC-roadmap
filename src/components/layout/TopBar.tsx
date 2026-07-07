'use client';

import { useUserData } from '@/hooks/useUserData';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, Route } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TopBar() {
  const { user, hasSelectedPath } = useUserData();
  const pathname = usePathname();

  const pageTitle = pathname === '/dashboard'
    ? 'Progress'
    : pathname === '/roadmap'
      ? 'Roadmap'
      : 'Explore paths';

  return (
    <header className="bg-surface-bright/90 backdrop-blur-xl border-b border-outline-variant fixed top-0 right-0 left-0 md:left-64 z-30 flex items-center justify-between px-4 md:px-6 h-16 dark:bg-background/90 dark:border-outline/30">
      <div className="flex min-w-0 items-center gap-3">
        <Link href="/roadmap" className="md:hidden flex items-center gap-2 font-code text-base font-bold uppercase tracking-[0.14em] text-on-surface">
          <Route className="h-5 w-5 text-primary" />
          <span>Stacc</span>
        </Link>
        <div className="hidden md:block min-w-0">
          <p className="micro-label text-outline">Workspace</p>
          <p className="truncate font-headline-md text-base font-semibold text-on-surface">{pageTitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        {hasSelectedPath && pathname !== '/roadmap' && (
          <Button asChild size="sm" className="hidden sm:inline-flex"><Link href="/roadmap">Continue learning<ArrowRight /></Link></Button>
        )}

        {/* User Profile Avatar */}
        <div className="hidden sm:flex h-8 w-8 rounded-none bg-surface-container-high border border-outline-variant overflow-hidden shrink-0 items-center justify-center">
          {user.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
          ) : (
            <span className="font-code text-[10px] font-bold uppercase text-on-surface-variant">
              {user.username.slice(0, 2)}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
