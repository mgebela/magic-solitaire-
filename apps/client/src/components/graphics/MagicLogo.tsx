interface MagicLogoProps {
  className?: string;
  size?: 'sm' | 'lg' | 'hero';
}

export function MagicLogo({ className = '', size = 'lg' }: MagicLogoProps) {
  const h = size === 'hero' ? 200 : size === 'lg' ? 120 : 48;

  return (
    <svg
      viewBox="0 0 260 200"
      height={h}
      className={className}
      aria-label="Space Towers"
    >
      <defs>
        <radialGradient id="orbGlow" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#f4ffe8" />
          <stop offset="40%" stopColor="#2cff55" />
          <stop offset="100%" stopColor="#0a3d14" />
        </radialGradient>
        <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <ellipse cx="130" cy="88" rx="88" ry="52" fill="#1dff55" opacity="0.22" filter="url(#softGlow)" />
      <rect x="52" y="118" width="50" height="32" rx="3" fill="#b8b49a" stroke="#5a5648" />
      <rect x="105" y="118" width="50" height="32" rx="3" fill="#c4c0a8" stroke="#5a5648" />
      <rect x="158" y="118" width="50" height="32" rx="3" fill="#b0ac94" stroke="#5a5648" />
      <rect x="78" y="86" width="50" height="32" rx="3" fill="#c8c4ac" stroke="#5a5648" />
      <rect x="132" y="86" width="50" height="32" rx="3" fill="#b4b09a" stroke="#5a5648" />
      <rect x="105" y="44" width="50" height="42" rx="5" fill="#9a967e" stroke="#3a382c" />
      <rect x="116" y="54" width="28" height="22" rx="2" fill="#0a0a0a" />
      <circle cx="130" cy="65" r="9" fill="url(#orbGlow)" filter="url(#softGlow)" />
      <path d="M8 168 C48 120, 72 176, 108 150" fill="none" stroke="#2d9a32" strokeWidth="10" />
      <path d="M18 180 C58 140, 80 188, 118 162" fill="none" stroke="#1e6a22" strokeWidth="8" />
      <path d="M252 168 C212 120, 188 176, 152 150" fill="none" stroke="#2d9a32" strokeWidth="10" />
      <path d="M242 180 C202 140, 180 188, 142 162" fill="none" stroke="#1e6a22" strokeWidth="8" />
    </svg>
  );
}
