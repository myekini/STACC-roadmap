'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/roadmap';

    if (!code) {
      router.replace(next);
      return;
    }

    supabase.auth.exchangeCodeForSession(code).then(({ error: exchangeError }) => {
      if (exchangeError) {
        console.error('Auth code exchange error:', exchangeError.message);
        setError(exchangeError.message);
        return;
      }
      router.replace(next);
    });
  }, [router, searchParams]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-surface px-6 text-center">
      {error ? (
        <>
          <p className="micro-label text-orange">{'// sign-in failed'}</p>
          <p className="font-code text-xs text-on-surface-variant">{error}</p>
          <button
            onClick={() => router.replace('/')}
            className="mt-2 font-code text-xs uppercase text-cyan underline-offset-2 hover:underline"
          >
            back to home
          </button>
        </>
      ) : (
        <>
          <p className="micro-label text-cyan">{'// signing in'}</p>
          <p className="font-code text-xs text-on-surface-variant">Completing Discord sign-in…</p>
        </>
      )}
    </main>
  );
}
