import type { PuzzleStars } from '@three-towers/shared';

interface StarRatingProps {
  stars: PuzzleStars;
  size?: 'sm' | 'md';
}

export function StarRating({ stars, size = 'md' }: StarRatingProps) {
  const starSize = size === 'sm' ? 'text-base' : 'text-xl';

  return (
    <div className={`flex gap-0.5 ${starSize}`} aria-label={`${stars} out of 3 stars`}>
      {[1, 2, 3].map((value) => (
        <span
          key={value}
          className={value <= stars ? 'text-[var(--color-gold)]' : 'text-white/20'}
        >
          ★
        </span>
      ))}
    </div>
  );
}
