'use client';

import { motion, useReducedMotion } from 'framer-motion';

/**
 * Animated Stacc Mark — Signature loader featuring the 3 stacked bars
 * (white, orange, white) in a navy container with smooth staggered motion.
 */
export function AnimatedStaccMark({
  className = 'h-8 w-8',
}: {
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const barMotion = (delay: number) => reduceMotion ? undefined : {
    animate: { x: [0, 4, 0], opacity: [0.55, 1, 0.55] },
    transition: { duration: 1.1, repeat: Infinity, ease: 'easeInOut' as const, delay },
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} role="status" aria-label="Loading">
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className="h-full w-full"
      >
        {/* Container */}
        <rect width="32" height="32" rx="6" fill="#0A1628" />

        {/* Top bar (White) */}
        <motion.rect
          x="6"
          y="6"
          width="14"
          height="4"
          rx="1"
          fill="#FFFFFF"
          {...barMotion(0)}
        />

        {/* Middle bar (Orange Stacc Brand Accent) */}
        <motion.rect
          x="6"
          y="14"
          width="20"
          height="4"
          rx="1"
          fill="#FF6B35"
          {...barMotion(0.12)}
        />

        {/* Bottom bar (White) */}
        <motion.rect
          x="6"
          y="22"
          width="14"
          height="4"
          rx="1"
          fill="#FFFFFF"
          {...barMotion(0.24)}
        />
      </svg>
    </div>
  );
}

export default AnimatedStaccMark;
