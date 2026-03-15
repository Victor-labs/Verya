// js/core/audio.js
// Background music controller
// - Loops fallenverya.mp3
// - Reads music toggle from player settings
// - Listens to settings-changed event for instant on/off
// - Auto-starts on first user interaction (browser autoplay policy)

const BGM_SRC = 'assets/audio/fallenverya.mp3';

/* Create audio element once */
const bgm       = new Audio(BGM_SRC);
bgm.loop        = true;
bgm.volume      = 0.4;
bgm.preload     = 'auto';

let started     = false;   /* has audio context been unlocked */
let shouldPlay  = false;   /* desired state from settings */

/* ── Play / pause helpers ── */
function tryPlay() {
  if (!shouldPlay) return;
  bgm.play().catch(() => {
    /* Blocked by browser — will retry on next interaction */
  });
}

function pause() {
  bgm.pause();
}

/* ── Unlock on first touch/click (browser autoplay policy) ── */
function unlockAndPlay() {
  if (started) return;
  started = true;
  if (shouldPlay) tryPlay();
}
document.addEventListener('click',     unlockAndPlay, { once: true });
document.addEventListener('touchstart',unlockAndPlay, { once: true });

/* ── React to settings toggle ── */
document.addEventListener('settings-changed', e => {
  if (e.detail.key !== 'music') return;
  shouldPlay = e.detail.value;
  if (shouldPlay) { started = true; tryPlay(); }
  else            { pause(); }
});

/* ── React to player-ready (apply saved setting on load) ── */
document.addEventListener('player-ready', () => {
  const s = window.getSettings?.() || {};
  shouldPlay = !!s.music;
  if (shouldPlay) tryPlay();
});
