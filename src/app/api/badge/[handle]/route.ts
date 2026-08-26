import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { localDateKey } from '@/lib/utils';
import type { PublicProfilePayload } from '@/lib/database.types';

export const runtime = 'nodejs';

/**
 * Embeddable SVG badge for a member's shipped progress — the same mechanism
 * as github-readme-stats/streak-stats (an <img src> a viewer's GitHub profile
 * README points at; the image is regenerated on every fetch). Public and
 * unauthenticated on purpose: it only surfaces what get_public_profile
 * already exposes anonymously for /u/[handle] — never XP/rank/role.
 */

const WIDTH = 480;
const HEIGHT = 168;

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]!));
}

// Same "consecutive active days ending today or yesterday" definition as
// useUserData's streak, applied to the same activity shape so the badge
// never disagrees with what the member sees on /dashboard.
function computeStreak(activity: Record<string, number>): number {
  let days = 0;
  const cursor = new Date();
  if (!activity[localDateKey(cursor)]) cursor.setDate(cursor.getDate() - 1);
  while (activity[localDateKey(cursor)]) {
    days += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return days;
}

function renderCard({ found, handle, payload, origin }: { found: boolean; handle: string; payload: PublicProfilePayload | null; origin: string }): string {
  const bg = '#0B1220';
  const surface = '#111A2B';
  const border = '#243247';
  const text = '#E8EDF5';
  const textMuted = '#8493AA';
  const cyan = '#38C1FF';
  const orange = '#FF8A4C';
  const font = "font-family='ui-monospace,SFMono-Regular,Menlo,Consolas,monospace'";

  if (!found || !payload) {
    return `<svg width="${WIDTH}" height="120" viewBox="0 0 ${WIDTH} 120" xmlns="http://www.w3.org/2000/svg">
      <rect width="${WIDTH}" height="120" fill="${bg}" stroke="${border}"/>
      <text x="20" y="48" ${font} font-size="11" font-weight="700" letter-spacing="2" fill="${orange}">STACC</text>
      <text x="20" y="76" ${font} font-size="14" fill="${text}">@${escapeXml(handle)} isn't on the roadmap yet</text>
      <text x="20" y="98" ${font} font-size="11" fill="${textMuted}">${escapeXml(origin)}</text>
    </svg>`;
  }

  const modulesShipped = payload.shipped.length;
  const artifacts = payload.shipped.reduce((sum, s) => sum + s.evidence.length, 0);
  const streak = computeStreak(payload.activity);
  const sortedShipped = [...payload.shipped].sort((a, b) => (b.completed_at ?? '').localeCompare(a.completed_at ?? ''));
  const currentPath = sortedShipped[0]?.path_title ?? 'Getting started';

  const stats: [string, string][] = [
    [String(modulesShipped), 'modules shipped'],
    [String(artifacts), 'artifacts'],
    [String(streak), 'day streak'],
  ];
  const colW = (WIDTH - 40) / 3;

  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(payload.profile.username)} on Stacc: ${modulesShipped} modules shipped">
    <rect width="${WIDTH}" height="${HEIGHT}" fill="${bg}" stroke="${border}"/>
    <rect x="0" y="0" width="4" height="${HEIGHT}" fill="${cyan}"/>

    <text x="20" y="30" ${font} font-size="10" font-weight="700" letter-spacing="2" fill="${orange}">STACC</text>
    <text x="${WIDTH - 20}" y="30" ${font} font-size="10" fill="${textMuted}" text-anchor="end">NOT LEARNING. JUST SHIPPING.</text>

    <text x="20" y="58" ${font} font-size="17" font-weight="700" fill="${text}">${escapeXml(payload.profile.username)}</text>
    <text x="20" y="76" ${font} font-size="11" fill="${cyan}">${escapeXml(currentPath)}</text>

    <line x1="20" y1="90" x2="${WIDTH - 20}" y2="90" stroke="${border}"/>

    ${stats.map(([n, label], i) => {
      const x = 20 + i * colW;
      return `
        <rect x="${x}" y="104" width="${colW - 10}" height="1" fill="${border}"/>
        <text x="${x}" y="132" ${font} font-size="24" font-weight="700" fill="${text}">${escapeXml(n)}</text>
        <text x="${x}" y="150" ${font} font-size="9" letter-spacing="0.5" fill="${textMuted}">${escapeXml(label.toUpperCase())}</text>
      `;
    }).join('')}

    <rect x="0" y="${HEIGHT - 1}" width="${WIDTH}" height="1" fill="${surface}"/>
  </svg>`;
}

export async function GET(request: Request, { params }: { params: { handle: string } }) {
  const handle = params.handle.replace(/\.svg$/i, '').trim();
  const origin = new URL(request.url).origin;

  if (!handle) {
    return new NextResponse('Missing handle', { status: 400 });
  }

  const supabase = createClient();
  const { data } = await supabase.rpc('get_public_profile', { p_handle: handle });
  const payload = (data as PublicProfilePayload | null) ?? null;

  const svg = renderCard({ found: Boolean(payload), handle, payload, origin: origin.replace(/^https?:\/\//, '') });

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      // GitHub proxies README images through camo, which respects this —
      // fresh enough to feel "live," cheap enough not to hammer Supabase
      // every time someone's profile page loads.
      'Cache-Control': 'public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
