interface AppBackgroundProps {
  children: React.ReactNode;
  variant?: 'lobby' | 'game';
}

export function AppBackground({ children, variant = 'lobby' }: AppBackgroundProps) {
  return (
    <div className={`app-background app-background--${variant}`}>
      <div className="app-background__vignette" aria-hidden />
      <div className="app-background__sparkles" aria-hidden />
      <div className="relative z-10 min-h-screen">{children}</div>
    </div>
  );
}
