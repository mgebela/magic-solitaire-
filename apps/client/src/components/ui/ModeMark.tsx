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

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function Mark({ children }: { children: ReactNode }) {
  return (
    <svg className="mode-mark" viewBox="0 0 32 32" aria-hidden>
      {children}
    </svg>
  );
}

export function ModeMark({ name }: { name: ModeMarkName }) {
  if (name === 'timed') {
    return (
      <Mark>
        <circle cx="16" cy="17" r="8.2" {...STROKE} />
        <path d="M16 12.4V17l3.2 2" {...STROKE} />
        <path d="M13.2 6.4h5.6M16 6.4V8.2" {...STROKE} />
      </Mark>
    );
  }

  if (name === 'relaxed') {
    return (
      <Mark>
        <path
          d="M16 25.4c0 0-7.4-4.8-7.4-11.6C8.6 9.2 12 7.2 16 10.2c4-3 7.4-1 7.4 3.6 0 6.8-7.4 11.6-7.4 11.6z"
          {...STROKE}
        />
        <path d="M16 23.6V12.2M16 18.2l-3.6-2.4M16 15.4l3.4-2.2" {...STROKE} />
      </Mark>
    );
  }

  if (name === 'classic') {
    return (
      <Mark>
        <path d="M6 23.5 11.2 13 16.4 23.5M12.8 23.5 16 12.2 19.2 23.5M15.6 23.5 21 13 26.2 23.5" {...STROKE} />
        <circle cx="11.2" cy="16.2" r="1.15" fill="currentColor" />
        <circle cx="16" cy="15.4" r="1.15" fill="currentColor" />
        <circle cx="21" cy="16.2" r="1.15" fill="currentColor" />
      </Mark>
    );
  }

  if (name === 'daily') {
    return (
      <Mark>
        <circle cx="16" cy="16" r="4.2" {...STROKE} />
        <path
          d="M16 5.8v2.6M16 23.6v2.6M5.8 16h2.6M23.6 16h2.6M8.7 8.7l1.8 1.8M21.5 21.5l1.8 1.8M23.3 8.7l-1.8 1.8M10.5 21.5l-1.8 1.8"
          {...STROKE}
        />
      </Mark>
    );
  }

  if (name === 'race') {
    return (
      <Mark>
        <circle cx="8.5" cy="16" r="2.3" {...STROKE} />
        <circle cx="15.2" cy="16" r="2.3" {...STROKE} />
        <path d="M20 16h7.2M23.6 12.4 27.4 16l-3.8 3.6" {...STROKE} />
      </Mark>
    );
  }

  if (name === 'duel') {
    return (
      <Mark>
        <path d="M5.5 16h8.2M9.6 12.2 5.5 16l4.1 3.8" {...STROKE} />
        <path d="M26.5 16h-8.2M22.4 12.2 26.5 16l-4.1 3.8" {...STROKE} />
      </Mark>
    );
  }

  if (name === 'puzzles') {
    return (
      <Mark>
        <path d="M16 6.2 18.4 13.2 25.8 16 18.4 18.8 16 25.8 13.6 18.8 6.2 16 13.6 13.2Z" {...STROKE} />
      </Mark>
    );
  }

  if (name === 'casual') {
    return (
      <Mark>
        <rect x="7" y="8.5" width="12" height="16" rx="2" {...STROKE} />
        <path d="M13 8.5V7.2A2 2 0 0 1 15 5.2h8.2A2 2 0 0 1 25.2 7.2V21a2 2 0 0 1-2 2H21" {...STROKE} />
      </Mark>
    );
  }

  return (
    <Mark>
      <path d="M8 22.5 16 7.5l8 15" {...STROKE} />
      <path d="M11.2 17.2h9.6" {...STROKE} />
    </Mark>
  );
}
