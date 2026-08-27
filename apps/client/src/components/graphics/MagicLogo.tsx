interface MagicLogoProps {
  className?: string;
  size?: 'sm' | 'lg';
}

export function MagicLogo({ className = '', size = 'lg' }: MagicLogoProps) {
  const h = size === 'lg' ? 88 : 52;

  return (
    <svg
      viewBox="0 0 220 120"
      height={h}
      className={className}
      aria-label="Space Towers"
    >
      <defs>
        <radialGradient id="orbGlow" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#dcffd4" />
          <stop offset="45%" stopColor="#2cff55" />
          <stop offset="100%" stopColor="#145a22" />
        </radialGradient>
        <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <ellipse cx="110" cy="58" rx="70" ry="36" fill="#1dff55" opacity="0.18" />
      <rect x="58" y="52" width="34" height="22" rx="3" fill="#5a5a5a" />
      <rect x="94" y="52" width="34" height="22" rx="3" fill="#626262" />
      <rect x="130" y="52" width="34" height="22" rx="3" fill="#5a5a5a" />
      <rect x="76" y="32" width="34" height="22" rx="3" fill="#6a6a6a" />
      <rect x="112" y="32" width="34" height="22" rx="3" fill="#5c5c5c" />
      <rect x="94" y="8" width="34" height="26" rx="4" fill="#4a4a4a" stroke="#2a2a2a" />
      <rect x="102" y="14" width="18" height="14" rx="2" fill="#111" />
      <circle cx="111" cy="21" r="6" fill="url(#orbGlow)" filter="url(#softGlow)" />
      <path d="M28 78 C48 62, 62 88, 78 74" fill="none" stroke="#2d8a28" strokeWidth="6" />
      <path d="M192 78 C172 62, 158 88, 142 74" fill="none" stroke="#2d8a28" strokeWidth="6" />
    </svg>
  );
}
