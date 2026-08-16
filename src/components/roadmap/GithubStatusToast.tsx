'use client';

/** The GitHub install/setup routes redirect back with ?githubError= or
 * ?githubConnected=1 — nothing ever read those params, so a failed or
 * successful connection attempt was completely silent. Surfaces them as a
 * toast, then strips the param so a refresh/back-nav doesn't re-fire it. */
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export function GithubStatusToast() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const githubError = searchParams.get('githubError');
  const githubConnected = searchParams.get('githubConnected');

  useEffect(() => {
    if (!githubError && !githubConnected) return;

    if (githubError) toast.error(githubError);
    if (githubConnected) toast.success('GitHub repository connected.');

    const next = new URLSearchParams(searchParams.toString());
    next.delete('githubError');
    next.delete('githubConnected');
    const query = next.toString();
    router.replace(`${window.location.pathname}${query ? `?${query}` : ''}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [githubError, githubConnected]);

  return null;
}
