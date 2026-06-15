import { ImageResponse } from 'next/og';

/* Next.js serves this as /apple-icon and adds <link rel="apple-touch-icon"> */
export const size        = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
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
          borderRadius: 40,
        }}
      >
        <div style={{
          fontSize: 100,
          fontWeight: 900,
          color: '#ffffff',
          lineHeight: 1,
          display: 'flex',
        }}>
          ই
        </div>
      </div>
    ),
    { ...size }
  );
}
