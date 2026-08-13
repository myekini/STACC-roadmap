import { AnimatedStaccMark } from '@/components/brand/AnimatedStaccMark';

export default function AppLoader({ label = 'Loading your roadmap...' }: { label?: string }) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-navy px-6 text-on-background" role="status" aria-live="polite">
      <div className="relative flex flex-col items-center">
        <div className="relative">
          <AnimatedStaccMark className="h-16 w-16" />
          <span className="absolute -inset-4 rounded-xl border border-cyan/30 animate-ping opacity-25" aria-hidden="true" />
        </div>
        <p className="mt-8 font-code text-[11px] font-bold uppercase tracking-[0.16em] text-cyan">Stacc Roadmap</p>
        <div className="mt-4 h-1 w-44 overflow-hidden rounded-full bg-slate-800" aria-hidden="true">
          <span className="block h-full w-1/2 rounded-full bg-gradient-to-r from-orange to-cyan pwa-loader-bar" />
        </div>
        <p className="mt-3 font-code text-xs text-on-surface-variant">{label}</p>
      </div>
    </div>
  );
}

