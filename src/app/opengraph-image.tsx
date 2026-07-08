import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Stacc Roadmap — know exactly what to learn next';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const RAIL = [
  { name: 'FOUNDATIONS', state: 'done' },
  { name: 'ETL CONCEPTS', state: 'done' },
  { name: 'DATA MODELING', state: 'now' },
  { name: 'DBT', state: 'locked' },
];

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: 'linear-gradient(135deg, #050c18 0%, #0d1e35 100%)',
          color: '#e0e3e5',
          fontFamily: 'monospace',
          padding: 64,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, background: '#0A1628', borderRadius: 8, display: 'flex' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, margin: 'auto', width: 28 }}>
                <div style={{ display: 'flex', width: 20, height: 5, background: '#FFFFFF', borderRadius: 1 }} />
                <div style={{ display: 'flex', width: 28, height: 5, background: '#FF6B35', borderRadius: 1 }} />
                <div style={{ display: 'flex', width: 20, height: 5, background: '#FFFFFF', borderRadius: 1 }} />
              </div>
            </div>
            <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: 6 }}>STACC</div>
            <div style={{ fontSize: 20, color: '#8395ac', marginLeft: 8 }}>{'// roadmap'}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1, maxWidth: 620 }}>
              Know exactly what to learn next.
            </div>
            <div style={{ fontSize: 24, color: '#8395ac', maxWidth: 560 }}>
              The visual skill tree for data careers — 38 modules, curated free resources, real tasks.
            </div>
          </div>
          <div style={{ fontSize: 20, color: '#00d9ff' }}>app.getstacc.org</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, justifyContent: 'center' }}>
          {RAIL.map((row) => (
            <div
              key={row.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                border: row.state === 'now' ? '2px solid rgba(0,217,255,0.6)' : '2px solid rgba(42,53,71,1)',
                background: row.state === 'now' ? 'rgba(0,217,255,0.08)' : 'rgba(18,38,63,0.7)',
                padding: '18px 22px',
                width: 360,
                opacity: row.state === 'locked' ? 0.5 : 1,
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  display: 'flex',
                  background: row.state === 'done' ? '#10b981' : row.state === 'now' ? '#00d9ff' : '#2a3547',
                }}
              />
              <div style={{ fontSize: 22, letterSpacing: 3, color: row.state === 'now' ? '#00d9ff' : '#e0e3e5' }}>{row.name}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
