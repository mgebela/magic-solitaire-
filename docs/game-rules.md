# Game Rules

## Overview

Three Towers Solitaire (TriPeaks) is a patience card game. Clear all 28 tableau cards before the stock runs out.

## Layout

Three pyramid peaks, each with 3 rows:

```
        [P1]              [P2]              [P3]
      [P1][P1]          [P2][P2]          [P3][P3]
    [P1][P1][P1]      [P2][P2][P2]      [P3][P3][P3]
```

- **6 cards per peak** × 3 peaks = **28 tableau cards**
- **24 cards** in the stock pile
- **52 cards** total (standard deck)

### Overlap Rules

- Bottom row cards (row 3) are initially **uncovered** and playable.
- A card becomes uncovered when **both cards directly below it** (in the row beneath) are removed.
- Top card of peak (row 1) is blocked by the two cards in row 2.

## Objective

Remove all 28 tableau cards to the foundation before the stock is exhausted.

## Move Rules

A tableau card may be played onto the waste pile if its rank is exactly **+1** or **-1** from the current waste card.

### Rank Connections

| From | Can play |
|------|----------|
| 7 | 6 or 8 |
| Ace | King or 2 |
| King | Queen or Ace |

### Drawing

If no valid move exists, draw one card from stock onto the waste pile.

If stock is empty and no valid move exists, the game is **lost**.

## Winning

All 28 tableau cards are cleared (moved to foundation) before stock runs out.

## Scoring (Milestone 7)

- Points for removing cards with combo multiplier
- Win bonuses: remaining stock, time (timed mode), perfect game, fast moves, no undo (+500 if undo never used)
- Leaderboards and personal bests per mode

## Undo & Hints (Milestone 12)

- Hints highlight the suggested card (or prompt a draw)
- Undo restores the previous board state in local/guest solo play
- Using undo forfeits the no-undo bonus

## Multiplayer (Milestone 8)

- Server generates a deck seed shared by all players in a room
- Each player races on an identical layout independently
- Winner: highest score (fastest time as tiebreaker)
- Every move validated server-side via `GameEngine`
