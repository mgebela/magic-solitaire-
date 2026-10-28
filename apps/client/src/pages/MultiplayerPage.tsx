import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import type { MultiplayerMode } from '@three-towers/shared';
import { AppBackground } from '../components/layout/AppBackground';
import { GameButton } from '../components/ui/GameButton';
import { ModeMark } from '../components/ui/ModeMark';
import { useAuthStore } from '../stores/authStore';
import { useMultiplayerStore } from '../stores/multiplayerStore';

export default function MultiplayerPage() {
  const navigate = useNavigate();
  const { tokens, user } = useAuthStore();
  const { connect, connected, createRoom, joinRoom, error, clearError } = useMultiplayerStore();
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tokens?.accessToken && user) {
      void connect(user.username);
    }
  }, [tokens?.accessToken, user, connect]);

  if (!tokens || !user) {
    return <Navigate to="/login?next=/multiplayer" replace />;
  }

  const busy = loading || !connected;

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
            Race opponents on the same seeded board. Highest score wins. Share a 6-letter room code to
            play.
          </p>

          {error && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
              {error}
            </div>
          )}

          {!connected && !error && (
            <p className="mt-4 text-sm text-white/50">Connecting to PvP…</p>
          )}

          <div className="mt-8 space-y-4">
            <h2 className="text-lg font-semibold text-white">Create Room</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => handleCreate('casual')}
                className="mode-tile text-left disabled:opacity-50"
              >
                <span className="mode-tile__icon">
                  <ModeMark name="casual" />
                </span>
                <div>
                  <div className="mode-tile__title">Casual</div>
                  <p className="mode-tile__desc">Up to 4 players, friendly race</p>
                </div>
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => handleCreate('ranked')}
                className="mode-tile text-left disabled:opacity-50"
              >
                <span className="mode-tile__icon">
                  <ModeMark name="ranked" />
                </span>
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
                disabled={busy || !joinCode.trim()}
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
