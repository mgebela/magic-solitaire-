let installed = false;

function ensureOverlay() {
  let el = document.getElementById('global-error-overlay');
  if (el) return el;

  el = document.createElement('div');
  el.id = 'global-error-overlay';
  el.style.position = 'fixed';
  el.style.inset = '0';
  el.style.zIndex = '999999';
  el.style.display = 'none';
  el.style.background = 'rgba(0,0,0,0.72)';
  el.style.backdropFilter = 'blur(6px)';
  el.style.padding = '24px';
  el.style.color = 'rgba(255,255,255,0.9)';
  el.style.fontFamily = 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif';

  const panel = document.createElement('div');
  panel.style.maxWidth = '980px';
  panel.style.margin = '0 auto';
  panel.style.border = '1px solid rgba(212, 168, 67, 0.35)';
  panel.style.borderRadius = '16px';
  panel.style.background = 'rgba(10,46,28,0.85)';
  panel.style.padding = '18px';

  const title = document.createElement('div');
  title.textContent = 'Magic Solitaire runtime error';
  title.style.fontWeight = '800';
  title.style.fontSize = '18px';
  title.style.color = '#f0d080';

  const hint = document.createElement('div');
  hint.textContent = 'Copy the details below and send them here.';
  hint.style.marginTop = '8px';
  hint.style.opacity = '0.85';

  const pre = document.createElement('pre');
  pre.id = 'global-error-overlay__pre';
  pre.style.marginTop = '14px';
  pre.style.padding = '12px';
  pre.style.borderRadius = '12px';
  pre.style.background = 'rgba(0,0,0,0.35)';
  pre.style.overflow = 'auto';
  pre.style.whiteSpace = 'pre-wrap';
  pre.style.wordBreak = 'break-word';
  pre.style.fontFamily = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
  pre.style.fontSize = '12px';
  pre.style.lineHeight = '1.4';

  panel.appendChild(title);
  panel.appendChild(hint);
  panel.appendChild(pre);
  el.appendChild(panel);
  document.body.appendChild(el);
  return el;
}

function show(details: string) {
  const overlay = ensureOverlay();
  const pre = document.getElementById('global-error-overlay__pre');
  if (pre) pre.textContent = details;
  overlay.style.display = 'block';
}

export function installGlobalErrorOverlay() {
  if (installed) return;
  installed = true;

  window.addEventListener('error', (event) => {
    const err = event.error instanceof Error ? event.error : null;
    const details = [
      `Message: ${event.message || String(err ?? 'Unknown error')}`,
      `Source: ${event.filename || ''}:${event.lineno || 0}:${event.colno || 0}`,
      '',
      err?.stack ?? '',
    ].join('\n');
    // eslint-disable-next-line no-console
    console.error('window.error:', event.error ?? event.message);
    show(details);
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const err = reason instanceof Error ? reason : null;
    const details = [
      'Unhandled promise rejection',
      `Reason: ${err?.message ?? String(reason)}`,
      '',
      err?.stack ?? '',
    ].join('\n');
    // eslint-disable-next-line no-console
    console.error('unhandledrejection:', reason);
    show(details);
  });
}

