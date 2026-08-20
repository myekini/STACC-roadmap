'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import BottomBar from './BottomBar';
import { useUserData } from '@/hooks/useUserData';
import { useUiStore } from '@/store/useUiStore';
import { cn } from '@/lib/utils';
import AppLoader from './AppLoader';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isLoading } = useUserData();
  const { sidebarCollapsed } = useUiStore();
  const isRoadmap = pathname === '/roadmap';
  const isNodeWorkspace = pathname?.startsWith('/roadmap/');

  // Landing, the public SEO tree, public portfolios, and admin (its own dedicated shell) render
  // without the member app shell. /auth/callback is a server Route Handler (no React render
  // there at all), so it never reaches this component.
  if (pathname === '/' || pathname === '/tree' || pathname === '/admin' || pathname.startsWith('/u/') || pathname.startsWith('/learn/')) {
    return <>{children}</>;
  }

  if (isLoading) {
    return <AppLoader />;
  }

  // Lesson workspaces own their complete viewport: breadcrumb, outline,
  // scroll region, and action footer. Nesting them inside the member shell
  // creates duplicate navigation and an unavoidable extra viewport of height.
  if (isNodeWorkspace) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background text-on-background font-body-md flex flex-col md:flex-row overflow-x-hidden">
      <Sidebar />

      {/* Main Container — left offset mirrors Sidebar's width (src/lib/layout.ts) */}
      <div
        className={cn(
          'flex-1 flex flex-col min-h-screen transition-[padding-left] duration-200',
          sidebarCollapsed ? 'md:pl-[76px]' : 'md:pl-64',
        )}
      >
        <TopBar />

        <main className={`flex-1 pt-[calc(4rem+env(safe-area-inset-top))] pb-[calc(5rem+env(safe-area-inset-bottom))] md:pt-16 md:pb-lg w-full transition-all ${
          isRoadmap ? 'max-w-none px-0 md:pb-0' : 'max-w-container-max mx-auto px-md md:px-xl'
        }`}>
          {children}
        </main>

        <BottomBar />
      </div>
    </div>
  );
}
