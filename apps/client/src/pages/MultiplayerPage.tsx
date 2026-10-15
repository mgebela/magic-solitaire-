import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import type { MultiplayerMode } from '@three-towers/shared';
import { MULTIPLAYER_ENTRY_COST } from '@three-towers/shared';
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
          <Link to="/" className="page-back">
            ← Lobby
          </Link>

          <h1 className="page-title mt-4">Multiplayer</h1>
          <p className="page-subtitle">
            Race opponents on the same seeded board. Highest score wins. Each match costs{' '}
            {MULTIPLAYER_ENTRY_COST} Solitaire Tokens.
          </p>

          <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <div>
              <p className="text-xs text-white/50">Your tokens</p>
              <p className="text-xl font-bold text-[var(--color-neon)]">
                {user.tokenBalance} ST
              </p>
            </div>
            <Link
              to="/tokens"
              className="text-sm font-medium text-[var(--color-neon)] hover:underline"
            >
              Buy tokens →
            </Link>
          </div>

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
                className="stone-input flex-1 px-4 py-3 font-mono uppercase tracking-widest placeholder:text-white/30"
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
