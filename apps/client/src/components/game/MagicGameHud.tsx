import { Link } from 'react-router-dom';
import type { GameState } from '@three-towers/shared';

interface MagicGameHudProps {
  state: GameState;
  onDraw: () => void;
  drawDisabled?: boolean;
  hintDraw?: boolean;
  onHint?: () => void;
  onUndo?: () => void;
  allowUndo?: boolean;
}

export function MagicGameHud({
  state,
  onDraw,
  drawDisabled,
  hintDraw,
  onHint,
  onUndo,
  allowUndo,
}: MagicGameHudProps) {
  const cleared = state.foundation.length;
  const combo = state.combo || 0;
  const seconds = Math.max(0, Math.floor((state.elapsedMs ?? 0) / 1000));
  const timerDisplay =
    state.mode === 'relaxed' ? '∞' : String(seconds);

  return (
    <div className="magic-hud" aria-hidden={false}>
      <div className="magic-hud__scoreboard">
        <div className="magic-hud__score">{state.score}</div>
        <div className="magic-hud__level">
          {cleared} / 28
        </div>
      </div>

      <div className="magic-hud__panel-controls">
        <button
          type="button"
          className="magic-hud__draw-zone"
          onClick={onDraw}
          disabled={drawDisabled}
          aria-label={`Draw card, ${state.stock.length} remaining`}
        />

        <div className="magic-hud__combo">
          <span className="magic-hud__combo-label">COMBOS</span>
          <div className="magic-hud__combo-dial">
            <span className="magic-hud__combo-value">×{Math.max(1, combo)}</span>
          </div>
        </div>

        <div className="magic-hud__timer">
          <span className="magic-hud__timer-icon" aria-hidden>
            ⏱
          </span>
          <span className="magic-hud__timer-value">{timerDisplay}</span>
        </div>

        <div className="magic-hud__actions">
          {onHint && (
            <button type="button" className="magic-hud__action-btn" onClick={onHint}>
              Hint
            </button>
          )}
          {allowUndo && onUndo && (
            <button type="button" className="magic-hud__action-btn" onClick={onUndo}>
              Undo
            </button>
          )}
          <Link to="/" className="magic-hud__exit">
            EXIT
          </Link>
        </div>
      </div>

      {hintDraw && (
        <p className="magic-hud__hint">Draw from the stock pile</p>
      )}
    </div>
  );
}
