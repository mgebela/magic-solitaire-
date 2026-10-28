import type { ReactNode } from 'react';

export type ModeMarkName =
  | 'timed'
  | 'relaxed'
  | 'classic'
  | 'daily'
  | 'race'
  | 'duel'
  | 'puzzles'
  | 'casual'
  | 'ranked';

const LIMESTONE = ['#8d8d88', '#5a5a58', '#323230', '#161614'] as const;
const MOSS = ['#3f9a52', '#1f6a34', '#124826', '#0a2414'] as const;
const ORB = '#20ee52';
const GOLD = '#d6ef4a';

function Mark({ children }: { children: ReactNode }) {
  return (
    <svg className="mode-mark" viewBox="0 0 32 32" aria-hidden>
      {children}
    </svg>
  );
}

function Orb({
  cx,
  cy,
  r,
  color = ORB,
}: {
  cx: number;
  cy: number;
  r: number;
  color?: string;
}) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r * 1.7} fill={color} opacity="0.28" />
      <circle cx={cx} cy={cy} r={r} fill={color} />
      <circle cx={cx - r * 0.3} cy={cy - r * 0.32} r={r * 0.34} fill="#f4ffe8" />
    </g>
  );
}

/**
 * Top-down ziggurat, the same stepped stone and neon well as the peaks.
 */
function Tower({
  cx,
  cy,
  size,
  stones = LIMESTONE,
  orb = ORB,
}: {
  cx: number;
  cy: number;
  size: number;
  stones?: readonly [string, string, string, string];
  orb?: string;
}) {
  const scales = [1, 0.72, 0.48, 0.28];
  return (
    <g>
      {scales.map((scale, index) => {
        const w = size * scale;
        return (
          <rect
            key={stones[index]}
            x={cx - w / 2}
            y={cy - w / 2}
            width={w}
            height={w}
            rx={Math.max(0.8, w * 0.08)}
            fill={stones[index]}
            stroke="#141412"
            strokeWidth={0.6}
          />
        );
      })}
      <ellipse
        cx={cx - size * 0.54}
        cy={cy + size * 0.36}
        rx={size * 0.055}
        ry={size * 0.12}
        fill={orb}
      />
      <ellipse
        cx={cx + size * 0.54}
        cy={cy + size * 0.36}
        rx={size * 0.055}
        ry={size * 0.12}
        fill={orb}
      />
      <Orb cx={cx} cy={cy} r={size * 0.16} color={orb} />
    </g>
  );
}

function CardFace({
  x,
  y,
  rotate,
  suit,
}: {
  x: number;
  y: number;
  rotate: number;
  suit: string;
}) {
  return (
    <g transform={`rotate(${rotate} ${x + 6} ${y + 8})`}>
      <rect x={x} y={y} width="12" height="16" rx="1.5" fill="#fffdf8" />
      <rect x={x + 0.6} y={y + 0.6} width="10.8" height="14.8" rx="1.1" fill="none" stroke="#e4dece" strokeWidth="0.6" />
      <path d={suit} fill="#1c1c1c" transform={`translate(${x + 3.1} ${y + 4.2})`} />
    </g>
  );
}

const SPADE =
  'M2.9 0.4c1.6 1.5 2.9 3.2 2.9 4.6 0 1.5-1.1 2.4-2.5 2.4-.4 0-.7 0-1 .1.3.7.7 1.2 1.5 1.2h.2v.8H1.6v-.8h.2c.8 0 1.2-.5 1.5-1.2-.3-.1-.6-.1-1-.1C1.1 7.4 0 6.5 0 5 0 3.6 1.3 1.9 2.9.4z';

export function ModeMark({ name }: { name: ModeMarkName }) {
  if (name === 'timed') {
    return (
      <Mark>
        <Tower cx={16} cy={16} size={22} orb={GOLD} />
      </Mark>
    );
  }

  if (name === 'relaxed') {
    return (
      <Mark>
        <Tower cx={16} cy={16} size={22} stones={MOSS} />
      </Mark>
    );
  }

  if (name === 'classic') {
    return (
      <Mark>
        <Tower cx={7.6} cy={19.2} size={9} />
        <Tower cx={24.4} cy={19.2} size={9} />
        <Tower cx={16} cy={15.4} size={11.4} />
      </Mark>
    );
  }

  if (name === 'daily') {
    return (
      <Mark>
        <Tower cx={16} cy={16} size={24} />
      </Mark>
    );
  }

  if (name === 'race') {
    return (
      <Mark>
        <rect x="3" y="20.6" width="26" height="3.2" rx="1" fill="#3a3a38" />
        <Tower cx={9} cy={16.2} size={9.2} />
        <Tower cx={23} cy={15.2} size={10.4} orb={GOLD} />
      </Mark>
    );
  }

  if (name === 'duel') {
    return (
      <Mark>
        <Tower cx={9} cy={16.2} size={14} />
        <Tower cx={23} cy={16.2} size={14} orb={GOLD} />
      </Mark>
    );
  }

  if (name === 'puzzles') {
    return (
      <Mark>
        <path
          fill="#6a6a68"
          d="M7 11.5h5.2a2.4 2.4 0 1 1 4.8 0H25v5.4a2.4 2.4 0 1 1 0 4.8V25H7V11.5z"
        />
        <path fill="#9a9a94" opacity="0.4" d="M8.2 12.6h8" />
        <Orb cx={14.2} cy={19.4} r={2.3} />
      </Mark>
    );
  }

  if (name === 'casual') {
    return (
      <Mark>
        <CardFace x={4.2} y={8} rotate={-16} suit={SPADE} />
        <CardFace x={14.6} y={7.2} rotate={8} suit={SPADE} />
      </Mark>
    );
  }

  return (
    <Mark>
      <rect x="4" y="21" width="7.2" height="6" rx="0.8" fill="#454543" />
      <rect x="20.8" y="18.2" width="7.2" height="8.8" rx="0.8" fill="#5c5c5a" />
      <Tower cx={16} cy={15.6} size={12} orb={GOLD} />
    </Mark>
  );
}
