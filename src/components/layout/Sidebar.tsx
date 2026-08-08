'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUserData } from '@/hooks/useUserData';
import { ChartNoAxesCombined, Compass, LogOut, PanelLeftClose, PanelLeftOpen, Route, Settings, ShieldCheck, UserRound } from 'lucide-react';
import { StaccMark } from '@/components/brand/StaccMark';
import { useUiStore } from '@/store/useUiStore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SIDEBAR_W, SIDEBAR_W_COLLAPSED } from '@/lib/layout';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const userData = useUserData();
  const { signOut, hasSelectedPath, isAdmin, user } = userData;
  const { sidebarCollapsed, toggleSidebar } = useUiStore();

  const navItems = [
    { name: 'Roadmap', href: '/roadmap', icon: Route },
    { name: 'Progress', href: '/dashboard', icon: ChartNoAxesCombined },
    { name: 'Explore paths', href: '/paths', icon: Compass },
    { name: 'Member settings', href: '/settings', icon: Settings },
    { name: 'Public portfolio', href: `/u/${encodeURIComponent(user.username)}`, icon: UserRound },
    ...(isAdmin ? [{ name: 'Admin', href: '/admin', icon: ShieldCheck }] : []),
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const itemClass = (isActive: boolean) =>
    cn(
      'flex items-center gap-3 py-2.5 transition-all border-l-2',
      sidebarCollapsed ? 'justify-center px-0' : 'px-3.5',
      isActive
        ? 'border-cyan bg-cyan/[0.1] text-cyan font-bold'
        : 'border-transparent text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface',
    );

  return (
    <TooltipProvider delayDuration={150}>
      <aside
        style={{ width: sidebarCollapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W }}
        className="fixed left-0 top-0 z-40 hidden h-full flex-col border-r border-cyan/15 bg-navy py-4 text-on-surface transition-[width] duration-200 md:flex"
      >
        {/* Brand Header with Integrated Collapse Toggle */}
        <div className={cn('mb-4 flex items-center justify-between px-4', sidebarCollapsed && 'flex-col gap-3 px-2')}>
          <div className="flex items-center gap-3 min-w-0">
            <StaccMark className="h-8 w-8 shrink-0" />
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <h2 className="font-display text-base font-bold uppercase tracking-wider text-on-surface">Stacc</h2>
                <p className="truncate text-[10px] text-on-surface-variant font-medium">
                  {hasSelectedPath ? 'Roadmap Tracker' : 'Career Tracker'}
                </p>
              </div>
            )}
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                className="h-8 w-8 rounded-none border border-outline-variant/60 text-on-surface-variant hover:border-cyan/50 hover:bg-cyan/10 hover:text-cyan transition-colors"
              >
                {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-surface-container-high font-code text-[11px] text-on-surface">
              {sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            </TooltipContent>
          </Tooltip>
        </div>

        <Separator className="bg-outline-variant/40 mb-3" />

        {/* Navigation */}
        <nav className={cn('flex-1 space-y-1', sidebarCollapsed ? 'px-2' : 'px-3')}>
          {!sidebarCollapsed && <p className="px-3 pb-1 micro-label text-outline">Workspace</p>}
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            const link = (
              <Link href={item.href} className={itemClass(isActive)}>
                <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-cyan' : 'text-on-surface-variant')} aria-hidden="true" />
                {!sidebarCollapsed && <span className="font-label-md text-xs">{item.name}</span>}
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

        {/* Bottom Section: Sign Out */}
        <div className={cn('mt-auto pt-3', sidebarCollapsed ? 'px-2' : 'px-3')}>
          <Separator className="bg-outline-variant/40 mb-3" />
          {sidebarCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSignOut}
                  aria-label="Sign out"
                  className="w-full rounded-none text-error hover:bg-error-container/20 hover:text-error"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-surface-container-high font-code text-[11px] text-on-surface">
                Sign out
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full justify-start gap-3 rounded-none px-3 py-2 font-code text-xs uppercase tracking-[0.06em] text-error hover:bg-error-container/20 hover:text-error"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}


