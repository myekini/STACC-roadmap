'use client';

import { useUserData } from '@/hooks/useUserData';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StaccMark } from '@/components/brand/StaccMark';
import { useUiStore } from '@/store/useUiStore';
import { cn } from '@/lib/utils';

export default function TopBar() {
  const { user, hasSelectedPath } = useUserData();
  const pathname = usePathname();
  const { sidebarCollapsed } = useUiStore();

  const pageTitle = pathname === '/dashboard'
    ? 'Progress'
    : pathname === '/roadmap'
      ? 'Roadmap'
      : 'Explore paths';

  return (
    <header
      className={cn(
        'fixed top-0 right-0 left-0 z-30 flex h-16 items-center justify-between border-b border-cyan/15 bg-navy/90 px-4 backdrop-blur-xl transition-[left] duration-200 md:px-6',
        sidebarCollapsed ? 'md:left-[76px]' : 'md:left-64',
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {/* On desktop the Sidebar owns branding; only the mobile bar (no sidebar) shows the logo. */}
        <Link href="/roadmap" className="flex items-center gap-2 font-code text-base font-bold uppercase tracking-[0.14em] text-on-surface md:hidden">
          <StaccMark className="h-6 w-6" />
          <span>Stacc</span>
        </Link>
        <p className="hidden truncate font-headline-md text-base font-semibold text-on-surface md:block">{pageTitle}</p>
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
