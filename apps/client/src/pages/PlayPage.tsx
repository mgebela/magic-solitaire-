import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GameCanvas } from '../components/GameCanvas';
import { GameResultModal } from '../components/GameResultModal';
import { ModeSelect } from '../components/ModeSelect';
import { AppBackground } from '../components/layout/AppBackground';
import { computeGameStats } from '../lib/game-stats';
import { getPersonalBest } from '../lib/leaderboard-api';
import { useAuthStore } from '../stores/authStore';
import { useGameStore } from '../stores/gameStore';

export default function PlayPage() {
  const { tokens } = useAuthStore();
  const accessToken = tokens?.accessToken;
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

  if (showModeSelect) {
    return (
      <AppBackground variant="lobby">
        <div className="lobby">
          <Link to="/" className="text-sm font-semibold text-[var(--color-gold)] hover:opacity-80">
            ← Lobby
          </Link>
          <ModeSelect isLoading={isStarting} onSelect={(m) => startGame(m, accessToken)} />
        </div>
      </AppBackground>
    );
  }

  return (
    <div className="magic-play-screen">
      {error && (
        <div className="magic-play-screen__error">
          <span>{error}</span>
          <button type="button" onClick={clearError}>
            ✕
          </button>
        </div>
      )}

      <GameCanvas
        state={state}
        immersive
        roundCurrent={1}
        roundTotal={10}
        onCardClick={(cardId) => {
          clearHint();
          playCard(cardId, accessToken);
        }}
        onDraw={() => drawCard(accessToken)}
        hintCardId={hintCardId}
        hintDraw={hintDraw}
        onHint={() => requestHint()}
        onUndo={() => undoMove()}
        allowUndo={allowUndo}
        className="magic-play-screen__canvas"
      />

      {isSyncing && <div className="magic-play-screen__saving">Saving…</div>}

      {showResult && stats && (
        <GameResultModal
          stats={stats}
          persisted={persisted}
          onPlayAgain={() => mode && startGame(mode, accessToken)}
          onChangeMode={resetToModeSelect}
        />
      )}
    </div>
  );
}
