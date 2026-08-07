import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// Only allow same-origin relative paths for `next` — blocks open redirects
// via an absolute URL, a protocol-relative `//host`, or a `/\host` trick.
function sanitizeNext(rawNext: string | null): string {
  if (rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') && !rawNext.startsWith('/\\')) {
    return rawNext;
  }
  return '/roadmap';
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = sanitizeNext(searchParams.get('next'));

  if (!code) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  const supabase = createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('Auth code exchange error:', error.message);
    return NextResponse.redirect(`${origin}/?authError=${encodeURIComponent(error.message)}`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
