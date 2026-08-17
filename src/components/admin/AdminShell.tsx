'use client';

/**
 * Admin app shell composed from the free shadcn Sidebar and Button primitives,
 * restyled to Stacc's Modern Technical Brutalism and wired to real sections.
 */
import Link from 'next/link';
import { BookOpen, LayoutDashboard, LogOut, Route, ShieldCheck, Users } from 'lucide-react';
import { StaccMark } from '@/components/brand/StaccMark';
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
import { ThemeToggle } from '@/components/ui/theme-toggle';

export type AdminSection = 'overview' | 'members' | 'curriculum';

const NAV: { id: AdminSection; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'curriculum', label: 'Curriculum', icon: ShieldCheck },
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
            <StaccMark className="h-7 w-7 shrink-0" />
            <span className="font-code text-sm font-bold uppercase tracking-[0.14em] text-on-surface">Stacc</span>
            <span className="border-l border-outline-variant pl-2 font-code text-[10px] uppercase tracking-[0.1em] text-outline">Admin</span>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2 py-3">
          <SidebarGroup>
            <SidebarGroupLabel className="micro-label px-2 text-outline">Workspace</SidebarGroupLabel>
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
                    {item.id === 'members' && stuckCount > 0 && (
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
                <Link href="/roadmap"><BookOpen className="h-4 w-4" /><span>View all courses</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="rounded-none font-code text-xs uppercase tracking-[0.06em] text-on-surface-variant">
                <Link href="/dashboard"><Route className="h-4 w-4" /><span>Member dashboard</span></Link>
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
        <header className="sticky top-0 z-30 flex h-[calc(3.5rem+env(safe-area-inset-top))] shrink-0 items-center gap-3 border-b border-outline-variant bg-background/95 px-4 pt-[env(safe-area-inset-top)] backdrop-blur md:h-14 md:px-6 md:pt-0">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-semibold text-on-surface">{activeLabel}</h1>
            <p className="font-code text-[10px] text-outline">Stacc administration</p>
          </div>
          <ThemeToggle />
        </header>
        <div className="flex flex-1 flex-col gap-5 p-3 sm:p-4 md:gap-6 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
