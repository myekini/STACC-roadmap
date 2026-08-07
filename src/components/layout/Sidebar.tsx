'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUserData } from '@/hooks/useUserData';
import { ChartNoAxesCombined, Check, ChevronLeft, Compass, Flame, LogOut, Pencil, Route, Settings, ShieldCheck, UserRound, X } from 'lucide-react';
import { StaccMark } from '@/components/brand/StaccMark';
import { useUiStore } from '@/store/useUiStore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { SIDEBAR_W, SIDEBAR_W_COLLAPSED } from '@/lib/layout';
import { cn } from '@/lib/utils';

function UserRenameButton({ renameUsername, currentName }: { renameUsername: (name: string) => Promise<string>; currentName: string }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(currentName);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSave = async () => {
    if (name.trim() === currentName) {
      setEditing(false);
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      await renameUsername(name.trim());
      setEditing(false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Rename failed');
    } finally {
      setBusy(false);
    }
  };

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => {
          setName(currentName);
          setErr(null);
          setEditing(true);
        }}
        title="Edit username"
        className="flex h-5 w-5 items-center justify-center border border-outline-variant/60 text-outline hover:border-cyan/50 hover:text-cyan"
      >
        <Pencil className="h-2.5 w-2.5" />
      </button>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={busy}
          className="h-6 w-24 border border-cyan/40 bg-surface px-1.5 font-code text-[10px] text-on-surface focus:outline-none"
        />
        <button
          type="button"
          disabled={busy}
          onClick={handleSave}
          title="Save username"
          className="flex h-6 w-6 items-center justify-center border border-cyan bg-cyan/10 text-cyan hover:bg-cyan/20"
        >
          <Check className="h-3 w-3" />
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => setEditing(false)}
          title="Cancel"
          className="flex h-6 w-6 items-center justify-center border border-outline-variant text-outline hover:text-on-surface"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
      {err && <p className="font-code text-[9px] text-error">{err}</p>}
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const userData = useUserData();
  const { signOut, hasSelectedPath, isAdmin, user, streak, progress } = userData;
  const { sidebarCollapsed, toggleSidebar } = useUiStore();

  const completedCount = Object.keys(progress.completedNodes).length;

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
        className="fixed left-0 top-0 z-40 hidden h-full flex-col border-r border-cyan/15 bg-navy py-5 text-on-surface transition-[width] duration-200 md:flex"
      >
        {/* Brand Header */}
        <div className={cn('mb-4 flex items-center gap-3', sidebarCollapsed ? 'justify-center px-0' : 'px-4')}>
          <StaccMark className="h-9 w-9 shrink-0" />
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <h2 className="font-display text-lg font-bold uppercase tracking-wider text-on-surface">Stacc</h2>
              <p className="truncate text-[11px] text-on-surface-variant font-medium">
                {hasSelectedPath ? 'Roadmap Tracker' : 'Career Tracker'}
              </p>
            </div>
          )}
        </div>

        {/* DataCamp-Style Top Identity & Progress Card */}
        {!sidebarCollapsed ? (
          <div className="mx-3 mb-5 border border-cyan/25 bg-surface-container-low/60 p-3 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <Link href="/settings" className="flex items-center gap-2.5 min-w-0 flex-1 group">
                <Avatar className="h-8 w-8 rounded-none border border-cyan/40 shrink-0 group-hover:border-cyan">
                  <AvatarImage src={user.avatar_url ?? undefined} alt={user.username} className="object-cover" />
                  <AvatarFallback className="rounded-none bg-surface-container-high text-[10px] font-bold uppercase text-cyan">
                    {user.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-on-surface group-hover:text-cyan transition-colors">
                    {user.username}
                  </p>
                  <p className="text-[10px] text-outline font-medium">Member</p>
                </div>
              </Link>
              <UserRenameButton renameUsername={userData.renameUsername} currentName={user.username} />
            </div>

            {/* Streak & XP Signal Badges */}
            <div className="mt-2.5 flex items-center justify-between border-t border-outline-variant/50 pt-2 font-code text-[10px]">
              <span className="inline-flex items-center gap-1 font-semibold text-tertiary">
                <Flame className="h-3.5 w-3.5 fill-tertiary text-tertiary" /> {streak}d streak
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-cyan">
                {completedCount} shipped
              </span>
            </div>
          </div>
        ) : (
          <div className="mb-4 flex justify-center px-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/settings">
                  <Avatar className="h-8 w-8 rounded-none border border-cyan/40">
                    <AvatarImage src={user.avatar_url ?? undefined} alt={user.username} className="object-cover" />
                    <AvatarFallback className="rounded-none bg-surface-container-high font-code text-[10px] font-bold uppercase text-cyan">
                      {user.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-surface-container-high font-code text-[11px] text-on-surface">
                {user.username} ({streak}d streak)
              </TooltipContent>
            </Tooltip>
          </div>
        )}

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

        {/* Sidebar Toggle Button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute -right-3 top-9 h-6 w-6 rounded-none border border-outline-variant bg-surface-container-high text-on-surface-variant hover:border-cyan/40 hover:text-cyan hover:bg-transparent"
        >
          <ChevronLeft className={cn('h-3.5 w-3.5 transition-transform duration-200', sidebarCollapsed && 'rotate-180')} />
        </Button>
      </aside>
    </TooltipProvider>
  );
}

