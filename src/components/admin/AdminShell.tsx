'use client';

/**
 * Admin app shell — adapted from the shadcn @efferd/dashboard-1 block's
 * Sidebar/Header composition, restyled to Stacc's Modern Technical Brutalism
 * (rounded-none, mono micro-labels, navy/cyan) and wired to real sections
 * instead of the block's placeholder nav.
 */
import Link from 'next/link';
import { AlertTriangle, LayoutGrid, LogOut, Route, ShieldCheck, Users } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export type AdminSection = 'overview' | 'members' | 'stuck' | 'modules';

const NAV: { id: AdminSection; label: string; icon: typeof LayoutGrid }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'stuck', label: 'Stuck Alerts', icon: AlertTriangle },
  { id: 'modules', label: 'Module Analytics', icon: ShieldCheck },
];

interface AdminShellProps {
  section: AdminSection;
  onSectionChange: (section: AdminSection) => void;
  stuckCount: number;
  username: string;
  onSignOut: () => void;
  children: React.ReactNode;
}

export function AdminShell({ section, onSectionChange, stuckCount, username, onSignOut, children }: AdminShellProps) {
  const activeLabel = NAV.find((n) => n.id === section)?.label ?? 'Overview';

  return (
    <SidebarProvider className="min-h-screen bg-background text-on-background">
      <Sidebar collapsible="offcanvas" className="border-r border-outline-variant">
        <SidebarHeader className="h-14 justify-center border-b border-outline-variant px-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center bg-primary text-white"><Route className="h-3.5 w-3.5" /></span>
            <span className="font-code text-sm font-bold uppercase tracking-[0.14em] text-on-surface">Stacc</span>
            <span className="font-code text-[10px] uppercase tracking-[0.1em] text-outline">/ admin</span>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2 py-3">
          <SidebarGroup>
            <SidebarGroupLabel className="micro-label px-2 text-outline">console</SidebarGroupLabel>
            <SidebarMenu>
              {NAV.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={section === item.id}
                    onClick={() => onSectionChange(item.id)}
                    className={cn(
                      'rounded-none font-code text-xs uppercase tracking-[0.06em] data-[active=true]:border data-[active=true]:border-cyan/40 data-[active=true]:bg-cyan/10 data-[active=true]:text-cyan',
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    {item.id === 'stuck' && stuckCount > 0 && (
                      <span className="ml-auto flex h-4 min-w-4 items-center justify-center border border-error/40 bg-error/10 px-1 font-code text-[9px] font-bold text-error">
                        {stuckCount}
                      </span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="gap-0 border-t border-outline-variant p-0">
          <SidebarMenu className="p-2">
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="rounded-none font-code text-xs uppercase tracking-[0.06em] text-on-surface-variant">
                <Link href="/roadmap"><Route className="h-4 w-4" /><span>Back to app</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <div className="flex items-center justify-between gap-2 border-t border-outline-variant p-3">
            <div className="min-w-0">
              <p className="truncate font-code text-[11px] font-semibold text-on-surface">{username}</p>
              <p className="micro-label text-outline">admin</p>
            </div>
            <button
              type="button"
              onClick={onSignOut}
              aria-label="Sign out"
              className="flex h-8 w-8 shrink-0 items-center justify-center border border-outline-variant text-on-surface-variant transition-colors hover:border-error/40 hover:text-error"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-outline-variant bg-background/95 px-4 backdrop-blur md:px-6">
          <SidebarTrigger className="md:hidden" />
          <Separator orientation="vertical" className="mr-1 h-4 md:hidden" />
          <p className="font-code text-[11px] uppercase tracking-[0.1em] text-outline">
            admin <span className="mx-1.5 text-outline-variant">/</span> <span className="text-on-surface">{activeLabel}</span>
          </p>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
