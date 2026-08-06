'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUserData } from '@/hooks/useUserData';
import { ChartNoAxesCombined, Check, ChevronLeft, Compass, LogOut, Pencil, Route, ShieldCheck, UserRound, X } from 'lucide-react';
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
        className="flex h-6 w-6 items-center justify-center border border-outline-variant/60 text-outline hover:border-cyan/50 hover:text-cyan"
      >
        <Pencil className="h-3 w-3" />
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
  const { signOut, hasSelectedPath, isAdmin, user } = userData;
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

        <Separator className="bg-outline-variant/60 mt-auto" />
        <div className={cn('space-y-1 pt-4', sidebarCollapsed ? 'px-2.5' : 'px-4')}>
          {!sidebarCollapsed && (
            <div className="mb-2 border border-outline-variant/50 bg-surface-container-low/40 p-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Avatar className="h-7 w-7 rounded-none border border-outline-variant/70 shrink-0">
                    <AvatarImage src={user.avatar_url ?? undefined} alt={user.username} className="object-cover" />
                    <AvatarFallback className="rounded-none bg-surface-container-high font-code text-[9px] font-bold uppercase text-outline">
                      {user.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-code text-xs font-semibold text-on-surface">{user.username}</p>
                    <p className="font-code text-[9px] lowercase text-outline">{'// scholar'}</p>
                  </div>
                </div>
                <UserRenameButton renameUsername={userData.renameUsername} currentName={user.username} />
              </div>
            </div>
          )}
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
                  <LogOut className="h-5 w-5" />
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
              className="w-full justify-start gap-3 rounded-none px-4 py-2.5 font-code text-xs uppercase tracking-[0.06em] text-error hover:bg-error-container/20 hover:text-error"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          )}
        </div>

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
