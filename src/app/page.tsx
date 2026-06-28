'use client';

import { useUserData } from '@/hooks/useUserData';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LandingPage() {
  const { isAuthenticated, signInWithDiscord, isSupabaseConnected } = useUserData();
  const router = useRouter();

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleGuestLogin = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col items-center justify-center relative px-4 overflow-hidden dark:bg-background">
      {/* Decorative background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/10 blur-[120px] pointer-events-none"></div>

      {/* Blueprint grid effect overlay */}
      <div className="absolute inset-0 blueprint-grid opacity-30 pointer-events-none"></div>

      <div className="max-w-md w-full text-center relative z-10 space-y-8">
        {/* Logo Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-container flex items-center justify-center shadow-lg dark:bg-primary/20 animate-bounce">
            <span className="material-symbols-outlined text-primary text-4xl icon-fill">school</span>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-on-background">
            Mastery <span className="text-primary dark:text-primary-fixed">Path</span>
          </h1>
          <p className="font-body-lg text-on-surface-variant text-sm sm:text-base max-w-sm mx-auto">
            Accelerate your learning in the data ecosystem with dynamic roadmaps and AI-driven tutoring.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-xl dark:bg-inverse-surface/10 dark:border-outline/30">
          <h2 className="font-headline-md text-lg font-semibold mb-4 text-on-surface">Get Started</h2>
          <div className="space-y-4">
            <button
              onClick={signInWithDiscord}
              className="w-full flex items-center justify-center gap-3 bg-[#5865F2] hover:bg-[#4752C4] text-white py-3 px-4 rounded-xl font-label-md text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              {/* Discord SVG Logo */}
              <svg className="w-5 h-5 fill-current" viewBox="0 0 127.14 96.36">
                <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5c.88-.65,1.72-1.34,2.51-2a75.58,75.58,0,0,0,73,0c.79.71,1.63,1.4,2.51,2a68.43,68.43,0,0,1-10.5,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31.06-18.83C129.8,48.24,124.05,25.43,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z"/>
              </svg>
              Sign in with Discord
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-outline-variant dark:border-outline/20"></div>
              <span className="flex-shrink mx-4 text-outline text-xs uppercase font-code">or</span>
              <div className="flex-grow border-t border-outline-variant dark:border-outline/20"></div>
            </div>

            <button
              onClick={handleGuestLogin}
              className="w-full flex items-center justify-center gap-2 bg-surface-container hover:bg-surface-container-high text-on-surface py-3 px-4 rounded-xl font-label-md text-sm transition-all border border-outline-variant dark:bg-inverse-surface/30 dark:border-outline/40 dark:hover:bg-inverse-surface/50"
            >
              <span className="material-symbols-outlined text-[18px]">person</span>
              Continue as Guest
            </button>
          </div>

          <p className="mt-4 text-[11px] text-outline">
            {!isSupabaseConnected 
              ? '💡 Running in Local Storage Mode (No setup required)'
              : '🔒 Secure login managed via Supabase Auth'
            }
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-3 gap-4 text-center mt-6">
          <div className="p-3">
            <span className="material-symbols-outlined text-primary text-2xl mb-1">account_tree</span>
            <h3 className="font-label-md text-xs font-semibold">5 Paths</h3>
          </div>
          <div className="p-3">
            <span className="material-symbols-outlined text-secondary text-2xl mb-1">smart_toy</span>
            <h3 className="font-label-md text-xs font-semibold">AI Tutor</h3>
          </div>
          <div className="p-3">
            <span className="material-symbols-outlined text-tertiary text-2xl mb-1">military_tech</span>
            <h3 className="font-label-md text-xs font-semibold">XP & Rank</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
