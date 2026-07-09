'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useUserData } from '@/hooks/useUserData';
import { ChartNoAxesCombined, ChevronLeft, Compass, LogOut, Route, ShieldCheck, UserRound } from 'lucide-react';
import { StaccMark } from '@/components/brand/StaccMark';
import { useUiStore } from '@/store/useUiStore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SIDEBAR_W, SIDEBAR_W_COLLAPSED } from '@/lib/layout';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut, hasSelectedPath, isAdmin, user } = useUserData();
  const { sidebarCollapsed, toggleSidebar } = useUiStore();

  const navItems = [
    { name: 'Roadmap', href: '/roadmap', icon: Route },
    { name: 'Progress', href: '/dashboard', icon: ChartNoAxesCombined },
    { name: 'Explore paths', href: '/paths', icon: Compass },
    // The public portfolio: shipped modules + evidence links, shareable with anyone.
    { name: 'Public profile', href: `/u/${encodeURIComponent(user.username)}`, icon: UserRound },
    ...(isAdmin ? [{ name: 'Admin', href: '/admin', icon: ShieldCheck }] : []),
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const itemClass = (isActive: boolean) =>
    cn(
      'flex items-center gap-3 py-3 transition-all',
      sidebarCollapsed ? 'justify-center px-0' : 'px-4',
      isActive
        ? 'bg-cyan/[0.07] text-cyan font-bold'
        : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface',
    );

  return (
    <TooltipProvider delayDuration={150}>
      <aside
        style={{ width: sidebarCollapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W }}
        className="fixed left-0 top-0 z-40 hidden h-full flex-col border-r border-cyan/15 bg-navy py-6 text-on-surface transition-[width] duration-200 md:flex"
      >
        <div className={cn('mb-8 flex items-center gap-3', sidebarCollapsed ? 'justify-center px-0' : 'px-lg')}>
          <StaccMark className="h-10 w-10 shrink-0" />
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <h2 className="font-code text-[19px] font-bold uppercase tracking-[0.14em] text-on-surface">Stacc</h2>
              <p className="mt-0.5 truncate font-code text-[11px] lowercase text-on-surface-variant">
                {hasSelectedPath ? '// roadmap tracker' : '// choose your first path'}
              </p>
            </div>
          )}
        </div>

        <nav className={cn('flex-1 space-y-1', sidebarCollapsed ? 'px-2.5' : 'px-4')}>
          {!sidebarCollapsed && <p className="px-4 pb-2 pt-1 micro-label text-outline">Workspace</p>}
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            const link = (
              <Link href={item.href} className={itemClass(isActive)}>
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                {!sidebarCollapsed && <span className="font-label-md text-label-md">{item.name}</span>}
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

        <div className={cn('mt-auto space-y-1 border-t border-outline-variant/60 pt-4', sidebarCollapsed ? 'px-2.5' : 'px-4')}>
          {sidebarCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleSignOut}
                  aria-label="Sign out"
                  className="flex w-full items-center justify-center py-3 text-error transition-colors hover:bg-error-container/20"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-surface-container-high font-code text-[11px] text-on-surface">
                Sign out
              </TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-error transition-colors hover:bg-error-container/20"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-label-md text-label-md">Sign Out</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute -right-3 top-9 flex h-6 w-6 items-center justify-center border border-outline-variant bg-surface-container-high text-on-surface-variant transition-colors hover:border-cyan/40 hover:text-cyan"
        >
          <ChevronLeft className={cn('h-3.5 w-3.5 transition-transform duration-200', sidebarCollapsed && 'rotate-180')} />
        </button>
      </aside>
    </TooltipProvider>
  );
}
