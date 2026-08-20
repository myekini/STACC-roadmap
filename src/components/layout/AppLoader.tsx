'use client';

import { useEffect, useState } from 'react';
import { AnimatedStaccMark } from '@/components/brand/AnimatedStaccMark';

/**
 * Clean Central Loader featuring animated Stacc mark loader
 */
export default function AppLoader({ delay = 240 }: { delay?: number }) {
  const [visible, setVisible] = useState(delay === 0);

  useEffect(() => {
    if (delay === 0) return;
    const timer = window.setTimeout(() => setVisible(true), delay);
    return () => window.clearTimeout(timer);
  }, [delay]);

  if (!visible) return <div className="min-h-[100dvh] bg-background" aria-hidden="true" />;

  return (
    <div
      className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6 text-on-background"
      role="status"
      aria-live="polite"
    >
      <AnimatedStaccMark className="h-11 w-11" />
      <span className="sr-only">Loading Stacc</span>
    </div>
  );
}
