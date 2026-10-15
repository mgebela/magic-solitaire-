import { useEffect, useState } from 'react';
import { GameButton } from './ui/GameButton';

const STORAGE_KEY = 'space-towers-howto-v1';

interface HowToPlayProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export function HowToPlay({ forceOpen, onClose }: HowToPlayProps) {
  const [open, setOpen] = useState(
    () => Boolean(forceOpen) || localStorage.getItem(STORAGE_KEY) !== '1',
  );

  useEffect(() => {
    if (forceOpen) {
      setOpen(true);
    }
  }, [forceOpen]);

  if (!open) return null;

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setOpen(false);
    onClose?.();
  };

  return (
    <div className="howto-overlay" role="dialog" aria-labelledby="howto-title">
      <div className="lobby-panel howto-panel">
        <h2 id="howto-title" className="page-title !text-4xl">
          How to Play
        </h2>
        <p className="page-subtitle">Clear the three peaks. One pass through the stock.</p>
        <ul className="howto-list">
          <li>Only uncovered cards can be played onto the waste pile.</li>
          <li>Play a card one rank higher or lower than the waste top card.</li>
          <li>Ace and King connect — you can wrap around the deck.</li>
          <li>When the waste is empty, tap any open card to start it.</li>
          <li>Draw from the stock when stuck. There are no reshuffles.</li>
          <li>Chains of plays raise your combo and score.</li>
        </ul>
        <GameButton variant="primary" className="mt-6 w-full py-3" onClick={dismiss}>
          Got it
        </GameButton>
      </div>
    </div>
  );
}
