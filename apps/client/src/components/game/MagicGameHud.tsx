import { Link } from 'react-router-dom';
import type { GameState } from '@three-towers/shared';
import { BOARD_ASPECT } from '../../renderer/layout-positions';

interface MagicGameHudProps {
  state: GameState;
  onDraw: () => void;
  drawDisabled?: boolean;
  hintDraw?: boolean;
  onHint?: () => void;
  onUndo?: () => void;
  allowUndo?: boolean;
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
  roundCurrent = 1,
  roundTotal = 10,
  roundLabel = 'Round',
}: MagicGameHudProps) {
  const combo = state.combo || 0;
  const seconds = Math.max(0, Math.floor((state.elapsedMs ?? 0) / 1000));
  const timerDisplay = state.mode === 'relaxed' ? '∞' : String(seconds);

  return (
    <div className="stone-hud" style={{ aspectRatio: String(BOARD_ASPECT) }}>
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
          <div className="stone-hud__timer">
            <span className="stone-hud__timer-icon" aria-hidden>
              ⏱
            </span>
            <span className="stone-hud__timer-value">{timerDisplay}</span>
          </div>
        </div>

        <div className="stone-hud__pit stone-hud__pit--round">
          <span className="stone-hud__pit-label">{roundLabel}</span>
          <span className="stone-hud__pit-value">
            {roundCurrent}/{roundTotal}
          </span>
        </div>

        <Link to="/" className="stone-hud__exit">
          Exit
        </Link>
      </div>

      {(onHint || (allowUndo && onUndo)) && (
        <div className="stone-hud__extras">
          {onHint && (
            <button type="button" className="stone-hud__extra-btn" onClick={onHint}>
              Hint
            </button>
          )}
          {allowUndo && onUndo && (
            <button type="button" className="stone-hud__extra-btn" onClick={onUndo}>
              Undo
            </button>
          )}
        </div>
      )}

      {hintDraw && <p className="stone-hud__hint">Draw from the stock pile</p>}
    </div>
  );
}
