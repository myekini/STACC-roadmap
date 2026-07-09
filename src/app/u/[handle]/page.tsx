import type { Metadata } from 'next';
import PublicProfile from './PublicProfile';

/**
 * Public portfolio (spec: "the profile IS the portfolio"). Anyone can view a
 * member's shipped modules and evidence links — no auth. Data comes from the
 * anon-callable get_public_profile RPC (demo mode: local guest progress).
 */
export function generateMetadata({ params }: { params: { handle: string } }): Metadata {
  const handle = decodeURIComponent(params.handle);
  return {
    title: `@${handle} — shipped work`,
    description: `Modules and projects @${handle} has shipped on the Stacc roadmap.`,
  };
}

export default function PublicProfilePage({ params }: { params: { handle: string } }) {
  return <PublicProfile handle={decodeURIComponent(params.handle)} />;
}
