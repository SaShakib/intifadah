type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  initials: string;
  size?: AvatarSize;
  hue?: number;
  style?: React.CSSProperties;
  className?: string;
}

export function Avatar({ initials, size = 'md', hue, style, className = '' }: AvatarProps) {
  const sizeClass = size === 'lg' ? 'avatar-lg' : size === 'xl' ? 'avatar-xl' : '';

  const colorStyle = hue !== undefined ? {
    background: `oklch(92% 0.04 ${hue})`,
    color: `oklch(40% 0.12 ${hue})`,
    ...style,
  } : style;

  return (
    <div className={`avatar ${sizeClass} ${className}`} style={colorStyle}>
      {initials}
    </div>
  );
}
