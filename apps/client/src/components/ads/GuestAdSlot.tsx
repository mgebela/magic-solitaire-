import { useEffect, useRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  adsenseClient,
  adsenseReady,
  adsenseSlot,
  ensureAdsenseScript,
  type GuestAdKind,
} from '../../lib/ads';
import { useAuthStore } from '../../stores/authStore';

interface GuestAdSlotProps {
  slot: GuestAdKind;
  className?: string;
}

export function GuestAdSlot({ slot, className = '' }: GuestAdSlotProps) {
  const user = useAuthStore((state) => state.user);
  const insRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (user) return;
    ensureAdsenseScript();
  }, [user]);

  useEffect(() => {
    if (user || !adsenseReady(slot)) return;
    const node = insRef.current;
    if (!node || node.getAttribute('data-adsbygoogle-status')) return;
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch {
      // AdSense throws if the same unit is pushed twice (React StrictMode).
    }
  }, [user, slot]);

  if (user) return null;

  const live = adsenseReady(slot);

  return (
    <aside className={`guest-ad guest-ad--${slot} ${className}`.trim()} aria-label="Advertisement">
      <p className="guest-ad__label">
        Ad
        <span aria-hidden> · </span>
        <Link to="/login" className="guest-ad__signin">
          Sign in to remove
        </Link>
      </p>
      {live ? (
        <ins
          ref={insRef}
          className="adsbygoogle guest-ad__unit"
          style={{ display: 'block' }}
          data-ad-client={adsenseClient()}
          data-ad-slot={adsenseSlot(slot)}
          data-ad-format={slot === 'play' ? 'horizontal' : 'rectangle'}
          data-full-width-responsive="true"
        />
      ) : (
        <div className="guest-ad__placeholder">Advertisement</div>
      )}
    </aside>
  );
}

export function GuestPlayShell({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user);
  return (
    <div className={`magic-play-screen ${user ? '' : 'magic-play-screen--with-ad'}`.trim()}>
      <GuestAdSlot slot="play" />
      {children}
    </div>
  );
}
