import { useEffect } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { GameCanvas } from '../components/GameCanvas';
import { AppBackground } from '../components/layout/AppBackground';
import { GameButton } from '../components/ui/GameButton';
import { formatElapsed } from '../lib/format-time';
import { useAuthStore } from '../stores/authStore';
import { useMultiplayerStore } from '../stores/multiplayerStore';

export default function RoomPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { tokens, user } = useAuthStore();
  const {
    room,
    myState,
    results,
    connected,
    error,
    userId,
    connect,
    joinRoom,
    leaveRoom,
    setReady,
    startGame,
    playCard,
    drawCard,
    tickTimer,
    clearError,
  } = useMultiplayerStore();

  const myId = userId;
  const isHost = Boolean(room && myId && room.hostId === myId);
  const myPlayer = room?.players.find((p) => p.userId === myId);
  const allReady = room?.players.every((p) => p.ready) ?? false;
  const canStart = isHost && allReady && (room?.players.length ?? 0) >= 2;

  useEffect(() => {
    if (tokens?.accessToken && user) {
      void connect(user.username);
    }
  }, [tokens?.accessToken, user, connect]);

  useEffect(() => {
    if (connected && code && (!room || room.code !== code)) {
      void joinRoom(code);
    }
  }, [connected, code, room, joinRoom]);

  useEffect(() => {
    if (!myState || myState.status !== 'playing') return;
    const interval = window.setInterval(() => tickTimer(), 50);
    return () => window.clearInterval(interval);
  }, [myState?.status, tickTimer]);

  if (!tokens || !user) {
    return <Navigate to="/login" replace />;
  }

  const leave = () => {
    leaveRoom();
    navigate('/multiplayer');
  };

  if (!room) {
    return (
      <AppBackground variant="lobby">
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center text-white/60">
          {error ? (
            <>
              <p className="max-w-md text-sm text-red-300">{error}</p>
              <Link to="/multiplayer" className="game-btn game-btn--primary">
                Back to Multiplayer
              </Link>
            </>
          ) : (
            <p>Joining room…</p>
          )}
        </div>
      </AppBackground>
    );
  }

  const errorBanner = error ? (
    <div className="mx-auto mb-4 flex max-w-5xl items-center justify-between rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
      <span>{error}</span>
      <button type="button" onClick={clearError} className="text-red-200 hover:text-white">
        ✕
      </button>
    </div>
  ) : null;

  const playerList = (
    <div className="lobby-panel">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/50">
        Players ({room.players.length}/{room.maxPlayers})
      </h2>
      <ul className="space-y-2">
        {room.players.map((player) => {
          const score = player.userId === myId ? (myState?.score ?? player.score) : player.score;
          const status = player.userId === myId ? (myState?.status ?? player.status) : player.status;

          return (
            <li
              key={player.userId}
              className={`rounded-lg px-3 py-2 text-sm ${
                player.userId === myId ? 'bg-[var(--color-gold)]/10' : 'bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-white">
                  {player.username}
                  {player.userId === room.hostId && (
                    <span className="ml-1 text-xs text-white/40">host</span>
                  )}
                </span>
                {room.status === 'waiting' && (
                  <span className={player.ready ? 'text-green-400' : 'text-white/40'}>
                    {player.ready ? 'Ready' : '…'}
                  </span>
                )}
              </div>
              {room.status !== 'waiting' && (
                <div className="mt-1 flex justify-between text-xs text-white/50">
                  <span className="capitalize">{status}</span>
                  <span className="font-mono text-white/80">{score} pts</span>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );

  const resultsOverlay = results ? (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="lobby-panel w-full max-w-md p-8">
        <h2 className="page-title mb-6 text-center !text-3xl">Match Results</h2>
        <ol className="space-y-3">
          {results.rankings.map((entry) => (
            <li
              key={entry.userId}
              className={`flex items-center justify-between rounded-lg px-4 py-3 ${
                entry.userId === myId ? 'bg-[var(--color-gold)]/10' : 'bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-white/40">#{entry.rank}</span>
                <span className="font-medium text-white">{entry.username}</span>
              </div>
              <div className="text-right text-sm">
                <div className="font-semibold text-[var(--color-gold)]">{entry.score}</div>
                <div className="font-mono text-xs text-white/40">{formatElapsed(entry.elapsedMs)}</div>
              </div>
            </li>
          ))}
        </ol>
        <Link to="/multiplayer" className="game-btn game-btn--primary mt-6 block w-full py-3 text-center">
          Back to Lobby
        </Link>
      </div>
    </div>
  ) : null;

  if (room.status === 'playing' && myState) {
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
          state={myState}
          immersive
          roundLabel="Room"
          roundValue={room.code}
          onCardClick={playCard}
          onDraw={() => drawCard()}
          exitTo="/multiplayer"
          onExit={leaveRoom}
          className="magic-play-screen__canvas"
        />

        <aside className="play-rivals" aria-label="Players">
          <p className="play-rivals__title">Rivals</p>
          <ul>
            {room.players.map((player) => {
              const score = player.userId === myId ? (myState.score ?? player.score) : player.score;
              return (
                <li key={player.userId}>
                  <span className={player.userId === myId ? 'text-[var(--color-gold)]' : undefined}>
                    {player.username}
                  </span>
                  <span>{score}</span>
                </li>
              );
            })}
          </ul>
        </aside>

        {resultsOverlay}
      </div>
    );
  }

  return (
    <AppBackground variant="lobby">
      <div className="lobby relative">
        <Link to="/multiplayer" className="page-back" onClick={leaveRoom}>
          ← Multiplayer
        </Link>
        {errorBanner}

        <header className="mb-6">
          <h1 className="page-title">{room.code}</h1>
          <p className="page-subtitle capitalize">{room.mode} match</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
          <div className="space-y-4">
            {playerList}
            {room.status === 'waiting' && (
              <div className="space-y-2">
                <GameButton
                  variant={myPlayer?.ready ? 'secondary' : 'primary'}
                  className="w-full"
                  onClick={() => setReady(!myPlayer?.ready)}
                >
                  {myPlayer?.ready ? 'Ready ✓' : 'Ready Up'}
                </GameButton>
                {isHost && (
                  <GameButton
                    variant="primary"
                    className="w-full"
                    disabled={!canStart}
                    onClick={() => startGame()}
                  >
                    Start Game
                  </GameButton>
                )}
                {!isHost && (
                  <p className="text-center text-xs text-white/40">Waiting for host to start…</p>
                )}
                <GameButton variant="ghost" className="w-full" onClick={leave}>
                  Leave
                </GameButton>
              </div>
            )}
          </div>

          <div className="relative flex min-h-[18rem] items-center justify-center rounded-2xl border border-dashed border-white/10 text-white/40">
            Waiting for players… share code{' '}
            <strong className="mx-2 text-[var(--color-neon)]">{room.code}</strong>
            {resultsOverlay}
          </div>
        </div>
      </div>
    </AppBackground>
  );
}
