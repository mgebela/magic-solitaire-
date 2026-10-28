const MUTE_KEY = 'space-towers-muted';

let ctx: AudioContext | null = null;
let muted = localStorage.getItem(MUTE_KEY) === '1';

function audioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === 'suspended') {
    void ctx.resume();
  }
  return ctx;
}

function tone(
  frequency: number,
  duration: number,
  type: OscillatorType,
  gain: number,
  delay = 0,
): void {
  if (muted) return;
  const audio = audioContext();
  if (!audio) return;
  const start = audio.currentTime + delay;
  const osc = audio.createOscillator();
  const amp = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);
  amp.gain.setValueAtTime(gain, start);
  amp.gain.exponentialRampToValueAtTime(0.001, start + duration);
  osc.connect(amp);
  amp.connect(audio.destination);
  osc.start(start);
  osc.stop(start + duration);
}

export const sound = {
  unlock(): void {
    audioContext();
  },
  isMuted(): boolean {
    return muted;
  },
  setMuted(value: boolean): void {
    muted = value;
    localStorage.setItem(MUTE_KEY, value ? '1' : '0');
    if (!value) audioContext();
  },
  toggleMuted(): boolean {
    sound.setMuted(!muted);
    return muted;
  },
  playCard(combo: number): void {
    tone(540 + Math.min(combo, 8) * 48, 0.08, 'triangle', 0.09);
    if (combo >= 2) {
      tone(720 + combo * 30, 0.14, 'sine', 0.065, 0.03);
    }
    if (combo >= 4) {
      tone(1040, 0.2, 'sine', 0.055, 0.06);
    }
  },
  draw(): void {
    tone(196, 0.11, 'square', 0.035);
    tone(148, 0.14, 'triangle', 0.03, 0.04);
  },
  win(): void {
    tone(523, 0.16, 'triangle', 0.08);
    tone(659, 0.16, 'triangle', 0.07, 0.1);
    tone(784, 0.18, 'triangle', 0.07, 0.2);
    tone(1046, 0.32, 'sine', 0.06, 0.32);
    tone(1318, 0.4, 'sine', 0.045, 0.46);
  },
  lose(): void {
    tone(330, 0.16, 'sawtooth', 0.04);
    tone(247, 0.22, 'triangle', 0.04, 0.12);
    tone(196, 0.3, 'triangle', 0.035, 0.26);
  },
};
