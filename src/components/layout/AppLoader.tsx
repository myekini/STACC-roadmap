import { StaccMark } from '@/components/brand/StaccMark';

export default function AppLoader({ label = 'Loading your roadmap' }: { label?: string }) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6 text-on-background" role="status" aria-live="polite">
      <div className="relative">
        <StaccMark className="h-16 w-16" />
        <span className="absolute -inset-3 border border-cyan/20 pwa-loader-frame" aria-hidden="true" />
      </div>
      <p className="mt-7 font-code text-[11px] font-semibold uppercase tracking-[0.12em] text-on-surface">Stacc Roadmap</p>
      <div className="mt-4 h-0.5 w-36 overflow-hidden bg-surface-container-high" aria-hidden="true">
        <span className="block h-full w-1/2 bg-primary pwa-loader-bar" />
      </div>
      <p className="mt-3 text-xs text-on-surface-variant">{label}</p>
    </div>
  );
}
