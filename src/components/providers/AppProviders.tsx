'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Toaster } from '@/components/ui/toast';
import { useUiStore } from '@/store/useUiStore';
import PwaRegistrar from './PwaRegistrar';

function ThemeSync() {
  const theme = useUiStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
    const themeMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    themeMeta?.setAttribute('content', theme === 'light' ? '#f8fafc' : '#0a1628');
  }, [theme]);

  return null;
}

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const theme = useUiStore((s) => s.theme);
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeSync />
      <PwaRegistrar />
      {children}
      <Toaster
        theme={theme}
        position="bottom-right"
        toastOptions={{
          unstyled: true,
          classNames: {
            toast:
              'flex items-start gap-3 w-[min(24rem,calc(100vw-2rem))] border bg-surface-card px-4 py-3.5 text-sm shadow-[0_12px_30px_rgba(2,8,23,0.22)] border-outline-variant',
            title: 'text-on-surface font-semibold',
            description: 'text-on-surface-variant mt-1 leading-5',
            success: '!border-secondary/40 [&_[data-icon]]:text-secondary',
            error: '!border-error/40 [&_[data-icon]]:text-error',
            closeButton: 'bg-surface-card border-outline-variant text-on-surface-variant',
          },
        }}
      />
    </QueryClientProvider>
  );
}
