import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'nodejs';

function safeRoadmapReturn(value: string) {
  return value === '/roadmap' || value.startsWith('/roadmap/') ? value : '/roadmap';
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const pathId = url.searchParams.get('path') ?? '';
  const requestedReturn = url.searchParams.get('returnTo') ?? '/roadmap';
  const returnTo = safeRoadmapReturn(requestedReturn);
  const appSlug = process.env.GITHUB_APP_SLUG;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.redirect(new URL(`${returnTo}?githubError=GitHub+projects+are+available+in+the+live+app`, url.origin));
  }
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.redirect(new URL('/?authError=Sign+in+before+connecting+GitHub', url.origin));
  if (!appSlug) return NextResponse.redirect(new URL(`${returnTo}?githubError=GitHub+App+is+not+configured`, url.origin));
  if (!/^[a-z0-9-]+$/.test(pathId) || pathId === 'foundations') {
    return NextResponse.redirect(new URL('/roadmap?githubError=Invalid+specialization', url.origin));
  }

  const state = randomUUID();
  const response = NextResponse.redirect(`https://github.com/apps/${encodeURIComponent(appSlug)}/installations/new?state=${encodeURIComponent(state)}`);
  response.cookies.set('stacc_github_state', state, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 600, path: '/' });
  response.cookies.set('stacc_github_path', pathId, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 600, path: '/' });
  response.cookies.set('stacc_github_return', returnTo, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 600, path: '/' });
  return response;
}
