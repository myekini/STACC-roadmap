'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import BottomBar from './BottomBar';
import { useUserData } from '@/hooks/useUserData';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isLoading } = useUserData();
  const isRoadmap = pathname === '/roadmap';

  // Landing, the public SEO tree, and admin (its own dedicated shell) render without the member app shell
  if (pathname === '/' || pathname === '/tree' || pathname === '/admin') {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-on-background flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-code text-xs uppercase tracking-[0.14em] text-on-surface-variant">{'// loading your roadmap'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-background font-body-md flex flex-col md:flex-row overflow-x-hidden">
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:pl-64 min-h-screen">
        <TopBar />

        <main className={`flex-1 pt-16 pb-24 md:pb-lg w-full transition-all ${
          isRoadmap ? 'max-w-none px-0 md:pb-0' : 'max-w-container-max mx-auto px-md md:px-xl'
        }`}>
          {children}
        </main>

        <BottomBar />
      </div>
    </div>
  );
}
