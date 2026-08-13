'use client';

import { motion } from 'framer-motion';

/**
 * Animated Stacc Mark — Signature loader featuring the 3 stacked bars
 * (white, orange, white) in a navy container with smooth staggered motion.
 */
export function AnimatedStaccMark({
  className = 'h-8 w-8',
}: {
  className?: string;
}) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} role="status" aria-label="Loading">
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className="w-full h-full drop-shadow-[0_0_8px_rgba(255,107,53,0.3)]"
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
          animate={{
            width: ['14px', '20px', '14px'],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0,
          }}
        />

        {/* Middle bar (Orange Stacc Brand Accent) */}
        <motion.rect
          x="6"
          y="14"
          width="20"
          height="4"
          rx="1"
          fill="#FF6B35"
          animate={{
            width: ['20px', '12px', '20px'],
            opacity: [1, 0.6, 1],
          }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.2,
          }}
        />

        {/* Bottom bar (White) */}
        <motion.rect
          x="6"
          y="22"
          width="14"
          height="4"
          rx="1"
          fill="#FFFFFF"
          animate={{
            width: ['14px', '20px', '14px'],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.4,
          }}
        />
      </svg>
    </div>
  );
}

export default AnimatedStaccMark;
