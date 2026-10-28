declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const CLIENT = import.meta.env.VITE_ADSENSE_CLIENT?.trim() ?? '';
const SLOT_PLAY = import.meta.env.VITE_ADSENSE_SLOT_PLAY?.trim() ?? '';
const SLOT_RESULT = import.meta.env.VITE_ADSENSE_SLOT_RESULT?.trim() ?? '';

let scriptRequested = false;

export type GuestAdKind = 'play' | 'result';

export function adsenseClient(): string {
  return CLIENT;
}

export function adsenseSlot(kind: GuestAdKind): string {
  return kind === 'play' ? SLOT_PLAY : SLOT_RESULT;
}

export function adsenseReady(kind: GuestAdKind): boolean {
  return Boolean(CLIENT && adsenseSlot(kind));
}

export function ensureAdsenseScript(): void {
  if (!CLIENT || scriptRequested || typeof document === 'undefined') return;
  if (document.querySelector(`script[data-adsense="${CLIENT}"]`)) {
    scriptRequested = true;
    return;
  }
  scriptRequested = true;
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(CLIENT)}`;
  script.crossOrigin = 'anonymous';
  script.dataset.adsense = CLIENT;
  document.head.appendChild(script);
}
