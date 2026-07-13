import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import { installGlobalErrorOverlay } from './lib/global-error-overlay';

installGlobalErrorOverlay();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
);
