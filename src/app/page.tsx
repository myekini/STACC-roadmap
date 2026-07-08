'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, LogIn } from 'lucide-react';
import { useUserData } from '@/hooks/useUserData';
import HeroRail from '@/components/landing/HeroRail';
import { Button } from '@/components/ui/button';
import { StaccMark } from '@/components/brand/StaccMark';

export default function LandingPage() {
  const { isAuthenticated, signInWithDiscord, isSupabaseConnected, hasSelectedPath } = useUserData();
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (isSupabaseConnected && isAuthenticated) {
      router.push(hasSelectedPath ? '/dashboard' : '/paths');
    }
  }, [hasSelectedPath, isAuthenticated, isSupabaseConnected, router]);

  const handleGuestLogin = () => {
    router.push(hasSelectedPath ? '/dashboard' : '/paths');
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-on-background">
      <div className="pointer-events-none absolute inset-0 blueprint-grid opacity-60" />
      <div className="pointer-events-none absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-primary/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[30rem] w-[30rem] rounded-full bg-cyan/[0.07] blur-[130px]" />

      <div className="relative z-10 mx-auto grid min-h-screen max-w-6xl items-center gap-14 px-5 py-12 lg:grid-cols-2 lg:px-10">
        {/* Copy */}
        <motion.section
          className="max-w-xl"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-10 flex items-center gap-3">
            <StaccMark className="h-10 w-10" />
            <span className="font-code text-xl font-bold uppercase tracking-[0.14em]">Stacc</span>
          </div>

          <p className="micro-label text-cyan">{'// the data-career roadmap'}</p>

          <h1 className="mt-4 font-display text-4xl font-bold leading-[1.06] tracking-[-0.04em] text-on-surface sm:text-6xl">
            Know exactly what to learn next.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-on-surface-variant sm:text-lg">
            One visual roadmap for data careers: curated free resources, real tasks, and modules that unlock as you
            finish them. No course-hopping. No guessing.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" onClick={handleGuestLogin} className="shadow-[0_10px_30px_rgba(217,98,46,0.25)]">
              {hasSelectedPath ? 'Continue your roadmap' : 'Start your roadmap'}
              <ArrowRight />
            </Button>
            {isSupabaseConnected && (
              <Button size="lg" variant="outline" onClick={signInWithDiscord}>
                <LogIn />
                Sign in with Discord
              </Button>
            )}
          </div>

          <div className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-outline-variant pt-6">
            {[['5', 'career paths'], ['38', 'skill modules'], ['1', 'next step at a time']].map(([value, label]) => (
              <div key={label}>
                <div className="font-code text-xl font-bold text-on-surface">{value}</div>
                <div className="mt-1 font-code text-[10px] lowercase leading-4 text-on-surface-variant">{`// ${label}`}</div>
              </div>
            ))}
          </div>

          <p className="mt-6 font-code text-[10px] lowercase text-outline">
            {isSupabaseConnected ? '// progress syncs to your account' : '// guest progress is saved on this device'}
            {' · '}
            <Link href="/tree" className="text-cyan/80 underline-offset-2 hover:text-cyan hover:underline">
              browse the full tree →
            </Link>
          </p>
        </motion.section>

        {/* Live rail */}
        <motion.section
          initial={reduceMotion ? false : { opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
        >
          <HeroRail />
        </motion.section>
      </div>
    </main>
  );
}
