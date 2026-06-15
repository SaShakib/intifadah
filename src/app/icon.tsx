import { ImageResponse } from 'next/og';

/* Next.js serves this as /icon automatically and adds <link rel="icon"> */
export const size        = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function AppIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(145deg, #c01155 0%, #8b0840 55%, #2a0415 100%)',
          borderRadius: 96,
        }}
      >
        {/* Outer glow ring */}
        <div style={{
          position: 'absolute',
          inset: 24,
          borderRadius: 72,
          border: '3px solid rgba(255,255,255,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }} />

        {/* Bengali ই letter */}
        <div style={{
          fontSize: 280,
          fontWeight: 900,
          color: '#ffffff',
          lineHeight: 1,
          letterSpacing: '-0.02em',
          textShadow: '0 8px 32px rgba(0,0,0,0.4)',
          display: 'flex',
        }}>
          ই
        </div>

        {/* Bottom accent bar */}
        <div style={{
          position: 'absolute',
          bottom: 64,
          width: 96,
          height: 6,
          borderRadius: 3,
          background: 'rgba(255,255,255,0.5)',
          display: 'flex',
        }} />
      </div>
    ),
    { ...size }
  );
}
