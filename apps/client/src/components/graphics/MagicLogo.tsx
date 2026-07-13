interface MagicLogoProps {
  className?: string;
  size?: 'sm' | 'lg';
}

export function MagicLogo({ className = '', size = 'lg' }: MagicLogoProps) {
  const h = size === 'lg' ? 72 : 48;

  return (
    <svg
      viewBox="0 0 240 80"
      height={h}
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="towerGold" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f0d080" />
          <stop offset="100%" stopColor="#b8862e" />
        </linearGradient>
        <linearGradient id="feltGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1f7a4f" />
          <stop offset="100%" stopColor="#0f3d27" />
        </linearGradient>
      </defs>
      {/* Three tower peaks */}
      {[0, 80, 160].map((x) => (
        <g key={x} transform={`translate(${x}, 8)`}>
          <polygon points="40,4 56,28 24,28" fill="url(#towerGold)" opacity="0.95" />
          <polygon points="24,28 56,28 48,44 32,44" fill="url(#feltGlow)" stroke="#d4a843" strokeWidth="1.5" />
          <polygon points="16,44 64,44 56,60 24,60" fill="url(#feltGlow)" stroke="#d4a843" strokeWidth="1.5" />
        </g>
      ))}
      {/* Sparkles */}
      <circle cx="20" cy="18" r="2" fill="#fff8dc" opacity="0.8" />
      <circle cx="118" cy="12" r="2.5" fill="#fff8dc" opacity="0.9" />
      <circle cx="210" cy="20" r="2" fill="#fff8dc" opacity="0.7" />
    </svg>
  );
}
