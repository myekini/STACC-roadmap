'use client';

import { useUserData } from '@/hooks/useUserData';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowRight, Flame, LogOut, Moon, Settings, ShieldCheck, Sun, UserRound, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
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
  const router = useRouter();
  const { sidebarCollapsed, theme, toggleTheme } = useUiStore();

  const pageTitle = PAGE_TITLES[pathname] ?? 'Stacc';
  const completedCount = Object.keys(progress.completedNodes).length;

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

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

      <div className="flex items-center gap-3">
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

        {/* User avatar dropdown menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="group flex items-center gap-2 rounded-none outline-none focus:ring-1 focus:ring-cyan"
              aria-label="User account menu"
            >
              <Avatar className="h-8 w-8 rounded-none border border-outline-variant transition-colors group-hover:border-cyan">
                <AvatarImage src={user.avatar_url ?? undefined} alt={user.username} className="object-cover" />
                <AvatarFallback className="rounded-none bg-surface-container-high font-code text-[10px] font-bold uppercase text-cyan">
                  {user.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-64 rounded-none border border-cyan/30 bg-navy/95 p-2 font-code shadow-2xl backdrop-blur-xl"
          >
            {/* Profile Info Header */}
            <div className="flex items-center gap-3 border-b border-outline-variant/50 p-2.5">
              <Avatar className="h-10 w-10 rounded-none border border-cyan/40 shrink-0">
                <AvatarImage src={user.avatar_url ?? undefined} alt={user.username} className="object-cover" />
                <AvatarFallback className="rounded-none bg-surface-container-high font-code text-xs font-bold uppercase text-cyan">
                  {user.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-on-surface">{user.username}</p>
                <p className="truncate text-[10px] text-outline font-medium">Member</p>
              </div>
            </div>

            {/* Quick Stats Banner */}
            <div className="my-2 grid grid-cols-2 gap-2 border border-outline-variant/40 bg-surface-container-low/60 p-2 text-[10px]">
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

            <DropdownMenuItem
              onClick={handleSignOut}
              className="cursor-pointer rounded-none text-xs text-error hover:bg-error-container/20 hover:text-error focus:bg-error-container/20 focus:text-error flex items-center gap-2.5 py-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

