'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import BottomBar from './BottomBar';
import { useUserData } from '@/hooks/useUserData';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isLoading } = useUserData();

  // If we are on the landing/login page, render without navigation shells
  if (pathname === '/') {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-on-background flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-label-md text-sm text-on-surface-variant">Loading your mastery path...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-background font-body-md flex flex-col md:flex-row overflow-x-hidden">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:pl-64 min-h-screen">
        {/* Top Header */}
        <TopBar />

        {/* Page Content */}
        <main className="flex-1 pt-16 pb-24 md:pb-lg w-full max-w-container-max mx-auto px-md md:px-xl transition-all">
          {children}
        </main>

        {/* Mobile Bottom Bar */}
        <BottomBar />
      </div>
    </div>
  );
}
