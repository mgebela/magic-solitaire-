import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import type { MultiplayerMode } from '@three-towers/shared';
import { AppBackground } from '../components/layout/AppBackground';
import { GameButton } from '../components/ui/GameButton';
import { useAuthStore } from '../stores/authStore';
import { useMultiplayerStore } from '../stores/multiplayerStore';

export default function MultiplayerPage() {
  const navigate = useNavigate();
  const { tokens, user } = useAuthStore();
  const { connect, createRoom, joinRoom, error, clearError } = useMultiplayerStore();
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tokens?.accessToken && user) {
      connect(tokens.accessToken, user.id);
    }
  }, [tokens?.accessToken, user, connect]);

  if (!tokens || !user) {
    return <Navigate to="/login" replace />;
  }

  const handleCreate = async (mode: MultiplayerMode) => {
    setLoading(true);
    clearError();
    const room = await createRoom(mode);
    setLoading(false);
    if (room) navigate(`/multiplayer/${room.code}`);
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setLoading(true);
    clearError();
    const room = await joinRoom(joinCode.trim().toUpperCase());
    setLoading(false);
    if (room) navigate(`/multiplayer/${room.code}`);
  };

  return (
    <AppBackground variant="lobby">
      <div className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="lobby-panel w-full max-w-lg">
          <Link to="/" className="text-sm font-semibold text-[var(--color-gold)] hover:opacity-80">
            ← Lobby
          </Link>

          <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl text-[var(--color-gold-light)]">
            Multiplayer
          </h1>
          <p className="mt-2 text-white/60">
            Race opponents on the same seeded board. Highest score wins.
          </p>

          {error && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="mt-8 space-y-4">
            <h2 className="text-lg font-semibold text-white">Create Room</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleCreate('casual')}
                className="mode-tile text-left disabled:opacity-50"
              >
                <span className="mode-tile__icon">🎲</span>
                <div>
                  <div className="mode-tile__title">Casual</div>
                  <p className="mode-tile__desc">Up to 4 players, friendly race</p>
                </div>
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleCreate('ranked')}
                className="mode-tile text-left disabled:opacity-50"
              >
                <span className="mode-tile__icon">⚔️</span>
                <div>
                  <div className="mode-tile__title">Ranked</div>
                  <p className="mode-tile__desc">Competitive same-seed match</p>
                </div>
              </button>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <h2 className="text-lg font-semibold text-white">Join Room</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Room code"
                maxLength={6}
                className="flex-1 rounded-lg border border-white/10 bg-black/25 px-4 py-3 font-mono uppercase tracking-widest text-white placeholder:text-white/30 outline-none focus:border-[var(--color-gold)]/50"
              />
              <GameButton
                variant="primary"
                disabled={loading || !joinCode.trim()}
                onClick={handleJoin}
              >
                Join
              </GameButton>
            </div>
          </div>
        </div>
      </div>
    </AppBackground>
  );
}
