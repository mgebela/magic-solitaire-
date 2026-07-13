import React from 'react';

type AppErrorBoundaryState = { error: Error | null };

export class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('App crashed:', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    const message = this.state.error?.message ?? String(this.state.error);

    return (
      <div
        style={{
          minHeight: '100vh',
          padding: 24,
          background: '#0a2e1c',
          color: 'rgba(255,255,255,0.85)',
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
        }}
      >
        <div
          style={{
            maxWidth: 880,
            margin: '0 auto',
            borderRadius: 16,
            border: '1px solid rgba(212, 168, 67, 0.35)',
            background: 'rgba(0,0,0,0.35)',
            padding: 20,
          }}
        >
          <div style={{ color: '#f0d080', fontWeight: 700, fontSize: 18 }}>
            Magic Solitaire crashed
          </div>
          <div style={{ marginTop: 8, opacity: 0.85 }}>
            Refresh the page. If it keeps happening, copy the error text below.
          </div>
          <pre
            style={{
              marginTop: 16,
              padding: 12,
              borderRadius: 12,
              background: 'rgba(0,0,0,0.35)',
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontSize: 12,
              lineHeight: 1.4,
            }}
          >
            {message}
            {'\n\n'}
            {this.state.error?.stack ?? ''}
          </pre>
        </div>
      </div>
    );
  }
}

