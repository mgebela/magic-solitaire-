import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import PlayPage from './pages/PlayPage';
import DailyPage from './pages/DailyPage';
import VsAiPage from './pages/VsAiPage';
import MultiplayerPage from './pages/MultiplayerPage';
import RoomPage from './pages/RoomPage';
import PuzzlesPage from './pages/PuzzlesPage';
import PuzzlePlayPage from './pages/PuzzlePlayPage';
import ProfilePage from './pages/ProfilePage';
import ResetPasswordPage from './pages/ResetPasswordPage';

function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const { tokens, fetchProfile } = useAuthStore();

  useEffect(() => {
    if (tokens) {
      fetchProfile();
    }
  }, [tokens, fetchProfile]);

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthBootstrap>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/play" element={<PlayPage />} />
          <Route path="/daily" element={<DailyPage />} />
          <Route path="/vs-ai" element={<VsAiPage />} />
          <Route path="/multiplayer" element={<MultiplayerPage />} />
          <Route path="/multiplayer/:code" element={<RoomPage />} />
          <Route path="/puzzles" element={<PuzzlesPage />} />
          <Route path="/puzzles/:id" element={<PuzzlePlayPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Routes>
      </AuthBootstrap>
    </BrowserRouter>
  );
}
