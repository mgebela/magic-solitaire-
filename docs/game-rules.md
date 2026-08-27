# Game Rules

## Overview

Three Towers Solitaire (TriPeaks) is a patience card game. Clear all 28 tableau cards before the stock runs out.

## Layout

Classic TriPeaks: three pyramids sharing a 10-card base.

```
        [0]         [1]         [2]
      [3] [4]     [5] [6]     [7] [8]
    [9][10][11] [12][13][14] [15][16][17]
  [18][19][20][21][22][23][24][25][26][27]
```

- **28 tableau cards** (3 + 6 + 9 face-down, 10 face-up)
- **24 cards** in the stock pile (waste starts empty)
- **52 cards** total (standard deck)

### Overlap Rules

- The bottom row of 10 cards is initially **uncovered** and playable.
- A card becomes uncovered when **both cards directly below it** are removed.
- Peak tops are blocked until the two cards beneath them are gone.

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
