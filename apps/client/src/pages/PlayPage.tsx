import { useEffect, useState } from 'react';
import { GameCanvas } from '../components/GameCanvas';
import { GameResultModal } from '../components/GameResultModal';
import { GameTimer } from '../components/GameTimer';
import { ModeSelect } from '../components/ModeSelect';
import { GameShell } from '../components/layout/GameShell';
import { GameButton } from '../components/ui/GameButton';
import { computeGameStats } from '../lib/game-stats';
import { formatMode } from '../lib/format-time';
import { getPersonalBest } from '../lib/leaderboard-api';
import { useAuthStore } from '../stores/authStore';
import { useGameStore } from '../stores/gameStore';

export default function PlayPage() {
  const { tokens } = useAuthStore();
  const accessToken = tokens?.accessToken;
  const [personalBest, setPersonalBest] = useState<number | null>(null);
  const [isPersonalBest, setIsPersonalBest] = useState(false);

  const {
    state,
    mode,
    persisted,
    allowUndo,
    isStarting,
    isSyncing,
    error,
    hintCardId,
    hintDraw,
    startGame,
    playCard,
    drawCard,
    undoMove,
    requestHint,
    clearHint,
    tickTimer,
    resetToModeSelect,
    clearError,
  } = useGameStore();

  useEffect(() => {
    if (!state || state.status !== 'playing') return;
    const interval = window.setInterval(() => tickTimer(), 50);
    return () => window.clearInterval(interval);
  }, [state?.status, tickTimer]);

  useEffect(() => {
    if (!accessToken || !mode) {
      setPersonalBest(null);
      return;
    }
    getPersonalBest(accessToken, mode)
      .then((result) => setPersonalBest(result.bestScore))
      .catch(() => setPersonalBest(null));
  }, [accessToken, mode]);

  useEffect(() => {
    if (!state || state.status !== 'won' || !accessToken || !mode) {
      setIsPersonalBest(false);
      return;
    }
    getPersonalBest(accessToken, mode)
      .then((result) => setIsPersonalBest(result.bestScore === state.score))
      .catch(() => setIsPersonalBest(false));
  }, [state?.status, state?.score, accessToken, mode]);

  const showModeSelect = !state && !isStarting;
  const showResult = state && (state.status === 'won' || state.status === 'lost');
  const stats = state
    ? computeGameStats(state, { isPersonalBest: isPersonalBest && state.status === 'won' })
    : null;

  const toolbar =
    state && mode ? (
      <>
        <span className="mode-badge">{formatMode(mode)}</span>
        <GameTimer elapsedMs={state.elapsedMs} mode={mode} running={state.status === 'playing'} />
        <span className="stat-pill">
          Score <strong>{state.score}</strong>
        </span>
        <span className="stat-pill stat-pill--gold">
          Combo <strong>×{state.combo || 1}</strong>
        </span>
        <span className="stat-pill">
          Stock <strong>{state.stock.length}</strong>
        </span>
        {personalBest !== null && (
          <span className="stat-pill text-white/50">
            Best <strong className="text-white/80">{personalBest}</strong>
          </span>
        )}
        {isSyncing && <span className="text-xs text-white/40">Saving…</span>}
      </>
    ) : null;

  const actions =
    state ? (
      <>
        <GameButton variant="ghost" onClick={() => requestHint()} disabled={state.status !== 'playing'}>
          ✨ Hint
        </GameButton>
        {allowUndo && (
          <GameButton variant="ghost" onClick={() => undoMove()} disabled={state.status !== 'playing'}>
            ↩ Undo
          </GameButton>
        )}
        <GameButton
          variant={hintDraw ? 'accent' : 'secondary'}
          onClick={() => drawCard(accessToken)}
          disabled={state.status !== 'playing' || state.stock.length === 0}
        >
          Draw
        </GameButton>
        <GameButton
          variant="primary"
          onClick={() => mode && startGame(mode, accessToken)}
          disabled={isStarting}
        >
          New Deal
        </GameButton>
      </>
    ) : null;

  return (
    <GameShell toolbar={toolbar} actions={actions}>
      {error && (
        <div className="mx-auto mb-4 flex max-w-5xl items-center justify-between rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          <span>{error}</span>
          <button type="button" onClick={clearError} className="text-red-200 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {showModeSelect ? (
        <ModeSelect isLoading={isStarting} onSelect={(m) => startGame(m, accessToken)} />
      ) : (
        <>
          <div className="game-table-frame">
            <GameCanvas
              state={state}
              onCardClick={(cardId) => {
                clearHint();
                playCard(cardId, accessToken);
              }}
              hintCardId={hintCardId}
              className="h-full w-full"
            />
          </div>

          {state?.status === 'playing' && (
            <p className={`hint-banner ${hintDraw ? 'hint-banner--active' : ''}`}>
              {hintDraw
                ? '✨ Hint: draw from the stock pile'
                : 'Tap glowing cards to play · Draw when stuck'}
              {!accessToken && ' · Guest mode: hints & undo enabled'}
            </p>
          )}

          {showResult && stats && (
            <GameResultModal
              stats={stats}
              persisted={persisted}
              onPlayAgain={() => mode && startGame(mode, accessToken)}
              onChangeMode={resetToModeSelect}
            />
          )}
        </>
      )}
    </GameShell>
  );
}
