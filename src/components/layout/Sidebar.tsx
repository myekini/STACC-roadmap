'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUserData } from '@/hooks/useUserData';
import { ChartNoAxesCombined, Compass, PanelLeftClose, PanelLeftOpen, Route, ShieldCheck } from 'lucide-react';
import { StaccMark } from '@/components/brand/StaccMark';
import { useUiStore } from '@/store/useUiStore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { SIDEBAR_W, SIDEBAR_W_COLLAPSED } from '@/lib/layout';
import { cn } from '@/lib/utils';
import { SignOutButton } from '@/components/ui/sign-out-button';

export default function Sidebar() {
  const pathname = usePathname();
  const userData = useUserData();
  const { signOut, hasSelectedPath, isAdmin, user } = userData;
  const { sidebarCollapsed, toggleSidebar } = useUiStore();

  const navItems = [
    { name: 'Roadmap', href: '/roadmap', icon: Route },
    { name: 'Progress', href: '/dashboard', icon: ChartNoAxesCombined },
    { name: 'Explore paths', href: '/paths', icon: Compass },
    ...(isAdmin ? [{ name: 'Admin', href: '/admin', icon: ShieldCheck }] : []),
  ];

  const itemClass = (isActive: boolean) =>
    cn(
      'relative flex min-h-11 items-center gap-3 rounded-xl border px-3 py-2.5 transition-[background-color,border-color,color,transform]',
      sidebarCollapsed ? 'justify-center px-0' : 'px-3.5',
      isActive
        ? 'border-cyan/35 bg-cyan/[0.09] text-cyan font-semibold'
        : 'border-transparent text-on-surface-variant hover:border-outline-variant hover:bg-surface-container-low hover:text-on-surface',
    );

  return (
    <TooltipProvider delayDuration={150}>
      <aside
        style={{ width: sidebarCollapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W }}
        className="fixed left-0 top-0 z-40 hidden h-full flex-col border-r border-outline-variant bg-surface px-3 py-3 text-on-surface shadow-[8px_0_28px_rgba(2,8,23,.08)] transition-[width] duration-300 ease-out md:flex"
      >
        {/* Brand Header with Integrated Collapse Toggle */}
        <div className={cn('mb-3 flex min-h-14 items-center justify-between rounded-2xl bg-surface-container-low px-3', sidebarCollapsed && 'flex-col justify-center gap-2 px-1 py-2')}>
          <Link href="/roadmap" className="flex min-w-0 items-center gap-3 transition-opacity hover:opacity-80">
            <StaccMark className="h-9 w-9 shrink-0" />
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <h2 className="font-display text-base font-bold tracking-tight text-on-surface">Stacc</h2>
                <p className="truncate text-xs font-medium text-on-surface-variant">
                  {hasSelectedPath ? 'Roadmap Tracker' : 'Career Tracker'}
                </p>
              </div>
            )}
          </Link>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                className="h-9 w-9 rounded-xl border border-transparent text-on-surface-variant transition-colors hover:border-cyan/35 hover:bg-cyan/10 hover:text-cyan"
              >
                {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-surface-container-high font-code text-[11px] text-on-surface">
              {sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Navigation */}
        <nav className={cn('flex-1 space-y-1.5 pt-2', sidebarCollapsed ? 'px-0' : 'px-1')}>
          {!sidebarCollapsed && <p className="px-3 pb-2 font-code text-[11px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">Workspace</p>}
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            const link = (
              <Link href={item.href} className={itemClass(isActive)}>
                <Icon className={cn('h-[18px] w-[18px] shrink-0', isActive ? 'text-cyan' : 'text-on-surface-variant')} aria-hidden="true" />
                {!sidebarCollapsed && <span className="text-sm">{item.name}</span>}
              </Link>
            );
            return sidebarCollapsed ? (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right" className="bg-surface-container-high font-code text-[11px] text-on-surface">
                  {item.name}
                </TooltipContent>
              </Tooltip>
            ) : (
              <div key={item.name}>{link}</div>
            );
          })}
        </nav>

        {/* Compact account controls */}
        <div className={cn('mt-auto rounded-2xl border border-outline-variant bg-surface-container-low p-1.5', sidebarCollapsed ? 'flex flex-col items-center gap-1' : 'flex items-center gap-2')}>
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-cyan/10 text-xs font-bold text-cyan" aria-hidden="true">
            {user.username.slice(0, 2).toUpperCase()}
          </span>
          {!sidebarCollapsed && (
            <div className="min-w-0 flex-1 py-1">
              <p className="truncate text-sm font-semibold leading-5 text-on-surface">{user.username}</p>
              <p className="truncate text-xs leading-4 text-on-surface-variant">Member</p>
            </div>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <SignOutButton
                onSignOut={signOut}
                compact
                className="size-9 min-h-9 shrink-0 rounded-xl text-on-surface-variant hover:bg-error-container/20 hover:text-error"
              />
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-surface-container-high font-code text-[11px] text-on-surface">
              Sign out
            </TooltipContent>
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}
