import { useEffect } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { GameCanvas } from '../components/GameCanvas';
import { GameTimer } from '../components/GameTimer';
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
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-felt-dark)] text-white/60">
        Joining room…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-felt-dark)]">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-4">
          <Link to="/multiplayer" className="text-[var(--color-gold)] hover:opacity-80">
            ← Lobby
          </Link>
          <span className="font-mono text-lg tracking-widest text-white">{room.code}</span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase text-white/60">
            {room.mode}
          </span>
        </div>

        {myState && room.status === 'playing' && (
          <div className="flex items-center gap-6 text-sm text-white/80">
            <GameTimer elapsedMs={myState.elapsedMs} mode="timed" running={myState.status === 'playing'} />
            <span>
              Score: <strong className="text-white">{myState.score}</strong>
            </span>
            <span>
              Combo: <strong className="text-[var(--color-gold)]">×{myState.combo || 1}</strong>
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            leaveRoom();
            navigate('/multiplayer');
          }}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/5"
        >
          Leave
        </button>
      </header>

      {error && (
        <div className="mx-6 mt-4 flex items-center justify-between rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          <span>{error}</span>
          <button onClick={clearError} className="text-red-200 hover:text-white">
            ✕
          </button>
        </div>
      )}

      <main className="flex flex-1 gap-4 p-4">
        <aside className="w-64 shrink-0 space-y-4">
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/50">
              Players ({room.players.length}/{room.maxPlayers})
            </h2>
            <ul className="space-y-2">
              {room.players.map((player) => {
                const liveState = player.userId === user.id
                  ? myState
                  : opponentStates[player.userId];
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
              <button
                type="button"
                onClick={() => setReady(!myPlayer?.ready)}
                className={`w-full rounded-lg py-3 font-semibold ${
                  myPlayer?.ready
                    ? 'border border-green-500/30 bg-green-500/10 text-green-300'
                    : 'bg-white/10 text-white'
                }`}
              >
                {myPlayer?.ready ? 'Ready ✓' : 'Ready Up'}
              </button>
              {isHost && (
                <button
                  type="button"
                  disabled={!canStart}
                  onClick={() => startGame()}
                  className="w-full rounded-lg bg-[var(--color-gold)] py-3 font-semibold text-black disabled:opacity-40"
                >
                  Start Game
                </button>
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
              <div className="flex-1 overflow-hidden rounded-2xl border border-white/10">
                <GameCanvas
                  state={myState}
                  onCardClick={playCard}
                  className="h-full w-full"
                />
              </div>
              <div className="mt-4 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => drawCard()}
                  disabled={myState.status !== 'playing' || myState.stock.length === 0}
                  className="rounded-lg bg-white/10 px-6 py-2 text-sm font-medium text-white disabled:opacity-40"
                >
                  Draw
                </button>
              </div>
            </>
          )}

          {room.status === 'waiting' && (
            <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-white/10 text-white/40">
              Waiting for players… share code <strong className="mx-2 text-white">{room.code}</strong>
            </div>
          )}

          {results && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[var(--color-felt-dark)] p-8">
                <h2 className="mb-6 text-center text-3xl font-bold text-[var(--color-gold)]">
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
                  className="mt-6 block rounded-lg bg-[var(--color-gold)] py-3 text-center font-semibold text-black"
                >
                  Back to Lobby
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
