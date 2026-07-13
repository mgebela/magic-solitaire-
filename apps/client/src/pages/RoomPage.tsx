import { useEffect } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { GameCanvas } from '../components/GameCanvas';
import { GameTimer } from '../components/GameTimer';
import { AppBackground } from '../components/layout/AppBackground';
import { GameShell } from '../components/layout/GameShell';
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
    opponentStates,
    results,
    connected,
    error,
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

  const isHost = room && user && room.hostId === user.id;
  const myPlayer = room?.players.find((p) => p.userId === user?.id);
  const allReady = room?.players.every((p) => p.ready) ?? false;
  const canStart = isHost && allReady && (room?.players.length ?? 0) >= 2;

  useEffect(() => {
    if (tokens?.accessToken && user) {
      connect(tokens.accessToken, user.id);
    }
  }, [tokens?.accessToken, user, connect]);

  useEffect(() => {
    if (connected && code && (!room || room.code !== code)) {
      joinRoom(code);
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

  if (!room) {
    return (
      <AppBackground variant="game">
        <div className="flex min-h-screen items-center justify-center text-white/60">
          Joining room…
        </div>
      </AppBackground>
    );
  }

  const toolbar =
    myState && room.status === 'playing' ? (
      <>
        <span className="mode-badge font-mono tracking-widest">{room.code}</span>
        <span className="stat-pill capitalize">{room.mode}</span>
        <GameTimer elapsedMs={myState.elapsedMs} mode="timed" running={myState.status === 'playing'} />
        <span className="stat-pill">
          Score <strong>{myState.score}</strong>
        </span>
        <span className="stat-pill stat-pill--gold">
          Combo <strong>×{myState.combo || 1}</strong>
        </span>
      </>
    ) : (
      <>
        <span className="mode-badge font-mono tracking-widest">{room.code}</span>
        <span className="stat-pill capitalize">{room.mode}</span>
      </>
    );

  const actions = (
    <GameButton
      variant="ghost"
      onClick={() => {
        leaveRoom();
        navigate('/multiplayer');
      }}
    >
      Leave
    </GameButton>
  );

  return (
    <GameShell
      backTo="/multiplayer"
      backLabel="Multiplayer"
      toolbar={toolbar}
      actions={actions}
    >
      {error && (
        <div className="mx-auto mb-4 flex max-w-5xl items-center justify-between rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          <span>{error}</span>
          <button type="button" onClick={clearError} className="text-red-200 hover:text-white">
            ✕
          </button>
        </div>
      )}

      <div className="flex flex-1 gap-4">
        <aside className="w-64 shrink-0 space-y-4">
          <div className="lobby-panel">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/50">
              Players ({room.players.length}/{room.maxPlayers})
            </h2>
            <ul className="space-y-2">
              {room.players.map((player) => {
                const liveState =
                  player.userId === user.id ? myState : opponentStates[player.userId];
                const score = liveState?.score ?? player.score;
                const status = liveState?.status ?? player.status;

                return (
                  <li
                    key={player.userId}
                    className={`rounded-lg px-3 py-2 text-sm ${
                      player.userId === user.id ? 'bg-[var(--color-gold)]/10' : 'bg-white/5'
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
            </div>
          )}
        </aside>

        <div className="relative flex flex-1 flex-col">
          {room.status === 'playing' && myState && (
            <>
              <div className="game-table-frame flex-1">
                <GameCanvas state={myState} onCardClick={playCard} className="h-full w-full" />
              </div>
              <div className="mt-4 flex justify-center">
                <GameButton
                  variant="secondary"
                  onClick={() => drawCard()}
                  disabled={myState.status !== 'playing' || myState.stock.length === 0}
                >
                  Draw
                </GameButton>
              </div>
            </>
          )}

          {room.status === 'waiting' && (
            <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-white/10 text-white/40">
              Waiting for players… share code{' '}
              <strong className="mx-2 text-[var(--color-gold)]">{room.code}</strong>
            </div>
          )}

          {results && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
              <div className="lobby-panel w-full max-w-md p-8">
                <h2 className="mb-6 text-center font-[family-name:var(--font-display)] text-3xl text-[var(--color-gold)]">
                  Match Results
                </h2>
                <ol className="space-y-3">
                  {results.rankings.map((entry) => (
                    <li
                      key={entry.userId}
                      className={`flex items-center justify-between rounded-lg px-4 py-3 ${
                        entry.userId === user.id ? 'bg-[var(--color-gold)]/10' : 'bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-white/40">#{entry.rank}</span>
                        <span className="font-medium text-white">{entry.username}</span>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-semibold text-[var(--color-gold)]">{entry.score}</div>
                        <div className="font-mono text-xs text-white/40">
                          {formatElapsed(entry.elapsedMs)}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
                <Link
                  to="/multiplayer"
                  className="game-btn game-btn--primary mt-6 block w-full py-3 text-center"
                >
                  Back to Lobby
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </GameShell>
  );
}
