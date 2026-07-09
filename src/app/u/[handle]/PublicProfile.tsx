'use client';

/**
 * Client half of /u/[handle]. Connected mode: anon-callable get_public_profile
 * RPC (migration 0002). Demo mode: renders the local guest's progress for any
 * handle so the page is fully previewable offline.
 */
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ArrowUpRight, CalendarDays, Hourglass, Package, Rocket } from 'lucide-react';
import { hasSupabaseEnv, supabase } from '@/utils/supabase/client';
import { useUserData } from '@/hooks/useUserData';
import type { PublicProfilePayload } from '@/lib/database.types';
import { AppIcon } from '@/components/ui/app-icon';
import { Button } from '@/components/ui/button';
import { StaccMark } from '@/components/brand/StaccMark';

function useProfilePayload(handle: string) {
  const local = useUserData();

  const remote = useQuery<PublicProfilePayload | null>({
    queryKey: ['publicProfile', handle],
    enabled: hasSupabaseEnv,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_public_profile', { p_handle: handle });
      if (error) throw error;
      return (data as PublicProfilePayload | null) ?? null;
    },
  });

  if (hasSupabaseEnv) {
    return { payload: remote.data ?? null, isLoading: remote.isLoading, demo: false };
  }

  // Demo mode: assemble the same payload shape from local content + progress.
  const shipped: PublicProfilePayload['shipped'] = Object.entries(local.progress.completedNodes)
    .map(([nodeId, completedAt]) => {
      const node = local.nodes.find((n) => n.id === nodeId);
      if (!node) return null;
      const path = local.paths.find((p) => p.id === node.path_id);
      const evidence = local.tasks
        .filter((t) => t.node_id === node.id && local.progress.evidence[t.id])
        .map((t) => ({ description: t.description, url: local.progress.evidence[t.id] }));
      return {
        slug: node.slug,
        name: node.name,
        subtitle: node.subtitle,
        icon: node.icon,
        path_id: node.path_id,
        path_title: path?.title ?? node.path_id,
        est_hours: node.est_hours,
        completed_at: completedAt || null,
        evidence,
      };
    })
    .filter((s): s is NonNullable<typeof s> => s !== null)
    .sort((a, b) => (b.completed_at ?? '').localeCompare(a.completed_at ?? ''));

  const payload: PublicProfilePayload = {
    profile: { username: local.user.username, avatar_url: local.user.avatar_url, joined_at: '' },
    shipped,
    activity: local.activity,
  };
  return { payload, isLoading: local.isLoading, demo: true };
}

const fmtDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;

