import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { TRIPEAKS_TABLEAU_CARD_COUNT, type GameState } from '@three-towers/shared';
import { cardPointsForCombo, getPlayableCards } from '@three-towers/game-engine';
import { sound } from '../../lib/sound';
import { BOARD_ASPECT, STOCK_HIT_STYLE, WASTE_BADGE_STYLE } from '../../renderer/layout-positions';

const RANK_FACE = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export interface RaceLane {
  name: string;
  score: number;
  cleared?: number;
  you?: boolean;
}

function matchRanks(value: number): string {
  const lower = value === 1 ? 13 : value - 1;
  const upper = value === 13 ? 1 : value + 1;
  return `${RANK_FACE[lower]} or ${RANK_FACE[upper]}`;
}

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
  roundValue?: string;
  race?: RaceLane[];
  exitTo?: string;
  onExit?: () => void;
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
  roundValue,
  race,
  exitTo = '/',
  onExit,
}: MagicGameHudProps) {
  const combo = state.combo || 0;
  const remainingTableau = state.tableau.filter(Boolean).length;
  const progress = 1 - remainingTableau / TRIPEAKS_TABLEAU_CARD_COUNT;
  const timerSeconds = Math.floor((state.elapsedMs ?? 0) / 1000);
  const pitValue = roundValue ?? `${roundCurrent}/${roundTotal}`;
  const [muted, setMuted] = useState(sound.isMuted());
  const [scorePop, setScorePop] = useState(0);
  const [comboPop, setComboPop] = useState(0);
  const prevScore = useRef(state.score);
  const prevCombo = useRef(combo);

  useEffect(() => {
    if (state.score > prevScore.current) {
      setScorePop((n) => n + 1);
    }
    prevScore.current = state.score;
  }, [state.score]);

  useEffect(() => {
    if (combo > prevCombo.current) {
      setComboPop((n) => n + 1);
    }
    prevCombo.current = combo;
  }, [combo]);

  const comboHeat = combo >= 5 ? 'blaze' : combo >= 3 ? 'hot' : combo >= 2 ? 'warm' : '';
  const stuck =
    state.status === 'playing' &&
    state.waste !== null &&
    state.stock.length > 0 &&
    getPlayableCards(state.tableau, state.uncovered, state.waste).length === 0;
  const nextPoints = cardPointsForCombo(combo + 1);

  return (
    <div className="stone-hud" style={{ aspectRatio: String(BOARD_ASPECT) }}>
      {race && race.length > 0 && (
        <div className="stone-hud__race" aria-label="Race">
          {race.map((lane, index) => (
            <span
              key={`${lane.name}-${index}`}
              className={lane.you ? 'stone-hud__race-lane is-you' : 'stone-hud__race-lane'}
            >
              <b>{lane.name}</b>
              <em>{lane.score}</em>
              {lane.cleared != null && (
                <small>
                  {lane.cleared}/{TRIPEAKS_TABLEAU_CARD_COUNT}
                </small>
              )}
            </span>
          ))}
        </div>
      )}

      {state.waste && state.status === 'playing' && (
        <div
          className={`stone-hud__waste-badge ${comboHeat ? `stone-hud__waste-badge--${comboHeat}` : ''}`}
          style={WASTE_BADGE_STYLE}
        >
          {combo >= 1 && (
            <span key={comboPop} className="stone-hud__waste-chain">
              ×{combo}
              <small>+{nextPoints}</small>
            </span>
          )}
          <span className="stone-hud__waste-ranks">{matchRanks(state.waste.value)}</span>
        </div>
      )}
      <div className="stone-hud__bar-actions">
        {allowUndo && onUndo && (
          <button
            type="button"
            className="stone-hud__bar-btn"
            onClick={onUndo}
            disabled={!canUndo}
          >
            Undo
          </button>
        )}
        {onHint && (
          <button type="button" className="stone-hud__bar-btn" onClick={onHint}>
            Hint
          </button>
        )}
        <button
          type="button"
          className="stone-hud__bar-btn"
          onClick={() => setMuted(sound.toggleMuted())}
          aria-pressed={muted}
        >
          {muted ? 'Sound off' : 'Sound'}
        </button>
      </div>

      <button
        type="button"
        className="stone-hud__draw-hit"
        style={STOCK_HIT_STYLE}
        onClick={onDraw}
        disabled={drawDisabled}
        aria-label={`Draw card, ${state.stock.length} remaining`}
      />

      <div className={`stone-hud__pit stone-hud__pit--score ${scorePop ? 'stone-hud__pit--pop' : ''}`}>
        <span className="stone-hud__pit-label">Score</span>
        <span key={scorePop} className="stone-hud__pit-value">
          {state.score}
        </span>
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
        <div className="stone-hud__timer">
          <span className="stone-hud__timer-icon" aria-hidden>
            ⏱
          </span>
          <span>{state.mode === 'relaxed' ? '∞' : String(timerSeconds)}</span>
        </div>
      </div>

      <div className="stone-hud__pit stone-hud__pit--round">
        <span className="stone-hud__pit-label">{roundLabel}</span>
        <span className="stone-hud__pit-value">{pitValue}</span>
      </div>

      <Link to={exitTo} className="stone-hud__exit" onClick={onExit}>
        EXIT
      </Link>

      {stuck && <p className="stone-hud__hint">No move — draw</p>}
      {!stuck && hintDraw && <p className="stone-hud__hint">Draw from the stock pile</p>}
      {!state.waste && state.status === 'playing' && (
        <p className="stone-hud__hint stone-hud__hint--start">
          Tap any open card to start the waste pile
        </p>
      )}
    </div>
  );
}
