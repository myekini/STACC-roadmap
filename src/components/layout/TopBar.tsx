'use client';

import { useUserData } from '@/hooks/useUserData';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { StaccMark } from '@/components/brand/StaccMark';
import { useUiStore } from '@/store/useUiStore';
import { cn } from '@/lib/utils';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Progress',
  '/roadmap': 'Roadmap',
  '/paths': 'Explore paths',
  '/settings': 'Member settings',
  '/admin': 'Admin',
};

export default function TopBar() {
  const { user, hasSelectedPath } = useUserData();
  const pathname = usePathname();
  const { sidebarCollapsed, theme, toggleTheme } = useUiStore();

  const pageTitle = PAGE_TITLES[pathname] ?? 'Stacc';

  return (
    <header
      className={cn(
        'fixed top-0 right-0 left-0 z-30 flex h-16 items-center justify-between border-b border-cyan/15 bg-navy/90 px-4 backdrop-blur-xl transition-[left] duration-200 md:px-6',
        sidebarCollapsed ? 'md:left-[76px]' : 'md:left-64',
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {/* On desktop the Sidebar owns branding; only the mobile bar shows the logo */}
        <Link
          href="/roadmap"
          className="flex items-center gap-2 font-code text-base font-bold uppercase tracking-[0.14em] text-on-surface md:hidden"
        >
          <StaccMark className="h-6 w-6" />
          <span>Stacc</span>
        </Link>
        <p className="hidden truncate font-headline-md text-base font-semibold text-on-surface md:block">
          {pageTitle}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {hasSelectedPath && pathname !== '/roadmap' && (
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/roadmap">Continue learning<ArrowRight /></Link>
          </Button>
        )}

        {/* Theme toggle button */}
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className="h-8 w-8 rounded-none border-outline-variant bg-surface text-on-surface-variant hover:text-cyan"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-warning" /> : <Moon className="h-4 w-4 text-cyan" />}
        </Button>

        {/* User avatar — clickable link to /settings */}
        <Link href="/settings" title="Member Settings & Profile">
          <Avatar className="hidden sm:flex h-8 w-8 rounded-none border border-outline-variant hover:border-cyan transition-colors">
            <AvatarImage src={user.avatar_url ?? undefined} alt={user.username} className="object-cover" />
            <AvatarFallback className="rounded-none bg-surface-container-high font-code text-[10px] font-bold uppercase text-on-surface-variant">
              {user.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
}
