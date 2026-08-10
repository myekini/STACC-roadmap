import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export function GET() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', background: '#0A1628' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, margin: 'auto', width: 124 }}>
        <div style={{ width: 74, height: 18, background: '#FFFFFF', borderRadius: 5 }} />
        <div style={{ width: 124, height: 18, background: '#FF6B35', borderRadius: 5 }} />
        <div style={{ width: 74, height: 18, background: '#FFFFFF', borderRadius: 5 }} />
      </div>
    </div>,
    { width: 192, height: 192, headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } },
  );
}