export default function PublicProfile({ handle }: { handle: string }) {
  const { payload, isLoading, demo } = useProfilePayload(handle);

  const shipped = payload?.shipped ?? [];
  const artifacts = shipped.reduce((sum, s) => sum + s.evidence.length, 0);
  const hours = shipped.reduce((sum, s) => sum + s.est_hours, 0);
  const byPath = shipped.reduce<Record<string, typeof shipped>>((acc, s) => {
    (acc[s.path_title] ??= []).push(s);
    return acc;
  }, {});

  return (
    <main className="relative min-h-screen bg-background text-on-background">
      <div className="pointer-events-none absolute inset-0 blueprint-grid opacity-40" aria-hidden />

      <div className="relative mx-auto max-w-3xl px-5 py-12 sm:px-8">
        <Link href="/" className="mb-10 inline-flex items-center gap-3">
          <StaccMark className="h-9 w-9" />
          <span className="font-code text-lg font-bold uppercase tracking-[0.14em] text-on-surface">Stacc</span>
        </Link>

        {isLoading ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-24 animate-pulse border border-outline-variant/40 bg-surface/50" />
            ))}
          </div>
        ) : !payload ? (
          <div className="border border-outline-variant bg-surface/70 p-10 text-center">
            <p className="micro-label text-outline">404 // no such member</p>
            <h1 className="mt-2 font-display text-2xl font-bold text-on-surface">@{handle} isn&apos;t on the roadmap</h1>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">Check the handle, or claim it by joining.</p>
            <Button asChild className="mt-6"><Link href="/">Start your roadmap <ArrowRight /></Link></Button>
          </div>
        ) : (
          <>
            {/* Identity */}
            <header className="border border-outline-variant bg-surface/80 p-6 sm:p-8">
              <p className="micro-label text-cyan">{`// member profile · public${demo ? ' · demo mode' : ''}`}</p>
              <div className="mt-4 flex items-center gap-4">
                {payload.profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={payload.profile.avatar_url} alt="" className="h-16 w-16 border border-outline-variant object-cover" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center border border-cyan/30 bg-cyan/10 font-display text-2xl font-bold text-cyan">
                    {payload.profile.username.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <h1 className="truncate font-display text-3xl font-bold tracking-[-0.02em] text-on-surface">
                    {payload.profile.username}
                  </h1>
                  {fmtDate(payload.profile.joined_at) && (
                    <p className="mt-1 flex items-center gap-1.5 font-code text-[11px] text-on-surface-variant">
                      <CalendarDays className="h-3 w-3 text-outline" /> shipping since {fmtDate(payload.profile.joined_at)}
                    </p>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="mt-6 grid grid-cols-3 divide-x divide-outline-variant border border-outline-variant">
                {[
                  { icon: Package, label: 'modules shipped', value: shipped.length },
                  { icon: Rocket, label: 'artifacts', value: artifacts },
                  { icon: Hourglass, label: 'hours invested', value: `~${hours}` },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="p-4 text-center">
                    <p className="flex items-center justify-center gap-1.5 font-display text-xl font-bold text-on-surface">
                      <Icon className="h-4 w-4 text-cyan" />{value}
                    </p>
                    <p className="micro-label mt-1 text-outline">{label}</p>
                  </div>
                ))}
              </div>
            </header>

            {/* Shipped work */}
            {shipped.length === 0 ? (
              <div className="mt-8 border border-outline-variant bg-surface/70 p-8 text-center">
                <p className="micro-label text-outline">{'// nothing shipped yet'}</p>
                <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                  The tree is waiting. First module shipped shows up here.
                </p>
              </div>
            ) : (
              <div className="mt-8 space-y-8">
                {Object.entries(byPath).map(([pathTitle, items]) => (
                  <section key={pathTitle}>
                    <div className="flex items-baseline justify-between border-b border-outline-variant pb-2">
                      <h2 className="font-display text-base font-bold uppercase tracking-wide text-on-surface">{pathTitle}</h2>
                      <span className="font-code text-[10px] text-outline">{items.length} shipped</span>
                    </div>
                    <ul className="mt-3 space-y-2">
                      {items.map((item) => (
                        <li key={item.slug} className="border border-outline-variant/70 bg-surface/70 p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-secondary/35 bg-secondary/10 text-secondary">
                              <AppIcon name={item.icon} className="h-[18px] w-[18px]" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                                <h3 className="text-sm font-semibold text-on-surface">{item.name}</h3>
                                {fmtDate(item.completed_at) && (
                                  <span className="font-code text-[10px] text-outline">{fmtDate(item.completed_at)}</span>
                                )}
                              </div>
                              <p className="font-code text-[10px] lowercase text-on-surface-variant">{`// ${item.subtitle}`}</p>
                              {item.evidence.length > 0 && (
                                <div className="mt-2.5 flex flex-wrap gap-1.5">
                                  {item.evidence.map((e) => (
                                    <a
                                      key={e.url}
                                      href={e.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="group inline-flex max-w-full items-center gap-1.5 border border-cyan/25 bg-cyan/[0.05] px-2 py-1 font-code text-[10px] text-cyan transition-colors hover:border-cyan/50"
                                    >
                                      <Rocket className="h-3 w-3 shrink-0" />
                                      <span className="max-w-[260px] truncate">{e.url.replace(/^https?:\/\//i, '')}</span>
                                      <ArrowUpRight className="h-3 w-3 shrink-0 opacity-60 group-hover:opacity-100" />
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            )}

            <footer className="mt-12 border border-cyan/25 bg-cyan/[0.05] p-6 text-center">
              <p className="font-display text-lg font-bold text-on-surface">Proof beats promises.</p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-on-surface-variant">
                Every link above is something this member actually built. Start your own tree and ship yours.
              </p>
              <Button asChild className="mt-5"><Link href="/">Start shipping <ArrowRight /></Link></Button>
            </footer>
          </>
        )}
      </div>
    </main>
  );
}
