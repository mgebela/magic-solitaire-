import { Link } from 'react-router-dom';
import { TRIPEAKS_TABLEAU_CARD_COUNT, type GameState } from '@three-towers/shared';
import { BOARD_ASPECT, STOCK_HIT_STYLE } from '../../renderer/layout-positions';

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
  roundCurrent = 1,
  roundTotal = 1,
  roundLabel = 'Round',
}: MagicGameHudProps) {
  const combo = state.combo || 0;
  const remainingTableau = state.tableau.filter(Boolean).length;
  const progress = 1 - remainingTableau / TRIPEAKS_TABLEAU_CARD_COUNT;
  const timerSeconds = Math.floor((state.elapsedMs ?? 0) / 1000);

  return (
    <div className="stone-hud" style={{ aspectRatio: String(BOARD_ASPECT) }}>
      <div className="stone-hud__top-left">
        <span>SCORE {state.score}</span>
        <span>
          {roundLabel.toUpperCase()} {roundCurrent} / {roundTotal}
        </span>
      </div>

      <div className="stone-hud__top-actions">
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
        {onHint && (
          <button type="button" className="stone-hud__extra-btn" onClick={onHint}>
            Hint
          </button>
        )}
      </div>

      <button
        type="button"
        className="stone-hud__draw-hit"
        style={STOCK_HIT_STYLE}
        onClick={onDraw}
        disabled={drawDisabled}
        aria-label={`Draw card, ${state.stock.length} remaining`}
      />

      <div className="stone-hud__pit stone-hud__pit--score">
        <span className="stone-hud__pit-label">Score</span>
        <span className="stone-hud__pit-value">{state.score}</span>
      </div>

      <div className="stone-hud__brand">
        <p className="stone-hud__title">
          SPACE
          <span>TOWERS</span>
        </p>
        <div className="stone-hud__progress" aria-hidden>
          <div className="stone-hud__progress-fill" style={{ width: `${Math.max(4, progress * 100)}%` }} />
        </div>
      </div>

      <div className="stone-hud__center">
        <div className="stone-hud__combo-ring">
          <span className="stone-hud__combo-label">COMBOS</span>
          <span className="stone-hud__combo-value">{combo}x</span>
        </div>
        <div className="stone-hud__timer">
          <span className="stone-hud__timer-icon" aria-hidden>
            ⏱
          </span>
          <span>{state.mode === 'relaxed' ? '∞' : String(timerSeconds)}</span>
        </div>
      </div>

      <div className="stone-hud__pit stone-hud__pit--round">
        <span className="stone-hud__pit-label">{roundLabel}</span>
        <span className="stone-hud__pit-value">
          {roundCurrent}/{roundTotal}
        </span>
      </div>

      <Link to="/" className="stone-hud__exit">
        EXIT
      </Link>

      {hintDraw && <p className="stone-hud__hint">Draw from the stock pile</p>}
      {!state.waste && state.status === 'playing' && (
        <p className="stone-hud__hint stone-hud__hint--start">
          Tap any open card to start the waste pile
        </p>
      )}
    </div>
  );
}
