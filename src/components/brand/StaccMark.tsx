/**
 * The Stacc mark — self-contained (navy rounded square + white/orange bars),
 * from Stacc Brand Kit/favicons/favicon.svg. Drop-in replacement for the
 * generic icon-in-a-colored-square placeholders used before real brand
 * assets existed. Sizing via className (e.g. "h-9 w-9").
 */
export function StaccMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} role="img" aria-label="Stacc">
      <rect width="32" height="32" rx="6" fill="#0A1628" />
      <rect x="6" y="6" width="14" height="4" rx="1" fill="#FFFFFF" />
      <rect x="6" y="14" width="20" height="4" rx="1" fill="#FF6B35" />
      <rect x="6" y="22" width="14" height="4" rx="1" fill="#FFFFFF" />
    </svg>
  );
}
