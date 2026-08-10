import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export function GET() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', background: '#0A1628' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 36, margin: 'auto', width: 328 }}>
        <div style={{ width: 196, height: 48, background: '#FFFFFF', borderRadius: 13 }} />
        <div style={{ width: 328, height: 48, background: '#FF6B35', borderRadius: 13 }} />
        <div style={{ width: 196, height: 48, background: '#FFFFFF', borderRadius: 13 }} />
      </div>
    </div>,
    { width: 512, height: 512, headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } },
  );
}
