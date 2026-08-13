import { AnimatedStaccMark } from '@/components/brand/AnimatedStaccMark';

/**
 * Clean Central Loader featuring animated Stacc mark loader
 */
export default function AppLoader() {
  return (
    <div
      className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6 text-on-background"
      role="status"
      aria-live="polite"
    >
      <div className="relative flex flex-col items-center">
        <div className="relative flex items-center justify-center p-4">
          <AnimatedStaccMark className="h-14 w-14" />
          <span className="absolute inset-0 rounded-2xl border border-cyan/20 animate-pulse pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
