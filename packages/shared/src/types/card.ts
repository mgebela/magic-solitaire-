export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

export type Rank =
  | 'ace'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'jack'
  | 'queen'
  | 'king';

/** Numeric rank value used for move validation (Ace = 1, King = 13). */
export type RankValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  value: RankValue;
}

export type CardId = Card['id'];
