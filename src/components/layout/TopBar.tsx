'use client';

import { useUserData } from '@/hooks/useUserData';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, Flame, Settings, ShieldCheck, UserRound, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarBadge, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StaccMark } from '@/components/brand/StaccMark';
import { useUiStore } from '@/store/useUiStore';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { SignOutMenuItem } from '@/components/ui/sign-out-button';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Progress',
  '/roadmap': 'Roadmap',
  '/paths': 'Explore paths',
  '/settings': 'Member settings',
  '/admin': 'Admin',
};

export default function TopBar() {
  const userData = useUserData();
  const { user, hasSelectedPath, signOut, streak, progress, isAdmin } = userData;
  const pathname = usePathname();
  const { sidebarCollapsed } = useUiStore();

  const pageTitle = PAGE_TITLES[pathname] ?? 'Stacc';
  const completedCount = Object.keys(progress.completedNodes).length;

  return (
    <header
      className={cn(
        'fixed top-0 right-0 left-0 z-30 flex h-[calc(4rem+env(safe-area-inset-top))] items-center justify-between border-b border-cyan/15 bg-navy/90 px-4 pt-[env(safe-area-inset-top)] backdrop-blur-xl transition-[left] duration-200 md:h-16 md:px-6 md:pt-0',
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

      <div className="flex items-center gap-3">
        {hasSelectedPath && pathname !== '/roadmap' && (
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/roadmap">Continue learning<ArrowRight /></Link>
          </Button>
        )}

        <ThemeToggle />

        {/* User avatar dropdown menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="group flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label="User account menu"
            >
              <Avatar size="sm" className="group-hover:border-cyan group-hover:ring-cyan/15">
                <AvatarImage src={user.avatar_url ?? undefined} alt={user.username} className="object-cover" />
                <AvatarFallback className="text-xs">
                  {user.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
                <AvatarBadge aria-label="Online" />
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-64 rounded-overlay border border-cyan/30 bg-navy/95 p-2 font-code shadow-lg backdrop-blur-xl"
          >
            {/* Profile Info Header */}
            <div className="flex items-center gap-3 border-b border-outline-variant/50 p-2.5">
              <Avatar className="shrink-0 border-cyan/40 ring-cyan/10">
                <AvatarImage src={user.avatar_url ?? undefined} alt={user.username} className="object-cover" />
                <AvatarFallback className="text-xs">
                  {user.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
                <AvatarBadge aria-label="Online" />
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-on-surface">{user.username}</p>
                <p className="truncate text-xs text-outline font-medium">Member</p>
              </div>
            </div>

            {/* Quick Stats Banner */}
            <div className="my-2 grid grid-cols-2 gap-2 border border-outline-variant/40 bg-surface-container-low/60 p-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-tertiary">
                <Flame className="h-3.5 w-3.5 fill-tertiary" />
                <span>{streak}d streak</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold text-cyan justify-end">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{completedCount} done</span>
              </div>
            </div>

            <DropdownMenuSeparator className="bg-outline-variant/40" />

            {/* Actions */}
            <DropdownMenuItem asChild className="cursor-pointer rounded-none text-xs text-on-surface hover:bg-cyan/10 hover:text-cyan focus:bg-cyan/10 focus:text-cyan">
              <Link href={`/u/${encodeURIComponent(user.username)}`} className="flex items-center gap-2.5 py-2">
                <UserRound className="h-4 w-4 text-cyan" />
                <span>Public Portfolio</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild className="cursor-pointer rounded-none text-xs text-on-surface hover:bg-cyan/10 hover:text-cyan focus:bg-cyan/10 focus:text-cyan">
              <Link href="/settings" className="flex items-center gap-2.5 py-2">
                <Settings className="h-4 w-4 text-on-surface-variant" />
                <span>Member Settings</span>
              </Link>
            </DropdownMenuItem>

            {isAdmin && (
              <DropdownMenuItem asChild className="cursor-pointer rounded-none text-xs text-on-surface hover:bg-cyan/10 hover:text-cyan focus:bg-cyan/10 focus:text-cyan">
                <Link href="/admin" className="flex items-center gap-2.5 py-2">
                  <ShieldCheck className="h-4 w-4 text-warning" />
                  <span>Admin Console</span>
                </Link>
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator className="bg-outline-variant/40" />

            <SignOutMenuItem onSignOut={signOut} />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
