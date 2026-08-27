import { Link } from 'react-router-dom';
import type { GameState } from '@three-towers/shared';
import { BOARD_ASPECT } from '../../renderer/layout-positions';
import { formatGameClock } from '../../lib/format-time';

interface MagicGameHudProps {
  state: GameState;
  onDraw: () => void;
  drawDisabled?: boolean;
  hintDraw?: boolean;
  onHint?: () => void;
  onUndo?: () => void;
  allowUndo?: boolean;
  canUndo?: boolean;
  roundCurrent?: number;
  roundTotal?: number;
  roundLabel?: string;
}

export function MagicGameHud({
  state,
  onDraw,
  drawDisabled,
  hintDraw,
  onHint,
  onUndo,
  allowUndo,
  canUndo,
  roundCurrent,
  roundTotal,
  roundLabel,
}: MagicGameHudProps) {
  const combo = state.combo || 0;
  const moves = state.moves.length;
  const timerDisplay =
    state.mode === 'relaxed' ? '∞' : formatGameClock(state.elapsedMs ?? 0);

  const showRound = roundLabel !== undefined && roundCurrent !== undefined && roundTotal !== undefined;

  return (
    <div className="stone-hud" style={{ aspectRatio: String(BOARD_ASPECT) }}>
      <div className="stone-hud__status">
        <span className="stone-hud__status-line">
          {timerDisplay} | {moves} {moves === 1 ? 'Move' : 'Moves'}
        </span>
        {allowUndo && onUndo && (
          <button
            type="button"
            className="stone-hud__undo"
            onClick={onUndo}
            disabled={!canUndo}
          >
            Undo
          </button>
        )}
      </div>

      <div className="stone-hud__vines stone-hud__vines--left" aria-hidden />
      <div className="stone-hud__vines stone-hud__vines--right" aria-hidden />

      <div className="stone-hud__platform">
        <div className="stone-hud__pit stone-hud__pit--score">
          <span className="stone-hud__pit-label">Score</span>
          <span className="stone-hud__pit-value">{state.score}</span>
        </div>

        <button
          type="button"
          className="stone-hud__draw-hit"
          onClick={onDraw}
          disabled={drawDisabled}
          aria-label={`Draw card, ${state.stock.length} remaining`}
        />

        <div className="stone-hud__center">
          <div className="stone-hud__combo-ring">
            <span>{combo}x</span>
          </div>
        </div>

        {showRound ? (
          <div className="stone-hud__pit stone-hud__pit--round">
            <span className="stone-hud__pit-label">{roundLabel}</span>
            <span className="stone-hud__pit-value">
              {roundCurrent}/{roundTotal}
            </span>
          </div>
        ) : (
          <div className="stone-hud__pit stone-hud__pit--round">
            <span className="stone-hud__pit-label">Stock</span>
            <span className="stone-hud__pit-value">{state.stock.length}</span>
          </div>
        )}

        <Link to="/" className="stone-hud__exit">
          Exit
        </Link>
      </div>

      {onHint && (
        <div className="stone-hud__extras">
          <button type="button" className="stone-hud__extra-btn" onClick={onHint}>
            Hint
          </button>
        </div>
      )}

      {hintDraw && <p className="stone-hud__hint">Draw from the stock pile</p>}
      {!state.waste && state.status === 'playing' && (
        <p className="stone-hud__hint stone-hud__hint--start">
          Tap any open card to start the waste pile
        </p>
      )}
    </div>
  );
}
