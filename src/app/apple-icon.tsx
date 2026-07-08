import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: '#0A1628', borderRadius: 34 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, margin: 'auto', width: 140 }}>
          <div style={{ display: 'flex', width: 79, height: 22, background: '#FFFFFF', borderRadius: 6 }} />
          <div style={{ display: 'flex', width: 140, height: 22, background: '#FF6B35', borderRadius: 6 }} />
          <div style={{ display: 'flex', width: 79, height: 22, background: '#FFFFFF', borderRadius: 6 }} />
        </div>
      </div>
    ),
    { ...size },
  );
}
